# ADR-0002: Dual-Chain Verification via strict_eq RPC Calls

## Context
Cross-chain protocols typically rely on custodial bridge attestations or complex ZK light clients. GenLayer validators have native external web access, allowing them to verify facts directly from source blockchains.

## Decision
Use `gl.eq_principle.strict_eq` to verify source-chain transactions across multiple validator nodes:
1. Fetch `eth_getTransactionReceipt` and `eth_getTransactionByHash` directly from Ethereum Sepolia and Base Sepolia.
2. Canonicalize the response into normalized JSON containing `tx_hash`, `from`, `to`, `block_number`, and `value_atto`.
3. Require exact byte-level consensus across validators before marking an obligation as `VERIFIED`.

## Consequences
* No trust in intermediate bridges or centralized oracles.
* Pure deterministic verification for raw transaction inclusion and value.
