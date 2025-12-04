export const grpoContent = `# # Group Relative Policy Optimization (GRPO)
# 
# GRPO is a reinforcement learning algorithm introduced by DeepSeek
# for efficient LLM fine-tuning. It addresses a key limitation of PPO:
# the need for a separate critic (value) network.
# 
# In standard RLHF with PPO, you need four models:
# 
# - **Policy model** $\\pi_\\theta$: The LLM being trained
# - **Reference model** $\\pi_{ref}$: Frozen copy for KL penalty
# - **Reward model** $r_\\phi$: Learned from human preferences
# - **Value model** $V_\\psi$: Critic for advantage estimation
# 
# For large models, maintaining 4 networks is extremely memory-intensive.
# GRPO eliminates the value model entirely by estimating baselines
# from group statistics, cutting memory requirements by ~25%.

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import List, Tuple, Optional

# ## The Problem with Critics
# 
# In PPO, advantages are computed using the TD residual:
# 
# $$\\hat{A}_t = r_t + \\gamma V(s_{t+1}) - V(s_t)$$
# 
# Where:
# - $\\hat{A}_t$ = estimated advantage at timestep $t$
# - $r_t$ = reward received at timestep $t$
# - $\\gamma$ = discount factor (typically 0.99)
# - $V(s)$ = learned value function estimating expected return from state $s$
# 
# This requires training a value function $V_\\psi(s)$ which:
# - Doubles trainable parameters for LLM-scale models
# - Introduces additional training instability
# - Needs careful balancing between policy and value losses
# 
# GRPO's insight: for single-turn generation tasks, we can estimate
# baselines from multiple samples of the same prompt instead.

# ## Group Relative Advantages
# 
# The core idea is elegant. Given a prompt $x$, generate $G$ different
# completions $\\{y_1, y_2, ..., y_G\\}$ and compute their rewards.
# Then normalize within the group:
# 
# $$\\hat{A}_i = \\frac{r_i - \\mu_G}{\\sigma_G + \\epsilon}$$
# 
# Where:
# - $\\hat{A}_i$ = advantage for completion $i$
# - $r_i$ = reward for completion $i$ from the reward model
# - $\\mu_G = \\frac{1}{G}\\sum_{j=1}^G r_j$ = mean reward in the group
# - $\\sigma_G = \\sqrt{\\frac{1}{G}\\sum_{j=1}^G (r_j - \\mu_G)^2}$ = standard deviation
# - $\\epsilon$ = small constant (1e-8) for numerical stability
# 
# Intuitively: "how many standard deviations better (or worse) is this
# completion compared to other completions from the same prompt?"

def compute_group_advantages(
    rewards: torch.Tensor,
    eps: float = 1e-8,
) -> torch.Tensor:
    """
    Compute group-relative advantages from a batch of rewards.
    
    Args:
        rewards: Tensor of shape (G,) containing rewards for G completions
        eps: Small constant for numerical stability
    
    Returns:
        Tensor of shape (G,) containing normalized advantages
    """

# Compute $\\mu_G$: the group mean serves as our baseline.
# This replaces the learned value function from PPO.
    mean_reward = rewards.mean()

# Compute $\\sigma_G$: normalizes the scale of advantages.
# This prevents gradient updates from being too large or too small.
    std_reward = rewards.std()

# Edge case: if all rewards are identical, advantages are zero.
# This prevents division by zero and makes intuitive sense.
    if std_reward < eps:
        return torch.zeros_like(rewards)

# Final normalized advantages: $\\hat{A}_i = (r_i - \\mu_G) / \\sigma_G$
# Positive values = better than average, negative = worse than average.
    advantages = (rewards - mean_reward) / (std_reward + eps)

    return advantages

# ## Why Group Size Matters
# 
# The group size $G$ controls the bias-variance tradeoff of our baseline:
# 
# - **Small G (4-8)**: High variance in $\\mu_G$ estimate, but faster
#   iteration and less memory per batch
# - **Large G (16-64)**: More stable baseline estimate, but requires
#   more forward passes and memory per update
# 
# DeepSeek found $G=8$ works well in practice. Larger isn't always
# better — diversity of samples matters more than quantity.

# ## GRPO Loss Function
# 
# The full GRPO objective combines three terms:
# 
# $$\\mathcal{L}_{GRPO} = \\mathcal{L}_{PG} + \\beta \\cdot \\mathcal{L}_{KL}$$
# 
# **Policy Gradient Loss** — maximize advantage-weighted log probs:
# $$\\mathcal{L}_{PG} = -\\frac{1}{G}\\sum_{i=1}^G \\hat{A}_i \\cdot \\log\\pi_\\theta(y_i|x)$$
# 
# Where:
# - $\\pi_\\theta(y_i|x)$ = probability of completion $y_i$ given prompt $x$
# - $\\hat{A}_i$ = group-relative advantage (computed above)
# 
# **KL Penalty** — prevent divergence from reference policy:
# $$\\mathcal{L}_{KL} = D_{KL}(\\pi_\\theta || \\pi_{ref}) \\approx \\mathbb{E}[\\log\\pi_{ref} - \\log\\pi_\\theta]$$
# 
# Where:
# - $\\beta$ = KL penalty coefficient (typically 0.01-0.1)
# - $\\pi_{ref}$ = frozen reference model (usually the SFT checkpoint)

class GRPOLoss(nn.Module):
    """
    GRPO loss function combining policy gradient and KL divergence.
    
    Args:
        beta: KL penalty coefficient. Controls policy-reference divergence.
              Too low → reward hacking. Too high → slow learning.
        entropy_coef: Optional entropy bonus coefficient for exploration.
    """

    def __init__(
        self,
        beta: float = 0.04,
        entropy_coef: float = 0.01,
    ):
        super().__init__()

# $\\beta$: KL penalty weight. This is the most important hyperparameter.
# Range 0.01-0.1 typically works. Start with 0.04 and tune.
        self.beta = beta

# Optional entropy coefficient to encourage exploration.
        self.entropy_coef = entropy_coef

    def forward(
        self,
        log_probs: torch.Tensor,
        ref_log_probs: torch.Tensor,
        rewards: torch.Tensor,
        mask: Optional[torch.Tensor] = None,
    ) -> Tuple[torch.Tensor, dict]:
        """
        Compute GRPO loss.
        
        Args:
            log_probs: Log probs under current policy, shape (G,)
            ref_log_probs: Log probs under reference policy, shape (G,)
            rewards: Rewards from reward model, shape (G,)
            mask: Optional attention mask
            
        Returns:
            loss: Scalar loss tensor
            metrics: Dict of training metrics
        """

# Step 1: Compute group-relative advantages $\\hat{A}_i$
        advantages = compute_group_advantages(rewards)

# Step 2: Policy gradient loss $\\mathcal{L}_{PG}$
# Negative because we minimize loss but want to maximize expected advantage.
        pg_loss = -(advantages * log_probs).mean()

# Step 3: KL divergence $D_{KL}(\\pi_\\theta || \\pi_{ref})$
# Using reverse KL which is mode-seeking (encourages high-quality outputs).
        kl_div = (ref_log_probs - log_probs).mean()

# Step 4: Combine into total loss
        loss = pg_loss + self.beta * kl_div

# Track metrics for logging and debugging
        metrics = {
            "pg_loss": pg_loss.item(),
            "kl_div": kl_div.item(),
            "advantages_mean": advantages.mean().item(),
            "advantages_std": advantages.std().item(),
            "reward_mean": rewards.mean().item(),
            "reward_std": rewards.std().item(),
        }

        return loss, metrics

# ## The GRPO Trainer
# 
# The training loop differs from PPO in a key way: we generate $G$
# completions per prompt *before* computing any gradients. This is
# "on-policy" learning with a group-based baseline.

class GRPOTrainer:
    """
    GRPO trainer handling the full training loop.
    
    Args:
        policy_model: The LLM being fine-tuned (π_θ)
        ref_model: Frozen reference model (π_ref), usually SFT checkpoint
        tokenizer: Tokenizer for encoding/decoding
        lr: Learning rate (use small values like 1e-6 for LLMs)
        beta: KL penalty coefficient
        group_size: Number of completions G to sample per prompt
        max_grad_norm: Gradient clipping threshold
    """

    def __init__(
        self,
        policy_model: nn.Module,
        ref_model: nn.Module,
        tokenizer,
        lr: float = 1e-6,
        beta: float = 0.04,
        group_size: int = 8,
        max_grad_norm: float = 1.0,
    ):

# $\\pi_\\theta$: The policy model we're training
        self.policy = policy_model

# $\\pi_{ref}$: Frozen reference model. Keeps policy grounded.
        self.ref = ref_model
        self.ref.eval()
        for p in self.ref.parameters():
            p.requires_grad = False

        self.tokenizer = tokenizer

# $G$: Group size for sampling
        self.group_size = group_size

# Gradient clipping threshold for stability
        self.max_grad_norm = max_grad_norm

# AdamW optimizer with conservative hyperparameters.
# Low LR is crucial — RL fine-tuning is very sensitive.
        self.optimizer = torch.optim.AdamW(
            self.policy.parameters(),
            lr=lr,
            betas=(0.9, 0.95),
            weight_decay=0.1,
        )

        self.loss_fn = GRPOLoss(beta=beta)

# ## Generating Completion Groups
# 
# For each prompt $x$, sample $G$ completions using temperature sampling.
# Higher temperature $\\tau$ → more diverse samples → better exploration.
# 
# We track which tokens are generated (vs prompt) since loss is only
# computed on generated tokens.

    @torch.no_grad()
    def generate_group(
        self,
        prompt_ids: torch.Tensor,
        max_new_tokens: int = 256,
        temperature: float = 0.8,
        top_p: float = 0.95,
    ) -> Tuple[List[torch.Tensor], List[torch.Tensor]]:
        """
        Generate G completions for the given prompt.
        
        Args:
            prompt_ids: Tokenized prompt, shape (1, seq_len)
            max_new_tokens: Maximum tokens to generate
            temperature: Sampling temperature τ (higher = more diverse)
            top_p: Nucleus sampling threshold
            
        Returns:
            completions: List of G completion tensors
            masks: List of G masks (1 for generated tokens, 0 for prompt)
        """
        completions = []
        completion_masks = []
        prompt_len = prompt_ids.shape[1]

        for _ in range(self.group_size):

# Sample with temperature $\\tau$ for diversity across the group
            output = self.policy.generate(
                prompt_ids,
                max_new_tokens=max_new_tokens,
                do_sample=True,
                temperature=temperature,
                top_p=top_p,
                pad_token_id=self.tokenizer.pad_token_id,
            )

# Create mask: we only compute loss on generated tokens
            mask = torch.zeros_like(output)
            mask[:, prompt_len:] = 1

            completions.append(output)
            completion_masks.append(mask)

        return completions, completion_masks

# ## Computing Sequence Log Probabilities
# 
# We need $\\log\\pi(y|x)$ for entire sequences. This is the sum (not
# average) of per-token log probs to avoid biasing against longer outputs:
# 
# $$\\log\\pi_\\theta(y|x) = \\sum_{t=1}^T \\log\\pi_\\theta(y_t | x, y_{<t})$$
# 
# Where:
# - $T$ = number of generated tokens
# - $y_t$ = token at position $t$
# - $y_{<t}$ = all tokens before position $t$

    def get_sequence_log_probs(
        self,
        model: nn.Module,
        input_ids: torch.Tensor,
        mask: torch.Tensor,
    ) -> torch.Tensor:
        """
        Compute log probability of a sequence under the given model.
        
        Args:
            model: The model (policy or reference)
            input_ids: Full sequence (prompt + completion)
            mask: Binary mask (1 for completion tokens, 0 for prompt)
            
        Returns:
            Scalar log probability of the completion
        """

# Forward pass: get logits for all positions
        outputs = model(input_ids)
        logits = outputs.logits

# Shift for next-token prediction: predict token t from tokens 0..t-1
        shift_logits = logits[:, :-1, :].contiguous()
        shift_labels = input_ids[:, 1:].contiguous()
        shift_mask = mask[:, 1:].contiguous()

# Convert logits to log probabilities via log-softmax
        log_probs = F.log_softmax(shift_logits, dim=-1)

# Gather log probs for the actual tokens that were generated
        token_log_probs = log_probs.gather(
            dim=-1,
            index=shift_labels.unsqueeze(-1)
        ).squeeze(-1)

# Apply mask and sum: $\\sum_t \\log\\pi(y_t | y_{<t})$
        masked_log_probs = token_log_probs * shift_mask
        sequence_log_probs = masked_log_probs.sum(dim=-1)

        return sequence_log_probs

# ## Training Step
# 
# One GRPO update consists of four steps:
# 
# 1. Generate $G$ completions for the prompt
# 2. Score each with the reward model $r_\\phi$
# 3. Compute group-relative advantages $\\hat{A}_i$
# 4. Update policy to increase $\\pi_\\theta(y_i|x)$ for high-advantage $y_i$

    def train_step(
        self,
        prompt_ids: torch.Tensor,
        reward_model,
    ) -> dict:
        """
        Perform one GRPO training step.
        
        Args:
            prompt_ids: Tokenized prompt
            reward_model: Model that scores completions
            
        Returns:
            Dictionary of training metrics
        """
        self.policy.train()

# Step 1: Sample G completions from current policy $\\pi_\\theta$
        completions, masks = self.generate_group(prompt_ids)

# Step 2: Score completions with reward model $r_\\phi$
        rewards = []
        for completion in completions:
            with torch.no_grad():
                reward = reward_model(completion)
            rewards.append(reward)
        rewards = torch.stack(rewards)

# Step 3: Compute log probs under both $\\pi_\\theta$ and $\\pi_{ref}$
        all_policy_log_probs = []
        all_ref_log_probs = []

        for completion, mask in zip(completions, masks):

# $\\log\\pi_\\theta(y|x)$ — with gradients for backprop
            policy_lp = self.get_sequence_log_probs(
                self.policy, completion, mask
            )
            all_policy_log_probs.append(policy_lp)

# $\\log\\pi_{ref}(y|x)$ — no gradients, just for KL computation
            with torch.no_grad():
                ref_lp = self.get_sequence_log_probs(
                    self.ref, completion, mask
                )
            all_ref_log_probs.append(ref_lp)

        policy_log_probs = torch.cat(all_policy_log_probs)
        ref_log_probs = torch.cat(all_ref_log_probs)

# Step 4: Compute loss and update parameters
        loss, metrics = self.loss_fn(
            policy_log_probs,
            ref_log_probs,
            rewards,
        )

        self.optimizer.zero_grad()
        loss.backward()

# Gradient clipping prevents exploding gradients
        torch.nn.utils.clip_grad_norm_(
            self.policy.parameters(),
            self.max_grad_norm
        )

        self.optimizer.step()

        metrics["loss"] = loss.item()
        return metrics
`;
