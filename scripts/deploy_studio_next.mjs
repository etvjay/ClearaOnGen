import { readFileSync } from "fs";
import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";
import { privateKeyToAccount } from "viem/accounts";

const pk = process.env.PRIVATE_KEY;
if (!pk) throw new Error("PRIVATE_KEY missing; load it from a 0600 local .env");
const rpc = "https://studio-next.genlayer.com/api";
const chainId = 61997;

const studioNext = {
  ...studioDevnet,
  id: chainId,
  name: "GenLayer Studio Next",
  rpcUrls: { default: { http: [rpc] } },
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
};

const account = privateKeyToAccount(pk);
console.log("deployer", account.address, "chain", studioNext.id, rpc);

const client = createClient({ chain: studioNext, account });

function assertSuccessfulReceipt(receipt) {
  const status = String(receipt?.statusName ?? receipt?.status ?? "");
  const execution = String(
    receipt?.txExecutionResultName ?? receipt?.tx_execution_result_name ?? receipt?.executionResult ?? receipt?.execution_result ?? receipt?.data?.execution_result ?? "",
  );
  const accepted = ["5", "7", "ACCEPTED", "FINALIZED"].includes(status);
  const finished = execution === "FINISHED_WITH_RETURN";
  if (!accepted || !finished) {
    throw new Error(`Deployment did not execute successfully: ${JSON.stringify({ status, execution, receipt })}`);
  }
}

async function main() {
  const code = new Uint8Array(readFileSync("contracts/cleara_coordinator.py"));
  console.log("code size", code.length);
  await client.initializeConsensusSmartContract();
  console.log("consensus init ok");
  // estimate fees
  const fees = await client.estimateTransactionFees({ code, args: [] });
  console.log("estimated fees", fees);
  const hash = await client.deployContract({ code, args: [], fees });
  console.log("deploy hash", hash);
  const receipt = await client.waitForTransactionReceipt({ hash, waitUntil: "decided", retries: 200 });
  console.log("receipt", JSON.stringify(receipt, null, 2));
  assertSuccessfulReceipt(receipt);
  const addr = receipt?.data?.contract_address || receipt?.txDataDecoded?.contractAddress || receipt?.contractAddress || receipt?.recipient;
  if (!addr) throw new Error("Successful deployment receipt did not contain a contract address");
  console.log("contract address", addr);
  // save
  const fs = await import("fs");
  fs.writeFileSync("deployed.json", JSON.stringify({ address: addr, hash, receipt }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
