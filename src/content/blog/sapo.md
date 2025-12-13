---
title: Soft Adaptive Policy Optimization (SAPO)
summary: Stabilize RL fine-tuning of LLMs with smooth, temperature-controlled gating instead of hard clipping
date: 2025-12-12
tags: [rlhf, policy-optimization, qwen]
---

# From GRPO to SAPO

## Group Relative Policy Optimization (GRPO)

Standard PPO requires a **critic (or value) model** to estimate advantages. GRPO eliminates the critic by computing advantages **relative to a group of sampled responses**.

### The Core Idea

For each prompt $q$, sample $G$ responses $\{y_1, \ldots, y_G\}$ from the policy. Score each response with a reward function $R(q, y_i)$. Then compute the advantage:

$$
\hat{A}_{i,t} = \hat{A}_i = \frac{R_i - \operatorname{mean}\left(\{R_j\}_{j=1}^G\right)}{\operatorname{std}\left(\{R_j\}_{j=1}^G\right)}
$$

This is just **z-score normalization** within the group. Note that we use the same advantage for all tokens in a response ($\hat{A}_{i,t} = \hat{A}_i$).

The algorithm is actually pretty simple:
1. Sample a group of $G$ responses for each prompt
2. Score each response with a reward model
3. Normalize rewards within the group -> advantages
4. Update the policy using these relative advantages

**But why groups?** In PPO, we compute advantages as $A = R - V(s)$, where $V(s)$ is a learned baseline (the expected return from state $s$) – basically calculating the gain compared to the baseline. Standard PPO trains a critic network to estimate $V(s)$.

For LLMs, this adds overhead – either a separate value model or an extra head on the base model. GRPO's solution: estimate the baseline from a group of samples. Generate $G$ responses for the same prompt, score them, use the mean as the baseline. If response A scores higher than average – reinforce it. If response B scores lower – suppress it.

No learned value function, just peer pressure.

### GRPO Objective

Let's start from the beginning.

The probability of generating response $y$ given prompt $q$ is the product of per-token probabilities:

$$
\pi_\theta(y \mid q) = \prod_{t=1}^{|y|} \pi_\theta(y_t \mid q, y_{<t})
$$

In other words: how likely is this exact sequence? Multiply the probability of each token, given everything before it.

For each query $q$, GRPO samples a group of $G$ responses $\{y_1, \dots, y_G\}$ from $\pi_{\theta_{\text{old}}}$ and computes rewards $\{R_1, \dots, R_G\}$.

The objective:

$$
\mathcal{J}_{\text{GRPO}}(\theta) = \mathbb{E}_{q, \{y_i\}} \left[ \frac{1}{G} \sum_{i=1}^G \frac{1}{|y_i|} \sum_{t=1}^{|y_i|} \left\{ \min\left( r_{i,t} \hat{A}_{i}, \; \htmlClass{color-primary}{\operatorname{clip}(r_{i,t}, 1-\epsilon, 1+\epsilon)} \hat{A}_{i} \right) - \beta \, D_{\text{KL}} \right\} \right]
$$

**Why min?** If $\hat{A} > 0$ (good response), we want to increase $r$. The $\min$ ensures we don't increase too much: once $r > 1+\epsilon$, the clipped term is smaller, so the gradient stops. If $\hat{A} < 0$ (bad response), we want to decrease $r$. The $\min$ ensures we don't decrease too much – once $r < 1-\epsilon$, the clipped term is smaller, so the gradient stops. This creates a **trust region** around the old policy.

**Notation:**
- $i \in \{1, \ldots, G\}$ – response index in the group
- $t \in \{1, \ldots, |y_i|\}$ – token position within response $y_i$
- $y_{i,t}$ – the $t$-th token of the $i$-th response
- $y_{i,<t}$ – all tokens before position $t$ in response $i$
- $\hat{A}_i$ – advantage for response $i$ (shared across all tokens in that response)

The token-level importance ratio:

$$
r_{i,t}(\theta) = \frac{\pi_\theta(y_{i,t} \mid q, y_{i,<t})}{\pi_{\theta_{\text{old}}}(y_{i,t} \mid q, y_{i,<t})}
$$

