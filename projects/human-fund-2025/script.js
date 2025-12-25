/*
  Human Fund 2025 — client-side report renderer
  - GitHub Pages compatible (fetches ./data.json)
  - Local-file friendly (falls back to embedded data if fetch is blocked on file://)
  - Normalizes identifier input (trim, collapse spaces, lowercase)
  - Renders a structured Impact Report + SVG bar chart ("Performance Index")
*/

(function () {
  const form = document.getElementById("hf-form");
  const input = document.getElementById("hf-name");
  const results = document.getElementById("hf-results");
  const resetBtn = document.getElementById("hf-reset");

  /**
   * Data shape:
   * {
   *   [key: string]: {
   *     causeTitle: string,
   *     amount: number,
   *     stats: string[],
   *     chartData: { labels: string[], values: number[] }
   *   }
   * }
   */
  const EMBEDDED_DATA = {
    connor: {
      causeTitle: "Evergreen Compliance Readiness Program",
      amount: 12025,
      stats: [
        "Completed 4 seasonal audits with zero detectable cheer leakage",
        "Improved hallway confidence by 17% (self-reported)",
        "Aligned 12 stakeholders to a single, quietly ominous vision statement"
      ],
      chartData: { labels: ["Policy", "Morale", "Uptime", "Synergy"], values: [62, 41, 88, 57] }
    },
    vanessa: {
      causeTitle: "Burgundy Ribbon Throughput Optimization",
      amount: 40404,
      stats: [
        "Reduced ribbon-related decision latency by 33ms",
        "Deployed 9 ribbon-centric best practices to all departments",
        "Increased ceremonial seriousness per capita by 2.1x"
      ],
      chartData: { labels: ["Velocity", "Precision", "Clarity", "Impact"], values: [71, 84, 66, 59] }
    },
    sidney: {
      causeTitle: "Liminal Workspace Stabilization Initiative",
      amount: 27182,
      stats: [
        "Maintained acceptable fluorescent hum levels across 3 zones",
        "Standardized chair squeak frequency to a predictable cadence",
        "Improved corridor mystery containment by 24%"
      ],
      chartData: { labels: ["Stability", "Silence", "Order", "Containment"], values: [78, 52, 81, 64] }
    },
    emma: {
      causeTitle: "Seasonal Sentiment Neutralization Fund",
      amount: 16180,
      stats: [
        "De-escalated 7 instances of unsolicited festive enthusiasm",
        "Achieved a balanced emotional baseline in open-plan seating",
        "Recovered 14 minutes of focus per hour (approx.)"
      ],
      chartData: { labels: ["Focus", "Calm", "Consistency", "Governance"], values: [73, 69, 77, 58] }
    },
    tracy: {
      causeTitle: "Strategic Ornament Governance Council",
      amount: 30003,
      stats: [
        "Implemented a 12-point ornament approval workflow",
        "Reduced sparkle variance to within acceptable tolerances",
        "Published 1 definitive policy on tinsel scope creep"
      ],
      chartData: { labels: ["Control", "Risk", "Alignment", "Delivery"], values: [86, 72, 79, 63] }
    },
    dave: {
      causeTitle: "Operational Hot Beverage Continuity Plan",
      amount: 9090,
      stats: [
        "Sustained mug availability during peak Q4 demand",
        "Increased beverage-to-spreadsheet conversion by 11%",
        "Achieved stable decaf preparedness across teams"
      ],
      chartData: { labels: ["Continuity", "Readiness", "Efficiency", "Resilience"], values: [82, 68, 61, 77] }
    },
    amy: {
      causeTitle: "North Pole Procurement Modernization",
      amount: 22222,
      stats: [
        "Streamlined the acquisition of 6 ethically ambiguous supplies",
        "Reduced sleigh-related vendor confusion by 19%",
        "Established a single source of truth for stocking levels"
      ],
      chartData: { labels: ["Procure", "Verify", "Track", "Forecast"], values: [74, 83, 70, 62] }
    },
    steve: {
      causeTitle: "Executive Cheer Minimization Taskforce",
      amount: 51515,
      stats: [
        "Neutralized 5 all-hands 'fun' initiatives before rollout",
        "Maintained a professional tone during 100% of greetings",
        "Achieved measurable restraint in hallway small talk"
      ],
      chartData: { labels: ["Restraint", "Tone", "Control", "Compliance"], values: [88, 76, 84, 71] }
    },
    judy: {
      causeTitle: "Internal Holiday Memo Standardization",
      amount: 13131,
      stats: [
        "Issued 3 compliant greetings with zero emotional ambiguity",
        "Aligned 9 departments on approved salutations",
        "Reduced exclamation mark usage to sustainable levels"
      ],
      chartData: { labels: ["Clarity", "Tone", "Approval", "Safety"], values: [79, 74, 68, 82] }
    },
    kelly: {
      causeTitle: "Corporate Kindness KPI Framework",
      amount: 8080,
      stats: [
        "Defined 12 kindness metrics without any subjective input",
        "Improved compliment traceability by 44%",
        "Reached a stable gratitude utilization rate"
      ],
      chartData: { labels: ["Measure", "Report", "Audit", "Scale"], values: [67, 73, 81, 60] }
    },
    ethan: {
      causeTitle: "Holiday Systems Interoperability Program",
      amount: 12345,
      stats: [
        "Integrated 4 seasonal workflows with legacy calendar systems",
        "Prevented 2 critical incidents involving 'secret Santa' scope",
        "Achieved cross-platform merriment parity (limited release)"
      ],
      chartData: { labels: ["Interop", "Reliability", "Coverage", "Latency"], values: [72, 86, 65, 58] }
    },
    will: {
      causeTitle: "Quiet Desk Lamp Enhancement Grant",
      amount: 17171,
      stats: [
        "Improved desk-lamp glow uniformity across 5 pods",
        "Reduced after-hours shadows to compliant silhouettes",
        "Enabled 1.0 additional unit of calm per workstation"
      ],
      chartData: { labels: ["Glow", "Uniformity", "Comfort", "Calm"], values: [81, 77, 69, 74] }
    },
    alex: {
      causeTitle: "Strategic Synergy Enablement Initiative",
      amount: 25000,
      stats: [
        "Provisioned 14.3 units of cross-functional optimism",
        "Reduced existential risk by 0.6% (statistically confident-ish)",
        "Unlocked 3 new stakeholder smiles per sprint"
      ],
      chartData: { labels: ["Synergy", "Velocity", "Confidence", "Adoption"], values: [76, 63, 71, 58] }
    },
    doug: {
      causeTitle: "Conference Room Echo Reduction Project",
      amount: 23232,
      stats: [
        "Lowered echo-related regret across 2 meeting rooms",
        "Improved microphone diplomacy by 28%",
        "Enabled clearer accountability statements per minute"
      ],
      chartData: { labels: ["Clarity", "Signal", "Order", "Retention"], values: [80, 74, 66, 62] }
    },
    langston: {
      causeTitle: "Seasonal Narrative Alignment Office",
      amount: 60606,
      stats: [
        "Consolidated 7 competing holiday narratives into one deck",
        "Standardized wonder to an approved range",
        "Achieved stakeholder consensus on 'meaning' (draft)"
      ],
      chartData: { labels: ["Narrative", "Consensus", "Control", "Delivery"], values: [83, 69, 77, 61] }
    },
    lyle: {
      causeTitle: "Staple Supply Resilience Fund",
      amount: 11111,
      stats: [
        "Maintained staple availability through the entire quarter",
        "Reduced paperclip drift in high-traffic zones",
        "Improved binder clip accountability by 13%"
      ],
      chartData: { labels: ["Supply", "Tracking", "Stability", "Confidence"], values: [78, 64, 82, 57] }
    },
    heather: {
      causeTitle: "Evergreen Ethics & Ornamentation Review",
      amount: 34343,
      stats: [
        "Reviewed 18 decorative proposals for regulatory alignment",
        "Prevented 1 unauthorized garland deployment",
        "Published a clean-room guideline for glitter handling"
      ],
      chartData: { labels: ["Ethics", "Risk", "Approval", "Safety"], values: [75, 86, 70, 84] }
    },
    ben: {
      causeTitle: "Holiday Queue Management Initiative",
      amount: 70707,
      stats: [
        "Optimized cookie line throughput with zero incidents",
        "Reduced wait-time suspense to tolerable levels",
        "Improved corridor flow during peak cheer hours"
      ],
      chartData: { labels: ["Throughput", "Flow", "Patience", "Order"], values: [82, 77, 61, 74] }
    },
    dylan: {
      causeTitle: "End-of-Year Deliverable Wrapping Program",
      amount: 20250,
      stats: [
        "Packaged 6 deliverables with executive-ready ribbon language",
        "Improved presentation fidelity by 19%",
        "Achieved a controlled surprise factor (within policy)"
      ],
      chartData: { labels: ["Packaging", "Clarity", "Polish", "Control"], values: [79, 73, 84, 68] }
    },
    heidi: {
      causeTitle: "Silent Night Operations Center",
      amount: 99999,
      stats: [
        "Maintained silence SLAs for 14 consecutive evenings",
        "Reduced overhead lighting anxiety to near-zero",
        "Improved after-hours compliance posture by 31%"
      ],
      chartData: { labels: ["Silence", "SLA", "Posture", "Calm"], values: [90, 82, 75, 86] }
    },
    max: {
      causeTitle: "Experimental Festivity Research & Development",
      amount: 50505,
      stats: [
        "Prototyped 3 minimally festive interactions (internal beta)",
        "Stabilized joy levels within an approved envelope",
        "Documented 1 repeatable process for tasteful seasonal ambiance"
      ],
      chartData: { labels: ["R&D", "Taste", "Stability", "Documentation"], values: [85, 72, 78, 66] }
    }
  };

  function normalizeIdentifier(raw) {
    // Trim, collapse whitespace, lowercase. Records are indexed by first-name key.
    const collapsed = String(raw || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
    return collapsed;
  }

  function titleCaseFirstName(key) {
    if (!key) return "";
    const first = key.split(" ")[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatSatiricalAmount(amount) {
    const n = Number(amount);
    const safe = Number.isFinite(n) ? n : 0;
    // Intentionally not a real currency: “HF$” is a satirical internal unit.
    return `HF$ ${safe.toLocaleString()}`;
  }

  function validateChartData(chartData) {
    const labels = Array.isArray(chartData?.labels) ? chartData.labels : [];
    const values = Array.isArray(chartData?.values) ? chartData.values : [];
    const len = Math.min(labels.length, values.length);
    return {
      labels: labels.slice(0, len).map((s) => String(s)),
      values: values.slice(0, len).map((v) => Number(v)).filter((v) => Number.isFinite(v))
    };
  }

  function renderChartSvg(containerEl, title, chartData) {
    const { labels, values } = validateChartData(chartData);
    if (!labels.length || values.length !== labels.length) return;

    const width = 560;
    const height = 180;
    const pad = { top: 18, right: 10, bottom: 38, left: 10 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const max = Math.max(1, ...values);
    const barW = innerW / labels.length;

    const bars = values
      .map((v, i) => {
        const h = Math.max(0, (v / max) * innerH);
        const x = pad.left + i * barW + 6;
        const y = pad.top + (innerH - h);
        const w = Math.max(10, barW - 12);
        const labelX = pad.left + i * barW + barW / 2;
        return `
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="rgba(31,75,58,.55)"></rect>
          <text x="${labelX}" y="${height - 16}" text-anchor="middle" font-size="11" fill="rgba(18,19,22,.74)" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace">${escapeHtml(labels[i])}</text>
        `;
      })
      .join("");

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="180" role="img" aria-label="${escapeHtml(title)}">
        <title>${escapeHtml(title)}</title>
        <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(255,255,255,.0)"></rect>
        <line x1="${pad.left}" y1="${pad.top + innerH}" x2="${width - pad.right}" y2="${pad.top + innerH}" stroke="rgba(18,19,22,.14)" />
        ${bars}
      </svg>
    `;

    containerEl.innerHTML = svg;
  }

  function renderReport(recipientName, entry) {
    const stats = Array.isArray(entry?.stats) ? entry.stats : [];
    const outcomes = stats.slice(0, 3).map((s) => `<li>${escapeHtml(s)}</li>`).join("");

    results.innerHTML = `
      <div class="hf-report">
        <div class="hf-report-head">
          <h3 class="hf-report-title">Impact Report</h3>
          <div class="hf-report-id">Identifier: ${escapeHtml(recipientName)}</div>
        </div>

        <div class="hf-kv" aria-label="Report details">
          <div class="hf-kv-row">
            <div class="hf-k">Recipient</div>
            <div class="hf-v">${escapeHtml(recipientName)}</div>
          </div>
          <div class="hf-kv-row">
            <div class="hf-k">Allocation Program</div>
            <div class="hf-v">${escapeHtml(entry.causeTitle)}</div>
          </div>
          <div class="hf-kv-row">
            <div class="hf-k">Total Allocation</div>
            <div class="hf-v"><strong>${escapeHtml(formatSatiricalAmount(entry.amount))}</strong></div>
          </div>
          <div class="hf-kv-row">
            <div class="hf-k">Key Outcomes</div>
            <div class="hf-v">
              <ul class="hf-outcomes">${outcomes}</ul>
            </div>
          </div>
        </div>

        <div>
          <div class="hf-chart-title">Performance Index</div>
          <div class="hf-chart" id="hf-chart"></div>
        </div>
      </div>
    `;

    const chartEl = document.getElementById("hf-chart");
    if (chartEl) renderChartSvg(chartEl, "Performance Index", entry.chartData);
  }

  function renderNotFound() {
    results.innerHTML = `
      <div class="hf-error" role="alert">
        <div class="hf-error-title">No record located for provided identifier.</div>
        <div style="color: rgba(18,19,22,.74); font-size: 13px;">
          Please verify spelling, spacing, and identifier scope (first-name index). Then retry.
        </div>
      </div>
    `;
  }

  function setResetVisible(visible) {
    if (!resetBtn) return;
    resetBtn.hidden = !visible;
  }

  function resetUi() {
    results.innerHTML = `
      <div class="hf-placeholder">
        <div class="hf-placeholder-title">Awaiting identifier input</div>
        <div class="hf-placeholder-sub">
          Reports will render here as an internal-facing compliance artifact.
        </div>
      </div>
    `;
    setResetVisible(false);
    if (input) {
      input.value = "";
      input.focus();
    }
  }

  async function loadData() {
    try {
      const res = await fetch("./data.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      // Local file (file://) often blocks fetch; embedded data preserves functionality.
      return EMBEDDED_DATA;
    }
  }

  resetBtn?.addEventListener("click", resetUi);

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const raw = input?.value ?? "";
    const normalized = normalizeIdentifier(raw);
    const key = normalized.split(" ")[0]; // index keys are first-name only

    if (!key) {
      renderNotFound();
      setResetVisible(true);
      input?.focus();
      return;
    }

    results.innerHTML = `<div class="hf-placeholder"><div class="hf-placeholder-title">Processing…</div></div>`;

    const data = await loadData();
    const entry = data?.[key];

    if (!entry) {
      renderNotFound();
      setResetVisible(true);
      return;
    }

    renderReport(titleCaseFirstName(key), entry);
    setResetVisible(true);
  });
})();

