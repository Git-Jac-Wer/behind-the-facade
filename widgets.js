/* =====================================================================
   BEHIND THE FACADE · WIDGETS (interactive add-ons)
   ---------------------------------------------------------------------
   A widget is one function in the WIDGETS list below. A station uses it
   by adding to its block in stations.js:

       widget: { type: "pendulumTimeline", pins: 48, latitude: 49.41 },

   "type" is the name of the function; everything else are settings that
   the function receives as "opt".

   Each function gets:
     box   an empty box on the station page to draw into
     opt   the widget settings from stations.js
     st    the whole station (title, stamp colour, ...)
   It may return a function that stops animations when the visitor
   leaves the page.
   ===================================================================== */
const WIDGETS = {

  /* -------------------------------------------------------------------
     Foucault pendulum: how many pins are down after a chosen time?

     Settings
       pins      number of pins around the ring (count the real ones!)
       latitude  latitude of the building in degrees (Heidelberg: 49.41)

     The physics
       The swing direction turns at  rate = 15.04° per hour × sin(latitude)
       - 15.04° per hour: the Earth turns once (360°) in 23.93 hours
       - sin(latitude): only this part of the Earth's turn happens
         "underneath" the pendulum; 1 at the pole, 0 at the equator
       The swing hits pins at both ends, so after turning 180° every
       pin is down.
     ------------------------------------------------------------------- */
  pendulumTimeline(box, opt, st) {
    const pins = opt.pins || 48;
    const lat = opt.latitude != null ? opt.latitude : 49.41;
    const rate = 15.04 * Math.sin(lat * Math.PI / 180);   // degrees per hour
    const allDown = 180 / rate;                           // hours until every pin is down
    const ink = (st.stamp && st.stamp.ink) || "#2447a6";
    const R = 46;
    const angles = Array.from({ length: pins }, (_, k) => (k + 0.5) * 360 / pins);

    box.innerHTML = `
      <p class="eyebrow">Try it</p>
      <h2>How many pins are down?</h2>
      <p>Move the slider to jump forward in time. The dashed line is the direction of the swing, seen from above.</p>
      <div class="pt" style="display:grid;gap:12px">
        <svg viewBox="-60 -60 120 120" role="img" aria-label="Ring of pins seen from above">
          <circle r="${R + 6}" fill="none" stroke="currentColor" stroke-opacity=".15" stroke-width="8"/>
          <g id="pt-pins"></g>
          <line id="pt-swing" x1="-${R - 4}" y1="0" x2="${R - 4}" y2="0" stroke="currentColor" stroke-opacity=".55" stroke-width="1" stroke-dasharray="2.5 2"/>
          <circle id="pt-bob" r="4.2" fill="#b8902f" stroke="#7a5d18" stroke-width=".8"/>
          <circle r="1.2" fill="currentColor"/>
        </svg>
        <label class="readout" for="pt-h" id="pt-out"></label>
        <input type="range" id="pt-h" min="0" max="${Math.ceil(allDown)}" step="0.25" value="3">
        <p class="formula">The swing turns by 15.04° per hour × sin(latitude). 15.04° per hour is how fast the Earth turns (360° in 23.93 hours). The latitude here is ${lat}°, so the swing turns about ${rate.toFixed(1)}° per hour, and all ${pins} pins are down after about ${Math.round(allDown)} hours. The model assumes evenly spaced pins and a swing that never gets shorter.</p>
      </div>`;

    const g = box.querySelector("#pt-pins"), out = box.querySelector("#pt-out");
    const slider = box.querySelector("#pt-h"), swing = box.querySelector("#pt-swing"), bob = box.querySelector("#pt-bob");
    let theta = 0;

    function draw() {
      const h = Number(slider.value);
      theta = Math.min(rate * h, 180);
      let down = 0;
      g.innerHTML = angles.map(a => {
        const r = a * Math.PI / 180, x = R * Math.cos(r), y = R * Math.sin(r);
        const fallen = (a % 180) < theta;
        if (fallen) {
          down++;
          const x2 = (R + 7) * Math.cos(r), y2 = (R + 7) * Math.sin(r);
          return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="currentColor" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round"/>`;
        }
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.9" fill="${ink}"/>`;
      }).join("");
      swing.setAttribute("transform", `rotate(${theta})`);
      const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
      out.textContent = `After ${hh} h ${String(mm).padStart(2, "0")} min: turned ${theta.toFixed(0)}°, ${down} of ${pins} pins down`;
    }

    // The bob swings along the current direction (just for illustration).
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    function swingBob(t) {
      const s = still ? 0.6 : Math.sin(t / 900);
      const r = theta * Math.PI / 180, d = (R - 8) * s;
      bob.setAttribute("cx", (d * Math.cos(r)).toFixed(2));
      bob.setAttribute("cy", (d * Math.sin(r)).toFixed(2));
      if (!still) raf = requestAnimationFrame(swingBob);
    }

    slider.addEventListener("input", () => { draw(); if (still) swingBob(0); });
    draw();
    swingBob(0);
    return () => cancelAnimationFrame(raf);
  },

};
