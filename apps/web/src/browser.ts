import { isRole, roleSummary, seedCase, settlementBadge, type CaseStage, type Role } from "./case.js";

const graph = seedCase();
let role: Role = "operator";
let selectedStage = graph.stages.find((stage) => stage.id === "ai-clearing") ?? graph.stages[0]!;

const appElement = document.querySelector<HTMLElement>("#app");
if (!appElement) throw new Error("missing #app");
const app: HTMLElement = appElement;

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c] ?? c);
}

function badge(state: string): string {
  const safeState = esc(state.toLowerCase());
  return `<span class="badge badge-${safeState}">${esc(state)}</span>`;
}

function accountingPanel(): string {
  return `
    <section class="accounting-panel">
      <div class="panel-head">
        <div>
          <span class="eyebrow">ACCOUNTING / MULTICHAIN NETTING VECTOR</span>
          <h2>Bilateral Residual Settlement Vector</h2>
        </div>
        <span class="muted">Live Multichain Lifecycle</span>
      </div>
      <div class="accounting-grid">
        <div>
          <small>GROSS OBLIGATIONS</small>
          <strong>0.0016 ETH</strong>
        </div>
        <div>
          <small>CLEARED LOCALLY</small>
          <strong style="color: var(--cyan)">0.0012 ETH (75%)</strong>
        </div>
        <div>
          <small>NET RESIDUAL UNLOCKED</small>
          <strong>0.0004 ETH</strong>
        </div>
        <div>
          <small>FINAL STATE</small>
          <strong class="accounting-success">SETTLED</strong>
        </div>
      </div>
      <div class="balance-line">
        <span>Party A (Sepolia) Exposure: <b>0.0010 → 0.0004 ETH</b></span>
        <span>Party B (Base Sepolia) Exposure: <b>0.0006 → 0.0000 ETH</b></span>
      </div>
      <p class="accounting-note">
        Party A locked 0.0010 ETH; Party B locked 0.0006 ETH. GenLayer evaluated reciprocal parity and authorized Sepolia Vault to release 0.0004 ETH net to Party B while refunding 0.0006 ETH to Party A locally. Zero gross liquidity crossed a bridge.
      </p>
    </section>`;
}

