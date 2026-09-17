# Cleara on GenLayer — Demonstration Guide

This guide walks through reproducing and verifying the complete Cleara multichain architecture.

---

## 1. Quick Verification (One Command)

To run the complete automated test and control plane verification:

```bash
./scripts/verify
```

Expected output:
* 14/14 Foundry unit tests pass on EVM Vault contracts.
* GenLayer intelligent contract passes Python syntax verification.
* Foundry control plane validator confirms all claims and gaps conform to `BUILD_FOUNDRY.md` v1.0.

---

## 2. Live On-Chain Architecture Inspection

### GenLayer Studio Next Coordinator (Chain 61997)
* **Contract:** `0xF75595614305B537eA8bfD5fF3C53d074192eB2F`
* **Deploy Tx:** `0xfb031403168a89a5acf5ce07ad7cbb1a0bd61f7706e283cc95961b5c3973e2ee`
* **Explorer URL:** `https://studio-next.genlayer.com`

Inspect obligations live via Node.js:
```bash
node -e '
import("genlayer-js").then(async ({ createClient }) => {
  const { studioDevnet } = await import("genlayer-js/chains");
  const studioNext = { ...studioDevnet, id: 61997, name: "GenLayer Studio Next", rpcUrls: { default: { http: ["https://studio-next.genlayer.com/api"] } } };
  const client = createClient({ chain: studioNext });
  const list = await client.readContract({ address: "0xF75595614305B537eA8bfD5fF3C53d074192eB2F", functionName: "list_obligations", args: [] });
  console.log("Obligations:", list);
});
'
```

---

## 3. Live EVM Collateral Vaults

### Ethereum Sepolia Vault (`11155111`)
* **Address:** `0x277341fc7c2481606ac69922a35b42344be5ec6f`
* **Verified Settled Deposit (Mode 1):** `0xa5f9c71cbefe05bb7c2126d7816cce04e7890bccd038733590543e95ab143f28` (0.001 ETH, state: `3 = SETTLED`)

Verify via `cast`:
```bash
cast call 0x277341fc7c2481606ac69922a35b42344be5ec6f "getDeposit(bytes32)(address,address,uint256,uint8,bytes32)" 0xa5f9c71cbefe05bb7c2126d7816cce04e7890bccd038733590543e95ab143f28 --rpc-url https://ethereum-sepolia-rpc.publicnode.com
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
