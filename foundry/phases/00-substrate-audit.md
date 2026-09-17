# Phase 00 — Substrate Audit: GenLayer & Multichain EVM Rails

STATUS: PASS  
OWNER: Lead Protocol Architect  

## Objective
Inspect and document the native capabilities and execution boundaries of GenLayer Studio Next (chain 61997) alongside Ethereum Sepolia (11155111) and Base Sepolia (84532).

## Substrate Capabilities

### 1. GenLayer Studio Next (Chain 61997)
* **Execution Environment:** GenVM (Python 3.12 sandbox).
* **Consensus Primitive:** Optimistic Democracy with Equivalence Principle (`strict_eq` and `run_nondet_unsafe`).
* **External Access:** `gl.nondet.web.post` and `gl.nondet.web.render` allow validators to query external RPC endpoints and web evidence.
* **Adjudication Engine:** Non-deterministic AI prompt execution (`gl.nondet.exec_prompt`) executed by leader and independently validated by N committee nodes.

### 2. EVM Native Execution Rails
* **Sepolia & Base Sepolia:** Host native collateral vaults.
* **Native Transfer Safety:** Assets never cross bridges during clearing; assets settle directly on native rails. Only net residuals cross rails or settle via local fronting.

## Residual Gap
Traditional cross-chain bridges and clearinghouses require either trusted multisig custodians or deterministic code that cannot parse complex natural-language commercial terms. Cleara uses GenLayer's Optimistic Democracy as an unforgeable financial relationship adjudicator that outputs cryptographic Settlement Certificates to drive EVM vault releases.

## Exit Gate
* [x] Studio Next chain ID and RPC identified.
* [x] EVM RPCs and testnet faucets verified.
* [x] Official contract runner pattern identified (`5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng`).
