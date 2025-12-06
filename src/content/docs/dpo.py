"""
---
title: Direct Preference Optimization (DPO)
summary: Train LLMs from human preferences without a reward model
date: 2025-12-06
---

# Direct Preference Optimization (DPO)

## Bradley-Terry Model

DPO starts from the **Bradley-Terry model**, which connects rewards to preferences.
This model expresses the probability that a human prefers response $y_w$ (winner) over $y_l$ (loser) given prompt $x$:

$$
p(y_w \succ y_l | x) = \sigma(r(x, y_w) - r(x, y_l))
$$

where $r(x, y)$ is the implicit reward model ($r(x, y_w)$ – reward of preferred response $y_w$, $r(x, y_l)$ – reward of rejected response $y_l$) and $\sigma$ is the sigmoid function.

And feedback comes as **preferences over model samples**
$$
\mathcal{D} = \{x_i, y_w^i, y_l^i\}
$$

Given this, we can define the loss function for the reward model:
$$
\mathcal{L}_{\text{R}}(\phi, \mathcal{D}) = -\mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}} \left[ \log \sigma(r_\phi(x, y_w) - r_\phi(x, y_l)) \right]
$$
where $\phi$ are the parameters of the reward model.

As you can see, the loss function is a binary classification problem and the logit is the difference in rewards.

## Deriving the DPO Objective

Instead of training a separate reward model (as in RLHF), DPO uses a theoretical result connecting the optimal policy $\pi^*$ to the reward function.

The standard RLHF objective is:

$$
\max_{\pi_\theta} \mathbb{E}_{x \sim \mathcal{D}, y \sim \pi_\theta(y|x)}[r_\phi(x, y)] - \beta \, D_{KL}[\pi_\theta(y|x) \| \pi_{\text{ref}}(y|x)]
$$

In other words, we want to maximize the expected reward of the policy, minus the KL term to encourage the policy to be close to the reference policy.

This objective has a **closed-form solution** for the optimal policy $\pi^*$:

$$
\pi^*(y|x) = \frac{1}{Z(x)} \pi_{\text{ref}}(y|x) \exp\left(\frac{1}{\beta} r(x, y)\right)
$$

where $Z(x)$ is the partition function:
$$
Z(x) = \sum_{y \in \mathcal{Y}} \pi_{\text{ref}}(y|x) \exp\left(\frac{1}{\beta} r(x, y)\right)
$$
Looks almost the same, but here we sum over all possible responses $y \in \mathcal{Y}$.

We can rearrange this to express the reward $r(x, y)$ in terms of the optimal policy $\pi^*$, reference policy $\pi_{\text{ref}}$, and partition function $Z(x)$:

$$
r(x, y) = \beta \log \frac{\pi^*(y|x)}{\pi_{\text{ref}}(y|x)} + \beta \log Z(x)
$$

## DPO Loss

Substituting this reward expression into the Bradley-Terry model (the $Z(x)$ terms cancel out, what a relief!), we get the preference probability in terms of the policy:

$$
p(y_w \succ y_l | x) = \sigma\left(\beta \log \frac{\pi^*(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \beta \log \frac{\pi^*(y_l|x)}{\pi_{\text{ref}}(y_l|x)}\right)
$$

Now we can train the policy $\pi_\theta$ directly by minimizing the negative log-likelihood of the preference data:

$$
\mathcal{L}_{\text{DPO}} = -\mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}}\left[\log \sigma\left(\beta \log \frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)}\right)\right]
$$

This bypasses the need for a separate reward model entirely. Cool, huh?
"""

# imports
import torch
import torch.nn.functional as F

# ## Log Probabilities
#
# We need to compute the log probability of a sequence, $\log \pi(y|x)$.
# Since the model is autoregressive, this is the sum of the log probabilities of each token given the history.

