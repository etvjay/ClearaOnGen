# Cleara on GenLayer — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** IMPLEMENTED & DEPLOYED  
**Author:** Cleara Core Protocol Team  

---

## 1. Executive Summary

Cleara is a **proof-native financial coordination and multichain settlement layer**.

*\"Clear first. Move only what remains.\"*

Cleara separates the **adjudication of financial relationships** from the **physical movement of collateral**. GenLayer Studio Next (`chain 61997`) serves as the canonical coordination and AI adjudication layer, while Ethereum Sepolia (`11155111`) and Base Sepolia (`84532`) host native execution vaults.

Traditional multichain settlement forces all gross obligations across cross-chain bridges, resulting in liquidity fragmentation, massive capital inefficiency, and high bridge exploit risk. Cleara uses GenLayer's **Optimistic Democracy** to evaluate contractual terms and reciprocal obligations across chains, nets them on-chain, and authorizes only the residual net amount to move on native rails.

---

## 2. Core Axioms & Boundary Vocabulary

Every subsystem and engineer must honor these non-negotiable boundaries:

| Axiom | Meaning |
|---|---|
| `OBSERVED != PROVEN` | An external transaction observation is not an accepted multi-validator proof until confirmed via `strict_eq`. |
| `PROOF != AUTHORITY` | Evidence that an event occurred does not authorize its financial consequence. |
| `COMPATIBILITY != CLEARING AUTHORITY` | Two obligations being readable or compatible does not permit a clearing transition without consensus. |
| `CLEARING != SETTLEMENT` | Clearing calculates and reduces reciprocal obligations; settlement executes the physical token release on the native EVM chain. |
| `ROUTED != SETTLED` | A bridge routing instruction does not establish that native settlement completed. |
| `WALLET != PARTY` | A connected wallet address is an execution identity, distinct from legal/contractual counterparty identities. |

---

## 3. Product Modes

Cleara operates across three canonical settlement modes:

### Mode 1: Bilateral Reciprocal Netting
* **Use Case:** Two parties owe each other reciprocal obligations across different chains (e.g. Alice owes Bob 0.001 ETH on Sepolia; Bob owes Alice 0.0006 ETH on Base Sepolia).
* **Flow:**
  1. Both parties lock collateral in their respective local `ClearaVault`.
  2. GenLayer verifies both transaction receipts using `strict_eq`.
  3. GenLayer AI adjudicates reciprocal compatibility using `run_nondet_unsafe`.
  4. GenLayer computes net residual: `0.001 - 0.0006 = 0.0004 ETH` (Alice owes Bob).
  5. GenLayer issues an unforgeable Settlement Certificate.
  6. The Sepolia Vault unlocks 0.0004 ETH to Bob and refunds 0.0006 ETH to Alice locally. Zero assets crossed the bridge.

### Mode 2: Facility / LP Fronting & Collateral Claim
* **Use Case:** Counterparty requires immediate liquidity on the destination chain without waiting for native cross-chain delays.
* **Flow:** A designated Liquidity Provider fronts payout locally on the destination vault and subsequently claims the locked collateral with the GenLayer certificate.

### Mode 3: Residual Bridge Routing
* **Use Case:** When no reciprocal obligation exists to net against, the residual balance is routed through canonical native bridge infrastructure (e.g. OP Standard Bridge).

---

## 4. Architectural Invariants

* **I-01 (Determinism):** Arithmetic, balance conservation, and replay defense remain strictly deterministic.
* **I-02 (Dual-Chain strict_eq):** Source-chain receipt inclusion and values must be identically verified by committee validators before an obligation becomes `VERIFIED`.
* **I-03 (Consensus Adjudication):** Semantic netting eligibility cannot be decided by a single node; committee validators independently verify evidence and rerun AI prompts.
* **I-04 (Replay Protection):** EVM vaults record `certificateUsed[genlayerTxHash] = true` to prevent certificate replay or double-spending.
* **I-05 (Sovereign Rails):** Collateral remains in native vaults; no third-party bridge holds full gross liquidity.

---

## 5. Deployed Testnet Infrastructure

* **GenLayer Studio Next (61997):**
  * Contract: `0x17c33C39f7998A7ed56D5C58f7D3d29E29444D55`
  * Tx: `0x85b854a7833a9ce927f504b257e2ddb68e68cac66d09a5beef40a9d399b3fbf2`
* **Ethereum Sepolia (11155111):**
  * Vault: `0x277341fc7c2481606ac69922a35b42344be5ec6f`
  * Deploy Tx: `0x47a53304df36a76f3920d7a587f8d11d2b4525481b9be49d76e1a84c3112f8c5`
* **Base Sepolia (84532):**
  * Vault: `0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad`
  * Deploy Tx: `0xf7f1fcad2858142c8b9e56b4eba17acc75e5bed541c953ec544a29c8d315fec7`
