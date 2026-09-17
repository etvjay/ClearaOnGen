# Implementation Status Matrix — Cleara on GenLayer

| Capability | Subsystem | Status | Evidence | Limitation |
|---|---|---|---|---|
| **GenLayer Coordinator** | GenVM (Python 3.12) | `LIVE` | [`foundry/evidence/deployed.json`](../../foundry/evidence/deployed.json) | Deployed on Studio Next (`0xF7559561...`) with receipt status 5 (`FINISHED_WITH_RETURN`) |
| **Dual-Chain strict_eq** | GenLayer Equivalence | `LIVE` | [`foundry/evidence/live-lifecycle.log`](../../foundry/evidence/live-lifecycle.log) | Committee consensus queries Sepolia and Base Sepolia |
| **AI Netting Adjudication** | Optimistic Democracy | `LIVE` | [`foundry/evidence/live-lifecycle.log`](../../foundry/evidence/live-lifecycle.log) | Executed on Studio Next (Tx `0x6b8d3511...`, `FINISHED_WITH_RETURN`) |
| **Settlement Certification** | GenLayer Contract Storage | `LIVE` | [`foundry/evidence/live-lifecycle.log`](../../foundry/evidence/live-lifecycle.log) | Cryptographic release authorization packet with AI reason codes |
| **Sepolia Execution Vault** | EVM (Solidity 0.8.20) | `LIVE` | [`foundry/evidence/endpoints.json`](../../foundry/evidence/endpoints.json) | ETH native collateral (`0x277341fc...`) |
| **Base Sepolia Vault** | EVM (Solidity 0.8.20) | `LIVE` | [`foundry/evidence/endpoints.json`](../../foundry/evidence/endpoints.json) | ETH native collateral (`0xe2b01f99...`) |
| **Mode 1 Netting Unlock** | `ClearaVault.sol` | `LIVE_PROVEN` | [`foundry/evidence/live-lifecycle.log`](../../foundry/evidence/live-lifecycle.log) | Unlocked on Sepolia block 11723829 (Tx `0xd2d14af0...`) |
| **Mode 2 LP Fronting** | `ClearaVault.sol` | `TESTED` | [`foundry/evidence/forge-test.log`](../../foundry/evidence/forge-test.log) | LP claims locked collateral via certificate |
| **Mode 3 Bridge Routing** | `ClearaVault.sol` | `TESTED` | [`foundry/evidence/forge-test.log`](../../foundry/evidence/forge-test.log) | Residual routing fallback |
| **Control Plane Integrity** | `check-foundry` | `VERIFIED` | [`scripts/check-foundry`](../../scripts/check-foundry) | 0 critical open gaps; 7 verified claims |