def get_log_probs(model, input_ids, attention_mask, labels):
    outputs = model(input_ids=input_ids, attention_mask=attention_mask)
    logits = outputs.logits

    # Align logits and labels.
    # The model predicts the NEXT token, so logits[t] corresponds to labels[t+1].
    # We remove the last logit (no next token) and the first label (no prediction).
    logits = logits[:, :-1, :]
    labels = labels[:, 1:]

    # Create a mask for padding tokens (where labels are -100).
    # We must mask BEFORE gathering because -100 is not a valid tensor index.
    mask = (labels != -100).float()
    
    # Replace -100 with 0 (or any valid index) to prevent index errors in gather.
    # We clone labels to ensure we don't modify the input tensor in place.
    labels_safe = labels.clone()
    labels_safe[labels == -100] = 0

    # Compute log probabilities for all vocabulary tokens at each position.
    log_probs = F.log_softmax(logits, dim=-1)
    
    # Select the log probability of the ACTUAL token that appeared in the sequence.
    # gather dim=-1 selects the value at the index specified by labels_safe.
    per_token_log_probs = torch.gather(log_probs, dim=-1, index=labels_safe.unsqueeze(-1)).squeeze(-1)

    # Multiply by mask to zero out padding tokens, then sum over the sequence.
    # Result shape: (batch_size,)
    return (per_token_log_probs * mask).sum(dim=-1)

# ## DPO Loss Function
#
# This implements the DPO objective derived above.
# It minimizes the negative log-likelihood of the preference data under the implicit reward model.
# 
# Also, we can use substraction instead of ratio since $\log \frac{a}{b} = \log a - \log b$.

def dpo_loss(
    policy_model,
    reference_model,
    chosen_ids, chosen_mask, chosen_labels,
    rejected_ids, rejected_mask, rejected_labels,
    beta: float = 0.1,
):
    # 1. Compute policy log probabilities for chosen and rejected responses.
    #    This gives us $\log \pi_\theta(y_w|x)$ and $\log \pi_\theta(y_l|x)$.
    pi_chosen = get_log_probs(policy_model, chosen_ids, chosen_mask, chosen_labels)
    pi_rejected = get_log_probs(policy_model, rejected_ids, rejected_mask, rejected_labels)

    # 2. Compute reference log probabilities (frozen model).
    #    This gives us $\log \pi_{\text{ref}}(y_w|x)$ and $\log \pi_{\text{ref}}(y_l|x)$.
    #    We use no_grad() because we don't update the reference model.
    with torch.no_grad():
        ref_chosen = get_log_probs(reference_model, chosen_ids, chosen_mask, chosen_labels)
        ref_rejected = get_log_probs(reference_model, rejected_ids, rejected_mask, rejected_labels)

    # 3. Calculate implicit rewards (log-ratios).
    #    $r(x, y) = \beta (\log \pi_\theta(y|x) - \log \pi_{\text{ref}}(y|x))$
    chosen_logratios = pi_chosen - ref_chosen
    rejected_logratios = pi_rejected - ref_rejected

    # 4. Compute the Bradley-Terry logits.
    #    $$
    #    u = \beta (r(x, y_w) - r(x, y_l))
    #      = \beta \left( \log \frac{\pi(y_w)}{\pi_{\text{ref}}(y_w)} - \log \frac{\pi(y_l)}{\pi_{\text{ref}}(y_l)} \right)
    #    $$
    logits = beta * (chosen_logratios - rejected_logratios)
    
    # 5. Compute the negative log-likelihood loss.
    #    $\mathcal{L} = -\log \sigma(u) = -\log \frac{1}{1 + e^{-u}}$
    #
    #    F.logsigmoid(x) computes log(1 / (1 + exp(-x))) stably.
    loss = -F.logsigmoid(logits).mean()

    return loss

# ## Training Loop
#
# Standard PyTorch training step, passing both chosen and rejected sequences.

def train_step(policy_model, reference_model, batch, optimizer, beta=0.1):
    optimizer.zero_grad()
    
    loss = dpo_loss(
        policy_model, reference_model,
        batch["chosen_input_ids"], batch["chosen_attention_mask"], batch["chosen_labels"],
        batch["rejected_input_ids"], batch["rejected_attention_mask"], batch["rejected_labels"],
        beta=beta,
    )
    
    loss.backward()
    optimizer.step()
    return loss.item()
