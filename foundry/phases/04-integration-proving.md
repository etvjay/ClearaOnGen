# Phase 04 — End-to-End Multichain Proving Lifecycle

STATUS: IN_PROGRESS  
OWNER: Lead Protocol Architect  

## Objective
Wire the live Studio Next coordinator with the Sepolia and Base Sepolia vaults to complete the 5-step lifecycle:
1. `record_obligation`: Register reciprocal obligations on GenLayer.
2. `verify_source_event`: Multi-validator RPC verification of deposits on Sepolia and Base Sepolia via `strict_eq`.
3. `evaluate_clearing`: AI comparative consensus via `run_nondet_unsafe` determining bilateral netting.
4. `get_settlement_certificate`: Query unforgeable settlement certificate.
5. `unlockWithCertificate`: Relayer submits certificate to Sepolia Vault releasing net residual and refunds.

## Preconditions
* [x] Studio Next coordinator deployed: `0x17c33C39f7998A7ed56D5C58f7D3d29E29444D55`.
* [x] Sepolia Vault deployed with locked deposit: `0x277341fc7c2481606ac69922a35b42344be5ec6f`.
* [x] Base Sepolia Vault deployed with locked deposit: `0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad`.
* [x] Script harness: [`scripts/live_prove.ts`](file:///home/ubuntu/ClearaOnGen/scripts/live_prove.ts).

## Exit Gate
* [ ] Execute full `scripts/live_prove.ts` against live testnets.
* [ ] Capture and archive final settlement tx hash and state transition `LOCKED -> SETTLED`.
