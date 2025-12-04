export const samplingContent = `# # Top-k and Top-p Sampling
# 
# When generating text from language models, we need to convert
# the output probability distribution into actual tokens. The naive
# approach — always picking the most likely token (greedy decoding) —
# produces repetitive and boring text.
# 
# **Sampling** introduces randomness by drawing from the distribution,
# but pure sampling can select unlikely tokens that derail generation.
# Top-k and top-p are two techniques to constrain sampling to
# "reasonable" tokens while preserving diversity.

import torch
import torch.nn.functional as F
from typing import Optional

# ## The Problem with Greedy Decoding
# 
# Greedy decoding always selects $\\arg\\max_v P(v|\\text{context})$.
# This leads to:
# 
# - **Repetition**: High-probability sequences get stuck in loops
# - **Boring outputs**: No creativity or variation
# - **Mode collapse**: Ignores the rich tail of the distribution
# 
# Pure random sampling fixes diversity but introduces a new problem:
# occasionally selecting very unlikely tokens that produce nonsense.

def greedy_decode(logits: torch.Tensor) -> torch.Tensor:
    """
    Always select the most probable token.
    Fast but produces repetitive, low-quality text.
    
    Args:
        logits: Raw model outputs, shape (batch, vocab_size)
        
    Returns:
        Selected token indices, shape (batch,)
    """

# Simply take argmax — no randomness at all
    return logits.argmax(dim=-1)

# ## Temperature Scaling
# 
# Before discussing top-k/top-p, we need temperature $\\tau$.
# Temperature reshapes the probability distribution:
# 
# $$P(v) = \\frac{\\exp(z_v / \\tau)}{\\sum_j \\exp(z_j / \\tau)}$$
# 
# Where:
# - $z_v$ = logit (raw score) for token $v$
# - $\\tau$ = temperature parameter
# 
# Effects of temperature:
# - $\\tau < 1$: Sharper distribution (more confident, less diverse)
# - $\\tau = 1$: Original distribution
# - $\\tau > 1$: Flatter distribution (less confident, more diverse)
# - $\\tau \\to 0$: Approaches greedy decoding
# - $\\tau \\to \\infty$: Approaches uniform distribution

def apply_temperature(
    logits: torch.Tensor,
    temperature: float = 1.0,
) -> torch.Tensor:
    """
    Apply temperature scaling to logits.
    
    Args:
        logits: Raw model outputs, shape (batch, vocab_size)
        temperature: τ parameter. Lower = sharper, higher = flatter.
        
    Returns:
        Scaled logits
    """

# Temperature of 0 would cause division by zero
    if temperature <= 0:
        raise ValueError("Temperature must be positive")

# Simple division: z_v / τ
# Lower temperature amplifies differences between logits
    return logits / temperature

# ## Top-k Sampling
# 
# Top-k sampling restricts the candidate pool to the $k$ most
# probable tokens, then samples from this reduced set.
# 
# Algorithm:
# 1. Sort tokens by probability
# 2. Keep only the top $k$ tokens
# 3. Re-normalize probabilities over these $k$ tokens
# 4. Sample from this truncated distribution
# 
# The key hyperparameter is $k$:
# - $k = 1$: Equivalent to greedy decoding
# - $k = 50$: Common default, good balance
# - $k = |V|$: Pure sampling (no filtering)

def top_k_sampling(
    logits: torch.Tensor,
    k: int = 50,
    temperature: float = 1.0,
) -> torch.Tensor:
    """
    Sample from the top-k most probable tokens.
    
    Args:
        logits: Raw model outputs, shape (batch, vocab_size)
        k: Number of top tokens to consider
        temperature: Temperature for probability scaling
        
    Returns:
        Sampled token indices, shape (batch,)
    """

# Step 1: Apply temperature scaling
    scaled_logits = apply_temperature(logits, temperature)

# Step 2: Find the k-th largest logit value (threshold)
# topk returns (values, indices), we only need the values
    top_k_values, _ = torch.topk(scaled_logits, k, dim=-1)

# The k-th largest value is at index k-1
    threshold = top_k_values[:, -1, None]

# Step 3: Mask out all tokens below the threshold
# Set their logits to -inf so they get 0 probability after softmax
    filtered_logits = torch.where(
        scaled_logits >= threshold,
        scaled_logits,
        torch.full_like(scaled_logits, float('-inf'))
    )

# Step 4: Convert to probabilities and sample
    probs = F.softmax(filtered_logits, dim=-1)
    sampled_token = torch.multinomial(probs, num_samples=1)

    return sampled_token.squeeze(-1)

# ## The Problem with Fixed k
# 
# Top-k has a fundamental issue: $k$ is fixed regardless of the
# distribution shape.
# 
# Consider two scenarios:
# 
# **Scenario A**: Model is confident
# - Token "the" has 95% probability
# - Top-50 includes many near-zero probability tokens
# - Sampling might select something nonsensical
# 
# **Scenario B**: Model is uncertain
# - 100 tokens each have ~1% probability
# - Top-50 excludes half the reasonable options
# - Artificially constrains valid completions
# 
# We need $k$ to adapt to the distribution shape. Enter top-p.

# ## Top-p (Nucleus) Sampling
# 
# Top-p sampling dynamically selects the smallest set of tokens
# whose cumulative probability exceeds threshold $p$:
# 
# $$\\text{nucleus} = \\arg\\min_{V'} \\left| V' \\right| \\text{ s.t. } \\sum_{v \\in V'} P(v) \\geq p$$
# 
# Where:
# - $V'$ = subset of vocabulary (the "nucleus")
# - $p$ = probability threshold (typically 0.9-0.95)
# - $|V'|$ = number of tokens in the nucleus
# 
# This adapts to distribution shape:
# - Confident model → small nucleus (few tokens)
# - Uncertain model → large nucleus (many tokens)

def top_p_sampling(
    logits: torch.Tensor,
    p: float = 0.9,
    temperature: float = 1.0,
) -> torch.Tensor:
    """
    Sample from the smallest set of tokens with cumulative prob >= p.
    Also known as "nucleus sampling".
    
    Args:
        logits: Raw model outputs, shape (batch, vocab_size)
        p: Cumulative probability threshold (0.9 = top 90% of mass)
        temperature: Temperature for probability scaling
        
    Returns:
        Sampled token indices, shape (batch,)
    """

# Step 1: Apply temperature scaling
    scaled_logits = apply_temperature(logits, temperature)

# Step 2: Sort tokens by probability (descending)
    sorted_logits, sorted_indices = torch.sort(
        scaled_logits, descending=True, dim=-1
    )

# Step 3: Compute cumulative probabilities
    sorted_probs = F.softmax(sorted_logits, dim=-1)
    cumulative_probs = torch.cumsum(sorted_probs, dim=-1)

# Step 4: Find cutoff — first position where cumsum exceeds p
# We want to KEEP tokens where cumsum <= p (plus one more)
# Shift right by 1 so we include the token that crosses threshold
    sorted_mask = cumulative_probs <= p

# Always keep at least the top token
    sorted_mask[:, 0] = True

# Step 5: Mask out tokens outside the nucleus
    sorted_logits = torch.where(
        sorted_mask,
        sorted_logits,
        torch.full_like(sorted_logits, float('-inf'))
    )

# Step 6: Unsort back to original vocabulary order
    filtered_logits = torch.zeros_like(logits)
    filtered_logits.scatter_(dim=-1, index=sorted_indices, src=sorted_logits)

# Step 7: Sample from the nucleus
    probs = F.softmax(filtered_logits, dim=-1)
    sampled_token = torch.multinomial(probs, num_samples=1)

    return sampled_token.squeeze(-1)

# ## Combined Top-k and Top-p
# 
# In practice, we often combine both methods:
# 
# 1. First apply top-k to remove the long tail of unlikely tokens
# 2. Then apply top-p to adapt to distribution shape
# 
# This gives us the benefits of both:
# - Top-k provides a hard ceiling on candidates
# - Top-p adapts to model confidence

def top_k_top_p_sampling(
    logits: torch.Tensor,
    k: int = 50,
    p: float = 0.9,
    temperature: float = 1.0,
    min_tokens_to_keep: int = 1,
) -> torch.Tensor:
    """
    Combined top-k and top-p (nucleus) sampling.
    
    Args:
        logits: Raw model outputs, shape (batch, vocab_size)
        k: Maximum number of tokens to consider (top-k)
        p: Cumulative probability threshold (top-p)
        temperature: Temperature scaling parameter
        min_tokens_to_keep: Always keep at least this many tokens
        
    Returns:
        Sampled token indices, shape (batch,)
    """

# Step 1: Apply temperature
    scaled_logits = apply_temperature(logits, temperature)

# Step 2: Apply top-k filtering first
    if k > 0:
        top_k_values, _ = torch.topk(scaled_logits, min(k, scaled_logits.size(-1)))
        threshold_k = top_k_values[:, -1, None]
        scaled_logits = torch.where(
            scaled_logits >= threshold_k,
            scaled_logits,
            torch.full_like(scaled_logits, float('-inf'))
        )

# Step 3: Apply top-p filtering on remaining tokens
    sorted_logits, sorted_indices = torch.sort(scaled_logits, descending=True, dim=-1)
    sorted_probs = F.softmax(sorted_logits, dim=-1)
    cumulative_probs = torch.cumsum(sorted_probs, dim=-1)

# Create mask for nucleus (cumsum <= p, keeping at least min_tokens)
    sorted_mask = cumulative_probs <= p
    sorted_mask[:, :min_tokens_to_keep] = True

# Mask out tokens outside nucleus
    sorted_logits = torch.where(
        sorted_mask,
        sorted_logits,
        torch.full_like(sorted_logits, float('-inf'))
    )

# Unsort and sample
    filtered_logits = torch.zeros_like(logits)
    filtered_logits.scatter_(dim=-1, index=sorted_indices, src=sorted_logits)
    
    probs = F.softmax(filtered_logits, dim=-1)
    return torch.multinomial(probs, num_samples=1).squeeze(-1)

# ## Practical Recommendations
# 
# Common hyperparameter settings by use case:
# 
# - **Creative writing**: temperature 0.8-1.0, top-k 50-100, top-p 0.95
# - **Code generation**: temperature 0.2-0.4, top-k 10-40, top-p 0.9
# - **Factual Q&A**: temperature 0.1-0.3, top-k 5-20, top-p 0.8
# - **Chat/dialogue**: temperature 0.7-0.9, top-k 40-60, top-p 0.9
# 
# General guidelines:
# - Start with $\\tau=0.7$, $k=50$, $p=0.9$
# - Lower temperature for more factual/deterministic outputs
# - Higher temperature for more creative/diverse outputs
# - Top-p alone (with k disabled) often works well

def sample_with_config(
    logits: torch.Tensor,
    temperature: float = 0.7,
    top_k: int = 50,
    top_p: float = 0.9,
    do_sample: bool = True,
) -> torch.Tensor:
    """
    Sample with configurable strategy — typical generation interface.
    
    Args:
        logits: Raw model outputs
        temperature: Temperature scaling (0 = greedy)
        top_k: Top-k filtering (0 = disabled)
        top_p: Top-p filtering (1.0 = disabled)
        do_sample: If False, use greedy decoding regardless of other params
        
    Returns:
        Sampled or selected token indices
    """

# Greedy decoding: ignore all sampling parameters
    if not do_sample or temperature == 0:
        return greedy_decode(logits)

# Apply combined top-k/top-p sampling
    return top_k_top_p_sampling(
        logits,
        k=top_k if top_k > 0 else logits.size(-1),
        p=top_p,
        temperature=temperature,
    )
`;


