/*
  Human Fund 2025 — initial implementation
  - Loads data from ./data.json (GitHub Pages compatible)
  - Falls back to embedded demo data if fetch is blocked (common on file://)
  - Normalizes contributor name (trim + lowercase) for lookup
*/

(function () {
  const form = document.getElementById("hf-form");
  const input = document.getElementById("hf-name");
  const results = document.getElementById("hf-results");

  /** @type {Record<string, {causeTitle: string, amount: number, stats: string[]}>} */
  const fallbackData = {
    alex: {
      causeTitle: "Strategic Synergy Enablement Initiative",
      amount: 2500,
      stats: [
        "Provisioned 14.3 units of cross-functional optimism",
        "Reduced existential risk by 0.6% (statistically confident-ish)",
        "Unlocked 3 new stakeholder smiles per sprint"
      ]
    },
    sam: {
      causeTitle: "Community Wellbeing Alignment Program",
      amount: 1800,
      stats: [
        "Deployed 22 feel-good deliverables to production",
        "Achieved 97th percentile gratitude throughput",
        "Converted coffee into impact at a 1:1 ratio"
      ]
    },
    taylor: {
      causeTitle: "Innovation Through Mild Discomfort Fund",
      amount: 4200,
      stats: [
        "Sponsored 9 courageous brainstorm sessions",
        "Increased idea velocity by 12% (measured in vibes)",
        "Prevented 1 major meeting from becoming a minor meeting"
      ]
    },
    jordan: {
      causeTitle: "Operational Excellence & Snack Availability",
      amount: 1200,
      stats: [
        "Improved snack uptime to 99.95%",
        "Introduced 5 new flavors of accountability",
        "Raised morale by 2 points on the corporate feelings index"
      ]
    },
    casey: {
      causeTitle: "Enterprise Empathy Modernization",
      amount: 3100,
      stats: [
        "Refactored 6 legacy apologies into modern apologies",
        "Cut passive-aggressive latency by 18ms",
        "Migrated 1 entire team to a shared understanding"
      ]
    },
    riley: {
      causeTitle: "Sustainable Meeting Reduction Strategy",
      amount: 900,
      stats: [
        "Eliminated 4 recurring meetings (ceremonially)",
        "Recovered 3.2 hours of weekly life",
        "Improved calendar hygiene by 41%"
      ]
    }
  };

  function normalizeName(raw) {
    return String(raw || "")
      .trim()
      .toLowerCase();
  }

  function formatMoney(amount) {
    const n = Number(amount);
    if (!Number.isFinite(n)) return String(amount);
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(n);
  }

  function renderNotFound(name) {
    const safe = name ? `"${name}"` : "that";
    results.innerHTML = `
      <h3 class="hf-report-title">No record found</h3>
      <p class="hf-muted">We have no official record for ${safe} contributor in our FY2025 ledger.</p>
      <p class="hf-muted">This is either an accounting error or an intentional mystery.</p>
    `;
  }

  function renderReport(entry) {
    const stats = Array.isArray(entry.stats) ? entry.stats : [];
    const statLis = stats.map((s) => `<li>${escapeHtml(String(s))}</li>`).join("");

    results.innerHTML = `
      <h3 class="hf-report-title">${escapeHtml(entry.causeTitle)}</h3>
      <p class="hf-amount">Funding amount: <strong>${escapeHtml(formatMoney(entry.amount))}</strong></p>
      <ul class="hf-list">${statLis}</ul>
    `;
  }

  // Minimal escaping since we set innerHTML for formatted output.
  function escapeHtml(str) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  async function loadData() {
    try {
      const res = await fetch("./data.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      // Local file opens (file://) often block fetch; keep the demo functional anyway.
      return fallbackData;
    }
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rawName = input?.value ?? "";
    const key = normalizeName(rawName);

    if (!key) {
      results.innerHTML = `<p class="hf-muted">Please enter a name so we can generate a report.</p>`;
      input?.focus();
      return;
    }

    results.innerHTML = `<p class="hf-muted">Generating report…</p>`;

    const data = await loadData();
    const entry = data?.[key];

    if (!entry) {
      renderNotFound(rawName.trim());
      return;
    }

    renderReport(entry);
  });
})();

