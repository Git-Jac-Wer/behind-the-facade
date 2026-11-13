/* =====================================================================
   BEHIND THE FACADE · APP LOGIC
   You normally don't need to change this file: all content comes from
   stations.js. The sections below are:
     1. Icons for the stamps
     2. Saving stamps on the visitor's phone
     3. Drawing a stamp
     4. Passport page (start page)
     5. Map
     6. Station page
     7. QR code signs
     8. Organiser guide
     9. Switching between pages (the part after # in the address)
   ===================================================================== */
(function () {
  "use strict";

  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const paras = text => String(text || "").split(/\n\s*\n/).map(p => `<p>${esc(p.trim())}</p>`).join("");
  const B = Object.fromEntries(BUILDINGS.map(b => [b.id, b]));
  const S = Object.fromEntries(STATIONS.map(s => [s.id, s]));
  const buildingOf = st => B[st.building] || { id: "?", code: "?", address: "", name: "" };
  const numberOf = st => STATIONS.indexOf(st) + 1;
  const inkOf = st => (st.stamp && st.stamp.ink) || "#2447a6";

  const FONT_DISPLAY = '"Big Shoulders Display", "Arial Narrow", "DejaVu Sans Condensed", sans-serif';
  const FONT_MONO = '"IBM Plex Mono", "DejaVu Sans Mono", monospace';
  const FONT_SANS = '"IBM Plex Sans", "Inter", "Segoe UI", sans-serif';


  /* ------------------------------------------------------------------
     1. ICONS
     Each icon is a small drawing on a 24 x 24 grid (SVG path notation).
     Add your own here and use its name as  icon: "name"  in stations.js.
     ------------------------------------------------------------------ */
  const ICONS = {
    pendulum: '<path d="M5 2.5h14"/><path d="M12 2.5l3.6 13"/><circle cx="16.3" cy="18" r="2.6"/><path d="M4.5 21.5c4.5 1.5 10.5 1.5 15 0" stroke-dasharray="1.6 2"/>',
    field:    '<path d="M3 6.5h7M8 4.5l2 2-2 2"/><path d="M17.5 3v7M15.5 8l2 2 2-2"/><path d="M21 17.5h-7M16 15.5l-2 2 2 2"/><path d="M6.5 21v-7M4.5 16l2-2 2 2"/>',
    detector: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5.5"/><path d="M12 12c2.5-3 5.5-4.5 9-4.5"/><path d="M12 12c-.5 3.5-2.5 6.5-6 8"/><path d="M12 12c-3.5-1-6.5-.5-9 1.5"/>',
    prism:    '<path d="M12 4l8 14H4z"/><path d="M0.5 13.5l8-2"/><path d="M15.5 10.5l8-3"/><path d="M16 12.2l8 .3"/><path d="M16.5 14l7 3.5"/>',
    neuron:   '<circle cx="11" cy="12" r="3"/><path d="M11 9V4M11 4L8.5 2M11 4l2.5-2"/><path d="M8.7 14L4 18.5M4 18.5H1.5M4 18.5V21"/><path d="M14 11l8-3.5"/><path d="M18.5 9l1.5 2.5M16.3 10l1 2.3"/><path d="M12.8 14.5l2.7 6"/>',
    printer:  '<path d="M3 3v18M21 3v18"/><path d="M3 6h18"/><path d="M10 6v4h4V6"/><path d="M12 10v2.2"/><path d="M8 20h8M9 17.5h6M10.5 15h3"/><path d="M1.5 21h21"/>',
    star:     '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6l-5.4 2.9 1.2-6-4.5-4.2 6.1-.7z"/>',
  };
  const iconSVG = name => `<svg viewBox="-1 -1 26 26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.star}</svg>`;


  /* ------------------------------------------------------------------
     2. SAVING STAMPS
     Stamps are kept in the browser's local storage as
     { "station-id": "date collected" }. Nothing leaves the phone.
     ------------------------------------------------------------------ */
  const KEY = "btf-passport-v1";
  function loadStamps() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  let stamps = loadStamps();
  function saveStamps() { try { localStorage.setItem(KEY, JSON.stringify(stamps)); } catch (e) { /* private mode: stamps last until the tab closes */ } }
  const has = id => Boolean(stamps[id]);
  const collectedCount = () => STATIONS.filter(s => has(s.id)).length;
  function collect(id) { if (!stamps[id]) { stamps[id] = new Date().toISOString().slice(0, 10); saveStamps(); } }
  function fmtDate(iso) {
    const d = iso ? new Date(iso + "T12:00:00") : new Date();
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }
  function updatePill() {
    $("#pill").textContent = `${collectedCount()} / ${STATIONS.length} stamps`;
    $("#brand").textContent = SITE.title;
  }


  /* ------------------------------------------------------------------
     3. DRAWING A STAMP
     Every stamp is an SVG drawing made from the station's
     stamp settings: shape, ink, icon and label.
     ------------------------------------------------------------------ */
  let uid = 0;
  function hash(s) { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); }
  const rotationFor = id => (hash(id) % 19) - 9;
  const fit = (text, max, width) => Math.min(max, width / (Math.max(text.length, 1) * 0.56)).toFixed(1);

  function stampSVG(st, dateText, extraClass) {
    const s = st.stamp || {};
    const b = buildingOf(st);
    const rot = rotationFor(st.id);
    const cls = "stamp " + (extraClass || "");
    if (s.image) return `<img class="${cls} stamp-img" src="${esc(s.image)}" alt="Stamp: ${esc(st.title)}" style="--r:${rot}deg">`;

    const label = esc(String(s.label || st.title).toUpperCase());
    const foot = esc(`${b.code} · ${dateText || ""}`);
    const icon = ICONS[s.icon] || ICONS.star;
    const u = "st" + (uid++);
    const D = `font-family='${FONT_DISPLAY.replace(/"/g, "")}' font-weight="800"`;
    const M = `font-family='${FONT_MONO.replace(/"/g, "")}'`;
    const iconAt = (cx, cy, k) => `<g transform="translate(${cx} ${cy}) scale(${k}) translate(-12 -12)" fill="none" stroke="currentColor" stroke-width="${(2.3 / k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">${icon}</g>`;
    const line = `fill="none" stroke="currentColor"`;
    let defs = "", body = "";

    switch (s.shape) {
      case "hexagon": {
        const hex = r => [0, 1, 2, 3, 4, 5].map(k => { const a = (-90 + 60 * k) * Math.PI / 180; return `${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`; }).join(" ");
        body = `<polygon points="${hex(57)}" ${line} stroke-width="3"/><polygon points="${hex(51)}" ${line} stroke-width="1"/>
          <text x="60" y="42" text-anchor="middle" fill="currentColor" ${D} font-size="${fit(label, 14, 64)}" letter-spacing=".6">${label}</text>
          <path d="M26 48H94" ${line} stroke-width="1"/>
          ${iconAt(60, 66, 1.1)}
          <text x="60" y="90" text-anchor="middle" fill="currentColor" ${M} font-size="5.8">${foot}</text>`;
        break;
      }
      case "square":
        body = `<rect x="5" y="5" width="110" height="110" rx="10" ${line} stroke-width="3"/><rect x="10.5" y="10.5" width="99" height="99" rx="6" ${line} stroke-width="1"/>
          <text x="60" y="29" text-anchor="middle" fill="currentColor" ${D} font-size="${fit(label, 17, 86)}" letter-spacing=".6">${label}</text>
          <path d="M10.5 35H109.5M10.5 88H109.5" ${line} stroke-width="1"/>
          ${iconAt(60, 61.5, 1.2)}
          <text x="60" y="101" text-anchor="middle" fill="currentColor" ${M} font-size="7">${foot}</text>`;
        break;
      case "ticket":
        body = `<path d="M12 18H108A9 9 0 0 0 117 27V93A9 9 0 0 0 108 102H12A9 9 0 0 0 3 93V27A9 9 0 0 0 12 18Z" ${line} stroke-width="3"/>
          <rect x="9" y="24" width="102" height="72" rx="3" ${line} stroke-width="1" stroke-dasharray="3 2.4"/>
          <path d="M37 24V96" ${line} stroke-width="1" stroke-dasharray="2 2"/>
          ${iconAt(23, 60, 0.95)}
          <text x="77" y="42" text-anchor="middle" fill="currentColor" ${M} font-size="6" letter-spacing="1">STATION ${numberOf(st) || ""}</text>
          <text x="77" y="64" text-anchor="middle" fill="currentColor" ${D} font-size="${fit(label, 17, 56)}" letter-spacing=".4">${label}</text>
          <text x="77" y="80" text-anchor="middle" fill="currentColor" ${M} font-size="6">${foot}</text>`;
        break;
      default: /* circle */
        defs = `<path id="t${u}" d="M19 60A41 41 0 0 1 101 60"/><path id="b${u}" d="M14 60A46 46 0 0 0 106 60"/>`;
        body = `<circle cx="60" cy="60" r="56" ${line} stroke-width="3"/><circle cx="60" cy="60" r="51" ${line} stroke-width="1"/><circle cx="60" cy="60" r="35" ${line} stroke-width="1"/>
          <text fill="currentColor" ${D} font-size="${fit(label, 13, 104)}" letter-spacing="1"><textPath href="#t${u}" startOffset="50%" text-anchor="middle">${label}</textPath></text>
          <text fill="currentColor" ${M} font-size="6.6" letter-spacing=".8"><textPath href="#b${u}" startOffset="50%" text-anchor="middle">${foot}</textPath></text>
          <circle cx="14" cy="60" r="1.6" fill="currentColor"/><circle cx="106" cy="60" r="1.6" fill="currentColor"/>
          ${iconAt(60, 60, 1.25)}`;
    }

    // The filter gives the print an uneven, inky look.
    defs += `<filter id="g${u}" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${hash(st.id) % 97}" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.5" result="m"/>
      <feComposite in="SourceGraphic" in2="m" operator="in"/></filter>`;

    return `<svg class="${cls}" viewBox="0 0 120 120" style="--r:${rot}deg;color:${esc(inkOf(st))}" role="img" aria-label="Stamp ${label}${dateText ? ", " + esc(dateText) : ""}">
      <defs>${defs}</defs><g filter="url(#g${u})">${body}</g></svg>`;
  }

  const emptySlot = st => `<div class="empty" aria-hidden="true">${iconSVG(st.stamp && st.stamp.icon)}</div>`;


  /* ------------------------------------------------------------------
     4. PASSPORT PAGE
     ------------------------------------------------------------------ */
  function renderPassport(notice) {
    const view = $("#view-passport");
    const n = collectedCount(), N = STATIONS.length;
    const groups = BUILDINGS.map(b => ({ b, list: STATIONS.filter(s => s.building === b.id) })).filter(g => g.list.length);
    view.innerHTML = `
      ${notice ? `<p class="notice">${esc(notice)}</p>` : ""}
      <header class="mast">
        <p class="eyebrow">${esc(SITE.place || "A campus trail")}</p>
        <h1>${esc(SITE.title)}</h1>
        <p class="lead">${esc(SITE.intro)}</p>
      </header>
      <ol class="howto">
        <li><b>Scan</b>the QR code next to an exhibit</li>
        <li><b>Read</b>what it shows and how it works</li>
        <li><b>Collect</b>its stamp in this passport</li>
      </ol>
      <section class="passport" aria-labelledby="pp-title">
        <div class="cover">
          <div><p class="eyebrow">${esc(SITE.passportName)}</p><h2 id="pp-title">${esc(SITE.title)}</h2></div>
          <p class="count">${n} / ${N} stamps</p>
        </div>
        <div class="leaf">
          ${groups.map(g => `
            <div class="bgroup">
              <div class="bgroup-head"><b>${esc(g.b.code)}</b><span>${esc(g.b.address)} · ${esc(g.b.name)}</span></div>
              <div class="slots">${g.list.map(st => `
                <div class="slot">
                  ${has(st.id) ? stampSVG(st, fmtDate(stamps[st.id])) : emptySlot(st)}
                  <span class="t">${esc(st.title)}</span>
                  <span class="s">${has(st.id) ? "Collected " + esc(fmtDate(stamps[st.id]).toLowerCase()) : "Scan the code at the exhibit"}</span>
                </div>`).join("")}
              </div>
            </div>`).join("")}
          ${n === N && N > 0 ? `<p class="complete">${esc(SITE.completeText)}</p>` : ""}
        </div>
      </section>
      <section id="map" aria-labelledby="map-title" style="display:grid;gap:14px">
        <h2 id="map-title">Where to find them</h2>
        ${mapHTML()}
      </section>
      <div class="tools" id="reset-wrap"></div>`;
    resetButton();
  }

  function resetButton() {
    const wrap = $("#reset-wrap");
    if (!wrap) return;
    wrap.innerHTML = `<button type="button" class="btn small" id="reset">Clear my stamps</button>`;
    $("#reset").onclick = () => {
      wrap.innerHTML = `<span class="confirm"><span>Remove all stamps from this phone?</span>
        <button type="button" class="btn small" id="reset-yes">Remove</button>
        <button type="button" class="btn small" id="reset-no">Keep them</button></span>`;
      $("#reset-yes").onclick = () => { stamps = {}; saveStamps(); updatePill(); renderPassport(); };
      $("#reset-no").onclick = resetButton;
    };
  }


  /* ------------------------------------------------------------------
     5. MAP
     A drawn map in a 100 x 70 grid. Positions come from "map" in
     stations.js. With SITE.floorplan set, that picture is used instead
     of the drawn building blocks.
     ------------------------------------------------------------------ */
  function mapHTML() {
    const pts = STATIONS.filter(s => s.map);
    const bg = SITE.floorplan
      ? `<image href="${esc(SITE.floorplan)}" x="0" y="0" width="100" height="70" preserveAspectRatio="xMidYMid meet"/>`
      : BUILDINGS.filter(b => b.map).map(b => {
          const m = b.map;
          return `<rect x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" rx="1.5" fill="#e3e7df" stroke="#a7aea3" stroke-width=".5"/>
            <text x="${m.x + 2.4}" y="${m.y + 6.2}" fill="#1b2230" font-family='${FONT_DISPLAY.replace(/"/g, "")}' font-weight="800" font-size="5.4">${esc(b.code)}</text>
            <text x="${m.x + 2.4}" y="${m.y + 9.8}" fill="#5a6372" font-family='${FONT_MONO.replace(/"/g, "")}' font-size="2.6">${esc(b.address)}</text>`;
        }).join("");
    const route = pts.map(s => `${s.map.x},${s.map.y}`).join(" ");
    const dots = pts.map(s => {
      const done = has(s.id), ink = esc(inkOf(s));
      return `<g><circle cx="${s.map.x}" cy="${s.map.y}" r="3.5" style="fill:${done ? ink : "#f6f7f3"}" stroke="${ink}" stroke-width=".8"/>
        <text x="${s.map.x}" y="${s.map.y + 1.15}" text-anchor="middle" font-family='${FONT_MONO.replace(/"/g, "")}' font-weight="600" font-size="3.2" fill="${done ? "#ffffff" : ink}">${numberOf(s)}</text></g>`;
    }).join("");
    return `<div class="mapcard">
      <svg viewBox="0 0 100 70" role="img" aria-label="Map of the buildings and stations">${bg}
        <polyline points="${route}" fill="none" stroke="#7d857b" stroke-width=".5" stroke-dasharray="1.4 1.2"/>${dots}</svg>
      ${SITE.floorplan ? "" : `<p class="hint">Schematic, not to scale. Filled dots are stations you have already visited.</p>`}
      <ol class="maplist">${pts.map(s => `
        <li><span class="n" style="background:${esc(inkOf(s))}">${numberOf(s)}</span>
          <span class="${has(s.id) ? "done" : ""}">${esc(s.title)}</span>
          <span class="b">${esc(buildingOf(s).code)} · ${esc(buildingOf(s).address)}</span></li>`).join("")}
      </ol></div>`;
  }


  /* ------------------------------------------------------------------
     6. STATION PAGE
     ------------------------------------------------------------------ */
  let cleanup = null;   // stops a running widget when the page changes

  function renderStation(st) {
    const view = $("#view-station");
    const b = buildingOf(st);
    const photos = st.photos || [];
    let quizDone = false;

    view.innerHTML = `
      <a class="back" href="#passport">← Passport</a>
      <header class="st-head">
        <div class="chips">
          <span class="chip">${esc(b.code)} · ${esc(b.address)}</span>
          <span class="eyebrow">Station ${numberOf(st)} of ${STATIONS.length}</span>
          ${st.draft ? `<span class="chip draft">Draft text</span>` : ""}
        </div>
        <h1>${esc(st.title)}</h1>
        ${st.teaser ? `<p class="teaser">${esc(st.teaser)}</p>` : ""}
      </header>
      ${photos.length ? `
        <figure class="viewer">
          <button type="button" class="viewer-frame" id="v-frame" aria-label="${photos.length > 1 ? "Show the next photo" : "Photo of the exhibit"}">
            <img id="v-img" alt="">
            ${photos.length > 1 ? `<span class="tap">Tap for photo ${2} of ${photos.length}</span>` : ""}
          </button>
          <figcaption><span id="v-cap"></span>
            ${photos.length > 1 ? `<span class="dots" id="v-dots">${photos.map((p, i) => `<button type="button" aria-label="Photo ${i + 1}"></button>`).join("")}</span>` : ""}
          </figcaption>
        </figure>` : ""}
      <div class="sections">
        ${(st.sections || []).map(sec => `<article>${sec.heading ? `<h2>${esc(sec.heading)}</h2>` : ""}${paras(sec.text)}</article>`).join("")}
      </div>
      ${st.widget ? `<section class="widget" id="widget"></section>` : ""}
      ${st.quiz ? `
        <section class="quiz" aria-labelledby="q-title">
          <p class="eyebrow">Quick question</p>
          <h2 id="q-title">${esc(st.quiz.question)}</h2>
          <div class="opts">${st.quiz.options.map((o, i) => `<button type="button" class="opt" data-i="${i}">${esc(o)}</button>`).join("")}</div>
          <p class="result" id="q-result" aria-live="polite" hidden></p>
        </section>` : ""}
      <section class="stamp-panel" id="stamp-panel" aria-live="polite"></section>`;

    // Photo viewer: tap the photo for the next one, or pick one with the dots.
    if (photos.length) {
      let i = 0;
      const img = $("#v-img"), cap = $("#v-cap"), dots = $("#v-dots"), tap = $("#v-frame .tap");
      const showPhoto = k => {
        i = (k + photos.length) % photos.length;
        img.classList.remove("landscape");
        img.src = photos[i].src;
        img.alt = photos[i].caption || st.title;
        cap.textContent = photos[i].caption || "";
        if (dots) [...dots.children].forEach((d, j) => d.setAttribute("aria-current", String(j === i)));
        if (tap) tap.textContent = `Tap for photo ${((i + 1) % photos.length) + 1} of ${photos.length}`;
      };
      img.onload = () => img.classList.toggle("landscape", img.naturalWidth > img.naturalHeight);
      if (photos.length > 1) $("#v-frame").onclick = () => showPhoto(i + 1);
      if (dots) [...dots.children].forEach((d, j) => d.onclick = () => showPhoto(j));
      showPhoto(0);
    }

    // Widget (interactive add-on from widgets.js)
    if (st.widget) {
      const box = $("#widget");
      const fn = typeof WIDGETS !== "undefined" && WIDGETS[st.widget.type];
      if (fn) { const stop = fn(box, st.widget, st); if (typeof stop === "function") cleanup = stop; }
      else box.innerHTML = `<p class="warn">Widget "${esc(st.widget.type)}" is not defined in widgets.js.</p>`;
    }

    // Quiz: any answer unlocks the stamp; the explanation follows.
    if (st.quiz) {
      const q = st.quiz;
      view.querySelectorAll(".opt").forEach(btn => btn.onclick = () => {
        if (quizDone) return;
        quizDone = true;
        const pick = Number(btn.dataset.i);
        view.querySelectorAll(".opt").forEach(o => {
          o.setAttribute("aria-disabled", "true");
          const k = Number(o.dataset.i);
          if (k === q.answer) o.classList.add("right");
          else if (k === pick) o.classList.add("wrong");
        });
        const res = $("#q-result");
        res.hidden = false;
        res.innerHTML = `<b>${pick === q.answer ? "Right." : "Not quite."}</b> ${esc(q.explain || "")}`;
        renderStampPanel(st, false, quizDone);
      });
    }

    renderStampPanel(st, false, quizDone);
  }

  function renderStampPanel(st, justLanded, quizDone) {
    const el = $("#stamp-panel");
    const N = STATIONS.length;
    if (has(st.id)) {
      const n = collectedCount();
      const k = STATIONS.indexOf(st);
      const next = STATIONS.slice(k + 1).concat(STATIONS.slice(0, k)).find(s => !has(s.id));
      const more = next
        ? `${n} of ${N} stamps. Next on the route: <b>${esc(next.title)}</b> in ${esc(buildingOf(next).code)} (${esc(buildingOf(next).address)}).`
        : esc(SITE.completeText);
      el.innerHTML = `${stampSVG(st, fmtDate(stamps[st.id]), justLanded ? "land" : "")}
        <div class="txt"><p><b>${justLanded ? "Stamp collected." : "This stamp is in your passport."}</b></p><p>${more}</p>
        <a class="btn small" href="#passport">Passport and map</a></div>`;
    } else {
      const locked = st.quiz && !quizDone;
      el.innerHTML = `${emptySlot(st)}
        <div class="txt"><p><b>Your stamp for this station</b></p>
        <p class="hint">${locked ? "Answer the question above to unlock it." : "Finished reading? Collect it for your passport."}</p>
        <button type="button" class="btn primary" id="collect" ${locked ? "disabled" : ""}>Stamp my passport</button></div>`;
      $("#collect").onclick = () => { collect(st.id); updatePill(); renderStampPanel(st, true, quizDone); };
    }
  }


  /* ------------------------------------------------------------------
     7. QR CODE SIGNS
     One printable sign (A6, 300 dpi) per station. The code contains
     website-address#station-id.
     ------------------------------------------------------------------ */
  const BASE_KEY = "btf-qr-base";
  function defaultBase() {
    if (SITE.url) return SITE.url;
    try { const saved = localStorage.getItem(BASE_KEY); if (saved) return saved; } catch (e) {}
    if (/^https?:$/.test(location.protocol) && !/claude|anthropic|usercontent|localhost|127\.0\.0\.1/i.test(location.hostname)) return location.origin + location.pathname;
    return "";
  }
  function normBase(v) {
    v = String(v || "").trim().split("#")[0];
    if (!v) return "";
    if (!/^[a-z]+:/i.test(v)) v = "https://" + v;
    try { const u = new URL(v); if (!/\/$|\.html?$/i.test(u.pathname)) u.pathname += "/"; return u.href; } catch (e) { return v; }
  }
  const isTopWindow = (() => { try { return window.top === window.self; } catch (e) { return false; } })();

  let qrTimer = null;
  function renderQR() {
    const inp = $("#qr-base");
    if (!inp.dataset.ready) {
      inp.dataset.ready = "1";
      inp.value = defaultBase();
      inp.addEventListener("input", () => {
        try { localStorage.setItem(BASE_KEY, inp.value.trim()); } catch (e) {}
        clearTimeout(qrTimer); qrTimer = setTimeout(drawSigns, 350);
      });
    }
    drawSigns();
  }

  async function drawSigns() {
    const base = normBase($("#qr-base").value);
    const hint = $("#qr-hint"), grid = $("#qr-grid");
    if (typeof makeQR !== "function") { hint.innerHTML = `<span class="warn">The QR code file (vendor/qrcode.js) is missing.</span>`; grid.innerHTML = ""; return; }
    if (!base) { hint.textContent = "Enter the public address of the website to make the codes."; grid.innerHTML = ""; return; }
    const local = /^file:|localhost|127\.0\.0\.1/i.test(base);
    hint.innerHTML = local
      ? `<span class="warn">This address only works on this computer. Put the site online first and use that address.</span>`
      : (SITE.url ? "Test every code with a phone before printing." : `Test every code with a phone. Tip: put this address into <code>url</code> in stations.js so it is filled in for everyone.`);
    try { await document.fonts.ready; } catch (e) {}
    grid.innerHTML = STATIONS.map(st => {
      const url = base + "#" + st.id;
      const png = signCanvas(st, url).toDataURL("image/png");
      return `<div class="qr-card">
        <img src="${png}" alt="QR sign for ${esc(st.title)}">
        <div class="row">
          ${isTopWindow ? `<a class="btn small primary" href="${png}" download="sign-${esc(st.id)}.png">Download PNG</a>` : ""}
          <a class="btn small" href="#${esc(st.id)}">Open station</a>
        </div>
        ${isTopWindow ? "" : `<span class="hint">Right-click or long-press the sign to save it.</span>`}
        <span class="u">${esc(url)}</span>
      </div>`;
    }).join("");
  }

  function wrapText(g, text, x, y, maxW, lineH, maxLines) {
    const words = String(text).split(/\s+/); let line = "", lines = [];
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    lines = lines.slice(0, maxLines || 99);
    lines.forEach((l, i) => g.fillText(l, x, y + i * lineH));
    return lines.length;
  }

  function signCanvas(st, url) {
    const W = 1240, H = 1748, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d"), b = buildingOf(st), ink = inkOf(st);
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    // Top band with the trail name
    g.fillStyle = "#6b1d2b"; g.fillRect(0, 0, W, 250);
    g.fillStyle = "#f0e1c0";
    g.font = `800 100px ${FONT_DISPLAY}`; g.fillText(SITE.title.toUpperCase(), 90, 145);
    g.font = `500 34px ${FONT_MONO}`; g.fillText(`STATION ${numberOf(st)} OF ${STATIONS.length}  ·  ${b.code}  ·  ${b.address}`, 90, 207);
    // Station name
    g.fillStyle = "#1b2230"; g.font = `800 96px ${FONT_DISPLAY}`;
    const lines = wrapText(g, st.title.toUpperCase(), 90, 380, W - 180, 96, 2);
    // QR code with a quiet zone of 4 modules
    const q = makeQR(url), cell = Math.floor(720 / (q.size + 8)), qs = cell * (q.size + 8);
    const qx = Math.round((W - qs) / 2), qy = lines > 1 ? 560 : 500;
    g.fillStyle = "#000000";
    for (let r = 0; r < q.size; r++) for (let k = 0; k < q.size; k++) if (q.isDark(r, k)) g.fillRect(qx + (k + 4) * cell, qy + (r + 4) * cell, cell, cell);
    g.strokeStyle = ink; g.lineWidth = 12; g.strokeRect(qx - 6, qy - 6, qs + 12, qs + 12);
    // Instructions and address
    g.fillStyle = "#1b2230"; g.font = `600 46px ${FONT_SANS}`;
    wrapText(g, "Scan with your phone camera to open this station and collect its stamp.", 90, qy + qs + 110, W - 180, 62, 3);
    g.fillStyle = "#5a6372"; g.font = `400 28px ${FONT_MONO}`;
    wrapText(g, url, 90, H - 90, W - 180, 36, 2);
    return c;
  }


  /* ------------------------------------------------------------------
     8. ORGANISER GUIDE
     The text is in index.html; here we only add the live stamp gallery.
     ------------------------------------------------------------------ */
  function renderGuide() {
    const shapes = ["circle", "hexagon", "square", "ticket"];
    const icons = Object.keys(ICONS);
    const samples = icons.map((icon, i) => ({
      id: "sample-" + icon, building: STATIONS[0] ? STATIONS[0].building : "",
      title: icon, stamp: { shape: shapes[i % shapes.length], icon, ink: ["#2447a6", "#1f7a55", "#b0262c", "#c0306f", "#6a3e9e", "#b5561b", "#1b2230"][i % 7], label: icon },
    }));
    $("#stamp-gallery").innerHTML = samples.map(s => `<figure>${stampSVG(s, fmtDate())}<figcaption>shape: "${s.stamp.shape}"<br>icon: "${s.stamp.icon}"</figcaption></figure>`).join("");
    document.querySelectorAll(".toc a").forEach(a => a.onclick = e => { e.preventDefault(); const t = document.getElementById(a.dataset.jump); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); });
  }


  /* ------------------------------------------------------------------
     9. SWITCHING PAGES
     The part of the address after # decides what is shown:
       (nothing) or #passport   → passport
       #map                     → passport, scrolled to the map
       #station-id              → that station
       #qr                      → QR code signs
       #guide                   → this guide
     ------------------------------------------------------------------ */
  const VIEWS = ["passport", "station", "qr", "guide"];
  function show(name) { VIEWS.forEach(v => { $("#view-" + v).hidden = v !== name; }); }

  function route() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    let h = "";
    try { h = decodeURIComponent(location.hash.slice(1)); } catch (e) { h = location.hash.slice(1); }
    updatePill();
    if (S[h]) { show("station"); renderStation(S[h]); window.scrollTo(0, 0); }
    else if (h === "qr") { show("qr"); renderQR(); window.scrollTo(0, 0); }
    else if (h === "guide") { show("guide"); renderGuide(); window.scrollTo(0, 0); }
    else if (h === "map") { show("passport"); renderPassport(); const m = $("#map"); if (m) m.scrollIntoView(); }
    else {
      show("passport");
      renderPassport(h && h !== "passport" ? `"${h}" is not a station of this trail (any more). Here is your passport.` : "");
      window.scrollTo(0, 0);
    }
  }

  window.addEventListener("hashchange", route);
  window.addEventListener("storage", e => { if (e.key === KEY) { stamps = loadStamps(); route(); } });
  route();
})();
