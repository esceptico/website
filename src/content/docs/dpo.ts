export const dpoContent = `# # Direct Preference Optimization (DPO)
# 
# DPO is a breakthrough algorithm that simplifies RLHF by eliminating the
# reward model entirely. Instead of the standard RLHF pipeline:
# 
# 1. Collect human preferences $(x, y_w, y_l)$
# 2. Train a reward model $r_\\phi$ on preferences
# 3. Use RL (PPO/GRPO) to optimize policy against $r_\\phi$
# 
# DPO directly optimizes the policy on preference data in a single step.
# This is both simpler and more stable than RL-based approaches.
# 
# The key insight: the optimal policy under the RL objective has a
# closed-form solution, which can be rearranged into a classification loss.

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Optional
from dataclasses import dataclass

# ## The RLHF Objective
# 
# Standard RLHF maximizes expected reward while staying close to a reference:
# 
# $$\\max_{\\pi_\\theta} \\mathbb{E}_{x \\sim D, y \\sim \\pi_\\theta}[r(x, y)] - \\beta D_{KL}[\\pi_\\theta || \\pi_{ref}]$$
# 
# Where:
# - $\\pi_\\theta$ = policy model being trained
# - $\\pi_{ref}$ = reference model (usually SFT checkpoint)
# - $r(x, y)$ = reward for completion $y$ given prompt $x$
# - $\\beta$ = KL penalty coefficient
# - $D_{KL}$ = KL divergence to prevent reward hacking
# 
# This constrained optimization has an analytical solution:
# 
# $$\\pi^*(y|x) = \\frac{1}{Z(x)} \\pi_{ref}(y|x) \\exp\\left(\\frac{r(x,y)}{\\beta}\\right)$$
# 
# Where $Z(x)$ is the partition function (normalization constant).

# ## From Rewards to Preferences
# 
# We can invert the optimal policy equation to express the reward in terms
# of the policy ratio:
# 
# $$r(x, y) = \\beta \\log \\frac{\\pi_\\theta(y|x)}{\\pi_{ref}(y|x)} + \\beta \\log Z(x)$$
# 
# The Bradley-Terry preference model assumes humans prefer $y_w$ over $y_l$
# with probability:
# 
# $$P(y_w \\succ y_l | x) = \\sigma(r(x, y_w) - r(x, y_l))$$
# 
# Where $\\sigma$ is the sigmoid function. Substituting the reward expression
# and noting that $Z(x)$ cancels out, we get:
# 
# $$P(y_w \\succ y_l | x) = \\sigma\\left(\\beta \\log \\frac{\\pi_\\theta(y_w|x)}{\\pi_{ref}(y_w|x)} - \\beta \\log \\frac{\\pi_\\theta(y_l|x)}{\\pi_{ref}(y_l|x)}\\right)$$

# ## The DPO Loss
# 
# From the preference probability, we derive a simple binary cross-entropy loss:
# 
# $$\\mathcal{L}_{DPO} = -\\mathbb{E}_{(x, y_w, y_l) \\sim D} \\left[ \\log \\sigma\\left(\\beta \\left( \\log \\frac{\\pi_\\theta(y_w|x)}{\\pi_{ref}(y_w|x)} - \\log \\frac{\\pi_\\theta(y_l|x)}{\\pi_{ref}(y_l|x)} \\right)\\right) \\right]$$
# 
# Breaking this down into implementable pieces:
# 
# **Log Ratios** — measure how much policy differs from reference:
# $$\\rho_w = \\log \\pi_\\theta(y_w|x) - \\log \\pi_{ref}(y_w|x)$$
# $$\\rho_l = \\log \\pi_\\theta(y_l|x) - \\log \\pi_{ref}(y_l|x)$$
# 
# **Final Loss** — binary classification on which completion is preferred:
# $$\\mathcal{L} = -\\log \\sigma(\\beta (\\rho_w - \\rho_l))$$

@dataclass
class DPOBatch:
    """
    A batch of preference pairs for DPO training.
    
    Attributes:
        prompt_ids: Tokenized prompts, shape (B, prompt_len)
        chosen_ids: Preferred completions, shape (B, chosen_len)
        rejected_ids: Dispreferred completions, shape (B, rejected_len)
        chosen_mask: Mask for chosen completion tokens
        rejected_mask: Mask for rejected completion tokens
    """
    prompt_ids: torch.Tensor
    chosen_ids: torch.Tensor
    rejected_ids: torch.Tensor
    chosen_mask: Optional[torch.Tensor] = None
    rejected_mask: Optional[torch.Tensor] = None

# ## Computing Sequence Log Probabilities
# 
# We need per-token log probs summed over the completion:
# 
# $$\\log \\pi(y|x) = \\sum_{t=1}^{T} \\log \\pi(y_t | x, y_{<t})$$
# 
# Where:
# - $T$ = number of tokens in completion $y$
# - $y_t$ = token at position $t$ in the completion
# - $y_{<t}$ = all tokens before position $t$
# 
# Important: we sum (not average) to avoid length bias. DPO should prefer
# quality over verbosity, not penalize longer responses.

def compute_log_probs(
    model: nn.Module,
    input_ids: torch.Tensor,
    labels: torch.Tensor,
    mask: torch.Tensor,
) -> torch.Tensor:
    """
    Compute log probability of a sequence under the given model.
    
    Args:
        model: The language model (policy or reference)
        input_ids: Full input sequence (prompt + completion)
        labels: Target tokens (shifted completion)
        mask: Binary mask (1 for completion tokens we care about)
        
    Returns:
        Log probability of each sequence in the batch, shape (B,)
    """

# Forward pass: get logits for all positions
    outputs = model(input_ids, attention_mask=(input_ids != 0).long())
    logits = outputs.logits

# Shift for next-token prediction alignment
# logits[t] predicts token[t+1]
    shift_logits = logits[:, :-1, :].contiguous()
    shift_labels = labels[:, 1:].contiguous()
    shift_mask = mask[:, 1:].contiguous()

# Convert to log probabilities via log-softmax over vocabulary
    log_probs = F.log_softmax(shift_logits, dim=-1)

# Gather the log prob of each actual token that appeared
# index: which vocabulary entry to select at each position
    per_token_log_probs = log_probs.gather(
        dim=-1,
        index=shift_labels.unsqueeze(-1)
    ).squeeze(-1)

# Apply mask and sum: only count completion tokens
    masked_log_probs = per_token_log_probs * shift_mask
    sequence_log_probs = masked_log_probs.sum(dim=-1)

    return sequence_log_probs

# ## The DPO Loss Function
# 
# The loss encourages the model to assign higher probability to chosen
# completions relative to rejected ones, compared to the reference model.
# 
# Intuitively: "the policy should prefer $y_w$ over $y_l$ more than the
# reference does."

class DPOLoss(nn.Module):
    """
    Direct Preference Optimization loss function.
    
    Args:
        beta: Temperature parameter controlling strength of preference.
              Lower β → sharper preference, more aggressive updates.
              Higher β → softer preference, more conservative updates.
              Typical range: 0.1 to 0.5
        label_smoothing: Optional smoothing to prevent overconfidence.
                        Useful when preference labels are noisy.
    """

    def __init__(
        self,
        beta: float = 0.1,
        label_smoothing: float = 0.0,
    ):
        super().__init__()

# $\\beta$: Temperature parameter. This is the key hyperparameter.
# - Small β (0.05-0.1): Strong preference signal, faster learning
# - Large β (0.3-0.5): Weaker signal, more stable but slower
        self.beta = beta

# Label smoothing prevents the model from becoming overconfident
# on potentially noisy preference labels.
        self.label_smoothing = label_smoothing

    def forward(
        self,
        policy_chosen_logps: torch.Tensor,
        policy_rejected_logps: torch.Tensor,
        ref_chosen_logps: torch.Tensor,
        ref_rejected_logps: torch.Tensor,
    ) -> Tuple[torch.Tensor, dict]:
        """
        Compute DPO loss from log probabilities.
        
        Args:
            policy_chosen_logps: log π_θ(y_w|x), shape (B,)
            policy_rejected_logps: log π_θ(y_l|x), shape (B,)
            ref_chosen_logps: log π_ref(y_w|x), shape (B,)
            ref_rejected_logps: log π_ref(y_l|x), shape (B,)
            
        Returns:
            loss: Scalar DPO loss
            metrics: Dictionary of training metrics
        """

# Step 1: Compute log ratios (implicit rewards)
# $\\rho_w = \\log \\pi_\\theta(y_w|x) - \\log \\pi_{ref}(y_w|x)$
        chosen_log_ratios = policy_chosen_logps - ref_chosen_logps

# $\\rho_l = \\log \\pi_\\theta(y_l|x) - \\log \\pi_{ref}(y_l|x)$
        rejected_log_ratios = policy_rejected_logps - ref_rejected_logps

# Step 2: Compute logits for the preference classifier
# $\\text{logits} = \\beta (\\rho_w - \\rho_l)$
        logits = self.beta * (chosen_log_ratios - rejected_log_ratios)

# Step 3: Binary cross-entropy loss
# Target is 1 (chosen should be preferred) with optional smoothing
        if self.label_smoothing > 0:
            # Smooth labels: instead of 1, use (1 - ε)
            target = torch.ones_like(logits) * (1 - self.label_smoothing)
            loss = F.binary_cross_entropy_with_logits(
                logits, target, reduction='mean'
            )
        else:
            # Standard log-sigmoid loss: -log σ(logits)
            loss = -F.logsigmoid(logits).mean()

# Compute implicit reward margin for monitoring
# Positive means chosen is preferred, which is what we want
        reward_margin = (chosen_log_ratios - rejected_log_ratios).mean()

# Accuracy: how often does the model prefer chosen over rejected?
        accuracy = (logits > 0).float().mean()

        metrics = {
            "loss": loss.item(),
            "reward_margin": reward_margin.item(),
            "accuracy": accuracy.item(),
            "chosen_log_ratio": chosen_log_ratios.mean().item(),
            "rejected_log_ratio": rejected_log_ratios.mean().item(),
        }

        return loss, metrics

# ## Why DPO Works
# 
# DPO has several advantages over standard RLHF:
# 
# - **Models needed**: RLHF requires 4 (policy, ref, reward, value), DPO only needs 2 (policy, ref)
# - **Training stability**: RLHF is sensitive to hyperparameters, DPO is stable like SFT
# - **Sample efficiency**: RLHF needs on-policy samples, DPO uses offline data
# - **Memory**: RLHF uses ~4x model size, DPO uses ~2x model size
# - **Complexity**: RLHF has RL loop with generation, DPO is simple gradient descent
# 
# The key insight is that we never need to explicitly learn or sample from
# the optimal policy — we can directly optimize the preference objective.

# ## The DPO Trainer
# 
# Training is remarkably simple: just supervised learning on preference pairs.
# No generation, no reward model, no complex RL dynamics.

class DPOTrainer:
    """
    DPO trainer for preference learning.
    
    Args:
        policy_model: The LLM being fine-tuned (π_θ)
        ref_model: Frozen reference model (π_ref)
        tokenizer: Tokenizer for encoding/decoding
        lr: Learning rate (similar to SFT, can be higher than RL)
        beta: DPO temperature parameter
        max_grad_norm: Gradient clipping threshold
    """

    def __init__(
        self,
        policy_model: nn.Module,
        ref_model: nn.Module,
        tokenizer,
        lr: float = 5e-7,
        beta: float = 0.1,
        max_grad_norm: float = 1.0,
    ):

# $\\pi_\\theta$: Policy model to train
        self.policy = policy_model

# $\\pi_{ref}$: Frozen reference. DPO needs this to stay fixed.
        self.ref = ref_model
        self.ref.eval()
        for p in self.ref.parameters():
            p.requires_grad = False

        self.tokenizer = tokenizer

# Gradient clipping for stability
        self.max_grad_norm = max_grad_norm

# Standard optimizer — DPO is stable enough for normal LRs
# Can use 5x-10x higher LR than RL-based methods
        self.optimizer = torch.optim.AdamW(
            self.policy.parameters(),
            lr=lr,
            betas=(0.9, 0.999),
            weight_decay=0.01,
        )

        self.loss_fn = DPOLoss(beta=beta)

# ## Training Step
# 
# Each step processes a batch of preference pairs $(x, y_w, y_l)$:
# 
# 1. Compute log probs for both completions under both models
# 2. Compute DPO loss from the four log prob values
# 3. Backpropagate and update policy
# 
# No generation or sampling required — pure supervised learning.

    def train_step(
        self,
        batch: DPOBatch,
    ) -> dict:
        """
        Perform one DPO training step.
        
        Args:
            batch: DPOBatch containing prompts and preference pairs
            
        Returns:
            Dictionary of training metrics
        """
        self.policy.train()

# Concatenate prompt + completion for full sequences
        chosen_input = torch.cat([batch.prompt_ids, batch.chosen_ids], dim=1)
        rejected_input = torch.cat([batch.prompt_ids, batch.rejected_ids], dim=1)

# Create masks: only compute loss on completion tokens
        prompt_len = batch.prompt_ids.shape[1]
        chosen_mask = torch.zeros_like(chosen_input)
        chosen_mask[:, prompt_len:] = 1
        rejected_mask = torch.zeros_like(rejected_input)
        rejected_mask[:, prompt_len:] = 1

# Compute log probs under policy $\\pi_\\theta$
        policy_chosen_logps = compute_log_probs(
            self.policy, chosen_input, chosen_input, chosen_mask
        )
        policy_rejected_logps = compute_log_probs(
            self.policy, rejected_input, rejected_input, rejected_mask
        )

# Compute log probs under reference $\\pi_{ref}$ (no gradients)
        with torch.no_grad():
            ref_chosen_logps = compute_log_probs(
                self.ref, chosen_input, chosen_input, chosen_mask
            )
            ref_rejected_logps = compute_log_probs(
                self.ref, rejected_input, rejected_input, rejected_mask
            )

# Compute loss and backprop
        loss, metrics = self.loss_fn(
            policy_chosen_logps,
            policy_rejected_logps,
            ref_chosen_logps,
            ref_rejected_logps,
        )

        self.optimizer.zero_grad()
        loss.backward()

# Gradient clipping for stability
        torch.nn.utils.clip_grad_norm_(
            self.policy.parameters(),
            self.max_grad_norm
        )

        self.optimizer.step()

        return metrics

# ## DPO Variants
# 
# Several improvements to vanilla DPO have been proposed:
# 
# **IPO (Identity Preference Optimization)**: Uses a different loss that
# avoids the "length exploitation" issue where DPO can prefer shorter responses.
# 
# **cDPO (Conservative DPO)**: Adds label smoothing to handle noisy preferences.
# 
# **KTO (Kahneman-Tversky Optimization)**: Works with binary feedback
# (good/bad) instead of pairwise preferences.
# 
# **ORPO (Odds Ratio Preference Optimization)**: Combines SFT and preference
# learning into a single objective, eliminating the need for a reference model.
`;

