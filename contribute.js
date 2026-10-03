/* =====================================================================
   Lumos Contribution module  — load AFTER app.js  (<script src="contribute.js" defer>)
   Contains: contribute page, access-code step, upload, admin review page.
   NO secrets here. The access code is checked by the "redeem_upload_code"
   database function; this file only sends what the user typed and shows the result.
   ===================================================================== */
(() => {
  "use strict";
  const MAX_BYTES = 25 * 1024 * 1024, MAX_UNITS = 8;
  const TYPES = [
    { key: "teacher-notes", label: "Notes", unit: true },
    { key: "important", label: "Important Questions", unit: true },
    { key: "assignment", label: "Assignments", unit: true },
    { key: "lab", label: "Lab Materials", unit: false },
    { key: "pyq", label: "Previous Year Papers", unit: false },
    { key: "reference", label: "Study / Reference Materials", unit: false },
  ];
  const unitApplies = (k) => !!(TYPES.find((t) => t.key === k) || {}).unit;
  const TOO_MANY = "Too many failed attempts. Please try again later.";

  const form = { type: "teacher-notes", dept: "", year: "", sem: "", subject: "", unit: "", name: "", title: "", desc: "" };
  const ui = { file: null, busy: false, progress: 0, error: "", checking: false, codeMsg: "", blockedUntil: 0, done: false, remaining: null, shake: false, here: false, enter: false };
  const adm = { filter: "pending", list: [], loaded: false, loading: false };

  const opt = (v, l, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? "selected" : ""}>${esc(l)}</option>`;
  const sel = (label, key, options, ph) =>
    `<div class="field"><label>${label}</label><select data-c="${key}">${ph ? `<option value="">${ph}</option>` : ""}${options.map(([v, l]) => opt(v, l, form[key])).join("")}</select></div>`;
  const inp = (label, key, ph, max, tag = "input") =>
    `<div class="field"><label>${label}</label>${tag === "textarea"
      ? `<textarea data-c="${key}" rows="3" maxlength="${max}" placeholder="${esc(ph)}">${esc(form[key])}</textarea>`
      : `<input data-c="${key}" type="text" maxlength="${max}" placeholder="${esc(ph)}" value="${esc(form[key])}" />`}</div>`;

  /* ------------------------------ PAGE ------------------------------ */
  const lockSVG = (open) => `<svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="c-shackle" d="${open ? "M20 28V19a12 12 0 0 1 23.5-3.5" : "M20 28V19a12 12 0 0 1 24 0v9"}"/><rect x="12" y="28" width="40" height="28" rx="6" fill="#FFC93C"/><circle cx="32" cy="41" r="3.5" fill="currentColor"/><path d="M32 44.5V50"/></svg>`;
  const TYPE_EMOJI = { "teacher-notes": "📚", important: "⭐", assignment: "📑", lab: "🧪", pyq: "📄", reference: "🔗" };
  const CONFETTI = ["#F0523A", "#FFC93C", "#3AACFF", "#2FAE73", "#F0523A", "#FFC93C", "#3AACFF", "#2FAE73", "#F0523A", "#FFC93C"];

  const fld = (label, key, ph, max, tag) =>
    `<div class="field"><label>${label}</label>${tag === "textarea"
      ? `<textarea data-c="${key}" rows="3" maxlength="${max}" placeholder="${esc(ph)}">${esc(form[key])}</textarea>`
      : `<input data-c="${key}" type="text" maxlength="${max}" placeholder="${esc(ph)}" value="${esc(form[key])}" />`}</div>`;
  const slc = (label, key, options, ph) =>
    `<div class="field"><label>${label}</label><select data-c="${key}">${ph ? `<option value="">${ph}</option>` : ""}${options.map(([v, l]) => opt(v, l, form[key])).join("")}</select></div>`;

  function stepper(step) {
    const items = ["Sign in", "Secret code", "Upload"];
    return `<ol class="c-steps" aria-label="Progress">${items.map((t, i) => {
      const n = i + 1, st = n < step ? "done" : n === step ? "now" : "";
      return `<li class="c-step ${st}"><span class="c-dot font-display">${n < step ? icon("check", 14) : n}</span><span class="c-step-t">${t}</span></li>`;
    }).join("")}</ol>`;
  }

  function codePanel(blocked) {
    const left = ui.remaining == null ? 3 : ui.remaining;
    const pips = [0, 1, 2].map((i) => `<i class="c-pip ${i >= left ? "used" : ""}"></i>`).join("");
    return `
      <form class="doodle-card c-panel c-vault ${ui.shake ? "c-shake" : ""}" data-c-form="code" autocomplete="off">
        <div class="c-lock ${blocked ? "c-lock-blocked" : ""}">${lockSVG(false)}</div>
        <h2 class="font-display">Enter the secret code</h2>
        <p class="c-muted">Ask the Lumos admin for the secret code. You get <b>3 attempts</b>; after 3 wrong tries you have to wait 30 minutes.</p>
        <div class="field c-code-field"><label for="c-code">Secret code</label>
          <div class="pw-wrap"><input id="c-code" class="c-code-input" type="password" name="code" autocomplete="off" maxlength="100" placeholder="••••••••••" ${blocked || ui.checking ? "disabled" : ""} required />
          <button type="button" class="pw-eye" data-action="toggle-pw" aria-label="Show or hide the code">${icon("eye", 16)}</button></div></div>
        <div class="c-pips" aria-label="${left} attempts remaining">${pips}<span>${left} attempt${left === 1 ? "" : "s"} left</span></div>
        <button class="btn btn-primary btn-lg btn-full" type="submit" ${blocked || ui.checking ? "disabled" : ""}>${ui.checking ? '<i class="c-spin"></i> Checking...' : "Unlock uploads " + icon("arrowRight", 16)}</button>
        <p class="form-note c-msg ${blocked ? "c-blocked" : "c-err"}" role="alert" aria-live="polite">${ui.codeMsg ? esc(ui.codeMsg) : ""}${blocked ? ` <b id="c-count" class="font-display"></b>` : ""}</p>
      </form>`;
  }

  function renderUploadPage() {
    if (!ui.here) { ui.here = true; ui.enter = true; setTimeout(() => { ui.enter = false; }, 1200); }
    if (ui.done) return `
      <div class="upload-success c-success">
        <div class="c-burst" aria-hidden="true">${CONFETTI.map((c, i) => `<i style="--a:${i * 36}deg;--c:${c};--d:${(i % 3) * 60}ms"></i>`).join("")}</div>
        <div class="success-icon c-check">${icon("check", 34, "color:#1E8A5C")}</div>
        <h1 class="font-display">Contribution submitted successfully.</h1>
        <p>Thank you! A moderator will review it, and it goes live once approved.</p>
        <div class="success-actions"><button class="btn btn-primary" data-action="c-again">Upload another</button>
        <button class="btn btn-secondary" data-action="go-browse">Browse resources</button></div>
      </div>`;

    if (state.user && !form.name) form.name = userName();
    const out = !state.user, locked = out || !canUpload(), blocked = ui.blockedUntil > Date.now();
    const step = out ? 1 : locked ? 2 : 3;
    const sems = form.year ? [Number(form.year) * 2 - 1, Number(form.year) * 2] : [];
    const subs = form.dept && form.year && form.sem
      ? (byDeptYearSem[`${form.dept}-${form.year}-${form.sem}`] || []).map((id) => [id, subjectsById[id].name]) : [];
    const f = ui.file;

    const hero = `
      <section class="c-hero ${ui.enter ? "c-in" : ""}">
        <span class="c-blob c-blob-a"></span><span class="c-blob c-blob-b"></span>
        <span class="c-float c-f1">📚</span><span class="c-float c-f2">⭐</span><span class="c-float c-f3">🧪</span><span class="c-float c-f4">📝</span>
        <div class="c-hero-in">
          <div class="eyebrow">Give back to your batch</div>
          <h1 class="font-display c-title">Lumos Contribution <span class="accent">Portal</span></h1>
          <p class="c-lead">Only the Lumos admin and people who have the <b>secret code</b> can contribute.<br class="c-br"/> Sign in, then enter the secret code to upload a resource.</p>
        </div>
      </section>`;

    const gate = out
      ? `<div class="doodle-card c-panel c-gate"><div class="c-lock">${lockSVG(false)}</div>
           <h2 class="font-display">Sign in to contribute</h2>
           <p class="c-muted">Create a free account or log in. After that you'll enter the secret code to unlock uploads.</p>
           <div class="c-row"><button class="btn btn-primary btn-lg" data-action="c-login">Log in</button>
           <button class="btn btn-secondary btn-lg" data-action="c-signup">Sign up</button></div></div>`
      : locked ? codePanel(blocked)
      : `<div class="c-unlocked"><span class="c-open">${lockSVG(true)}</span><div><b class="font-display">Secret code accepted</b>
           <span class="c-muted">You can upload now · access ends in <b id="c-left" class="font-display"></b></span></div></div>`;

    const typeChips = TYPES.map((t) => `<button type="button" class="c-chip ${form.type === t.key ? "on" : ""}" data-action="c-type" data-v="${t.key}" aria-pressed="${form.type === t.key}"><span>${TYPE_EMOJI[t.key]}</span>${t.label}</button>`).join("");
    const unitChips = unitApplies(form.type) ? `
      <div class="field c-unit-field"><label>Unit</label><div class="c-units">${Array.from({ length: MAX_UNITS }, (_, i) =>
        `<button type="button" class="c-unit ${String(form.unit) === String(i + 1) ? "on" : ""}" data-action="c-unit" data-v="${i + 1}" aria-pressed="${String(form.unit) === String(i + 1)}">${i + 1}</button>`).join("")}</div></div>` : "";

    const fileArea = f
      ? `<div class="c-file"><span class="c-pdf font-display">PDF</span><div class="c-file-i"><b>${esc(f.name)}</b><span>${(f.size / 1048576).toFixed(2)} MB</span></div>
           <button type="button" class="btn btn-secondary btn-sm" data-action="c-pick">Replace</button>
           <button type="button" class="c-x" data-action="c-rm-file" aria-label="Remove file">${icon("x", 15)}</button></div>`
      : `<div class="dropzone c-drop ${locked ? "c-off" : ""}" id="c-dropzone" role="button" tabindex="0" aria-label="Choose a PDF file">
           <span class="c-up">${icon("upload", 26)}</span>
           <b class="font-display">Drag &amp; drop your PDF here</b>
           <span>or</span><span class="btn btn-secondary btn-sm">Choose File</span>
           <small>PDF only · up to 25 MB</small></div>`;

    return `
    <div class="upload-wrap c-wrap">
      ${hero}
      ${stepper(step)}
      <div class="${ui.enter ? "c-in" : ""}">${gate}</div>
      <form class="upload-form c-form ${locked ? "c-locked" : ""} ${ui.enter ? "c-in" : ""}" data-c-form="upload" novalidate>
        <input type="file" id="c-file" accept="application/pdf,.pdf" hidden />
        <fieldset class="c-fields" ${locked || ui.busy ? "disabled" : ""}>
          ${locked ? `<div class="c-veil"><span>${icon("user", 15)} ${out ? "Sign in first" : "Enter the secret code to unlock"}</span></div>` : ""}
          <h3 class="c-h font-display"><i>1</i> Your PDF</h3>
          ${fileArea}
          <div class="c-bar" ${ui.busy ? "" : "hidden"}><i id="c-bar-fill" style="width:${ui.progress}%"></i></div>
          <p class="c-pct" ${ui.busy ? "" : "hidden"}><span id="c-pct">${ui.progress}</span>% uploaded</p>
          <h3 class="c-h font-display"><i>2</i> What is it?</h3>
          <div class="field"><label>Resource type</label><div class="c-chips">${typeChips}</div></div>
          <div class="form-grid">
            ${slc("Department", "dept", DEPARTMENTS.map((d) => [d.id, d.name]), "Select department")}
            ${slc("Year", "year", [1, 2, 3, 4].map((y) => [y, ["First", "Second", "Third", "Fourth"][y - 1] + " Year"]), "Select year")}
            ${slc("Semester", "sem", sems.map((x) => [x, "Semester " + x]), form.year ? "Select semester" : "Choose year first")}
            ${slc("Subject", "subject", subs, subs.length ? "Select subject" : "Choose dept, year & semester")}
          </div>
          ${unitChips}
          <h3 class="c-h font-display"><i>3</i> About you</h3>
          <div class="form-grid">${fld("Contributor name", "name", "Your name", 60)}${fld("Title", "title", "e.g. Unit 3 Normalization Notes", 120)}</div>
          ${fld("Description (optional)", "desc", "What's covered in this file?", 500, "textarea")}
          ${ui.error ? `<p class="form-note c-err c-pop" role="alert">${esc(ui.error)}</p>` : ""}
          <p class="form-note">Every contribution is reviewed by the admin before it goes live.</p>
          <button type="submit" class="btn btn-primary btn-lg btn-full">${ui.busy ? '<i class="c-spin"></i> Uploading...' : "Submit Contribution " + icon("arrowRight", 16)}</button>
        </fieldset>
      </form>
    </div>`;
  }

  /* ---------------------------- FILE HANDLING ---------------------------- */
  async function setFile(f) {
    if (!f) return;
    const bad = (m) => { ui.file = null; ui.error = m; render(); };
    if (!/\.pdf$/i.test(f.name) || (f.type && f.type !== "application/pdf") || f.size < 100) return bad("Please upload a valid PDF.");
    if (f.size > MAX_BYTES) return bad("This file is too large.");
    let head = ""; try { head = await f.slice(0, 5).text(); } catch { /* ignore */ }
    if (head !== "%PDF-") return bad("Please upload a valid PDF.");
    ui.file = f; ui.error = ""; render();
  }

  function validate() {
    if (form.name.trim().length < 2) return "Please enter your name.";
    if (!form.dept) return "Please select a department.";
    if (!form.year) return "Please select a year.";
    if (!form.sem) return "Please select a semester.";
    if (!form.subject) return "Please select a subject.";
    if (unitApplies(form.type) && !form.unit) return "Please select a unit.";
    if (form.title.trim().length < 3) return "Please enter a title.";
    if (!ui.file) return "Please upload a valid PDF.";
    return "";
  }

  function putFile(path, file, token) {   // XHR so we get a real progress bar
    return new Promise((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open("POST", `${supabaseUrl}/storage/v1/object/${SUPABASE_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`);
      x.setRequestHeader("Authorization", "Bearer " + token);
      x.setRequestHeader("apikey", supabaseKey);
      x.setRequestHeader("Content-Type", "application/pdf");
      x.setRequestHeader("x-upsert", "false");
      x.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        ui.progress = Math.round((e.loaded / e.total) * 100);
        const b = document.getElementById("c-bar-fill"); if (b) b.style.width = ui.progress + "%";
        const p = document.getElementById("c-pct"); if (p) p.textContent = ui.progress;
      };
      x.onload = () => (x.status >= 200 && x.status < 300 ? resolve() : reject(new Error("storage " + x.status + " " + x.responseText)));
      x.onerror = () => reject(new Error("network"));
      x.send(file);
    });
  }

  async function submitContribution() {
    if (ui.busy) return;
    const err = validate();
    if (err) { ui.error = err; return render(); }
    if (!canUpload()) { state.uploadUntil = 0; ui.error = "Contributor access expired. Enter the access code again."; return render(); }
    ui.error = ""; ui.busy = true; ui.progress = 0; render();
    let path = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("401 auth");
      const safe = ui.file.name.replace(/[^\w.-]+/g, "_").replace(/\.pdf$/i, "").slice(-60) + ".pdf";
      path = `contributions/${session.user.id}/${Date.now()}_${safe}`;
      await putFile(path, ui.file, session.access_token);
      const name = form.name.trim();
      const { data, error } = await supabase.from("resources").insert({
        subject_id: form.subject, subject_name: subjectsById[form.subject].name, type: form.type,
        unit: unitApplies(form.type) ? Number(form.unit) : null,
        title: form.title.trim(), description: form.desc.trim() || null,
        contributor_name: name, teacher: name, uploaded_by: name, file_path: path,
      }).select("id").single();   // admin email is sent by a database trigger
      if (error) throw error;
      Object.assign(form, { title: "", desc: "", unit: "" }); ui.file = null; ui.done = true;
    } catch (e) {
      console.error(e);
      if (path) supabase.storage.from(SUPABASE_BUCKET).remove([path]).catch(() => {});
      const m = String((e && (e.message || e.code)) || "");
      if (/row-level|42501|not authorized|401|403/i.test(m)) { state.uploadUntil = 0; ui.error = "Contributor access expired. Enter the access code again."; }
      else if (/too large|413/i.test(m)) ui.error = "This file is too large.";
      else ui.error = "Something went wrong. Please try again.";   // never show raw DB/storage errors
    }
    ui.busy = false; render();
    if (ui.done) showToast("Contribution submitted successfully.");
  }

  /* ---------------------------- ACCESS CODE ---------------------------- */
  function shake() { ui.shake = true; setTimeout(() => { ui.shake = false; }, 700); }
  async function verifyCode(formEl) {
    const input = formEl.elements.code, code = input.value; input.value = "";
    if (!code.trim()) { ui.codeMsg = "Enter the access code."; return render(); }
    if (ui.blockedUntil > Date.now()) { ui.codeMsg = TOO_MANY; return render(); }
    ui.checking = true; ui.codeMsg = ""; render();
    try {
      const { data, error } = await supabase.rpc("redeem_upload_code", { code });
      if (error || !data) throw error || new Error("empty");
      if (data.error === "auth") { ui.codeMsg = "Please log in first."; ui.checking = false; return render(); }
      if (data.ok) {
        state.uploadUntil = new Date(data.expires_at).getTime(); ui.codeMsg = ""; ui.blockedUntil = 0; ui.remaining = null;
        showToast("Access granted. You can upload now.");
      } else if (data.blocked) {
        ui.blockedUntil = data.blocked_until ? new Date(data.blocked_until).getTime() : Date.now() + 30 * 60000;
        const t = new Date(ui.blockedUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        ui.codeMsg = `${TOO_MANY} (after ${t})`; ui.remaining = 0; shake();
      } else {
        const n = data.remaining;
        ui.codeMsg = `Incorrect secret code. ${n} attempt${n === 1 ? "" : "s"} remaining.`; ui.remaining = n; shake();
      }
    } catch (e) { console.error(e); ui.codeMsg = "Couldn't verify right now. Please try again."; }
    ui.checking = false; render();
  }

  /* ---------------------------- ADMIN REVIEW ---------------------------- */
  function renderAdminPage() {
    if (!state.isAdmin) return `<div class="wrap" style="padding:60px 0;">${renderEmptyState("Admins only", "This page is for Lumos admins.")}</div>`;
    if (!adm.loaded && !adm.loading) { adm.loading = true; setTimeout(loadAdmin, 0); }
    const chip = (f) => `<button class="unit-chip ${adm.filter === f ? "active" : ""}" data-action="c-adm-filter" data-f="${f}">${f[0].toUpperCase() + f.slice(1)}</button>`;
    const rows = adm.list.map((r) => {
      const t = (TYPES.find((x) => x.key === r.type) || {}).label || r.type, url = getPublicFileUrl(r.file_path), id = esc(String(r.id));
      return `<div class="doodle-card c-adm-row"><div>
          <b class="font-display">${esc(r.title)}</b> <span class="badge">${esc(r.status)}</span>
          <div class="res-meta">${esc(r.subject_name || r.subject_id)} · ${esc(t)}${r.unit ? " · Unit " + r.unit : ""}</div>
          <div class="res-meta">${esc((r.department || "").toUpperCase())} · Sem ${esc(r.semester)} · by ${esc(r.contributor_name || "—")} (${esc(r.contributor_email || "—")})</div>
          ${r.description ? `<div class="res-meta2">${esc(r.description)}</div>` : ""}</div>
        <div class="c-row">${url ? `<a class="btn btn-secondary btn-sm" href="${esc(url)}" target="_blank" rel="noopener">View</a>` : ""}
          ${r.status !== "approved" ? `<button class="btn btn-primary btn-sm" data-action="c-adm-approve" data-id="${id}">Approve</button>` : ""}
          ${r.status !== "rejected" ? `<button class="btn btn-secondary btn-sm" data-action="c-adm-reject" data-id="${id}">Reject</button>` : ""}
          <button class="btn btn-secondary btn-sm" data-action="c-adm-delete" data-id="${id}">Delete</button></div></div>`;
    }).join("");
    return `<div class="wrap" style="padding:40px 0;"><h1 class="font-display dash-title">Review contributions</h1>
      <div class="unit-chips">${chip("pending")}${chip("approved")}${chip("rejected")}</div>
      <div class="c-adm-list">${adm.loading ? "<p>Loading...</p>" : rows || `<p class="pf-empty">Nothing here.</p>`}</div></div>`;
  }
  async function loadAdmin() {
    const { data, error } = await supabase.from("resources").select("*").eq("status", adm.filter).order("created_at", { ascending: false }).limit(200);
    if (error) { console.error(error); showToast("Couldn't load contributions."); }
    adm.list = data || []; adm.loaded = true; adm.loading = false;
    if (state.page === "admin") render();
  }
  async function setStatus(id, status) {
    const { data, error } = await supabase.from("resources").update({ status }).eq("id", id).select().single();
    if (error) { console.error(error); return showToast("Action failed."); }
    if (status === "approved") addDbResource(data);
    showToast(status === "approved" ? "Approved" : "Rejected");
    adm.loaded = false; render();
  }
  async function removeContribution(id) {
    if (!confirm("Delete this contribution permanently?")) return;
    const row = adm.list.find((r) => String(r.id) === id);
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) { console.error(error); return showToast("Delete failed."); }
    if (row && /^contributions\//.test(row.file_path || "")) await supabase.storage.from(SUPABASE_BUCKET).remove([row.file_path]);
    const rid = "db-" + id; delete resourcesById[rid];
    Object.values(subjectsById).forEach((s) => { s.resourceIds = s.resourceIds.filter((x) => x !== rid); });
    showToast("Deleted"); adm.loaded = false; render();
  }

  /* ---------------------------- EVENTS ---------------------------- */
  document.addEventListener("click", (e) => {
    const z = e.target.closest("#c-dropzone");
    if (z) { if (!z.classList.contains("c-off")) document.getElementById("c-file").click(); return; }
    const el = e.target.closest('[data-action^="c-"]'); if (!el) return;
    const a = el.getAttribute("data-action"), id = el.getAttribute("data-id");
    if (a === "c-login") requireLogin(() => render());
    else if (a === "c-signup") setState({ authOpen: true, authMode: "signup", authStep: "form", authError: "", authInfo: "", pending: null });
    else if (a === "c-again") { ui.done = false; ui.enter = true; setTimeout(() => { ui.enter = false; }, 1200); render(); }
    else if (a === "c-type") { form.type = el.getAttribute("data-v"); if (!unitApplies(form.type)) form.unit = ""; render(); }
    else if (a === "c-unit") { form.unit = el.getAttribute("data-v"); render(); }
    else if (a === "c-pick") { const fi = document.getElementById("c-file"); if (fi) fi.click(); }
    else if (a === "c-rm-file") { ui.file = null; render(); }
    else if (a === "c-adm-filter") { adm.filter = el.getAttribute("data-f"); adm.loaded = false; render(); }
    else if (a === "c-adm-approve") setStatus(id, "approved");
    else if (a === "c-adm-reject") setStatus(id, "rejected");
    else if (a === "c-adm-delete") removeContribution(id);
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.id === "c-file") { setFile(t.files[0]); t.value = ""; return; }
    const k = t.dataset && t.dataset.c; if (!k) return;
    form[k] = t.value;
    if (t.tagName !== "SELECT") return;
    if (k === "year") { form.sem = ""; form.subject = ""; }
    if (k === "dept" || k === "sem") form.subject = "";
    if (k === "type" && !unitApplies(form.type)) form.unit = "";   // Lab etc: Unit disappears
    render();
  });
  document.addEventListener("input", (e) => {
    const k = e.target.dataset && e.target.dataset.c;
    if (k && e.target.tagName !== "SELECT") form[k] = e.target.value;
  });
  const over = (e, on) => { const z = e.target.closest && e.target.closest("#c-dropzone"); if (z && !z.classList.contains("c-off")) z.classList.toggle("c-over", on); };
  document.addEventListener("dragenter", (e) => over(e, true));
  document.addEventListener("dragover", (e) => { if (e.target.closest("#c-dropzone")) { e.preventDefault(); over(e, true); } });
  document.addEventListener("dragleave", (e) => over(e, false));
  document.addEventListener("drop", (e) => {
    const z = e.target.closest("#c-dropzone"); if (!z) return;
    e.preventDefault(); z.classList.remove("c-over"); if (!z.classList.contains("c-off")) setFile(e.dataTransfer.files[0]);
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.id === "c-dropzone") { e.preventDefault(); e.target.click(); }
  });
  // live countdowns: lock-out timer and "access ends in" timer (updated in place, no re-render)
  const mmss = (ms) => { const t = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); };
  setInterval(() => {
    if (state.page !== "upload") { ui.here = false; return; }
    const c = document.getElementById("c-count");
    if (c) { const ms = ui.blockedUntil - Date.now(); if (ms <= 0) { ui.blockedUntil = 0; ui.codeMsg = ""; ui.remaining = null; render(); } else c.textContent = mmss(ms); }
    const l = document.getElementById("c-left");
    if (l) { const ms = state.uploadUntil - Date.now(); if (ms <= 0) render(); else l.textContent = mmss(ms); }
  }, 1000);
  document.addEventListener("submit", (e) => {
    const c = e.target.closest('[data-c-form="code"]'), u = e.target.closest('[data-c-form="upload"]');
    if (c) { e.preventDefault(); verifyCode(c); } else if (u) { e.preventDefault(); submitContribution(); }
  });

  window.renderUploadPage = renderUploadPage;
  window.renderAdminPage = renderAdminPage;
  if (state.page === "upload" || state.page === "admin") render();
})();
