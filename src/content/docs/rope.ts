export const ropeContent = `# # Rotary Position Embeddings (RoPE)
# 
# Transformers have no built-in notion of order – they see tokens as a set,
# not a sequence. RoPE fixes this by encoding position into attention itself.
# 
# The core idea: if you rotate vector A by angle α and vector B by angle β,
# their dot product depends on (α - β). So if we rotate each token's q/k
# by an angle proportional to its position, attention scores will reflect
# *relative* distance between tokens. Token 3 and token 5? The angle
# difference is the same as between token 10 and token 12.
# 
# Why 2D? 1D is just scaling, not rotation. Higher-D needs rotation
# matrices and doesn't really help. 2D hits the sweet spot: real rotation,
# simple complex math, and each pair gets its own frequency. High frequencies
# pick up nearby tokens, low frequencies pick up distant ones.
# 
# I use complex numbers because rotating (x, y) by θ is just multiplying
# (x + iy) by $e^{i\\theta}$. Same math, cleaner code.
# 
# also [einops](https://github.com/arogozhnikov/einops) – easier to follow the tensor shapes.

from dataclasses import dataclass

import torch
from einops import einsum, rearrange
from torch import nn

# ## Config

@dataclass
class Config:

# \`head_dim\` must be even – we pair up dimensions for 2D rotation
    head_dim: int = 8
    num_attention_heads: int = 4

# base frequency. \`10_000\` is standard. higher = slower decay = longer context
    rope_theta: float = 10_000

# ## Computing Frequencies
# 
# Each pair of dimensions rotates at a different frequency.
# Pair 0 rotates fast, pair 1 slower, pair 2 even slower, etc.

class RoPE(nn.Module):
    def __init__(self, config: Config):
        super().__init__()
        self.config = config
        self.theta = config.rope_theta
        self.head_dim = config.head_dim

        inv_freq = self._compute_inverse_frequencies()

# \`register_buffer\` stores \`inv_freq\` as part of the module.
# not a learnable parameter, but moves to GPU when you call \`.cuda()\`
# and gets included when you save/load the model.
# 
# \`persistent=False\` means don't save it – we recompute in \`__init__\` anyway.
        self.register_buffer("inv_freq", inv_freq, persistent=False)

    def _compute_inverse_frequencies(self):

# for \`head_dim=8\`, we get 4 frequencies (one per 2D plane).
# \`freq_i = 1 / theta^(2i/d)\` where \`i = 0, 1, 2, 3\`
# \`freq_0\` is highest (fastest rotation), \`freq_3\` is lowest (slowest).
        scale = torch.arange(0, self.head_dim, 2) / self.head_dim
        radians = 1.0 / self.theta ** scale
        return radians

# for each position \`p\` and frequency \`f\`: \`angle = p * f\`
# 
# position 0 gets angles \`[0, 0, 0, 0]\`, position 5 gets angles \`[5*f0, 5*f1, 5*f2, 5*f3]\`
# 
# then convert to complex: $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$
# these are unit vectors we'll multiply with to rotate.
# 
# also, we force float32 to avoid precision issues with bfloat16.
# see: [HuggingFace PR #29285](https://github.com/huggingface/transformers/pull/29285)
    @torch.no_grad()
    def forward(self, x, position_ids):
        with torch.autocast(device_type=x.device.type, enabled=False):
            freqs = einsum(
                self.inv_freq.float(), position_ids.float(),
                "rotary_dim, batch seq -> batch seq rotary_dim"
            )

# \`torch.polar(r, θ)\` = \`r * e^(iθ)\`. \`r=1\` gives unit vectors.
            freqs_cis = torch.polar(abs=torch.ones_like(freqs), angle=freqs)

        return freqs_cis.to(dtype=x.dtype)

# ## Applying Rotation
# 
# now we rotate query and key vectors using the angles we computed.
# each pair of adjacent features is one 2D plane.

def apply_rope(query, key, freqs_cis):

    def rotate(x):

# pair adjacent dims: \`[d0, d1, d2, d3, ...]\` -> \`[[d0, d1], [d2, d3], ...]\`
# each pair is a point on a 2D plane.
        x_split = rearrange(x, "... (pairs two) -> ... pairs two", two=2)

# reinterpret \`[a, b]\` as complex number \`a + bi\`.
# just a view change, no computation.
        x_complex = torch.view_as_complex(x_split.contiguous())

# rotate: \`(a + bi) * e^(iθ)\` rotates the point by angle θ.
        x_rotated = x_complex * freqs_cis.unsqueeze(-2)

# back to real: \`a + bi\` -> \`[a, b]\`.
        x_out = torch.view_as_real(x_rotated).flatten(-2)
        return x_out

    query_out = rotate(query)
    key_out = rotate(key)

# that's it. now use rotated q/k in attention:
# \`scores = (query_out @ key_out.T) / sqrt(d)\`
# 
# the dot product now encodes relative position.
    return query_out.type_as(query), key_out.type_as(key)

# ## Alternative: Sin/Cos Version
# 
# most codebases (LLaMA, HuggingFace) skip complex numbers and use the
# rotation matrix directly: \`x' = x * cos - y * sin, y' = x * sin + y * cos\`

def rotate_half(x):
    x1 = x[..., : x.shape[-1] // 2]
    x2 = x[..., x.shape[-1] // 2 :]
    return torch.cat((-x2, x1), dim=-1)

def apply_rope_explicit(x, cos, sin):
    return (x * cos) + (rotate_half(x) * sin)
`;
