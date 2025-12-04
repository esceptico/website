export const ropeContent = `# # Rotary Position Embeddings (RoPE)
# 
# RoPE is a position encoding method introduced in the RoFormer paper
# that encodes position information by rotating feature vectors.
# Unlike absolute or learned position embeddings, RoPE naturally
# captures relative positions through the properties of rotation.
# 
# The key insight: if we rotate query and key vectors by angles
# proportional to their positions, their dot product will depend
# only on the *relative* distance between positions.
# 
# **Implementation note**: This implementation uses complex number
# multiplication for rotation. While most codebases (LLaMA, HuggingFace)
# use explicit sin/cos formulas, the complex plane approach is simpler
# to understand — rotation is just multiplication by $e^{i\\theta}$.
# 
# We also use [einops](https://github.com/arogozhnikov/einops) for
# tensor operations — it makes the transformations more readable.

from dataclasses import dataclass

import torch
from einops import einsum, rearrange
from torch import nn

# ## Configuration
# 
# RoPE requires knowing the head dimension (for computing rotation
# frequencies) and theta (base frequency, typically 10,000).
# 
# Higher theta values extend the effective context length by
# making the rotation frequencies decay more slowly.

@dataclass
class Config:
    hidden_size: int = 16
    head_dim: int = 8
    num_attention_heads: int = 4
    rope_theta: float = 10_000

# ## Rotary Position Embeddings
# 
# The core idea: treat pairs of features as 2D coordinates and
# rotate them based on position. Different feature pairs rotate
# at different frequencies (like a Fourier basis).
# 
# Mathematically, for position $m$ and dimension $d$:
# $$\\theta_d = \\frac{1}{\\theta_{base}^{2d/D}}$$
# 
# Where $D$ is the head dimension and $d$ indexes the dimension pairs.

class RoPE(nn.Module):
    def __init__(self, config: Config):
        super().__init__()
        self.config = config
        self.theta = config.rope_theta
        self.head_dim = config.head_dim

        inv_freq = self._compute_inverse_frequencies()
        self.register_buffer("inv_freq", inv_freq, persistent=False)

    def _compute_inverse_frequencies(self):
        scale = torch.arange(0, self.head_dim, 2) / self.head_dim
        radians = 1.0 / self.theta ** scale
        return radians

    @torch.no_grad()
    def forward(self, x, position_ids):

# Returns cis (cis is short for cos + i*sin) – complex exponentials $e^{i\\theta}$
# for rotation, shape (..., seq, rotary_dim).
# Rotates each pair of features by position-dependent angles.
# 
# Enforce float32 even if user is using bfloat16.
# See: [HuggingFace Transformers PR #29285](https://github.com/huggingface/transformers/pull/29285)
        with torch.autocast(device_type=x.device.type, enabled=False):
            freqs = einsum(
                self.inv_freq.float(), position_ids.float(),
                "rotary_dim, batch seq -> batch seq rotary_dim"
            )
            freqs_cis = torch.polar(abs=torch.ones_like(freqs), angle=freqs)

        return freqs_cis.to(dtype=x.dtype)

# ## Applying Rotations (Complex Number Approach)
# 
# RoPE encodes position information by rotating feature vectors
# based on their position. Each pair of adjacent features is
# treated as a 2D point and rotated in that plane.
# 
# We use complex multiplication: rotating a point $(a, b)$ by angle
# $\\theta$ is equivalent to multiplying $(a + bi)$ by $e^{i\\theta}$.

def apply_rope(query, key, freqs_cis):

    def rotate(x):

# Reshape last dim from (d,) to (d/2, 2) – pair adjacent features.
# E.g., [f0, f1, f2, f3] -> [[f0, f1], [f2, f3]]
        x_split = rearrange(x, "... (pairs two) -> ... pairs two", two=2)

# Convert pairs to complex numbers: [a, b] -> a + bi
        x_complex = torch.view_as_complex(x_split.contiguous())

# Rotate by multiplying with $e^{i\\theta}$ from freqs_cis.
# This applies a different rotation angle to each position.
        x_rotated = x_complex * freqs_cis.unsqueeze(-2)

# Convert back to real pairs and flatten to original shape.
        x_out = torch.view_as_real(x_rotated).flatten(-2)
        return x_out

    query_out = rotate(query)
    key_out = rotate(key)

    return query_out.type_as(query), key_out.type_as(key)

# ## Alternative: Explicit Rotation (Common Pattern)
# 
# Most implementations (LLaMA, HuggingFace Transformers) use the
# explicit rotation matrix formula instead of complex numbers.
# Mathematically equivalent, but more verbose.
# 
# The 2D rotation formula:
# $$\\begin{bmatrix} x' \\\\ y' \\end{bmatrix} = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix}$$
# 
# Which simplifies to: $x' = x \\cos\\theta - y \\sin\\theta$, $y' = x \\sin\\theta + y \\cos\\theta$

def rotate_half(x):
    x1 = x[..., : x.shape[-1] // 2]
    x2 = x[..., x.shape[-1] // 2 :]
    return torch.cat((-x2, x1), dim=-1)

def apply_rope_explicit(x, cos, sin):
    return (x * cos) + (rotate_half(x) * sin)

# ## Why RoPE Works
# 
# When we compute attention: $q_m^T k_n$ (query at position $m$,
# key at position $n$), the rotation angles are $m\\theta$ and $n\\theta$.
# 
# The dot product of rotated vectors depends on the *difference*
# of angles: $(m - n)\\theta$. This means attention naturally
# captures relative position without explicit position biases.
# 
# Benefits:
# - Extrapolates to longer sequences than seen in training
# - No learned position embeddings needed
# - Computationally efficient (just complex multiplication)
`;
