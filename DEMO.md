# Cleara on GenLayer — Demonstration Guide

This guide walks through reproducing and verifying the complete Cleara multichain architecture.

---

## 1. Quick Verification (One Command)

To run the complete automated test and control plane verification:

```bash
./scripts/verify
```

Expected output:
* 7/7 Foundry unit tests pass on EVM Vault contracts.
* GenLayer intelligent contract passes Python syntax verification.
* Foundry control plane validator confirms all claims and gaps conform to `BUILD_FOUNDRY.md` v1.0.

---

## 2. Live On-Chain Architecture Inspection

### GenLayer Studio Next Coordinator (Chain 61997)
* **Contract:** `0x17c33C39f7998A7ed56D5C58f7D3d29E29444D55`
* **Deploy Tx:** `0x85b854a7833a9ce927f504b257e2ddb68e68cac66d09a5beef40a9d399b3fbf2`
* **Explorer URL:** `https://explorer-studio-dev.genlayer.com`

Inspect obligations live via Node.js:
```bash
node -e '
import("genlayer-js").then(async ({ createClient }) => {
  const { studioDevnet } = await import("genlayer-js/chains");
  const studioNext = { ...studioDevnet, id: 61997, name: "GenLayer Studio Next", rpcUrls: { default: { http: ["https://studio-next.genlayer.com/api"] } } };
  const client = createClient({ chain: studioNext });
  const list = await client.readContract({ address: "0x17c33C39f7998A7ed56D5C58f7D3d29E29444D55", functionName: "list_obligations", args: [] });
  console.log("Obligations:", list);
});
'
```

---

## 3. Live EVM Collateral Vaults

### Ethereum Sepolia Vault (`11155111`)
* **Address:** `0x277341fc7c2481606ac69922a35b42344be5ec6f`
* **Verified Locked Deposit:** `0x365f1ee2f03c0894860f9e20e26a8619a9787ae823eb5ca0f7e40ff932c8bbab` (0.001 ETH)

Verify via `cast`:
```bash
cast call 0x277341fc7c2481606ac69922a35b42344be5ec6f "getDeposit(bytes32)(address,address,uint256,uint8,bytes32)" 0x365f1ee2f03c0894860f9e20e26a8619a9787ae823eb5ca0f7e40ff932c8bbab --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

### Base Sepolia Vault (`84532`)
* **Address:** `0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad`
* **Verified Locked Deposit:** `0x0909d8b4992764452f2e066cb01de06ae741433c82c4b2b28ad1912686662b72` (0.0006 ETH)

Verify via `cast`:
```bash
cast call 0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad "getDeposit(bytes32)(address,address,uint256,uint8,bytes32)" 0x0909d8b4992764452f2e066cb01de06ae741433c82c4b2b28ad1912686662b72 --rpc-url https://sepolia.base.org
```

---

## 4. End-to-End Multichain Settlement Flow
1. **Collateral Lock:** Alice locks 0.001 ETH on Sepolia; Bob locks 0.0006 ETH on Base Sepolia.
2. **strict_eq Proof:** Validators confirm transaction receipts across both source chains.
3. **AI Netting Consensus:** Optimistic Democracy determines bilateral netting compatibility; calculates net residual:
   $$\text{Net} = 0.001 - 0.0006 = 0.0004\text{ ETH (Alice owes Bob)}$$
4. **Certificate Issuance:** GenLayer produces tamper-proof Settlement Certificate.
5. **Native Execution:** Sepolia vault pays 0.0004 ETH to Bob and refunds 0.0006 ETH to Alice locally.
