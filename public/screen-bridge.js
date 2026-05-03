(function () {
  const screen = window.APEX_SCREEN || "";
  const session = JSON.parse(localStorage.getItem("apexSession") || "null");

  // ─── API helper ───
  async function api(path, options) {
    let url = path;
    const isHotelApi = path.startsWith("/api/hotel");
    const opts = { ...(options || {}) };
    if (isHotelApi && session?.id) {
      if ((opts.method || "GET").toUpperCase() === "GET") {
        url += `${url.includes("?") ? "&" : "?"}user_id=${encodeURIComponent(session.id)}`;
      } else if (opts.body) {
        try {
          const p = JSON.parse(opts.body);
          p.user_id = session.id;
          opts.body = JSON.stringify(p);
        } catch (_) {}
      }
    }
    const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  // ─── Toast ───
  function toast(msg, type = "info") {
    document.querySelectorAll(".nhpl-toast").forEach(t => t.remove());
    const el = document.createElement("div");
    el.className = "nhpl-toast";
    el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(16px);
      z-index:999999;padding:11px 20px;border-radius:8px;font:700 13px Inter,sans-serif;
      box-shadow:0 8px 30px rgba(0,0,0,.22);opacity:0;transition:opacity .25s,transform .25s;
      max-width:min(420px,calc(100vw - 32px));text-align:center;pointer-events:none;
      background:${type === "success" ? "#065f46" : type === "error" ? "#991b1b" : "#1f2937"};color:#fff;`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateX(-50%) translateY(0)";
    }));
    setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }, 2800);
  }

  // ─── Shared styles injected once ───
  function injectStyles() {
    if (document.getElementById("nhpl-bridge-css")) return;
    const s = document.createElement("style");
    s.id = "nhpl-bridge-css";
    s.textContent = `
      .nhpl-panel {
        position:fixed;right:18px;bottom:18px;z-index:99999;width:320px;max-height:60vh;
        overflow:auto;background:#fff;border:1px solid #d1d5db;
        box-shadow:0 18px 50px rgba(15,23,42,.18);border-radius:10px;padding:14px;
        font-family:Inter,system-ui,sans-serif;color:#111827;
      }
      .nhpl-panel.collapsed .nhpl-body { display:none; }
      .nhpl-panel h3 { margin:0 0 4px;font:700 15px 'Work Sans',sans-serif; }
      .nhpl-panel p  { margin:0 0 8px;color:#6b7280;font-size:12px;line-height:1.4; }
      .nhpl-panel input,.nhpl-panel select,.nhpl-panel textarea {
        width:100%;border:1px solid #e5e7eb;border-radius:6px;padding:8px;
        margin-bottom:7px;font:13px Inter,sans-serif;background:#fff;color:#111827;
      }
      .nhpl-panel button {
        border:0;background:#111827;color:#fff;border-radius:6px;
        padding:8px 10px;font:700 11px Inter,sans-serif;text-transform:uppercase;cursor:pointer;
      }
      .nhpl-panel button:hover { background:#374151; }
      .nhpl-panel button:disabled { opacity:.4;cursor:not-allowed; }
      .nhpl-row { border-top:1px solid #e5e7eb;padding:9px 0;display:grid;gap:4px; }
      .nhpl-row strong { font-size:13px; }
      .nhpl-row small  { color:#6b7280;font-size:11px; }
      .nhpl-pill { display:inline-flex;border-radius:999px;background:#f3f4f6;padding:3px 8px;font:700 10px Inter,sans-serif; }
      .nhpl-pill.green  { background:#def7ec;color:#03543f; }
      .nhpl-pill.yellow { background:#fef3c7;color:#92400e; }
      .nhpl-pill.red    { background:#fee2e2;color:#991b1b; }
      .nhpl-pill.blue   { background:#eff6ff;color:#1e40af; }
      .nhpl-panel-head  { display:flex;justify-content:space-between;align-items:start;gap:8px;margin-bottom:10px;cursor:move;user-select:none; }
      .nhpl-icon-btn    { width:28px;height:28px;padding:0!important;display:inline-flex;align-items:center;justify-content:center; }
      .nhpl-actions     { display:flex;gap:6px;flex-wrap:wrap;margin-top:4px; }
      /* ── Customer full-page drawer ── */
      .nhpl-drawer-backdrop { position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.4); }
      .nhpl-drawer {
        position:fixed;inset:0 0 0 auto;z-index:100001;
        width:min(760px,100vw);background:#fff;border-left:1px solid #d1d5db;
        box-shadow:-18px 0 55px rgba(15,23,42,.18);overflow:auto;
        font-family:Inter,system-ui,sans-serif;color:#111827;
      }
      .nhpl-drawer-head {
        position:sticky;top:0;z-index:2;display:flex;align-items:start;
        justify-content:space-between;gap:18px;padding:20px;background:#fff;
        border-bottom:1px solid #e5e7eb;
      }
      .nhpl-drawer-head h2 { margin:0;font:800 24px 'Work Sans',sans-serif; }
      .nhpl-drawer-head p  { margin:6px 0 0;color:#64748b;font-size:13px; }
      .nhpl-drawer-close   { width:36px;height:36px;border:1px solid #d1d5db;border-radius:6px;background:#fff;cursor:pointer; }
      .nhpl-drawer-body    { padding:20px;display:grid;gap:16px; }
      .nhpl-card-grid      { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px; }
      .nhpl-card {
        border:1px solid #e5e7eb;border-radius:10px;background:#fff;overflow:hidden;
        transition:box-shadow .2s;
      }
      .nhpl-card:hover { box-shadow:0 4px 18px rgba(15,23,42,.1); }
      .nhpl-card img   { width:100%;height:180px;object-fit:cover;background:#f3f4f6; }
      .nhpl-card-body  { padding:14px;display:grid;gap:8px; }
      .nhpl-card-body h3   { margin:0;font:800 17px 'Work Sans',sans-serif; }
      .nhpl-card-body p,
      .nhpl-card-body small { margin:0;color:#64748b;font-size:12px;line-height:1.45; }
      .nhpl-card-body .nhpl-price { font:800 20px 'Work Sans',sans-serif;color:#111827; }
      .nhpl-card-body .nhpl-price small { font-size:12px;font-weight:400;color:#6b7280; }
      .nhpl-badge { display:inline-flex;border-radius:4px;background:#eff6ff;color:#1e40af;
        padding:3px 8px;font:700 11px Inter,sans-serif;margin:2px; }
      .nhpl-live-badge { display:inline-flex;align-items:center;gap:4px;border-radius:4px;
        background:#dcfce7;color:#15803d;padding:3px 8px;font:700 11px Inter,sans-serif; }
      .nhpl-live-badge::before { content:'';display:inline-block;width:7px;height:7px;
        border-radius:50%;background:#16a34a;animation:nhplPulse 1.5s infinite; }
      @keyframes nhplPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.25)} }
      .nhpl-btn-primary {
        border:0;background:#111827;color:#fff;border-radius:7px;
        padding:11px 16px;font:700 13px Inter,sans-serif;cursor:pointer;transition:background .2s;
        display:inline-flex;align-items:center;gap:6px;
      }
      .nhpl-btn-primary:hover { background:#374151; }
      .nhpl-btn-secondary {
        border:1px solid #d1d5db;background:#fff;color:#111827;border-radius:7px;
        padding:10px 14px;font:700 13px Inter,sans-serif;cursor:pointer;transition:all .2s;
      }
      .nhpl-btn-secondary:hover { border-color:#111827;background:#f9fafb; }
      .nhpl-btn-purple {
        border:0;background:#5b3f9d;color:#fff;border-radius:7px;
        padding:11px 16px;font:700 13px Inter,sans-serif;cursor:pointer;transition:background .2s;
      }
      .nhpl-btn-purple:hover { background:#462d82; }
      .nhpl-form-grid  { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px; }
      .nhpl-form-field { display:grid;gap:5px; }
      .nhpl-form-field label { font:700 11px Inter,sans-serif;color:#6b7280;text-transform:uppercase;letter-spacing:.05em; }
      .nhpl-form-field input,.nhpl-form-field select,.nhpl-form-field textarea {
        border:1px solid #d1d5db;border-radius:6px;padding:10px;
        font:13px Inter,sans-serif;background:#fff;color:#111827;width:100%;
        transition:border-color .2s,box-shadow .2s;
      }
      .nhpl-form-field input:focus,.nhpl-form-field select:focus,.nhpl-form-field textarea:focus {
        outline:none;border-color:#5b3f9d;box-shadow:0 0 0 3px rgba(91,63,157,.1);
      }
      .nhpl-section-title { font:700 18px 'Work Sans',sans-serif;margin:0 0 12px; }
      .nhpl-empty { border:1px dashed #cbd5e1;border-radius:8px;padding:20px;color:#64748b;
        background:#f8fafc;text-align:center;font-size:13px; }
      .nhpl-star  { color:#f59e0b; }
      .nhpl-amenity { display:inline-flex;align-items:center;gap:4px;background:#f3f4f6;
        border-radius:999px;padding:4px 10px;font-size:12px;margin:2px; }
      /* Hotel live dashboard */
      .nhpl-room-grid { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0; }
      .nhpl-room-slot { border:1px solid #d1d5db;border-radius:7px;padding:9px;min-height:64px;
        display:grid;align-content:space-between;background:#fff; }
      .nhpl-room-slot strong { font-size:12px; }
      .nhpl-room-slot small  { color:#6b7280;font-size:10px; }
      .nhpl-room-slot.vacant     { background:#ecfdf5;border-color:#6ee7b7; }
      .nhpl-room-slot.occupied   { background:#eef2ff;border-color:#c7d2fe; }
      .nhpl-room-slot.housekeeping { background:#fffbeb;border-color:#fcd34d; }
      .nhpl-svc-card { border-top:1px solid #e5e7eb;padding:11px 0;display:grid;gap:5px; }
      .nhpl-svc-card.critical { background:#fef2f2;margin:0 -8px;padding:11px 8px;
        border:1px solid #fecaca;border-radius:6px; }
      .nhpl-svc-meta { display:flex;justify-content:space-between;gap:10px;
        color:#6b7280;font-size:11px;font-weight:800;text-transform:uppercase; }
      .nhpl-timer-red { font-weight:900;color:#dc2626; }
      /* Restaurant */
      .nhpl-order-card { border:1px solid #e5e7eb;border-radius:8px;padding:12px;
        display:grid;gap:6px;background:#fff; }
      .nhpl-order-status { display:inline-flex;border-radius:4px;padding:3px 8px;
        font:700 11px Inter,sans-serif; }
      .nhpl-order-status.New       { background:#dbeafe;color:#1e40af; }
      .nhpl-order-status.Preparing { background:#fef3c7;color:#92400e; }
      .nhpl-order-status.Ready     { background:#def7ec;color:#03543f; }
      .nhpl-order-status.Dispatched,.nhpl-order-status.Served { background:#f3f4f6;color:#374151; }
      /* Admin control */
      .nhpl-control-drawer {
        position:fixed;inset:18px 18px 18px auto;z-index:100001;
        width:min(700px,calc(100vw - 36px));overflow:auto;background:#f8fafc;
        border:1px solid #cbd5e1;box-shadow:0 24px 70px rgba(15,23,42,.24);
        border-radius:10px;font-family:Inter,system-ui,sans-serif;color:#111827;
      }
      .nhpl-ctrl-head { position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;
        gap:16px;padding:18px;background:#fff;border-bottom:1px solid #e5e7eb; }
      .nhpl-ctrl-head h2 { margin:0;font:800 22px 'Work Sans',sans-serif; }
      .nhpl-ctrl-stats { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:14px 18px; }
      .nhpl-stat { border:1px solid #e5e7eb;border-radius:8px;background:#fff;padding:12px; }
      .nhpl-stat strong { display:block;font-size:22px; }
      .nhpl-stat small  { color:#64748b;font-size:11px;text-transform:uppercase;font-weight:700; }
      .nhpl-ctrl-list   { display:grid;gap:10px;padding:0 18px 18px; }
      .nhpl-ctrl-item   { border:1px solid #e5e7eb;border-radius:8px;background:#fff;padding:14px;display:grid;gap:10px; }
      .nhpl-ctrl-item h3 { margin:0;font:700 15px 'Work Sans',sans-serif; }
      .nhpl-ctrl-item p  { margin:4px 0 0;color:#64748b;font-size:12px; }
      .nhpl-ctrl-item label { display:grid;gap:5px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase; }
      .nhpl-ctrl-item input,.nhpl-ctrl-item select,.nhpl-ctrl-item textarea {
        width:100%;border:1px solid #d1d5db;border-radius:6px;padding:9px;
        font:13px Inter,sans-serif;background:#fff;color:#111827;
      }
      .nhpl-ctrl-switch { display:flex!important;align-items:center;gap:7px!important;text-transform:none!important; }
      .nhpl-ctrl-switch input { width:16px;height:16px; }
      /* Booking confirmation */
      .nhpl-confirm { background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;padding:14px;
        text-align:center;display:grid;gap:6px; }
      .nhpl-confirm strong { font:700 16px 'Work Sans',sans-serif;color:#065f46; }
      .nhpl-confirm small  { color:#047857;font-size:12px; }
      /* Availability banner */
      .nhpl-avail-bar {
        display:flex;align-items:center;justify-content:space-between;
        background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
        padding:10px 14px;font:700 13px Inter,sans-serif;color:#15803d;
      }
      .nhpl-avail-bar.full { background:#fff7ed;border-color:#fed7aa;color:#c2410c; }
      /* Responsive */
      @media(max-width:760px){
        .nhpl-card-grid,.nhpl-form-grid{grid-template-columns:1fr;}
        .nhpl-card img{height:155px;}
        .nhpl-ctrl-stats{grid-template-columns:repeat(2,minmax(0,1fr));}
      }
      @media(max-width:900px){.nhpl-panel{left:12px!important;right:12px!important;bottom:12px!important;top:auto!important;width:auto;}}
      /* Draggable panel */
      .nhpl-panel { user-select:none; }
    `;
    document.head.appendChild(s);
  }

  // ─── Escape HTML ───
  function esc(v) {
    return String(v ?? "")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }

  function imgList(v) {
    if (Array.isArray(v)) return v;
    try { return JSON.parse(v || "[]"); } catch { return []; }
  }

  function stars(n) {
    return "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
  }

  // ─── Panel drag ───
  function makeDraggable(panel) {
    let dragging = false, ox = 0, oy = 0;
    const saved = JSON.parse(localStorage.getItem("nhplPanelPos") || "null");
    if (saved && window.innerWidth > 900) {
      panel.style.left = saved.left + "px";
      panel.style.top = saved.top + "px";
      panel.style.right = "auto";
      panel.style.bottom = "auto";
    }
    panel.addEventListener("pointerdown", e => {
      if (!e.target.closest(".nhpl-panel-head") || e.target.closest("button")) return;
      dragging = true;
      const r = panel.getBoundingClientRect();
      ox = e.clientX - r.left; oy = e.clientY - r.top;
      panel.setPointerCapture(e.pointerId);
    });
    panel.addEventListener("pointermove", e => {
      if (!dragging) return;
      const left = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, e.clientX - ox));
      const top  = Math.max(8, Math.min(window.innerHeight - 48, e.clientY - oy));
      panel.style.left = left + "px"; panel.style.top = top + "px";
      panel.style.right = "auto"; panel.style.bottom = "auto";
    });
    panel.addEventListener("pointerup", () => {
      if (!dragging) return; dragging = false;
      const r = panel.getBoundingClientRect();
      localStorage.setItem("nhplPanelPos", JSON.stringify({ left: r.left, top: r.top }));
    });
  }

  // ─── Generic collapse ───
  function collapseBtn(panel) {
    const btn = panel.querySelector(".nhpl-collapse");
    if (!btn) return;
    btn.addEventListener("click", () => {
      panel.classList.toggle("collapsed");
      btn.textContent = panel.classList.contains("collapsed") ? "+" : "−";
    });
  }

  // ═══════════════════════════════════════════════
  //  CUSTOMER PAGE — fully live connected
  // ═══════════════════════════════════════════════
  function closeDrawer() {
    document.querySelector(".nhpl-drawer-backdrop")?.remove();
    document.querySelector(".nhpl-drawer")?.remove();
  }

  function openDrawer(title, subtitle, bodyHtml, onMount) {
    closeDrawer();
    const backdrop = document.createElement("div");
    backdrop.className = "nhpl-drawer-backdrop";
    const drawer = document.createElement("aside");
    drawer.className = "nhpl-drawer";
    drawer.innerHTML = `
      <div class="nhpl-drawer-head">
        <div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div>
        <button class="nhpl-drawer-close" title="Close">✕</button>
      </div>
      <div class="nhpl-drawer-body">${bodyHtml}</div>
    `;
    backdrop.addEventListener("click", closeDrawer);
    drawer.querySelector(".nhpl-drawer-close").addEventListener("click", closeDrawer);
    document.body.append(backdrop, drawer);
    if (onMount) onMount(drawer);
    return drawer;
  }

  // ── Hotels drawer — shows ALL live hotels including newly created ones ──
  async function showHotels() {
    // Show loading state immediately
    openDrawer("Hotels in Netarhat", "Loading available properties…", `
      <div style="display:flex;align-items:center;justify-content:center;padding:60px;color:#6b7280;font-size:14px;gap:10px;">
        <div style="width:20px;height:20px;border:3px solid #e5e7eb;border-top-color:#5b3f9d;border-radius:50%;animation:nhplSpin .7s linear infinite;"></div>
        Fetching live availability…
      </div>
      <style>@keyframes nhplSpin{to{transform:rotate(360deg)}}</style>
    `);
    const data = await api("/api/explore?category=hotels");
    const hotels = data.hotels || [];
    const liveCount = hotels.filter(h => h.is_live).length;
    const drawer = openDrawer(
      "Hotels in Netarhat",
      `${hotels.length} propert${hotels.length === 1 ? "y" : "ies"} available${liveCount ? ` · ${liveCount} live` : ""}`,
      `
      <div class="nhpl-card-grid" id="nhplHotelGrid">
        ${hotels.length ? hotels.map(h => {
          const imgs = imgList(h.images);
          const amenities = imgList(h.amenities || []);
          const hasVacancy = h.is_live ? Number(h.vacant_rooms) > 0 : true;
          return `
            <article class="nhpl-card" data-hotel-id="${h.id}">
              <img src="${esc(imgs[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80")}" alt="${esc(h.name)}" loading="lazy">
              <div class="nhpl-card-body">
                <div style="display:flex;align-items:start;justify-content:space-between;gap:8px;">
                  <h3>${esc(h.name)}</h3>
                  ${h.is_live ? `<span class="nhpl-live-badge">Live</span>` : ""}
                </div>
                <p>${esc(h.address || h.description || "Netarhat, Jharkhand")}</p>
                <div class="nhpl-star">${stars(Number(h.rating || 4.5))}</div>
                ${h.is_live ? `
                  <div class="${hasVacancy ? "nhpl-avail-bar" : "nhpl-avail-bar full"}">
                    <span>${hasVacancy ? `${h.vacant_rooms} room${h.vacant_rooms === 1 ? "" : "s"} available` : "Fully booked"}</span>
                    <span>${h.total_rooms} total</span>
                  </div>
                ` : ""}
                <div class="nhpl-price">₹${Number(h.price || 0).toLocaleString("en-IN")} <small>/ night</small></div>
                ${amenities.length ? `<div>${amenities.slice(0,3).map(a=>`<span class="nhpl-amenity">✓ ${esc(a)}</span>`).join("")}</div>` : ""}
                ${h.phone ? `<small>📞 ${esc(h.phone)}</small>` : ""}
                <button class="nhpl-btn-primary" data-book-hotel="${h.id}" 
                  data-hotel-name="${esc(h.name)}" 
                  data-hotel-price="${h.price || 3000}"
                  data-hotel-profile-user="${h.profile_user_id || ""}"
                  ${!hasVacancy ? "disabled style=\"opacity:.5;cursor:not-allowed;\"" : ""}>
                  ${hasVacancy ? "Book Now →" : "Fully Booked"}
                </button>
              </div>
            </article>`;
        }).join("") : `<div class="nhpl-empty" style="grid-column:1/-1;">No hotels listed yet. Hotel managers need to set up their properties first.</div>`}
      </div>
    `);
    drawer.querySelectorAll("[data-book-hotel]:not([disabled])").forEach(btn => {
      const hotel = hotels.find(h => String(h.id) === btn.dataset.bookHotel);
      btn.addEventListener("click", () => showHotelBooking({
        id: btn.dataset.bookHotel,
        name: btn.dataset.hotelName,
        price: btn.dataset.hotelPrice,
        images: hotel?.images || [],
        phone: hotel?.phone || "",
        profile_user_id: btn.dataset.hotelProfileUser || null,
      }));
    });
  }

  function showHotelBooking(hotel) {
    const imgs = imgList(hotel.images);
    // Detect profile hotel (id = "profile-N") vs seed hotel (numeric id)
    const profileUserId = hotel.profile_user_id || (() => {
      const m = String(hotel.id).match(/^profile-(\d+)$/);
      return m ? Number(m[1]) : null;
    })();
    const isProfileHotel = Boolean(profileUserId);
    const vacancyInfo = isProfileHotel && hotel.vacant_rooms !== undefined
      ? (Number(hotel.vacant_rooms) > 0
          ? `<div style="background:#dcfce7;border:1px solid #86efac;border-radius:7px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">
               <span style="color:#15803d;font:700 13px Inter,sans-serif;">✓ Rooms Available</span>
               <span style="color:#15803d;font:700 13px Inter,sans-serif;">${hotel.vacant_rooms} of ${hotel.total_rooms || "?"} vacant</span>
             </div>`
          : `<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:7px;padding:10px 14px;text-align:center;color:#991b1b;font:700 13px Inter,sans-serif;">
               ✗ Fully Booked — No rooms available right now
             </div>`)
      : "";
    openDrawer(`Book — ${hotel.name}`, `₹${Number(hotel.price).toLocaleString("en-IN")} per night`, `
      ${imgs[0] ? `<img src="${esc(imgs[0])}" alt="${esc(hotel.name)}" style="width:100%;height:220px;object-fit:cover;border-radius:10px;">` : ""}
      ${vacancyInfo}
      <form id="nhplHotelBookForm">
        <div class="nhpl-form-grid">
          <div class="nhpl-form-field"><label>Your Name</label><input name="customer_name" required placeholder="Full name"></div>
          <div class="nhpl-form-field"><label>Phone</label><input name="phone" placeholder="+91 9876543210"></div>
          <div class="nhpl-form-field"><label>Check-in Date</label><input name="date" type="date" required></div>
          <div class="nhpl-form-field"><label>Check-out Date</label><input name="check_out" type="date"></div>
          <div class="nhpl-form-field" style="grid-column:1/-1;"><label>Special Requests</label><input name="notes" placeholder="Extra bed, early check-in, dietary requirements…"></div>
        </div>
        ${hotel.phone ? `<p style="font-size:12px;color:#6b7280;margin-top:8px;">📞 Hotel contact: <strong>${esc(hotel.phone)}</strong></p>` : ""}
        ${isProfileHotel ? `<p style="font-size:11px;color:#5b3f9d;margin-top:6px;font-weight:700;">⚡ Live hotel — your booking will appear instantly on the hotel's front desk.</p>` : ""}
        <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
          <button type="submit" class="nhpl-btn-purple">Confirm Booking</button>
          <button type="button" class="nhpl-btn-secondary" id="nhplBackToHotels">← Back to Hotels</button>
        </div>
        <p id="nhplBookMsg" style="margin-top:10px;font-size:13px;color:#991b1b;"></p>
      </form>
      <div id="nhplBookConfirm"></div>
    `, drawer => {
      drawer.querySelector("#nhplBackToHotels").addEventListener("click", showHotels);
      drawer.querySelector("#nhplHotelBookForm").addEventListener("submit", async e => {
        e.preventDefault();
        const btn = e.currentTarget.querySelector("button[type=submit]");
        btn.disabled = true; btn.textContent = "Booking…";
        const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
        payload.type = "Hotel";
        // For seed hotels use numeric item_id; for profile hotels pass profile_user_id
        // The server will write to BOTH customer_bookings AND hotel_bookings (cross-domain)
        const numericId = parseInt(hotel.id);
        payload.item_id = isNaN(numericId) ? null : numericId;
        if (profileUserId) payload.profile_user_id = profileUserId;
        try {
          await api("/api/bookings", { method: "POST", body: JSON.stringify(payload) });
          e.currentTarget.style.display = "none";
          drawer.querySelector("#nhplBookConfirm").innerHTML = `
            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:20px;display:grid;gap:8px;">
              <strong style="font-size:18px;">✓ Booking Confirmed!</strong>
              <span style="color:#374151;">${esc(hotel.name)}</span>
              <span style="color:#6b7280;font-size:13px;">Check-in: ${esc(payload.date)}${payload.check_out ? ` · Check-out: ${esc(payload.check_out)}` : ""}</span>
              <span style="color:#6b7280;font-size:13px;">Contact: ${esc(payload.phone || "—")}</span>
              ${hotel.phone ? `<span style="color:#6b7280;font-size:13px;">📞 Hotel: ${esc(hotel.phone)}</span>` : ""}
              ${isProfileHotel ? `<span style="color:#5b3f9d;font:700 12px Inter,sans-serif;">⚡ Hotel manager has been notified.</span>` : ""}
              <button class="nhpl-btn-secondary" id="nhplViewBookings">View My Bookings →</button>
            </div>`;
          drawer.querySelector("#nhplViewBookings").addEventListener("click", showMyBookings);
          toast("Hotel booking confirmed!", "success");
          loadCustomerBookings();
        } catch(err) {
          drawer.querySelector("#nhplBookMsg").textContent = err.message;
          btn.disabled = false; btn.textContent = "Confirm Booking";
        }
      });
    });
  }

  // ── Dining drawer ──
  async function showDining() {
    const data = await api("/api/explore?category=dining");
    const restaurants = data.restaurants || [];
    openDrawer("Dining", `${restaurants.length} restaurants available`, `
      <div class="nhpl-card-grid">
        ${restaurants.length ? restaurants.map(r => {
          const imgs = imgList(r.images);
          const menu = imgList(r.menu);
          return `
            <article class="nhpl-card">
              <img src="${esc(imgs[0]||"")}" alt="${esc(r.name)}" loading="lazy">
              <div class="nhpl-card-body">
                <h3>${esc(r.name)}</h3>
                <p>${esc(r.area || "")}</p>
                <div class="nhpl-star">${stars(Number(r.rating))}</div>
                <div style="font-size:12px;color:#374151;margin:4px 0;">
                  ${menu.slice(0,3).map(item=>`<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f3f4f6;">
                    <span>${esc(item.name)}</span><strong>₹${Number(item.price).toLocaleString("en-IN")}</strong>
                  </div>`).join("")}
                </div>
                <button class="nhpl-btn-primary" data-book-dining="${r.id}" data-dining-name="${esc(r.name)}">Order / Reserve →</button>
              </div>
            </article>`;
        }).join("") : `<div class="nhpl-empty" style="grid-column:1/-1;">No restaurants listed yet.</div>`}
      </div>
    `, drawer => {
      drawer.querySelectorAll("[data-book-dining]").forEach(btn => {
        btn.addEventListener("click", () => showDiningBooking({ id: btn.dataset.bookDining, name: btn.dataset.diningName }));
      });
    });
  }

  function showDiningBooking(rest) {
    openDrawer(`Reserve — ${rest.name}`, "Confirm your table or food order", `
      <form id="nhplDineForm">
        <div class="nhpl-form-grid">
          <div class="nhpl-form-field"><label>Your Name</label><input name="customer_name" required placeholder="Full name"></div>
          <div class="nhpl-form-field"><label>Phone</label><input name="phone" placeholder="+91 9876543210"></div>
          <div class="nhpl-form-field"><label>Date</label><input name="date" type="date"></div>
          <div class="nhpl-form-field"><label>Notes / Items</label><input name="notes" placeholder="Veg, window table, etc."></div>
        </div>
        <div style="margin-top:14px;display:flex;gap:10px;">
          <button type="submit" class="nhpl-btn-purple">Confirm Reservation</button>
          <button type="button" class="nhpl-btn-secondary" id="nhplBackToDining">← Back</button>
        </div>
        <p id="nhplDineMsg" style="margin-top:10px;font-size:13px;color:#991b1b;"></p>
      </form>
      <div id="nhplDineConfirm"></div>
    `, drawer => {
      drawer.querySelector("#nhplBackToDining").addEventListener("click", showDining);
      drawer.querySelector("#nhplDineForm").addEventListener("submit", async e => {
        e.preventDefault();
        const btn = e.currentTarget.querySelector("button[type=submit]");
        btn.disabled = true; btn.textContent = "Booking…";
        const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
        payload.type = "Dining"; payload.item_id = rest.id;
        try {
          await api("/api/bookings", { method: "POST", body: JSON.stringify(payload) });
          e.currentTarget.style.display = "none";
          drawer.querySelector("#nhplDineConfirm").innerHTML = `
            <div class="nhpl-confirm"><strong>✓ Reservation Confirmed!</strong><small>${esc(rest.name)}</small></div>`;
          toast("Dining reservation confirmed!", "success");
          loadCustomerBookings();
        } catch(err) {
          drawer.querySelector("#nhplDineMsg").textContent = err.message;
          btn.disabled = false; btn.textContent = "Confirm Reservation";
        }
      });
    });
  }

  // ── Cabs / Trip planner ──
  async function showCabs() {
    const data = await api("/api/trips");
    const places = data.places || [];
    openDrawer("Book a Cab / Plan Trip", "Schedule your travel around Netarhat", `
      <form id="nhplCabForm">
        <div class="nhpl-form-grid">
          <div class="nhpl-form-field"><label>Your Name</label><input name="customer_name" required placeholder="Full name"></div>
          <div class="nhpl-form-field"><label>Phone</label><input name="phone" placeholder="+91 9876543210"></div>
          <div class="nhpl-form-field"><label>Pickup Date</label><input name="date" type="date" required></div>
          <div class="nhpl-form-field"><label>Pickup Point</label><input name="notes" placeholder="Hotel name or landmark"></div>
        </div>
        <p class="nhpl-section-title" style="margin-top:16px;">Select Places to Visit</p>
        <div style="display:grid;gap:8px;">
          ${places.map(p=>`
            <label style="display:flex;gap:10px;align-items:start;border:1px solid #e5e7eb;border-radius:7px;padding:10px;cursor:pointer;">
              <input type="checkbox" name="place_ids" value="${p.id}" style="margin-top:2px;">
              <span><strong style="font-size:13px;">${esc(p.name)}</strong><br>
              <small style="color:#6b7280;">${esc(p.area)} — ${esc(p.duration)}</small></span>
            </label>`).join("")}
        </div>
        <div style="margin-top:16px;display:flex;gap:10px;">
          <button type="submit" class="nhpl-btn-purple">Book Cab</button>
        </div>
        <p id="nhplCabMsg" style="margin-top:8px;font-size:13px;color:#991b1b;"></p>
      </form>
      <div id="nhplCabConfirm"></div>
    `, drawer => {
      drawer.querySelector("#nhplCabForm").addEventListener("submit", async e => {
        e.preventDefault();
        const btn = e.currentTarget.querySelector("button[type=submit]");
        if (btn) {
          btn.disabled = true; btn.textContent = "Booking…";
        }
        const fd = new FormData(e.currentTarget);
        const payload = Object.fromEntries(fd.entries());
        payload.type = "Cab";
        payload.place_ids = fd.getAll("place_ids").map(Number);
        try {
          await api("/api/bookings", { method: "POST", body: JSON.stringify(payload) });
          e.currentTarget.style.display = "none";
          drawer.querySelector("#nhplCabConfirm").innerHTML = `
            <div class="nhpl-confirm"><strong>✓ Cab Booked!</strong><small>Our team will call you to confirm pickup.</small></div>`;
          toast("Cab booking confirmed!", "success");
          loadCustomerBookings();
        } catch(err) {
          drawer.querySelector("#nhplCabMsg").textContent = err.message;
          if (btn) {
            btn.disabled = false; btn.textContent = "Book Cab";
          }
        }
      });
    });
  }

  // ── Flights ──
  async function showFlights() {
    const data = await api("/api/airports");
    const airports = data.airports || [];
    const options = airports.map(a=>`<option value="${a.code}">${a.code} — ${esc(a.city)} (${esc(a.name)})</option>`).join("");
    openDrawer("Flights", "Search and request flight coordination", `
      <div class="nhpl-form-grid">
        <div class="nhpl-form-field"><label>From</label><select id="nhplFlightFrom">${options}</select></div>
        <div class="nhpl-form-field"><label>To</label><select id="nhplFlightTo">${options}</select></div>
      </div>
      <div class="nhpl-form-field" style="margin-top:10px;">
        <label>Search airports</label>
        <input id="nhplAirportSearch" placeholder="City, code, or state…">
      </div>
      <div id="nhplAirportList" class="nhpl-card-grid" style="margin-top:12px;"></div>
      <div style="margin-top:16px;display:flex;gap:10px;">
        <button class="nhpl-btn-purple" id="nhplFlightBook">Request Flight Info →</button>
      </div>
      <div id="nhplFlightConfirm"></div>
    `, drawer => {
      const list = drawer.querySelector("#nhplAirportList");
      const render = () => {
        const q = drawer.querySelector("#nhplAirportSearch").value.trim().toLowerCase();
        const filtered = airports.filter(a=>[a.code,a.name,a.city,a.state].join(" ").toLowerCase().includes(q)).slice(0,16);
        list.innerHTML = filtered.map(a=>`
          <div class="nhpl-card"><div class="nhpl-card-body">
            <h3 style="font-size:15px;">${a.code} — ${esc(a.city)}</h3>
            <p>${esc(a.name)}</p><small>${esc(a.state)}</small>
          </div></div>`).join("");
      };
      drawer.querySelector("#nhplAirportSearch").addEventListener("input", render);
      drawer.querySelector("#nhplFlightBook").addEventListener("click", async () => {
        const from = drawer.querySelector("#nhplFlightFrom").value;
        const to = drawer.querySelector("#nhplFlightTo").value;
        await api("/api/events", { method:"POST", body:JSON.stringify({ level:"info", message:`Flight request: ${from} → ${to}` }) });
        drawer.querySelector("#nhplFlightConfirm").innerHTML = `
          <div class="nhpl-confirm"><strong>✓ Flight Request Sent!</strong><small>${from} → ${to} · Our travel desk will contact you shortly.</small></div>`;
        toast("Flight request submitted!", "success");
      });
      render();
    });
  }

  // ── My Bookings — fully connected to /api/my-bookings (merges customer + hotel bookings) ──
  async function showMyBookings() {
    openDrawer("My Bookings", "Loading your bookings…", `
      <div style="display:flex;align-items:center;justify-content:center;padding:60px;color:#6b7280;font-size:14px;gap:10px;">
        <div style="width:20px;height:20px;border:3px solid #e5e7eb;border-top-color:#5b3f9d;border-radius:50%;animation:nhplSpin .7s linear infinite;"></div>
        Fetching bookings…
      </div>
      <style>@keyframes nhplSpin{to{transform:rotate(360deg)}}</style>
    `);
    try {
      const data = await api("/api/my-bookings");
      const bookings = data.bookings || [];
      const typeIcon = t => ({ Hotel:"🏨", Dining:"🍽️", Cab:"🚖", Flight:"✈️", Trip:"🌄" }[t] || "📝");
      openDrawer("My Bookings", `${bookings.length} booking${bookings.length === 1 ? "" : "s"} on record`, `
        ${bookings.length ? `
          <div style="display:grid;gap:12px;">
            ${bookings.map(b => `
              <div style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;background:#fff;">
                <div style="display:flex;justify-content:space-between;align-items:start;gap:8px;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:20px;">${typeIcon(b.type)}</span>
                    <strong style="font:700 15px 'Work Sans',sans-serif;">${esc(b.type)} Booking</strong>
                  </div>
                  <span class="nhpl-pill ${b.status === 'Confirmed' ? 'green' : 'yellow'}">${esc(b.status)}</span>
                </div>
                <div style="margin-top:8px;display:grid;gap:4px;">
                  <span style="font-size:14px;color:#374151;">👤 ${esc(b.customer_name)}</span>
                  ${b.date ? `<span style="font-size:12px;color:#6b7280;">📅 ${esc(b.date)}</span>` : ""}
                  ${b.phone ? `<span style="font-size:12px;color:#6b7280;">📞 ${esc(b.phone)}</span>` : ""}
                  ${b.notes ? `<span style="font-size:12px;color:#6b7280;font-style:italic;">💬 ${esc(b.notes)}</span>` : ""}
                  <span style="font-size:11px;color:#9ca3af;">Booking #${b.id}</span>
                </div>
              </div>`).join("")}
          </div>` : `<div class="nhpl-empty">No bookings yet. Browse Hotels, Dining, or Cabs to make a booking.</div>`}
        <button class="nhpl-btn-secondary" id="nhplGoExplore" style="margin-top:8px;">→ Explore Hotels</button>
      `);
      document.getElementById("nhplGoExplore")?.addEventListener("click", showHotels);
    } catch(err) {
      openDrawer("My Bookings", "Error loading bookings", `
        <div class="nhpl-empty">${esc(err.message)}</div>
      `);
    }
  }

  // ── Events / Trips ──
  async function showEvents() {
    const data = await api("/api/trips");
    const trips = data.trips || [];
    openDrawer("Planned Trips & Events", `${trips.length} trip(s) planned`, `
      ${trips.length ? trips.map(t=>{
        const places = imgList(t.places);
        return `<div class="nhpl-card"><div class="nhpl-card-body">
          <h3>${esc(t.title)}</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0;">
            <span class="nhpl-pill blue">${esc(t.schedule)}</span>
            <span class="nhpl-pill">${t.days} day(s)</span>
            <span class="nhpl-pill ${t.status==='Planned'?'yellow':'green'}">${esc(t.status)}</span>
          </div>
          <p>${places.map(p=>esc(p.name||p)).join(" → ")}</p>
        </div></div>`;
      }).join("")
      : `<div class="nhpl-empty">No trips planned yet. Use Cabs to plan a trip.</div>`}
    `);
  }

  // ── Active bookings sidebar — loads from /api/my-bookings ──
  async function loadCustomerBookings() {
    try {
      const data = await api("/api/my-bookings");
      const bookings = (data.bookings || []).slice(0, 3);
      const container = document.querySelector("#nhplLiveBookings");
      if (!container) return;
      container.innerHTML = bookings.length ? bookings.map(b => `
        <div class="relative pl-10" style="margin-bottom:20px;">
          <div class="absolute left-2.5 top-1 w-3 h-3 rounded-full" style="background:#5b3f9d;box-shadow:0 0 0 4px rgba(91,63,157,.2);"></div>
          <p style="font-size:10px;font-weight:700;color:#5b3f9d;text-transform:uppercase;letter-spacing:.05em;margin:0 0 2px;">${esc(b.type)}</p>
          <p style="font-weight:700;font-size:14px;margin:0 0 2px;">${esc(b.customer_name)}</p>
          <p style="color:#6b7280;font-size:12px;margin:0;">${b.date ? esc(b.date) : "Date flexible"} · ${esc(b.status)}</p>
        </div>`).join("")
      : `<p style="color:#6b7280;font-size:13px;">No active bookings yet.</p>`;
    } catch (_) {}
  }

  // ── Patch static hotel cards with live data and vacancy badges ──
  async function patchStaticHeroCards() {
    try {
      const hotelData = await api("/api/explore?category=hotels");
      const hotels = (hotelData.hotels || []).slice(0, 3);
      const flightData = await api("/api/airports");
      const totalFlights = (flightData.airports || []).length;
      const totalHotels = hotelData.hotels ? hotelData.hotels.length : 0;
      
      const cards = document.querySelectorAll(".group.cursor-pointer");
      cards.forEach((card, i) => {
        const hotel = hotels[i];
        if (!hotel) return;
        const imgs = imgList(hotel.images);
        const img = card.querySelector("img");
        if (img && imgs[0]) img.src = imgs[0];
        const h3 = card.querySelector("h3");
        if (h3) h3.textContent = hotel.name;
        const loc = card.querySelectorAll("p")[0];
        if (loc) loc.textContent = hotel.address || "Netarhat, Jharkhand";
        const price = card.querySelector(".font-bold.text-body-lg");
        if (price) price.textContent = `₹${Number(hotel.price).toLocaleString("en-IN")}`;
        // Live vacancy badge — inject/refresh it
        let badge = card.querySelector(".nhpl-hero-vacancy");
        if (!badge) {
          badge = document.createElement("div");
          badge.className = "nhpl-hero-vacancy";
          badge.style.cssText = "position:absolute;top:10px;left:10px;z-index:2;";
          const imgEl = card.querySelector("img");
          if (imgEl) { imgEl.style.position = "relative"; imgEl.parentElement.style.position = "relative"; }
          (card.querySelector(".relative, .overflow-hidden") || card).style.position = "relative";
          (card.querySelector(".relative, .overflow-hidden") || card).prepend(badge);
        }
        if (hotel.is_live) {
          badge.innerHTML = totalHotels > 0
            ? `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(220,252,231,.95);color:#15803d;border-radius:6px;padding:4px 9px;font:700 11px Inter,sans-serif;">
                 <span style="width:7px;height:7px;border-radius:50%;background:#16a34a;animation:nhplPulse 1.5s infinite;display:inline-block;"></span>
                 ${totalHotels} Available
               </span>`
            : `<span style="background:rgba(254,226,226,.95);color:#991b1b;border-radius:6px;padding:4px 9px;font:700 11px Inter,sans-serif;">None Available</span>`;
        } else {
          badge.innerHTML = "";
        }
        // Prevent duplicate click handlers by marking the card
        if (!card.dataset.nhplBound) {
          card.dataset.nhplBound = "1";
          card.addEventListener("click", () => showHotelBooking(hotel));
        } else {
          // Update the hotel reference by replacing with a fresh listener via cloneNode trick
          // We store latest hotel on the element and read it in the handler
          card.dataset.nhplHotelIdx = String(i);
        }
        // Always keep hotel data fresh on element for re-use
        card._nhplHotel = hotel;
      });
      // Single delegated handler if we did the clone approach — not needed, handled above.
    } catch (_) {}
  }

  // ── Category action map — used by initCustomerPage ──
  const CATEGORY_ACTIONS = {
    flights: showHotels,
    hotels: showFlights,
    dining: showDining,
    "restaurants": showDining,
    cabs: showCabs,
    transport: showCabs,
    travel: showCabs,
    events: showEvents,
    trips: showEvents,
    "my bookings": showMyBookings,
    "my itinerary": showMyBookings,
    bookings: showMyBookings,
    wallet: showMyBookings,
    profile: showMyBookings,
    explore: showHotels,
    orders: showDining,
  };

  function bindAction(el, handler) {
    el.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); handler(); });
  }

  // ── Init customer page ──
  function initCustomerPage() {
    // Replace brand name
    document.querySelectorAll("span, a, div, h1, h2, h3, p, button").forEach(n => {
      if (n.childNodes.length === 1 && n.childNodes[0].nodeType === 3) {
        if (n.textContent.trim().toLowerCase() === "omnimarket") n.textContent = "NHPL";
        if (n.textContent.trim() === "System Status") n.textContent = "My Bookings";
      }
    });

    // Insert live bookings container in sidebar
    const timeline = document.querySelector(".space-y-6.relative");
    if (timeline) {
      timeline.id = "nhplLiveBookings";
      timeline.innerHTML = `<p style="color:#6b7280;font-size:13px;">Loading bookings…</p>`;
    }
    loadCustomerBookings();
    patchStaticHeroCards();

    // Bind every clickable card / button / nav link using the label map
    document.querySelectorAll(
      ".grid .cursor-pointer, .grid .group, nav a, nav button, nav.md\\:hidden div, nav.fixed div, button.fixed, button.rounded-full"
    ).forEach(el => {
      const label = (
        el.querySelector("span:last-child,span.font-label-md,span")?.textContent ||
        el.getAttribute("aria-label") ||
        el.textContent || ""
      ).trim().toLowerCase();

      for (const [key, fn] of Object.entries(CATEGORY_ACTIONS)) {
        if (label.includes(key)) { bindAction(el, fn); break; }
      }
    });

    // Bind hero mode toggle buttons (Hotels / Dining / Travel)
    document.querySelectorAll(".inline-flex button").forEach(btn => {
      const label = btn.textContent.trim().toLowerCase();
      const fn = CATEGORY_ACTIONS[label];
      if (fn) bindAction(btn, fn);
    });

    // Hero search button → hotels
    const searchBtn = document.querySelector("button.bg-primary");
    if (searchBtn && searchBtn.textContent.trim() === "Search") {
      bindAction(searchBtn, showHotels);
    }

    // FAB → cabs
    const fab = document.querySelector("button.fixed.bottom-24, button.fixed.rounded-full");
    if (fab) bindAction(fab, showCabs);

    // ── Live hotel availability refresh every 60s so the page stays current ──
    setInterval(patchStaticHeroCards, 60000);
  }

  // ═══════════════════════════════════════════════
  //  HOTEL OPS — live panel
  // ═══════════════════════════════════════════════
  async function renderHotelFrontDesk(panel, data, services) {
    const rooms = data.rooms || [];
    const bookings = data.bookings || [];
    const tickets = services.tickets || [];
    const vacant = rooms.filter(r => r.status === "Vacant");
    panel.innerHTML = `
      <div class="nhpl-panel-head">
        <div><h3>Front Desk</h3><p>${data.stats.vacant} vacant · ${data.stats.occupied} occupied</p></div>
        <button class="nhpl-icon-btn nhpl-collapse">−</button>
      </div>
      <div class="nhpl-body">
        <div class="nhpl-room-grid">
          ${rooms.slice(0,9).map(r=>`
            <div class="nhpl-room-slot ${r.status.toLowerCase()}">
              <strong>${esc(r.room_no)}</strong>
              <small>${esc(r.room_type)}</small>
              <span class="nhpl-pill ${r.status==="Vacant"?"green":r.status==="Occupied"?"blue":"yellow"}">${r.status}</span>
            </div>`).join("") || `<p style="color:#6b7280;font-size:12px;grid-column:1/-1;">No rooms set up yet.</p>`}
        </div>
        <button id="nhplAddRoomBtn" style="margin-bottom:8px;">+ Add Room</button>
        <form id="nhplFDBookForm">
          <select name="room_id" required>
            <option value="">Select vacant room</option>
            ${vacant.map(r=>`<option value="${r.id}">Room ${esc(r.room_no)} — ${esc(r.room_type)} — ₹${Number(r.rate).toLocaleString("en-IN")}</option>`).join("")}
          </select>
          <input name="guest_name" placeholder="Guest name" required>
          <input name="phone" placeholder="Phone">
          <input name="check_in" type="date" required>
          <input name="check_out" type="date" required>
          <input name="notes" placeholder="Notes / ID proof">
          <button ${vacant.length ? "" : "disabled"}>Book Room</button>
        </form>
        <div style="margin-top:12px;">
          <strong style="font-size:13px;">Recent Bookings</strong>
          ${bookings.slice(0,5).map(b=>`
            <div class="nhpl-row">
              <strong>${esc(b.ref)} — ${esc(b.guest_name)}</strong>
              <small>Room ${esc(b.room_no)} · ${esc(b.check_in)} → ${esc(b.check_out)}</small>
            </div>`).join("") || `<p style="color:#6b7280;font-size:12px;">No bookings yet.</p>`}
        </div>
      </div>
    `;
    collapseBtn(panel);
    panel.querySelector("#nhplAddRoomBtn").addEventListener("click", async () => {
      const roomNo = prompt("Room number / name (e.g. 101, Cottage A):"); if (!roomNo) return;
      const roomType = prompt("Room type:", "Standard Room") || "Standard Room";
      const rate = prompt("Rate per night:", "3000") || "3000";
      await api("/api/hotel/rooms", { method:"POST", body:JSON.stringify({ room_no:roomNo, room_type:roomType, rate }) });
      toast(`Room ${roomNo} added. Customers will see it immediately.`, "success");
      await loadHotelPanel(panel);
    });
    panel.querySelector("#nhplFDBookForm").addEventListener("submit", async e => {
      e.preventDefault();
      const btn = e.currentTarget.querySelector("button");
      btn.disabled = true; btn.textContent = "Booking…";
      try {
        const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
        await api("/api/hotel/bookings", { method:"POST", body:JSON.stringify(payload) });
        toast("Room booked successfully!", "success");
        await loadHotelPanel(panel);
      } catch(err) { toast(err.message, "error"); btn.disabled=false; btn.textContent="Book Room"; }
    });
    // Sync live room map into the page iframe
    syncRoomMapInPage(rooms, data.stats);
  }

  function syncRoomMapInPage(rooms, stats) {
    let map = document.querySelector("#nhplInlineRoomMap");
    const anchor = document.querySelector("main, .main, [class*='grid']");
    if (!map && anchor) {
      map = document.createElement("section");
      map.id = "nhplInlineRoomMap";
      map.style.cssText = "margin:16px;padding:16px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;font-family:Inter,sans-serif;";
      anchor.prepend(map);
    }
    if (!map) return;
    map.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div>
          <h3 style="margin:0;font:700 18px 'Work Sans',sans-serif;">Live Room Map</h3>
          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Real-time status · visible to customers</p>
        </div>
        <div style="display:flex;gap:8px;">
          <span style="background:#ecfdf5;color:#03543f;border-radius:999px;padding:4px 10px;font:700 12px Inter,sans-serif;">${stats.vacant} Vacant</span>
          <span style="background:#eef2ff;color:#1e40af;border-radius:999px;padding:4px 10px;font:700 12px Inter,sans-serif;">${stats.occupied} Occupied</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;">
        ${rooms.map(r=>`
          <div style="border:1px solid ${r.status==="Vacant"?"#6ee7b7":r.status==="Occupied"?"#c7d2fe":"#fcd34d"};
            border-radius:8px;padding:10px;background:${r.status==="Vacant"?"#ecfdf5":r.status==="Occupied"?"#eef2ff":"#fffbeb"};">
            <strong style="font-size:13px;">${esc(r.room_no)}</strong><br>
            <small style="color:#6b7280;font-size:11px;">${esc(r.room_type)}</small><br>
            <span style="font:700 10px Inter,sans-serif;color:${r.status==="Vacant"?"#03543f":r.status==="Occupied"?"#1e40af":"#92400e"};">${r.status}</span>
          </div>`).join("") || `<p style="color:#6b7280;grid-column:1/-1;">No rooms added yet. Use Hotel Setup to add rooms.</p>`}
      </div>
    `;
  }

  async function renderHotelServicePanel(panel, data, services) {
    const rooms = data.rooms || [];
    const tickets = services.tickets || [];
    panel.innerHTML = `
      <div class="nhpl-panel-head">
        <div><h3>Service Queue</h3><p>${services.stats.open} open · ${services.stats.critical} critical</p></div>
        <button class="nhpl-icon-btn nhpl-collapse">−</button>
      </div>
      <div class="nhpl-body">
        <button id="nhplShowSvcForm">+ Add Service Request</button>
        <form id="nhplSvcForm" style="display:none;margin-top:10px;">
          <input type="hidden" name="room_id" id="nhplSvcRoomId">
          <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-bottom:8px;">
            ${rooms.map(r=>`
              <button type="button" class="nhpl-room-slot ${r.status.toLowerCase()}" data-room-id="${r.id}">
                <strong>${esc(r.room_no)}</strong><small>${esc(r.room_type)}</small>
                <span class="nhpl-pill">${r.status}</span>
              </button>`).join("") || `<p style="color:#6b7280;font-size:12px;">No rooms.</p>`}
          </div>
          <select name="service_type">
            <option>Housekeeping</option><option>F&B</option>
            <option>Maintenance</option><option>Laundry</option><option>Concierge</option>
          </select>
          <input name="title" placeholder="Details e.g. Extra towels" required>
          <select name="sla_minutes">
            <option value="5">SLA 5 min</option><option value="10">SLA 10 min</option>
            <option value="15" selected>SLA 15 min</option><option value="30">SLA 30 min</option>
          </select>
          <select name="priority"><option>Normal</option><option>High</option><option>Critical</option></select>
          <button type="submit">Add to Queue</button>
        </form>
        <div style="margin-top:10px;">
          ${tickets.map(t=>`
            <div class="nhpl-svc-card ${t.status==="Critical"?"critical":""}">
              <div class="nhpl-svc-meta">
                <span>Room ${esc(t.room_no)} · ${esc(t.service_type)}</span>
                <span class="nhpl-timer-red">${esc(t.timer)}</span>
              </div>
              <strong style="font-size:13px;">${esc(t.title)}</strong>
              <small>${esc(t.sla_state)}${t.assignee ? ` · ${esc(t.assignee)}` : ""}</small>
              <div class="nhpl-actions">
                ${t.status !== "Done" ? `
                  ${t.status !== "Assigned" ? `<button data-svc="${t.id}" data-action="assign">Assign</button>` : ""}
                  ${t.status !== "Critical" ? `<button data-svc="${t.id}" data-action="escalate" style="background:#991b1b;">Escalate</button>` : ""}
                  <button data-svc="${t.id}" data-action="done" style="background:#065f46;">Done ✓</button>
                ` : `<span class="nhpl-pill green">Done</span>`}
              </div>
            </div>`).join("") || `<p style="color:#6b7280;font-size:12px;margin-top:8px;">No service tickets.</p>`}
        </div>
      </div>
    `;
    collapseBtn(panel);
    panel.querySelector("#nhplShowSvcForm").addEventListener("click", () => {
      const f = panel.querySelector("#nhplSvcForm");
      f.style.display = f.style.display === "none" ? "grid" : "none";
      f.style.gap = "6px";
    });
    panel.querySelectorAll("[data-room-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        panel.querySelectorAll("[data-room-id]").forEach(b => b.style.outline = "");
        btn.style.outline = "3px solid #5b3f9d";
        panel.querySelector("#nhplSvcRoomId").value = btn.dataset.roomId;
      });
    });
    panel.querySelector("#nhplSvcForm").addEventListener("submit", async e => {
      e.preventDefault();
      const roomId = panel.querySelector("#nhplSvcRoomId").value;
      if (!roomId) { toast("Select a room first.", "error"); return; }
      const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
      await api("/api/hotel/services", { method:"POST", body:JSON.stringify(payload) });
      toast("Service ticket added.", "success");
      await loadHotelPanel(panel);
    });
    panel.querySelectorAll("[data-svc]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const assignee = btn.dataset.action === "assign" ? (prompt("Assign to:", "Maria S.") || "Hotel Staff") : "";
        await api("/api/hotel/services/status", { method:"POST", body:JSON.stringify({ ticket_id:btn.dataset.svc, action:btn.dataset.action, assignee }) });
        toast(`Ticket ${btn.dataset.action}d.`, "success");
        await loadHotelPanel(panel);
      });
    });
    syncServiceQueueInPage(tickets, services.stats);
  }

  function syncServiceQueueInPage(tickets, stats) {
    let queueEl = document.querySelector("#nhplInlineSvcQueue");
    const anchor = document.querySelector("main, .main, [class*='grid']");
    if (!queueEl && anchor) {
      queueEl = document.createElement("section");
      queueEl.id = "nhplInlineSvcQueue";
      queueEl.style.cssText = "margin:16px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;font-family:Inter,sans-serif;overflow:hidden;";
      anchor.appendChild(queueEl);
    }
    if (!queueEl) return;
    queueEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e5e7eb;">
        <h3 style="margin:0;font:700 20px 'Work Sans',sans-serif;">Service Queue</h3>
        <span style="background:#5b3f9d;color:#fff;border-radius:6px;padding:5px 10px;font:700 12px Inter,sans-serif;">${stats.open} OPEN</span>
      </div>
      ${tickets.slice(0,6).map(t=>`
        <div style="padding:14px 20px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;gap:14px;">
          <div>
            <div style="color:${t.status==="Critical"?"#dc2626":t.service_type==="Housekeeping"?"#059669":"#5b3f9d"};font-size:11px;font-weight:700;text-transform:uppercase;">
              ROOM ${esc(t.room_no)} · ${esc(t.service_type)}
            </div>
            <strong style="display:block;margin-top:6px;font-size:15px;">${esc(t.title)}</strong>
            <small style="color:#6b7280;">${t.assignee ? `Assigned: ${esc(t.assignee)}` : "Unassigned"}</small>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <strong style="display:block;color:${t.sla_state==="SLA OVER"?"#dc2626":"#059669"};font-size:15px;">${esc(t.timer)}</strong>
            <small style="color:#6b7280;">${esc(t.sla_state)}</small>
          </div>
        </div>`).join("") || `<p style="padding:16px 20px;color:#6b7280;font-size:13px;">No service tickets yet.</p>`}
    `;
  }

  async function loadHotelPanel(panel) {
    try {
      const [data, services] = await Promise.all([api("/api/hotel"), api("/api/hotel/services")]);
      if (screen === "hotel-inventory") await renderHotelServicePanel(panel, data, services);
      else await renderHotelFrontDesk(panel, data, services);
    } catch(err) { panel.innerHTML = `<p style="color:#991b1b;font-size:13px;padding:10px;">${err.message}</p>`; }
  }

  // ═══════════════════════════════════════════════
  //  RESTAURANT OPS — live panel
  // ═══════════════════════════════════════════════
  function orderStatusClass(status) {
    return { New:"New", Preparing:"Preparing", Ready:"Ready", Dispatched:"Dispatched", Served:"Served" }[status] || "New";
  }
  function nextStatus(status) {
    return { New:"Preparing", Preparing:"Ready", Ready:"Dispatched", Dispatched:"Served" }[status] || "";
  }

  async function renderRestaurantPanel(panel, data) {
    const orders = data.orders || [];
    panel.innerHTML = `
      <div class="nhpl-panel-head">
        <div><h3>Restaurant Ops</h3><p>${data.stats.openOrders} open · ${data.stats.preparing} preparing · ${data.stats.ready} ready</p></div>
        <button class="nhpl-icon-btn nhpl-collapse">−</button>
      </div>
      <div class="nhpl-body">
        <form id="nhplOrderForm">
          <input name="customer" placeholder="Customer / room" required>
          <input name="table_no" placeholder="Table / pickup channel" required>
          <input name="items" placeholder="Items ordered" required>
          <input name="total" type="number" min="1" placeholder="Total (₹)" required>
          <button>Add Order</button>
        </form>
        <div style="margin-top:10px;display:grid;gap:8px;">
          ${orders.map(o=>`
            <div class="nhpl-order-card">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong style="font-size:13px;">${esc(o.ref)} · ${esc(o.customer)}</strong>
                <span class="nhpl-order-status ${orderStatusClass(o.status)}">${o.status}</span>
              </div>
              <small>${esc(o.table_no)} · ${esc(o.items)}</small>
              <small>₹${Number(o.total).toLocaleString("en-IN")}</small>
              <div class="nhpl-actions">
                ${nextStatus(o.status) ? `<button data-order="${o.id}" data-next="${nextStatus(o.status)}" style="background:#5b3f9d;">→ ${nextStatus(o.status)}</button>` : `<span class="nhpl-pill green">Completed</span>`}
              </div>
            </div>`).join("") || `<p style="color:#6b7280;font-size:12px;">No orders yet.</p>`}
        </div>
      </div>
    `;
    collapseBtn(panel);
    panel.querySelector("#nhplOrderForm").addEventListener("submit", async e => {
      e.preventDefault();
      const btn = e.currentTarget.querySelector("button");
      btn.disabled = true; btn.textContent = "Adding…";
      try {
        const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
        await api("/api/restaurant/orders", { method:"POST", body:JSON.stringify(payload) });
        toast("Order added.", "success");
        await loadRestaurantPanel(panel);
      } catch(err) { toast(err.message, "error"); btn.disabled=false; btn.textContent="Add Order"; }
    });
    panel.querySelectorAll("[data-order]").forEach(btn => {
      btn.addEventListener("click", async () => {
        await api("/api/restaurant/status", { method:"POST", body:JSON.stringify({ orderId:btn.dataset.order, status:btn.dataset.next }) });
        toast(`Order moved to ${btn.dataset.next}.`, "success");
        await loadRestaurantPanel(panel);
      });
    });
    syncOrdersInPage(orders, data.stats);
  }

  function syncOrdersInPage(orders, stats) {
    let el = document.querySelector("#nhplInlineOrders");
    const anchor = document.querySelector("main, section, [class*='grid']");
    if (!el && anchor) {
      el = document.createElement("section");
      el.id = "nhplInlineOrders";
      el.style.cssText = "margin:16px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;font-family:Inter,sans-serif;overflow:hidden;";
      anchor.prepend(el);
    }
    if (!el) return;
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e5e7eb;">
        <h3 style="margin:0;font:700 20px 'Work Sans',sans-serif;">Live Orders</h3>
        <div style="display:flex;gap:8px;">
          <span style="background:#dbeafe;color:#1e40af;border-radius:6px;padding:5px 10px;font:700 11px Inter,sans-serif;">${stats.openOrders} Open</span>
          <span style="background:#fef3c7;color:#92400e;border-radius:6px;padding:5px 10px;font:700 11px Inter,sans-serif;">${stats.preparing} Preparing</span>
          <span style="background:#def7ec;color:#03543f;border-radius:6px;padding:5px 10px;font:700 11px Inter,sans-serif;">${stats.ready} Ready</span>
        </div>
      </div>
      ${orders.slice(0,8).map(o=>`
        <div style="padding:14px 20px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;gap:12px;">
          <div>
            <strong style="font-size:14px;">${esc(o.ref)} · ${esc(o.customer)}</strong><br>
            <small style="color:#6b7280;">${esc(o.table_no)} · ${esc(o.items)}</small>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <strong style="font-size:14px;">₹${Number(o.total).toLocaleString("en-IN")}</strong><br>
            <span style="font:700 11px Inter,sans-serif;color:${o.status==="Ready"?"#03543f":o.status==="Preparing"?"#92400e":"#1e40af"}">${o.status}</span>
          </div>
        </div>`).join("") || `<p style="padding:16px 20px;color:#6b7280;font-size:13px;">No orders yet.</p>`}
    `;
  }

  async function loadRestaurantPanel(panel) {
    try {
      const data = await api("/api/restaurant");
      await renderRestaurantPanel(panel, data);
    } catch(err) { panel.innerHTML = `<p style="color:#991b1b;font-size:13px;padding:10px;">${err.message}</p>`; }
  }

  // ═══════════════════════════════════════════════
  //  ADMIN — control system + live events
  // ═══════════════════════════════════════════════
  async function renderAdminPanel(panel, data) {
    panel.innerHTML = `
      <div class="nhpl-panel-head">
        <div><h3>Master Admin</h3><p>${data.stats.partners} partners · ${data.stats.activeDrivers} drivers</p></div>
        <button class="nhpl-icon-btn nhpl-collapse">−</button>
      </div>
      <div class="nhpl-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px;">
          <button data-ctrl-domain="global">Global Controls</button>
          <button data-ctrl-domain="hotels">Hotel Controls</button>
          <button data-ctrl-domain="dining">Dining Controls</button>
          <button data-ctrl-domain="transport">Transport Controls</button>
        </div>
        <button id="nhplWriteEvent">Write Test Event</button>
        <div style="margin-top:10px;">
          ${(data.events || []).slice(0,6).map(e=>`
            <div class="nhpl-row">
              <strong style="font-size:12px;">${esc(e.message)}</strong>
              <small>${new Date(e.created_at).toLocaleTimeString()}</small>
            </div>`).join("") || `<small style="color:#6b7280;">No events yet.</small>`}
        </div>
      </div>
    `;
    collapseBtn(panel);
    panel.querySelector("#nhplWriteEvent").addEventListener("click", async () => {
      await api("/api/events", { method:"POST", body:JSON.stringify({ level:"info", message:`Admin panel test event — ${new Date().toLocaleTimeString()}` }) });
      const data2 = await api("/api/dashboard");
      await renderAdminPanel(panel, data2);
      toast("Test event written.", "success");
    });
    panel.querySelectorAll("[data-ctrl-domain]").forEach(btn => {
      btn.addEventListener("click", () => openControlDrawer(btn.dataset.ctrlDomain));
    });
  }

  async function openControlDrawer(domain) {
    const TITLES = { global:"Global Admin Controls", hotels:"Hotel Domain Controls", dining:"Restaurant Controls", transport:"Travel & Transport Controls", customer:"Customer Controls" };
    let drawer = document.querySelector(".nhpl-control-drawer");
    if (!drawer) { drawer = document.createElement("aside"); drawer.className = "nhpl-control-drawer"; document.body.appendChild(drawer); }
    drawer.innerHTML = `<div class="nhpl-ctrl-head"><div><h2>${TITLES[domain]||"Controls"}</h2><p>Loading…</p></div><button class="nhpl-drawer-close" id="nhplCtrlClose">✕</button></div>`;
    drawer.querySelector("#nhplCtrlClose").addEventListener("click", () => drawer.remove());
    const data = await api(`/api/control-system?domain=${domain}`);
    renderControlDrawer(drawer, data, TITLES);
  }

  function renderControlDrawer(drawer, data, TITLES) {
    const TITLES2 = TITLES || { global:"Global",hotels:"Hotels",dining:"Dining",transport:"Transport",customer:"Customer" };
    const groups = data.items.reduce((g, item) => { (g[item.category] = g[item.category]||[]).push(item); return g; }, {});
    drawer.innerHTML = `
      <div class="nhpl-ctrl-head">
        <div><h2>${TITLES2[data.domain]||"Controls"}</h2><p>Toggle, edit, or add controls for this domain.</p></div>
        <button class="nhpl-drawer-close" id="nhplCtrlClose">✕</button>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;padding:12px 18px;border-bottom:1px solid #e5e7eb;background:#fff;">
        ${Object.keys(TITLES2).map(d=>`<button style="border:1px solid ${d===data.domain?"#111827":"#d1d5db"};background:${d===data.domain?"#111827":"#fff"};color:${d===data.domain?"#fff":"#111827"};border-radius:6px;padding:7px 10px;font:700 11px Inter,sans-serif;cursor:pointer;" data-domain-tab="${d}">${TITLES2[d]}</button>`).join("")}
      </div>
      <div class="nhpl-ctrl-stats">
        <div class="nhpl-stat"><strong>${data.stats.total}</strong><small>Total</small></div>
        <div class="nhpl-stat"><strong>${data.stats.enabled}</strong><small>Enabled</small></div>
        <div class="nhpl-stat"><strong>${data.stats.disabled}</strong><small>Disabled</small></div>
        <div class="nhpl-stat"><strong>${data.stats.attention}</strong><small>Attention</small></div>
      </div>
      <div class="nhpl-ctrl-list">
        <form id="nhplCtrlAddForm" style="border:1px solid #e5e7eb;border-radius:8px;background:#fff;padding:14px;display:grid;gap:8px;">
          <strong style="font:700 15px 'Work Sans',sans-serif;">Add Custom Control</strong>
          <label style="display:grid;gap:4px;font:700 11px Inter,sans-serif;color:#6b7280;text-transform:uppercase;">Category<input name="category" placeholder="e.g. Fraud Control" required style="border:1px solid #d1d5db;border-radius:6px;padding:8px;font:13px Inter,sans-serif;margin-top:4px;"></label>
          <label style="display:grid;gap:4px;font:700 11px Inter,sans-serif;color:#6b7280;text-transform:uppercase;">Title<input name="title" required style="border:1px solid #d1d5db;border-radius:6px;padding:8px;font:13px Inter,sans-serif;margin-top:4px;"></label>
          <label style="display:grid;gap:4px;font:700 11px Inter,sans-serif;color:#6b7280;text-transform:uppercase;">Detail<textarea name="detail" rows="2" style="border:1px solid #d1d5db;border-radius:6px;padding:8px;font:13px Inter,sans-serif;margin-top:4px;width:100%;"></textarea></label>
          <button style="border:0;background:#111827;color:#fff;border-radius:6px;padding:9px;font:700 12px Inter,sans-serif;cursor:pointer;">Add Control</button>
        </form>
        ${Object.entries(groups).map(([cat, items]) => items.map(item => `
          <form class="nhpl-ctrl-item" data-ctrl-id="${item.id}">
            <div style="display:flex;align-items:start;justify-content:space-between;gap:12px;">
              <div><h3>${esc(item.title)}</h3><p>${esc(cat)}</p></div>
              <label class="nhpl-ctrl-switch"><input type="checkbox" name="enabled" ${item.enabled?"checked":""}><span>${item.enabled?"Enabled":"Disabled"}</span></label>
            </div>
            <label>Title<input name="title" value="${esc(item.title)}"></label>
            <label>Detail<input name="detail" value="${esc(item.detail)}"></label>
            <label>Status<select name="status">${["Ready","Active","Needs Review","Paused","Emergency"].map(s=>`<option ${s===item.status?"selected":""}>${s}</option>`).join("")}</select></label>
            <button type="submit" style="border:0;background:#5b3f9d;color:#fff;border-radius:6px;padding:8px;font:700 11px Inter,sans-serif;cursor:pointer;">Save</button>
          </form>`).join("")).join("")}
      </div>
    `;
    drawer.querySelector("#nhplCtrlClose").addEventListener("click", () => drawer.remove());
    drawer.querySelectorAll("[data-domain-tab]").forEach(btn => {
      btn.addEventListener("click", () => openControlDrawer(btn.dataset.domainTab));
    });
    drawer.querySelector("#nhplCtrlAddForm").addEventListener("submit", async e => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
      payload.action = "create"; payload.domain = data.domain;
      const updated = await api("/api/control-system", { method:"POST", body:JSON.stringify(payload) });
      toast("Control added.", "success");
      renderControlDrawer(drawer, updated, TITLES2);
    });
    drawer.querySelectorAll("[data-ctrl-id]").forEach(form => {
      form.addEventListener("submit", async e => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(form).entries());
        payload.id = form.dataset.ctrlId; payload.domain = data.domain;
        payload.enabled = form.elements.enabled.checked;
        const updated = await api("/api/control-system", { method:"POST", body:JSON.stringify(payload) });
        toast("Control saved.", "success");
        renderControlDrawer(drawer, updated, TITLES2);
      });
    });
  }

  // ═══════════════════════════════════════════════
  //  DRIVER / TRAVEL / LOGISTICS — live panel
  // ═══════════════════════════════════════════════
  async function renderGenericPanel(panel) {
    const data = await api("/api/dashboard");
    panel.innerHTML = `
      <div class="nhpl-panel-head">
        <div><h3>Live Dashboard</h3><p>Connected to Neon backend</p></div>
        <button class="nhpl-icon-btn nhpl-collapse">−</button>
      </div>
      <div class="nhpl-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:10px;text-align:center;">
            <strong style="font-size:22px;">${data.stats.partners}</strong><br>
            <small style="color:#6b7280;font-size:11px;">Partners</small>
          </div>
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:10px;text-align:center;">
            <strong style="font-size:22px;">${data.stats.activeDrivers}</strong><br>
            <small style="color:#6b7280;font-size:11px;">Active Drivers</small>
          </div>
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:10px;text-align:center;">
            <strong style="font-size:22px;">${data.stats.pendingRequests}</strong><br>
            <small style="color:#6b7280;font-size:11px;">Pending</small>
          </div>
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:10px;text-align:center;">
            <strong style="font-size:22px;">${data.stats.uptime}</strong><br>
            <small style="color:#6b7280;font-size:11px;">Uptime</small>
          </div>
        </div>
        <button id="nhplEventBtn">Write Test Event</button>
        <div style="margin-top:10px;">
          ${(data.events || []).slice(0,5).map(e=>`
            <div class="nhpl-row">
              <strong style="font-size:12px;">${esc(e.message)}</strong>
              <small>${new Date(e.created_at).toLocaleTimeString()}</small>
            </div>`).join("")}
        </div>
      </div>
    `;
    collapseBtn(panel);
    panel.querySelector("#nhplEventBtn").addEventListener("click", async () => {
      await api("/api/events", { method:"POST", body:JSON.stringify({ level:"info", message:`${screen} test event — ${new Date().toLocaleTimeString()}` }) });
      await renderGenericPanel(panel);
      toast("Event written.", "success");
    });
    makeButtonsFunctional();
  }

  function makeButtonsFunctional() {
    document.addEventListener("click", async e => {
      const target = e.target.closest("button, a");
      if (!target) return;
      if (target.closest(".nhpl-panel,.nhpl-drawer,.nhpl-drawer-backdrop,.nhpl-control-drawer")) return;
      const label = (target.textContent || target.getAttribute("aria-label") || "Action").replace(/\s+/g," ").trim();
      if (target.tagName === "A") e.preventDefault();
      target.style.outline = "2px solid #5b3f9d";
      setTimeout(() => target.style.outline = "", 1200);
      toast(`"${label.slice(0,30)}" action simulated.`);
      try {
        await api("/api/events", { method:"POST", body:JSON.stringify({ level:"info", message:`${screen}: "${label}" clicked.` }) });
      } catch(_) {}
    });
  }

  // ═══════════════════════════════════════════════
  //  BOOT
  // ═══════════════════════════════════════════════
  function boot() {
    injectStyles();

    // Customer page — full live integration
    if (screen.startsWith("voyage") || /customer/i.test(screen)) {
      initCustomerPage();
      return;
    }

    // All other pages get a draggable live panel
    const panel = document.createElement("aside");
    panel.className = "nhpl-panel";
    document.body.appendChild(panel);
    makeDraggable(panel);

    if (screen.startsWith("hotel-")) {
      loadHotelPanel(panel);
      setInterval(() => loadHotelPanel(panel), 30000);
    } else if (screen.startsWith("restaurant-")) {
      loadRestaurantPanel(panel);
      setInterval(() => loadRestaurantPanel(panel), 20000);
    } else if (screen.startsWith("master-admin")) {
      api("/api/dashboard").then(data => renderAdminPanel(panel, data));
    } else {
      renderGenericPanel(panel);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
