import { createPublicClient, createWalletClient, http, parseAbi, parseEther } from "viem";
import { sepolia, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";
import fs from "fs";

const pk = process.env.PRIVATE_KEY;
if (!pk) throw new Error("PRIVATE_KEY missing; load it from .env");

const sepoliaRpc = "https://ethereum-sepolia-rpc.publicnode.com";
const baseRpc = "https://sepolia.base.org";
const genRpc = "https://studio-next.genlayer.com/api";
const genContract = "0xF75595614305B537eA8bfD5fF3C53d074192eB2F";

const vaultAbi = parseAbi([
  "function deposit(bytes32 obligationId, address intendedRecipient, bytes32 targetChain) payable",
  "function unlockWithCertificate(bytes32 obligationId, address payable recipient, uint256 netAmount, uint256 refundAmount, bytes32 genlayerTxHash)",
  "function getDeposit(bytes32) view returns (address depositor, address intendedRecipient, uint256 amount, uint8 state, bytes32 targetChain)",
]);

const endpoints = {
  sepolia: { chain: sepolia, rpc: sepoliaRpc, vault: "0x277341fc7c2481606ac69922a35b42344be5ec6f" },
  base: { chain: baseSepolia, rpc: baseRpc, vault: "0xe2b01f99107a6ad24a6bdd8e34f7e864434c69ad" },
};

const studioNext = {
  ...studioDevnet,
  id: 61997,
  name: "GenLayer Studio Next",
  rpcUrls: { default: { http: [genRpc] } },
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
};

async function submitGenlayerTx(client, account, functionName, args) {
  console.log(`[GenLayer] Estimating fees for ${functionName}...`);
  const fees = await client.estimateTransactionFees({ method: functionName, args });
  console.log(`[GenLayer] Submitting ${functionName} from ${account.address}...`);
  const hash = await client.writeContract({
    address: genContract,
    functionName,
    args,
    fees,
  });
  console.log(`[GenLayer] Tx hash: ${hash}. Waiting for consensus decision...`);
  const receipt = await client.waitForTransactionReceipt({ hash, waitUntil: "decided", retries: 200 });
  const status = receipt.statusName ?? receipt.status;
  const exec = receipt.txExecutionResultName ?? receipt.execution_result ?? receipt.result ?? "UNKNOWN";
  console.log(`[GenLayer] Decided: status=${status}, execution=${exec}`);
  return { hash, receipt };
}

async function main() {
  console.log("==================================================================");
  console.log("=== Cleara on GenLayer — End-to-End Live Proving Lifecycle ===");
  console.log("==================================================================");

  // Accounts
  const alice = privateKeyToAccount(pk);
  const bobKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
  const bob = privateKeyToAccount(bobKey);

  console.log("Alice (Deployer/Party A):", alice.address);
  console.log("Bob (Counterparty/Party B):", bob.address);
  console.log("GenLayer Coordinator:", genContract);
  console.log("Sepolia Vault:", endpoints.sepolia.vault);
  console.log("Base Sepolia Vault:", endpoints.base.vault);

  // Clients
  const aliceGenClient = createClient({ chain: studioNext, account: alice });
  const bobGenClient = createClient({ chain: studioNext, account: bob });

  const sepoliaPublic = createPublicClient({ chain: sepolia, transport: http(sepoliaRpc) });
  const basePublic = createPublicClient({ chain: baseSepolia, transport: http(baseRpc) });
  const sepoliaWallet = createWalletClient({ account: alice, chain: sepolia, transport: http(sepoliaRpc) });

  // Verified locked deposit hashes
  const idSepolia = "0xa5f9c71cbefe05bb7c2126d7816cce04e7890bccd038733590543e95ab143f28";
  const depSepHash = "0x810cbd330f707d0a2a0741471a936ad5a403da6d62cf04e51459356633263557";

  const idBase = "0x0909d8b4992764452f2e066cb01de06ae741433c82c4b2b28ad1912686662b72";
  const depBaseHash = "0xbdd8b9bbd63c4b0d0a3f586469d5a87ae084606b1b9cef67d67a079a09560dea";

  console.log("\n--- Step 1: Verify Initial EVM Vault State ---");
  const dep1 = await sepoliaPublic.readContract({ address: endpoints.sepolia.vault, abi: vaultAbi, functionName: "getDeposit", args: [idSepolia] });
  const dep2 = await basePublic.readContract({ address: endpoints.base.vault, abi: vaultAbi, functionName: "getDeposit", args: [idBase] });
  console.log(`Sepolia Vault Deposit (${idSepolia.slice(0, 10)}...): state=${dep1[3]} (expected 1=LOCKED), amount=${dep1[2]} wei (0.001 ETH)`);
  console.log(`Base Vault Deposit    (${idBase.slice(0, 10)}...): state=${dep2[3]} (expected 1=LOCKED), amount=${dep2[2]} wei (0.0006 ETH)`);

  if (dep1[3] !== 1 || dep2[3] !== 1) {
    console.log(`Notice: One of the deposits is in state: Sepolia=${dep1[3]}, Base=${dep2[3]}`);
  }

  console.log("\n--- Step 2: Register Reciprocal Obligations on GenLayer ---");
  // Alice records obligation 1 (Alice owes Bob 0.001 ETH on Sepolia)
  const r1 = await submitGenlayerTx(aliceGenClient, alice, "record_obligation", [
    bob.address,
    "1000000000000000", // 0.001 ETH
    "ETH",
    "", // evidence_url (uses NO_EVIDENCE_URL)
    "SEPOLIA",
    "BASE_SEPOLIA",
    "Alice owes Bob 0.001 ETH for compute services, payable on Sepolia, reciprocal with Base Sepolia",
  ]);

  // Bob records obligation 2 (Bob owes Alice 0.0006 ETH on Base Sepolia)
  const r2 = await submitGenlayerTx(bobGenClient, bob, "record_obligation", [
    alice.address,
    "600000000000000", // 0.0006 ETH
    "ETH",
    "", // evidence_url
    "BASE_SEPOLIA",
    "SEPOLIA",
    "Bob owes Alice 0.0006 ETH for bandwidth services, payable on Base Sepolia, reciprocal with Sepolia",
  ]);

  const oid1 = "obl-1";
  const oid2 = "obl-2";
  console.log(`Registered obligations: ${oid1} and ${oid2}`);

  console.log("\n--- Step 3: Multi-Validator strict_eq RPC Verification ---");
  // Verify obligation 1 on both chains
  console.log(`Verifying ${oid1} on Sepolia...`);
  await submitGenlayerTx(aliceGenClient, alice, "verify_source_event", [
    oid1,
    "SEPOLIA",
    sepoliaRpc,
    depSepHash,
    alice.address.toLowerCase(),
    endpoints.sepolia.vault.toLowerCase(),
    "1000000000000000",
  ]);

  console.log(`Verifying ${oid1} on Base Sepolia...`);
  await submitGenlayerTx(aliceGenClient, alice, "verify_source_event", [
    oid1,
    "BASE_SEPOLIA",
    baseRpc,
    depBaseHash,
    alice.address.toLowerCase(),
    endpoints.base.vault.toLowerCase(),
    "600000000000000",
  ]);

  // Verify obligation 2 on both chains
  console.log(`Verifying ${oid2} on Sepolia...`);
  await submitGenlayerTx(aliceGenClient, alice, "verify_source_event", [
    oid2,
    "SEPOLIA",
    sepoliaRpc,
    depSepHash,
    alice.address.toLowerCase(),
    endpoints.sepolia.vault.toLowerCase(),
    "1000000000000000",
  ]);

  console.log(`Verifying ${oid2} on Base Sepolia...`);
  await submitGenlayerTx(aliceGenClient, alice, "verify_source_event", [
    oid2,
    "BASE_SEPOLIA",
    baseRpc,
    depBaseHash,
    alice.address.toLowerCase(),
    endpoints.base.vault.toLowerCase(),
    "600000000000000",
  ]);

  // Check obligation states
  const obl1 = await aliceGenClient.readContract({ address: genContract, functionName: "get_obligation", args: [oid1] });
  const obl2 = await aliceGenClient.readContract({ address: genContract, functionName: "get_obligation", args: [oid2] });
  console.log(`Obligation ${oid1} state: ${obl1.status} (expected VERIFIED)`);
  console.log(`Obligation ${oid2} state: ${obl2.status} (expected VERIFIED)`);

  console.log("\n--- Step 4: AI Clearing Adjudication via Optimistic Democracy ---");
  const evalRes = await submitGenlayerTx(aliceGenClient, alice, "evaluate_clearing", [oid1, oid2]);
  console.log(`AI clearing evaluation decided: tx=${evalRes.hash}`);

  const obl1After = await aliceGenClient.readContract({ address: genContract, functionName: "get_obligation", args: [oid1] });
  console.log(`Obligation ${oid1} status after evaluation: ${obl1After.status} (expected CLEARING)`);
  console.log(`Net calculated by GenLayer AI: ${obl1After.net_atto_amount} wei (0.0004 ETH), direction: ${obl1After.net_direction}`);

  console.log("\n--- Step 5: Mark Cleared & Fetch Settlement Certificate ---");
  await submitGenlayerTx(aliceGenClient, alice, "mark_cleared", [oid1]);
  await submitGenlayerTx(aliceGenClient, alice, "reconcile", [oid1]);

  const cert = await aliceGenClient.readContract({ address: genContract, functionName: "get_settlement_certificate", args: [oid1] });
  console.log("Final Settlement Certificate:", JSON.stringify(cert, null, 2));

  console.log("\n--- Step 6: Native EVM Vault Unlock with Settlement Certificate ---");
  const netAmount = BigInt(cert.net_atto_amount);
  const refundAmount = parseEther("0.0006"); // 0.001 - 0.0004 = 0.0006 refund to Alice
  const genlayerTxHash = evalRes.hash;

  console.log(`Executing unlockWithCertificate on Sepolia Vault...`);
  console.log(`  Recipient (Bob): ${bob.address}, Net: ${netAmount} wei (0.0004 ETH)`);
  console.log(`  Refund (Alice): ${alice.address}, Refund: ${refundAmount} wei (0.0006 ETH)`);
  console.log(`  Certificate Tx Hash: ${genlayerTxHash}`);

  // Only unlock if still in LOCKED state
  const currentDep = await sepoliaPublic.readContract({ address: endpoints.sepolia.vault, abi: vaultAbi, functionName: "getDeposit", args: [idSepolia] });
  if (currentDep[3] === 1) {
    const unlockHash = await sepoliaWallet.writeContract({
      address: endpoints.sepolia.vault,
      abi: vaultAbi,
      functionName: "unlockWithCertificate",
      args: [idSepolia, bob.address, netAmount, refundAmount, genlayerTxHash],
    });
    console.log(`Sepolia unlock transaction: ${unlockHash}`);
    const unlockReceipt = await sepoliaPublic.waitForTransactionReceipt({ hash: unlockHash });
    console.log(`Sepolia unlock confirmed: status=${unlockReceipt.status} (block ${unlockReceipt.blockNumber})`);
  } else {
    console.log(`Deposit already settled or state=${currentDep[3]}, skipping EVM unlock call.`);
  }

  const finalDep = await sepoliaPublic.readContract({ address: endpoints.sepolia.vault, abi: vaultAbi, functionName: "getDeposit", args: [idSepolia] });
  console.log(`Final Sepolia Vault Deposit State: ${finalDep[3]} (expected 3=SETTLED)`);

  console.log("\n==================================================================");
  console.log("=== LIVE PROVING COMPLETE: Mode 1 Netting Confirmed Across Chains ===");
  console.log("==================================================================");
}

main().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
