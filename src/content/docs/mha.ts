export const mhaContent = `# # Attention Mechanisms: MHA, MQA, and GQA
# 
# Attention is the core mechanism powering modern transformers.
# This document covers three variants:
# 
# - **MHA** (Multi-Head Attention): The original from "Attention Is All You Need"
# - **MQA** (Multi-Query Attention): Memory-efficient variant from Google
# - **GQA** (Grouped-Query Attention): Best of both worlds, used in Llama 2
# 
# Each represents a different tradeoff between model quality and
# inference efficiency, particularly for KV-cache memory usage.

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Tuple

# ## Scaled Dot-Product Attention
# 
# The foundation of all attention variants. Given queries $Q$, keys $K$,
# and values $V$, attention computes:
# 
# $$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$
# 
# Where:
# - $Q \\in \\mathbb{R}^{n \\times d_k}$ = query vectors (what we're looking for)
# - $K \\in \\mathbb{R}^{m \\times d_k}$ = key vectors (what we're matching against)
# - $V \\in \\mathbb{R}^{m \\times d_v}$ = value vectors (what we retrieve)
# - $d_k$ = dimension of keys/queries
# - $n$ = number of query positions, $m$ = number of key/value positions
# 
# The $\\sqrt{d_k}$ scaling prevents dot products from growing too large,
# which would push softmax into regions with vanishing gradients.

def scaled_dot_product_attention(
    query: torch.Tensor,
    key: torch.Tensor,
    value: torch.Tensor,
    mask: Optional[torch.Tensor] = None,
    dropout: float = 0.0,
    training: bool = True,
) -> Tuple[torch.Tensor, torch.Tensor]:
    """
    Compute scaled dot-product attention.
    
    Args:
        query: Shape (batch, heads, seq_len, d_k)
        key: Shape (batch, heads, seq_len, d_k)  
        value: Shape (batch, heads, seq_len, d_v)
        mask: Optional attention mask
        dropout: Dropout probability
        training: Whether in training mode
        
    Returns:
        output: Attended values, shape (batch, heads, seq_len, d_v)
        weights: Attention weights, shape (batch, heads, seq_len, seq_len)
    """
    d_k = query.size(-1)

# Compute attention scores: $QK^T / \\sqrt{d_k}$
    scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)

# Apply mask (e.g., causal mask for autoregressive generation)
# Masked positions get -inf so they become 0 after softmax
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))

# Softmax over the key dimension to get attention weights
# Each query attends to all keys with weights summing to 1
    attn_weights = F.softmax(scores, dim=-1)

# Apply dropout for regularization during training
    if dropout > 0 and training:
        attn_weights = F.dropout(attn_weights, p=dropout)

# Weighted sum of values: $\\text{softmax}(\\cdot) \\cdot V$
    output = torch.matmul(attn_weights, value)

    return output, attn_weights

# ## Multi-Head Attention (MHA)
# 
# MHA runs $h$ attention operations in parallel, each with different
# learned projections. This allows the model to attend to information
# from different representation subspaces:
# 
# $$\\text{MHA}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h) W^O$$
# 
# Where each head is:
# $$\\text{head}_i = \\text{Attention}(QW^Q_i, KW^K_i, VW^V_i)$$
# 
# Parameters:
# - $W^Q_i \\in \\mathbb{R}^{d_{model} \\times d_k}$ = query projection for head $i$
# - $W^K_i \\in \\mathbb{R}^{d_{model} \\times d_k}$ = key projection for head $i$
# - $W^V_i \\in \\mathbb{R}^{d_{model} \\times d_v}$ = value projection for head $i$
# - $W^O \\in \\mathbb{R}^{hd_v \\times d_{model}}$ = output projection
# 
# Typically $d_k = d_v = d_{model} / h$, so total parameters stay manageable.

class MultiHeadAttention(nn.Module):
    """
    Standard Multi-Head Attention.
    
    Each head has its own Q, K, V projections.
    KV cache size: 2 * num_layers * batch * seq_len * num_heads * d_k
    
    Args:
        d_model: Model dimension (embedding size)
        num_heads: Number of attention heads h
        dropout: Dropout probability
        bias: Whether to use bias in projections
    """

    def __init__(
        self,
        d_model: int,
        num_heads: int,
        dropout: float = 0.0,
        bias: bool = True,
    ):
        super().__init__()

# $h$ = number of attention heads
        self.num_heads = num_heads

# $d_k = d_v = d_{model} / h$ = dimension per head
        self.d_k = d_model // num_heads
        self.d_model = d_model

        assert d_model % num_heads == 0, "d_model must be divisible by num_heads"

# Projection matrices: we use single linear layers that project
# all heads at once, then reshape. More efficient than h separate layers.
# $W^Q$: projects to all $h$ query heads simultaneously
        self.W_q = nn.Linear(d_model, d_model, bias=bias)

# $W^K$: projects to all $h$ key heads simultaneously
        self.W_k = nn.Linear(d_model, d_model, bias=bias)

# $W^V$: projects to all $h$ value heads simultaneously
        self.W_v = nn.Linear(d_model, d_model, bias=bias)

# $W^O$: output projection after concatenating heads
        self.W_o = nn.Linear(d_model, d_model, bias=bias)

        self.dropout = dropout

    def forward(
        self,
        query: torch.Tensor,
        key: torch.Tensor,
        value: torch.Tensor,
        mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        """
        Args:
            query: Shape (batch, seq_len, d_model)
            key: Shape (batch, seq_len, d_model)
            value: Shape (batch, seq_len, d_model)
            mask: Optional attention mask
            
        Returns:
            Output tensor, shape (batch, seq_len, d_model)
        """
        batch_size, seq_len, _ = query.shape

# Project inputs: x @ W -> (batch, seq, d_model)
        Q = self.W_q(query)
        K = self.W_k(key)
        V = self.W_v(value)

# Reshape to separate heads: (batch, seq, h, d_k) -> (batch, h, seq, d_k)
# This allows batch matrix operations across all heads simultaneously
        Q = Q.view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        K = K.view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        V = V.view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)

# Compute attention for all heads in parallel
        attn_output, _ = scaled_dot_product_attention(
            Q, K, V, mask=mask, dropout=self.dropout, training=self.training
        )

# Concatenate heads: (batch, h, seq, d_k) -> (batch, seq, h*d_k)
        attn_output = attn_output.transpose(1, 2).contiguous()
        attn_output = attn_output.view(batch_size, seq_len, self.d_model)

# Final output projection
        return self.W_o(attn_output)

# ## The KV-Cache Problem
# 
# During autoregressive generation, we cache key and value tensors
# to avoid recomputing them for previous tokens. The cache size is:
# 
# $$\\text{KV cache} = 2 \\times L \\times B \\times S \\times h \\times d_k$$
# 
# Where:
# - $L$ = number of layers
# - $B$ = batch size  
# - $S$ = sequence length
# - $h$ = number of heads
# - $d_k$ = dimension per head
# 
# For a 70B model with 80 layers, 64 heads, seq_len=4096:
# Cache ≈ 2 × 80 × 1 × 4096 × 64 × 128 × 2 bytes = **5.4 GB per sequence!**
# 
# This is why MQA and GQA were developed.

# ## Multi-Query Attention (MQA)
# 
# MQA uses a single key-value head shared across all query heads:
# 
# $$\\text{MQA}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h) W^O$$
# 
# Where:
# $$\\text{head}_i = \\text{Attention}(QW^Q_i, KW^K, VW^V)$$
# 
# Note: $W^K$ and $W^V$ have no subscript $i$ — they're shared!
# 
# Benefits:
# - KV cache reduced by factor of $h$ (e.g., 32x smaller)
# - Faster inference due to less memory bandwidth
# 
# Drawback:
# - Slight quality degradation compared to MHA

class MultiQueryAttention(nn.Module):
    """
    Multi-Query Attention (MQA).
    
    Single K,V head shared across all Q heads.
    KV cache size: 2 * num_layers * batch * seq_len * d_k
    (h times smaller than MHA!)
    
    Used in: PaLM, Falcon, StarCoder
    """

    def __init__(
        self,
        d_model: int,
        num_heads: int,
        dropout: float = 0.0,
        bias: bool = True,
    ):
        super().__init__()
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        self.d_model = d_model

# $W^Q$: still projects to $h$ heads (full query capacity)
        self.W_q = nn.Linear(d_model, d_model, bias=bias)

# $W^K$, $W^V$: project to single head only!
# This is the key difference — only d_k output dims, not d_model
        self.W_k = nn.Linear(d_model, self.d_k, bias=bias)
        self.W_v = nn.Linear(d_model, self.d_k, bias=bias)

        self.W_o = nn.Linear(d_model, d_model, bias=bias)
        self.dropout = dropout

    def forward(
        self,
        query: torch.Tensor,
        key: torch.Tensor,
        value: torch.Tensor,
        mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        batch_size, seq_len, _ = query.shape

# Q gets h heads as usual
        Q = self.W_q(query)
        Q = Q.view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)

# K, V get single head
        K = self.W_k(key)
        V = self.W_v(value)

# Broadcast K, V across all query heads by adding head dimension
# Shape: (batch, seq, d_k) -> (batch, 1, seq, d_k)
        K = K.unsqueeze(1)
        V = V.unsqueeze(1)

# Attention: K, V broadcast to match Q's head dimension
        attn_output, _ = scaled_dot_product_attention(
            Q, K, V, mask=mask, dropout=self.dropout, training=self.training
        )

# Concatenate and project
        attn_output = attn_output.transpose(1, 2).contiguous()
        attn_output = attn_output.view(batch_size, seq_len, self.d_model)
        return self.W_o(attn_output)

# ## Grouped-Query Attention (GQA)
# 
# GQA is the middle ground: use $g$ key-value heads, where $1 < g < h$.
# Each KV head is shared by $h/g$ query heads.
# 
# $$\\text{GQA}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h) W^O$$
# 
# Where query heads are grouped:
# $$\\text{head}_i = \\text{Attention}(QW^Q_i, KW^K_{\\lfloor i \\cdot g/h \\rfloor}, VW^V_{\\lfloor i \\cdot g/h \\rfloor})$$
# 
# Special cases:
# - $g = h$: Equivalent to MHA
# - $g = 1$: Equivalent to MQA
# 
# Common choice: $g = h/8$ (e.g., 8 KV heads for 64 query heads)
# 
# This gives most of MQA's memory savings while preserving MHA-like quality.

class GroupedQueryAttention(nn.Module):
    """
    Grouped-Query Attention (GQA).
    
    g KV heads shared among h query heads.
    KV cache size: 2 * num_layers * batch * seq_len * num_kv_heads * d_k
    
    Used in: Llama 2, Mistral, Mixtral
    
    Args:
        d_model: Model dimension
        num_heads: Number of query heads h
        num_kv_heads: Number of key-value heads g (must divide num_heads)
        dropout: Dropout probability
        bias: Whether to use bias
    """

    def __init__(
        self,
        d_model: int,
        num_heads: int,
        num_kv_heads: int,
        dropout: float = 0.0,
        bias: bool = True,
    ):
        super().__init__()

# $h$ = query heads, $g$ = KV heads
        self.num_heads = num_heads
        self.num_kv_heads = num_kv_heads

# Each KV head is shared by this many query heads
        self.num_queries_per_kv = num_heads // num_kv_heads

        assert num_heads % num_kv_heads == 0, "num_heads must be divisible by num_kv_heads"

        self.d_k = d_model // num_heads
        self.d_model = d_model

# Q: projects to h heads
        self.W_q = nn.Linear(d_model, d_model, bias=bias)

# K, V: project to g heads (not h!)
        self.W_k = nn.Linear(d_model, self.num_kv_heads * self.d_k, bias=bias)
        self.W_v = nn.Linear(d_model, self.num_kv_heads * self.d_k, bias=bias)

        self.W_o = nn.Linear(d_model, d_model, bias=bias)
        self.dropout = dropout

    def forward(
        self,
        query: torch.Tensor,
        key: torch.Tensor,
        value: torch.Tensor,
        mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        batch_size, seq_len, _ = query.shape

# Project queries to h heads
        Q = self.W_q(query)
        Q = Q.view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)

# Project keys and values to g heads
        K = self.W_k(key)
        V = self.W_v(value)
        K = K.view(batch_size, seq_len, self.num_kv_heads, self.d_k).transpose(1, 2)
        V = V.view(batch_size, seq_len, self.num_kv_heads, self.d_k).transpose(1, 2)

# Expand KV heads to match Q heads by repeating
# Each KV head serves (h/g) query heads
# Shape: (batch, g, seq, d_k) -> (batch, h, seq, d_k)
        K = K.repeat_interleave(self.num_queries_per_kv, dim=1)
        V = V.repeat_interleave(self.num_queries_per_kv, dim=1)

# Standard attention computation
        attn_output, _ = scaled_dot_product_attention(
            Q, K, V, mask=mask, dropout=self.dropout, training=self.training
        )

# Concatenate and project
        attn_output = attn_output.transpose(1, 2).contiguous()
        attn_output = attn_output.view(batch_size, seq_len, self.d_model)
        return self.W_o(attn_output)
`;
