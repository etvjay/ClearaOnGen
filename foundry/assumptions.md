# Assumptions Ledger — Cleara on GenLayer

Every meaningful engineering assumption is recorded here until validated or falsified by empirical evidence.

---

### ASM-001: GenVM Bytecode vs EVM Readback
* **Assumption:** `eth_getCode` returns `0x` for GenLayer intelligent contracts on Studio Next because GenVM executes Python bytecode in an isolated VM runtime, not EVM bytecode.
* **Status:** **VALIDATED**
* **Evidence:** Studio Next consensus receipt `0x85b854a7833a9ce927f504b257e2ddb68e68cac66d09a5beef40a9d399b3fbf2` returned status `7` (`ACCEPTED/FINALIZED`) with `txExecutionResultName: "FINISHED_WITH_RETURN"`, while `eth_getCode` returns `0x`. The authoritative deployment proof is the GenLayer receipt and contract address.

### ASM-002: RPC Access inside strict_eq
* **Assumption:** Public Ethereum Sepolia and Base Sepolia RPCs (`publicnode.com`, `sepolia.base.org`) are accessible over HTTPS from GenLayer Studio Next validator nodes during `strict_eq` execution.
* **Status:** **ACTIVE**
* **Validation Method:** Validators independently issue `eth_getTransactionReceipt` and `eth_getTransactionByHash` and compare deterministic results.

### ASM-003: Optimistic Relayer Trust Boundary
* **Assumption:** For hackathon and initial testnet scope, the EVM execution vaults rely on an authorized relayer (`onlyRelayer`) to deliver finalized GenLayer transaction hashes, guarded against replay via `certificateUsed`.
* **Status:** **ACTIVE / GUARDED**
* **Future Work:** Direct light client or on-chain GenLayer validator signature verification on the EVM vault.