The KL divergence term (it's an approximation, see [Schulman et al. (2020)](http://joschu.net/blog/kl-approx.html)) penalizes deviation from a reference policy $\pi_{\text{ref}}$:
$$
D_{\text{KL}}[\pi_\theta \| \pi_{\text{ref}}] = \frac{\pi_{\text{ref}}(y_{i,t} \mid q, y_{i,<t})}{\pi_\theta(y_{i,t} \mid q, y_{i,<t})} - \log \frac{\pi_{\text{ref}}(y_{i,t} \mid q, y_{i,<t})}{\pi_\theta(y_{i,t} \mid q, y_{i,<t})} - 1
$$
> **Note:** $\pi_{\theta_{\text{old}}}$ and $\pi_{\text{ref}}$ are different. $\pi_{\theta_{\text{old}}}$ is the policy that generated the samples (updated each iteration). $\pi_{\text{ref}}$ is a fixed reference (usually the SFT model) used for KL regularization to prevent the policy from drifting too far from the original model.

## The Problem: Hard Clipping

The clip operation creates a **hard cutoff**:

$$
\htmlClass{color-primary}{\operatorname{clip}(\rho, 1-\epsilon, 1+\epsilon)} = \begin{cases}
1-\epsilon & \text{if } \rho < 1-\epsilon \\
\rho & \text{if } 1-\epsilon \leq \rho \leq 1+\epsilon \\
1+\epsilon & \text{if } \rho > 1+\epsilon
\end{cases}
$$

When the ratio hits the boundary, the gradient contribution is **zeroed out** (the derivative of a constant = zero).

### Why This Is Bad

**1. Token-level variance is high in LLMs**

In long sequences, individual tokens can have extreme probability ratios even when the sequence overall is on-policy. A single rare token can push $\rho_t$ outside $[1-\epsilon, 1+\epsilon]$.

**2. The min operator discards useful signal**

When $\rho_t > 1+\epsilon$ and $\hat{A} > 0$, PPO takes the clipped value. But the gradient of $\operatorname{clip}(\rho_t, \cdot)$ with respect to $\theta$ is **zero** – the token contributes nothing to learning. Since we propagate the same advantage to each token, this can zero out useful signal from an entire sequence. Task failed successfully.

**3. Hyperparameter sensitivity**
- Small $\epsilon$ (0.1): aggressive clipping -> many tokens discarded -> slow learning
- Large $\epsilon$ (0.3): off-policy tokens dominate -> training instability

The Qwen team observed this is especially problematic for **MoE models** (routing decisions add extra variance) and **long-context training**, where token-level variance is even higher.

## SAPO: Soft Adaptive Policy Optimization

SAPO replaces the hard clip with a **soft gate centered at $r = 1$**. Instead of zeroing gradients, it down-weights off-policy tokens a bit more smoothly:
- Near $r = 1$ (on-policy): weight stays high -> keep gradients
- As $r$ moves away: weight decays gradually -> soften, not zero

### The Soft Gate

Instead of clipping $r_{i,t}$, SAPO applies a sigmoid-shaped weighting function:

$$
\htmlClass{color-secondary}{f(r; \tau)} = \sigma\big(\tau (r - 1)\big) \cdot \frac{4}{\tau}
$$

where $\tau$ is a temperature and $\sigma$ is the sigmoid function.

**Why $(r - 1)$?** This centers the function at $r = 1$ (on-policy):
- $r = 1 \Rightarrow f = \sigma(0) \cdot 4/\tau = 0.5 \cdot 4/\tau$
- $r > 1 \Rightarrow f$ increases (policy favors this token more)
- $r < 1 \Rightarrow f$ decreases (policy favors this token less)

**Temperature controls sharpness:**
- Small $\tau$: sharp transition (approaches hard clipping)
- Large $\tau$: smooth transition (tolerant of off-policy drift)

### Asymmetric Temperatures

SAPO uses **different temperatures** for positive vs negative advantages:

$$
\tau_{i,t} = \begin{cases} \tau_{\text{pos}} & \text{if } \hat{A}_i \geq 0 \\ \tau_{\text{neg}} & \text{if } \hat{A}_i < 0 \end{cases}
$$

with $\tau_{\text{neg}} < \tau_{\text{pos}}$ (e.g., 0.05 vs 0.1).

**Why?** Negative updates are more destabilizing – when you push down the probability of one token, you push up probabilities of many other (potentially wrong) tokens. This is fine (it's not). Tighter gating makes weights decay faster for off-policy tokens with negative advantage, limiting the damage.

### The SAPO Objective

$$
\mathcal{J}_{\text{SAPO}}(\theta) = \mathbb{E}_{q, \{y_i\}} \left[ \frac{1}{G} \sum_{i=1}^G \frac{1}{|y_i|} \sum_{t=1}^{|y_i|} \htmlClass{color-secondary}{f_{i,t}(r_{i,t})} \hat{A}_i - \beta \, D_{\text{KL}} \right]
$$

where

$$
\htmlClass{color-secondary}{f_{i,t}(r)} = \sigma\big(\tau_{i,t} (r - 1)\big) \cdot \frac{4}{\tau_{i,t}}
$$

with $\tau_{i,t}$ being the asymmetric temperature defined above.

**Results:** SAPO gives more stable training and better Pass@1 on math benchmarks. Gains are consistent across Qwen3-VL model sizes.

```python
# # Implementation
#
# Simplified from [TRL's GRPOTrainer](https://github.com/huggingface/trl/blob/main/trl/trainer/grpo_trainer.py)

import torch

# ## SAPO Token Loss
#
# The soft gate function that replaces hard clipping:
# $$
# f(r; \tau) = \sigma(\tau(r - 1)) \cdot \frac{4}{\tau}
# $$
# where $r = \pi_\theta / \pi_{\text{old}}$ is the importance ratio.

def get_sapo_token_loss(ratio: torch.Tensor, tau: float) -> torch.Tensor:
    return torch.sigmoid(tau * (ratio - 1)) * (4.0 / tau)

# ## SAPO Loss
#
# Per-token loss with asymmetric temperatures:
# $$
# \mathcal{L} = -f(r; \tau) \cdot \hat{A} + \beta \cdot D_{\text{KL}}
# $$
# where $\tau = \tau_{\text{pos}}$ if $\hat{A} \geq 0$, else $\tau = \tau_{\text{neg}}$.

def compute_sapo_loss(
    log_probs: torch.Tensor,           # (batch, seq_len) - log π_θ
    old_log_probs: torch.Tensor,       # (batch, seq_len) - log π_old
    advantages: torch.Tensor,          # (batch,) - per-sequence advantages
    mask: torch.Tensor,                # (batch, seq_len) - completion mask
    tau_pos: float = 20.0,
    tau_neg: float = 40.0,
    beta: float = 0.01,
    ref_log_probs: torch.Tensor = None # (batch, seq_len) - log π_ref for KL
) -> torch.Tensor:
    # Importance ratio: r = π_θ / π_old = exp(log π_θ - log π_old)
    log_ratio = log_probs - old_log_probs
    ratio = torch.exp(log_ratio)
    
    # Expand advantages: (batch,) -> (batch, seq_len)
    advantages_expanded = advantages.unsqueeze(-1).expand_as(ratio)
    
    # Asymmetric temperatures based on advantage sign
    per_token_loss = torch.empty_like(ratio)
    positive_mask = advantages_expanded > 0
    
    per_token_loss[positive_mask] = get_sapo_token_loss(ratio[positive_mask], tau_pos)
    per_token_loss[~positive_mask] = get_sapo_token_loss(ratio[~positive_mask], tau_neg)
    
    # Multiply by advantage (negative because we minimize)
    per_token_loss = -per_token_loss * advantages_expanded
    
    # KL penalty: D_KL[π_θ || π_ref] = π_ref/π_θ - log(π_ref/π_θ) - 1
    if ref_log_probs is not None and beta > 0:
        ratio_ref = torch.exp(ref_log_probs - log_probs)
        kl = ratio_ref - (ref_log_probs - log_probs) - 1
        per_token_loss = per_token_loss + beta * kl
    
    # Average over tokens, then over batch
    loss = ((per_token_loss * mask).sum(-1) / mask.sum(-1).clamp(min=1.0)).mean()
    return loss

# ## Advantage Computation
#
# Z-score normalization within the group:
# $$
# \hat{A}_i = \frac{R_i - \mu}{\sigma}, \quad \mu = \text{mean}(R), \; \sigma = \text{std}(R)
# $$

def compute_advantages(rewards: torch.Tensor) -> torch.Tensor:
    mean = rewards.mean()
    std = rewards.std().clamp(min=1e-8)
    return (rewards - mean) / std
```

# Notes

- For PPO -> GRPO derivation, see [this blogpost](https://huggingface.co/blog/NormalUhr/grpo). Here I covered only the basics needed for SAPO.
- Relation with GSPO (and related derivations) was intentionally omitted for the simplicity.
- I simplified notation in some formulas (because it's too verbose and I'm lazy). Check the papers for complete notation.
- The original SAPO paper doesn't include the KL term in the objective; I added it for consistency with vanilla GRPO paper.

# References

- [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/pdf/2402.03300), Zhihong Shao et al.
- [Soft Adaptive Policy Optimization](https://arxiv.org/pdf/2511.20347), Chang Gao et al.
- [TRL GRPOTrainer](https://github.com/huggingface/trl/blob/main/trl/trainer/grpo_trainer.py), HuggingFace