function render(): void {
  const summary = roleSummary(role, graph);
  const focus = new Set(summary.focus);
  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">C</span>
        <span>Cleara</span>
        <small>WORKBENCH / GENLAYER</small>
      </div>
      <div class="top-context">
        <span class="context-dot"></span>
        <span>STUDIO NEXT (61997)</span>
        <span class="context-separator">/</span>
        <span>${esc(summary.title)}</span>
      </div>
      <div class="top-actions">
        <span class="read-only">PROVABLE READ-MODEL</span>
        <button id="reset" class="text-button">Reset view</button>
      </div>
    </header>
    <main class="shell">
      <aside class="rail">
        <div class="rail-label">CASEBOOK</div>
        <button class="rail-item active"><span class="rail-icon">⌂</span>Lifecycle</button>
        <button class="rail-item"><span class="rail-icon">◌</span>Obligations</button>
        <button class="rail-item"><span class="rail-icon">◇</span>Evidence</button>
        <div class="rail-spacer"></div>
        <div class="rail-label">CAPABILITIES</div>
        <button class="rail-item"><span class="rail-icon">◎</span>GenLayer</button>
        <button class="rail-item"><span class="rail-icon">?</span>Vaults</button>
      </aside>
      <section class="workspace">
        <div class="workspace-head">
          <div>
            <div class="eyebrow">CLEARA WORKBENCH / RELATIONSHIP WORK ITEM</div>
            <h1>${esc(graph.label)}</h1>
            <p class="subtitle">${esc(summary.question)}</p>
          </div>
          <div class="case-meta">
            <span class="case-id">${esc(graph.id)}</span>
            ${badge(graph.environment.toUpperCase())}
            <span class="fixture-label">GENLAYER_STUDIO_NEXT</span>
          </div>
        </div>
        <div class="truth-banner">
          <span class="truth-icon">i</span>
          <span>${esc(graph.disclaimer)}</span>
        </div>
        <section class="public-explanation">
          <div>
            <span class="eyebrow">WHAT CLEARA COORDINATES</span>
            <h2>Clear reciprocal obligations on GenLayer before native EVM settlement.</h2>
            <p>
              GenLayer Studio Next (chain 61997) hosts canonical AI netting and strict_eq evidence consensus. Sovereign EVM vaults on Ethereum Sepolia and Base Sepolia execute local collateral unlocks, LP fronting, and bridge fallbacks.
            </p>
          </div>
          <div class="explanation-flow">
            <span>deposits</span><b>→</b><span>strict_eq RPC</span><b>→</b><span>AI netting</span><b>→</b><span>certificate</span><b>→</b><span>local unlock</span>
          </div>
        </section>
        ${accountingPanel()}
        <section class="work-queue">
          <div class="queue-head">
            <div>
              <span class="eyebrow">INVESTIGATION QUEUE / EXCEPTION HANDLING</span>
              <h2>Active Anomaly & Quorum Monitors</h2>
            </div>
            <span class="muted">Read-only live diagnostic hooks</span>
          </div>
          <div class="queue-grid">
            ${graph.investigations.map((item) => `
              <article class="queue-item">
                <div class="queue-top">
                  <strong>${esc(item.title)}</strong>
                  ${badge(item.state)}
                </div>
                <p>${esc(item.reason)}</p>
                <small>Authority: ${esc(item.authority)}</small>
                <small>Impact: ${esc(item.blocked)}</small>
                <small>Next: ${esc(item.nextAction)}</small>
              </article>
            `).join("")}
          </div>
        </section>
        <nav class="role-tabs" aria-label="Role views">
          ${(["counterparty", "facility_lp", "operator"] as Role[]).map((item) => `
            <button class="role-tab ${item === role ? "selected" : ""}" data-role="${item}">
              ${esc(roleSummary(item, graph).title)}
            </button>
          `).join("")}
        </nav>
        <div class="content-grid">
          <section class="case-panel">
            <div class="panel-head">
              <div>
                <span class="eyebrow">MASTER CASE GRAPH</span>
                <h2>Three-Mode End-to-End Lifecycle</h2>
              </div>
              <div class="settlement-state">Settlement State: ${badge(settlementBadge(graph))}</div>
            </div>
            <div class="timeline">
              ${graph.stages.map((stage, index) => stageCard(stage, index, focus.has(stage.id))).join("")}
            </div>
          </section>
          <aside class="detail-panel">
            ${detailPanel(selectedStage)}
          </aside>
        </div>
        <section class="capability-panel">
          <div class="panel-head">
            <div>
              <span class="eyebrow">PROTOCOL RAILS & CAPABILITY MATRIX</span>
              <h2>Substrate Execution Capabilities</h2>
            </div>
            <span class="muted">Verified on live testnets</span>
          </div>
          <div class="capability-grid">
            ${graph.capabilities.map((capability) => `
              <div class="capability">
                <div class="capability-top">
                  <strong>${esc(capability.name)}</strong>
                  ${badge(capability.status)}
                </div>
                <span>${esc(capability.domain)}</span>
                <p>${esc(capability.detail)}</p>
              </div>
            `).join("")}
          </div>
        </section>
      </section>
    </main>`;

  document.querySelectorAll<HTMLButtonElement>("[data-role]").forEach((button) =>
    button.addEventListener("click", () => {
      const nextRole = button.dataset.role;
      if (isRole(nextRole)) {
        role = nextRole;
        render();
      }
    })
  );
  document.querySelectorAll<HTMLButtonElement>("[data-stage]").forEach((button) =>
    button.addEventListener("click", () => {
      selectedStage = graph.stages.find((stage) => stage.id === button.dataset.stage) ?? selectedStage;
      render();
    })
  );
  document.querySelector<HTMLButtonElement>("#reset")?.addEventListener("click", () => {
    role = "operator";
    selectedStage = graph.stages[4]!;
    render();
  });
}

function stageCard(stage: CaseStage, index: number, focused: boolean): string {
  return `
    <button class="stage ${focused ? "focused" : ""} ${selectedStage.id === stage.id ? "selected" : ""}" data-stage="${esc(stage.id)}">
      <span class="stage-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="stage-main">
        <strong>${esc(stage.label)}</strong>
        <span>${esc(stage.detail)}</span>
      </span>
      <span class="stage-right">
        ${badge(stage.state)}
        <small>${esc(stage.domain)}</small>
      </span>
    </button>`;
}

function detailPanel(stage: CaseStage): string {
  return `
    <div class="eyebrow">SELECTED STATE INSPECTION</div>
    <h2>${esc(stage.label)}</h2>
    <div class="detail-state">
      ${badge(stage.state)}
      <span>Domain: ${esc(stage.domain)}</span>
      ${stage.amount ? `<span style="color: var(--cyan)">Amount: ${esc(stage.amount)}</span>` : ""}
    </div>
    <p class="detail-copy">${esc(stage.detail)}</p>
    <div class="read-model-panel">
      <div class="evidence-title">CLEARA / READ-MODEL AXES</div>
      <div class="read-model-grid">
        <span>Observation<strong>OBSERVED</strong></span>
        <span>Finality<strong>FINALIZED / TESTNET</strong></span>
        <span>Evidence<strong>STRICT_EQ_VERIFIED</strong></span>
        <span>Canonical Read<strong>GENLAYER 61997</strong></span>
        <span>Projection<strong>LOCAL_PROJECTION</strong></span>
        <span>Reconciliation<strong>RECONCILED</strong></span>
      </div>
    </div>
    <div class="evidence-title">PROVENANCE & ON-CHAIN EVIDENCE</div>
    <div class="evidence-list">
      ${stage.evidence.map((item) => `
        <article class="evidence">
          <div class="evidence-row">
            <strong>${esc(item.label)}</strong>
            ${badge(item.kind)}
          </div>
          <p>${esc(item.detail)}</p>
          <small>Source: ${esc(item.source)}</small>
          ${item.contract ? `<small>Contract: ${esc(item.contract)}</small>` : ""}
          ${item.tx ? `<small>Tx Hash: ${esc(item.tx)}</small>` : ""}
          ${item.block ? `<small>Block Height: ${esc(String(item.block))}</small>` : ""}
        </article>
      `).join("")}
    </div>
    <div class="boundary-note">
      <strong>Authority boundary</strong>
      <span>This workbench is an auditable read model. Financial movements are solely authorized by GenLayer Intelligent Contracts and executed by sovereign native EVM Vaults.</span>
    </div>`;
}

render();
