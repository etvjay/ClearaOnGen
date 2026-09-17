# Contradictions Ledger — Cleara on GenLayer

Conflicts between documentation, code, architecture, tests, or live evidence are recorded here. Never silently resolve contradictions without empirical evidence.

---

### CON-001: Base Sepolia Deposit Status (NONE/0 vs LOCKED/1)
* **Conflict:** Initial script readback reported Base Sepolia deposit status as `0` (`NONE`) with `0` balance, whereas deposit transaction receipt indicated success (`status 1`).
* **Root Cause:** Script-level read argument discrepancy and typing formatting error when calling `getDeposit(bytes32)`.
* **Resolution:** Independent `cast call` directly to the Base Sepolia Vault (`0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad`) verified `state: 1` (`LOCKED`) and exact collateral `600000000000000` wei.
* **Evidence:** `foundry/evidence/endpoints.json`.

### CON-002: GenLayer Deployment Consensus vs Execution Result
* **Conflict:** Earlier deployment attempts returned `ACCEPTED / MAJORITY_AGREE` at consensus level, but validator execution failed with `invalid_contract runner malformed`.
* **Root Cause:** Consensus can accept an envelope even if the contract runner hash is unrecognized by validator runtimes.
* **Resolution:** Replaced unofficial runner with official Studio Next runner `py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng`. Deployment receipt confirmed `status: 7` and `txExecutionResultName: FINISHED_WITH_RETURN`.
* **Evidence:** `foundry/evidence/deployed.json`.
