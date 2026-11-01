(() => {
  const BASES = [
    ["Radius", "Average distance from the center to the edge"],
    ["Texture", "Variation in gray-scale values"],
    ["Perimeter", "Length around the nucleus"],
    ["Area", "Size of the nucleus"],
    ["Smoothness", "Local variation in radius lengths"],
    ["Compactness", "Perimeter² / area − 1"],
    ["Concavity", "Depth of indents in the outline"],
    ["Concave points", "Number of indented sections"],
    ["Symmetry", "How even the shape is"],
    ["Fractal dimension", "Coastline roughness − 1"],
  ];
  const GROUPS = [
    "Mean: the average of each measurement across all nuclei in the image.",
    "Standard error: how much each measurement varies from nucleus to nucleus.",
    "Worst: the average of the three largest values in the image.",
  ];

  const $ = (s) => document.querySelector(s);
  const panel = $("#panel");
  let meta = null;
  let group = 0;
  const values = new Array(30).fill("");

  const fmt = (n) => (Math.abs(n) >= 100 ? n.toFixed(0) : Math.abs(n) >= 1 ? n.toFixed(2) : n.toPrecision(3));

  // ---------- form ----------
  function renderFields() {
    panel.innerHTML = "";
    $("#group-note").textContent = GROUPS[group];
    BASES.forEach(([name, desc], i) => {
      const idx = group * 10 + i;
      const wrap = document.createElement("div");
      wrap.className = "field";
      wrap.dataset.idx = idx;
      wrap.innerHTML = `
        <label for="f${idx}">${name}<small>${desc}</small></label>
        <input id="f${idx}" type="text" inputmode="decimal" autocomplete="off"
               placeholder="e.g. ${fmt(meta.median[idx])}" value="${values[idx]}">
        <span class="hint">Typical range ${fmt(meta.min[idx])} to ${fmt(meta.max[idx])}</span>`;
      const input = wrap.querySelector("input");
      input.addEventListener("input", () => {
        values[idx] = input.value.trim();
        validate(wrap, idx);
        refresh();
      });
      panel.appendChild(wrap);
      validate(wrap, idx);
    });
  }

  function validate(wrap, idx) {
    const hint = wrap.querySelector(".hint");
    wrap.classList.remove("warn", "bad");
    const raw = values[idx];
    const base = `Typical range ${fmt(meta.min[idx])} to ${fmt(meta.max[idx])}`;
    hint.textContent = base;
    if (raw === "") return;
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      wrap.classList.add("bad");
      hint.textContent = "Enter a number, for example 0.085";
    } else if (n < 0) {
      wrap.classList.add("bad");
      hint.textContent = "This measurement can't be negative";
    } else if (n < meta.min[idx] * 0.5 || n > meta.max[idx] * 1.5) {
      wrap.classList.add("warn");
      hint.textContent = `Far outside the training data (${fmt(meta.min[idx])} to ${fmt(meta.max[idx])})`;
    }
  }

  function numericValues() {
    return values.map((v) => (v === "" ? NaN : Number(v)));
  }
  function isValid(v) { return Number.isFinite(v) && v >= 0; }

  function refresh() {
    const nums = numericValues();
    const filled = nums.filter(isValid).length;
    for (let g = 0; g < 3; g++) {
      const c = nums.slice(g * 10, g * 10 + 10).filter(isValid).length;
      const el = document.querySelector(`[data-count="${g}"]`);
      el.textContent = `${c}/10`;
      el.classList.toggle("done", c === 10);
    }
    $("#progress").textContent = `${filled} of 30 values entered`;
    $("#predict").disabled = filled !== 30;
    drawNuclei(nums);
  }

  function setAll(arr) {
    arr.forEach((v, i) => (values[i] = String(v)));
    renderFields();
    clearResult();
    refresh();
  }

  // ---------- tabs ----------
  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      group = Number(btn.dataset.group);
      document.querySelectorAll(".tabs button").forEach((b) => b.setAttribute("aria-selected", b === btn));
      renderFields();
    });
  });

  // ---------- quick actions ----------
  $("#load-benign").onclick = () => setAll(meta.samples.benign);
  $("#load-malignant").onclick = () => setAll(meta.samples.malignant);
  $("#clear").onclick = () => { values.fill(""); $("#paste-box").value = ""; setMsg("Values go in the same order as your dataset columns."); renderFields(); clearResult(); refresh(); };

  const pasteBox = $("#paste-box");
  function setMsg(t, cls = "") { const m = $("#paste-msg"); m.textContent = t; m.className = "paste-msg " + cls; }
  pasteBox.addEventListener("input", () => {
    const nums = (pasteBox.value.match(/-?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || []).map(Number);
    if (!nums.length) return setMsg("Values go in the same order as your dataset columns.");
    if (nums.length === 30) { setMsg("Read 30 values and filled every field.", "ok"); setAll(nums); }
    else setMsg(`Found ${nums.length} numbers. You need exactly 30.`, "bad");
  });

  // ---------- nuclei illustration ----------
  const SEEDS = [[110,105,1],[205,95,.9],[150,170,1.1],[235,175,.85],[95,220,.9],[190,245,1],[60,150,.7],[260,120,.65]];
  const NS = "http://www.w3.org/2000/svg";
  let nucleiEls = [];
  function buildScope() {
    const g = $("#nuclei");
    SEEDS.forEach(() => { const p = document.createElementNS(NS, "path"); g.appendChild(p); nucleiEls.push(p); });
    const f = $("#fibres");
    for (let i = 0; i < 14; i++) {
      const p = document.createElementNS(NS, "path");
      const y = 20 + i * 22, a = (i * 37) % 30;
      p.setAttribute("d", `M0 ${y} C 90 ${y - 20 + a}, 210 ${y + 24 - a}, 320 ${y}`);
      p.setAttribute("fill", "none"); p.setAttribute("stroke", "#D9729F"); p.setAttribute("stroke-width", "1.2");
      f.appendChild(p);
    }
  }
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  function norm(i, v) { return Number.isFinite(v) ? clamp01((v - meta.min[i]) / (meta.max[i] - meta.min[i])) : 0.35; }

  function drawNuclei(nums) {
    const size = 0.55 + norm(0, nums[0]) * 0.95;          // radius_mean
    const bumpy = 0.02 + norm(6, nums[6]) * 0.3;           // concavity_mean
    const sym = norm(8, nums[8]);                           // symmetry_mean
    SEEDS.forEach(([cx, cy, k], n) => {
      const r = 26 * k * size;
      const pts = 18;
      let d = "";
      for (let j = 0; j <= pts; j++) {
        const a = (j / pts) * Math.PI * 2;
        const wob = 1 + bumpy * Math.sin(a * (3 + (n % 3)) + n * 1.7) + bumpy * 0.5 * Math.sin(a * 7 + n);
        const stretch = 1 + sym * 0.25 * Math.cos(a * 2 + n);
        const x = cx + Math.cos(a) * r * wob * stretch;
        const y = cy + Math.sin(a) * r * wob / stretch;
        d += (j ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
      }
      nucleiEls[n].setAttribute("d", d + "Z");
    });
  }

  // ---------- predict ----------
  function clearResult() {
    $("#verdict").hidden = true; $("#error").hidden = true; $("#empty").hidden = false;
    $("#scope").classList.remove("malignant", "benign");
  }

  $("#predict").addEventListener("click", async () => {
    const btn = $("#predict");
    btn.disabled = true; btn.textContent = "Predicting…";
    $("#error").hidden = true;
    try {
      const res = await fetch("/api/predict", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: numericValues() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The server could not make a prediction.");
      showResult(data);
    } catch (e) {
      $("#empty").hidden = true; $("#verdict").hidden = true;
      const err = $("#error"); err.hidden = false;
      err.textContent = e instanceof TypeError ? "Can't reach the server. Check that app.py is still running, then try again." : e.message;
    } finally {
      btn.textContent = "Predict diagnosis"; refresh();
    }
  });

  function showResult(d) {
    const cls = d.label === 0 ? "malignant" : "benign";
    $("#empty").hidden = true; $("#verdict").hidden = false;
    const w = $("#verdict-word"); w.textContent = d.diagnosis; w.className = "verdict-word " + cls;
    const top = Math.max(d.malignant_probability, d.benign_probability);
    $("#verdict-sub").textContent = d.label === 0
      ? `The model is ${(top * 100).toFixed(1)}% confident this tumor is malignant.`
      : `The model is ${(top * 100).toFixed(1)}% confident this tumor is benign.`;
    $("#pct-m").textContent = (d.malignant_probability * 100).toFixed(1) + "%";
    $("#pct-b").textContent = (d.benign_probability * 100).toFixed(1) + "%";
    $("#bar-m").style.width = "0"; $("#bar-b").style.width = "0";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $("#bar-m").style.width = d.malignant_probability * 100 + "%";
      $("#bar-b").style.width = d.benign_probability * 100 + "%";
    }));
    const s = $("#scope"); s.classList.remove("malignant", "benign"); s.classList.add(cls);
  }

  // ---------- init ----------
  fetch("/api/meta").then((r) => r.json()).then((m) => {
    meta = m; buildScope(); renderFields(); refresh();
  }).catch(() => {
    $("#empty").textContent = "Can't load the model details. Make sure app.py is running.";
  });
})();
