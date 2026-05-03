let session = JSON.parse(localStorage.getItem("apexSession") || "null");
let screens = [];
let activeScreen = localStorage.getItem("apexScreen") || "";
let authMode = "signin";

// ─── Demo account credentials (email → {password, domain}) ───
const DEMO_ACCOUNTS = {
  "admin@apex.local":   { password: "Admin--8xomIxnip-HoF1G-2026", domain: "admin"   },
  "customer@nhpl.local":{ password: "Admin--8xomIxnip-HoF1G-2026", domain: "customer"},
  "hotel@apex.local":   { password: "Admin--8xomIxnip-HoF1G-2026", domain: "hotels"  },
  "dining@apex.local":  { password: "Admin--8xomIxnip-HoF1G-2026", domain: "dining"  },
};

// ─── Toast utility ───
function showToast(message, type = "") {
  const existing = document.querySelector(".portal-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = `portal-toast${type ? " " + type : ""}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("show")));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Server returned a page instead of JSON. Restart the Node app and try again.");
  }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function setButtonLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.dataset.origText = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin .7s linear infinite;display:inline-block;">progress_activity</span> Working…`;
    btn.classList.add("loading");
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.origText || btn.innerHTML;
    btn.classList.remove("loading");
    btn.disabled = false;
  }
}

function showApp() {
  const loginViewEl = document.querySelector("#loginView");
  const appViewEl = document.querySelector("#appView");
  const screenFrameEl = document.querySelector("#screenFrame");
  const accountsViewEl = document.querySelector("#accountsView");
  const hotelSetupViewEl = document.querySelector("#hotelSetupView");
  
  if (loginViewEl) loginViewEl.classList.add("hidden");
  if (appViewEl) appViewEl.classList.remove("hidden");
  if (screenFrameEl) screenFrameEl.classList.remove("hidden");
  if (accountsViewEl) accountsViewEl.classList.add("hidden");
  if (hotelSetupViewEl) hotelSetupViewEl.classList.add("hidden");
}

function showLogin() {
  const appViewEl = document.querySelector("#appView");
  const loginViewEl = document.querySelector("#loginView");
  
  if (appViewEl) appViewEl.classList.add("hidden");
  if (loginViewEl) loginViewEl.classList.remove("hidden");
}

function renderUser() {
  if (!session) return;
  const userNameEl = document.querySelector("#userName");
  const userRoleEl = document.querySelector("#userRole");
  const userAvatarImg = document.querySelector("#userAvatarImg");
  const accountsBtnEl = document.querySelector("#accountsBtn");
  const hotelSetupBtnEl = document.querySelector("#hotelSetupBtn");
  
  if (userNameEl) userNameEl.textContent = session.name;
  if (userRoleEl) userRoleEl.textContent = session.role;
  
  // Load saved avatar if exists
  if (userAvatarImg && session.avatar) {
    userAvatarImg.src = session.avatar;
  } else if (userAvatarImg) {
    userAvatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.name)}&background=3F49C1&color=fff`;
  }

  // Admin button visibility - strictly based on role/domain
  const isAdmin = session.default_domain === "admin" || session.role === "admin";
  const isHotelAdmin = session.default_domain === "hotels";

  if (accountsBtnEl) {
    accountsBtnEl.classList.toggle("hidden", !isAdmin);
  }
  if (hotelSetupBtnEl) {
    hotelSetupBtnEl.classList.toggle("hidden", !isHotelAdmin);
  }
}

// ─── Profile & Settings ───
document.querySelector("#avatarUpload")?.addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const base64 = event.target.result;
    session.avatar = base64;
    localStorage.setItem("apexSession", JSON.stringify(session));
    renderUser();
    showToast("Profile photo updated!", "success");
  };
  reader.readAsDataURL(file);
});

document.querySelector("#settingsBtn")?.addEventListener("click", () => {
  showToast("System settings are managed via Global Control Plane.", "info");
});

function openScreen(slug) {
  activeScreen = slug;
  localStorage.setItem("apexScreen", slug);
  
  const accountsViewEl = document.querySelector("#accountsView");
  const hotelSetupViewEl = document.querySelector("#hotelSetupView");
  const frame = document.querySelector("#screenFrame");
  const accountsBtnEl = document.querySelector("#accountsBtn");
  const hotelSetupBtnEl = document.querySelector("#hotelSetupBtn");
  
  if (accountsViewEl) accountsViewEl.classList.add("hidden");
  if (hotelSetupViewEl) hotelSetupViewEl.classList.add("hidden");
  
  if (frame) {
    frame.classList.remove("hidden");
    frame.classList.add("loading");
    frame.src = `/screens/${slug}`;
    frame.onload = () => frame.classList.remove("loading");
  }
  
  if (accountsBtnEl) accountsBtnEl.classList.remove("active");
  if (hotelSetupBtnEl) hotelSetupBtnEl.classList.remove("active");
  
  renderTabs();
}

function renderTabs() {
  const screenTabsEl = document.querySelector("#screenTabs");
  if (screenTabsEl) {
    screenTabsEl.innerHTML = screens.map((screen) => `
      <button class="${screen.slug === activeScreen ? "active" : ""}" data-screen="${screen.slug}">
        ${screen.name}
      </button>
    `).join("");
    document.querySelectorAll("[data-screen]").forEach((button) => {
      button.addEventListener("click", () => openScreen(button.dataset.screen));
    });
  }
}

async function loadScreens() {
  const data = await api(`/api/screens?domain=${session.default_domain}`);
  screens = data.screens;
  if (!screens.some((screen) => screen.slug === activeScreen)) {
    activeScreen = screens[0]?.slug || "";
  }
  renderUser();
  renderTabs();
  if (activeScreen) openScreen(activeScreen);
}

function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  const creating = mode === "create";
  document.querySelectorAll(".create-only").forEach((item) => item.classList.toggle("hidden", !creating));
  toggleHotelCreateFields();
  document.querySelector("#authSubmit span:first-child").textContent = creating ? "Create account" : "Sign in to account";
  document.querySelector("#loginMessage").textContent = "";
  document.querySelector("#loginMessage").classList.remove("success");
  // Update hero text
  const h2 = document.querySelector(".auth-form h2");
  const subp = document.querySelector(".auth-form > form > div > p");
  if (h2) h2.textContent = creating ? "Create account" : "Welcome back";
  if (subp) subp.textContent = creating ? "Fill in the details below to get started." : "Please enter your credentials to access your portal.";
}

function toggleHotelCreateFields() {
  const show = authMode === "create" && document.querySelector("#domainInput").value === "hotels";
  document.querySelectorAll(".hotel-create-only").forEach((item) => item.classList.toggle("hidden", !show));
}

function accountStatusClass(status) {
  if (status === "active") return "status-active";
  if (status === "pending") return "status-pending";
  return "status-disabled";
}

async function loadAccounts() {
  const message = document.querySelector("#accountsMessage");
  message.textContent = "";
  try {
    const data = await api("/api/accounts");
    document.querySelector("#accountsList").innerHTML = data.accounts.map((account) => `
      <article class="account-row">
        <div>
          <strong>${account.name}</strong>
          <small>${account.email} — ${account.domain_label}${account.hotel_name ? ` — ${account.hotel_name}` : ""}</small>
        </div>
        <div>${account.role}</div>
        <span class="status-pill ${accountStatusClass(account.status)}">${account.status}</span>
        <div class="account-actions">
          <button class="primary" type="button" data-account-action="active" data-account-id="${account.id}">Activate</button>
          <button type="button" data-account-action="disabled" data-account-id="${account.id}">Disable</button>
          <button class="danger" type="button" data-account-delete="${account.id}">Delete</button>
        </div>
      </article>
    `).join("");
    document.querySelectorAll("[data-account-action]").forEach((button) => {
      button.addEventListener("click", async () => {
        const original = button.textContent;
        button.textContent = "…";
        button.disabled = true;
        try {
          await api("/api/accounts/status", {
            method: "POST",
            body: JSON.stringify({
              user_id: button.dataset.accountId,
              status: button.dataset.accountAction,
            }),
          });
          showToast("Account status updated.", "success");
          await loadAccounts();
        } catch (error) {
          message.textContent = error.message;
          button.textContent = original;
          button.disabled = false;
        }
      });
    });
    document.querySelectorAll("[data-account-delete]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this account? This cannot be undone.")) return;
        const original = button.textContent;
        button.textContent = "…";
        button.disabled = true;
        try {
          await api(`/api/accounts/${button.dataset.accountDelete}`, { method: "DELETE" });
          showToast("Account deleted.", "warning");
          await loadAccounts();
        } catch (error) {
          message.textContent = error.message;
          button.textContent = original;
          button.disabled = false;
        }
      });
    });
  } catch (error) {
    message.textContent = error.message;
  }
}

function sessionQuery() {
  return `user_id=${encodeURIComponent(session?.id || "")}`;
}

async function fileToDataUrl(file) {
  if (!file) return "";
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function roomImage(room) {
  return room.image_url
    ? `<img class="setup-room-img" src="${room.image_url}" alt="Room ${room.room_no}">`
    : `<div class="setup-room-placeholder"><span class="material-symbols-outlined">bed</span></div>`;
}

async function loadHotelSetup() {
  const message = document.querySelector("#hotelSetupMessage");
  message.textContent = "";
  try {
    const data = await api(`/api/hotel/profile?${sessionQuery()}`);
    const hotel = data.hotel || {};
    const rooms = data.hotelData?.rooms || [];
    const tickets = data.services?.tickets || [];
    const roomOptions = (data.roomTypes || []).map((type) => `<option>${type}</option>`).join("");
    document.querySelector("#hotelSetupContent").innerHTML = `
      <form id="hotelProfileForm" class="setup-card">
        <h3>Hotel Profile</h3>
        ${hotel.cover_image ? `<img class="setup-cover" src="${hotel.cover_image}" alt="${hotel.name || "Hotel"}">` : ""}
        <label>Hotel name</label>
        <input name="name" value="${hotel.name || ""}" required>
        <label>Address</label>
        <input name="address" value="${hotel.address || ""}" placeholder="Hotel location">
        <label>Phone</label>
        <input name="phone" value="${hotel.phone || ""}" placeholder="Front desk phone">
        <label>Description</label>
        <textarea name="description" rows="3" placeholder="Short hotel profile">${hotel.description || ""}</textarea>
        <label>Upload hotel photo</label>
        <input name="cover_file" type="file" accept="image/*">
        <button class="primary-action" type="submit"><span>Save hotel profile</span><span class="material-symbols-outlined">save</span></button>
      </form>

      <form id="roomForm" class="setup-card">
        <h3>Add Room</h3>
        <label>Room number / name</label>
        <input name="room_no" placeholder="101, Cottage A, Suite 2" required>
        <label>Room type</label>
        <select name="room_type" id="roomTypeSelect">${roomOptions}</select>
        <input id="manualRoomType" class="hidden" name="manual_room_type" placeholder="Manual room type">
        <label>Floor / section</label>
        <input name="floor" placeholder="1, 2, Garden Wing">
        <label>Rate</label>
        <input name="rate" type="number" min="0" step="1" placeholder="5000" required>
        <label>Upload room photo</label>
        <input name="room_file" type="file" accept="image/*">
        <label>Room info</label>
        <textarea name="description" rows="3" placeholder="Beds, view, amenities"></textarea>
        <button class="primary-action" type="submit"><span>Add room</span><span class="material-symbols-outlined">add</span></button>
      </form>

      <form id="employeeForm" class="setup-card">
        <h3>Create Employee Login</h3>
        <label>Employee name</label>
        <input name="name" required>
        <label>Email</label>
        <input name="email" type="email" required>
        <label>Password</label>
        <input name="password" type="password" autocomplete="new-password" required>
        <label>Role</label>
        <select name="hotel_role">
          <option>Front Desk</option>
          <option>Housekeeping</option>
          <option>Maintenance</option>
          <option>Manager</option>
          <option>Owner Assistant</option>
        </select>
        <button class="primary-action" type="submit"><span>Create credentials</span><span class="material-symbols-outlined">person_add</span></button>
      </form>

      <form id="queueForm" class="setup-card">
        <h3>Add Queue Item</h3>
        <label>Room</label>
        <select name="room_id" required>
          ${rooms.length
            ? rooms.map((room) => `<option value="${room.id}">Room ${room.room_no} - ${room.room_type}</option>`).join("")
            : `<option value="">No rooms added yet</option>`}
        </select>
        <label>Service type</label>
        <select name="service_type">
          <option>Housekeeping</option>
          <option>F&B</option>
          <option>Maintenance</option>
          <option>Laundry</option>
          <option>Concierge</option>
        </select>
        <label>Queue details</label>
        <input name="title" placeholder="Extra towels, AC service, dinner order" required>
        <label>SLA minutes</label>
        <input name="sla_minutes" type="number" min="1" value="15" required>
        <button class="primary-action" type="submit" ${rooms.length ? "" : "disabled"}><span>Add queue</span><span class="material-symbols-outlined">playlist_add</span></button>
      </form>

      <section class="setup-card setup-wide">
        <h3>Rooms In This Hotel</h3>
        <div class="setup-room-grid">
          ${rooms.map((room) => `
            <article class="setup-room">
              ${roomImage(room)}
              <strong>${room.room_no}</strong>
              <small>${room.room_type} — Floor ${room.floor || "1"} — ₹${Number(room.rate).toLocaleString("en-IN")}</small>
              <p>${room.description || "No room notes yet."}</p>
            </article>
          `).join("") || `<p style="color:var(--muted);font-size:13px;">No rooms added yet. Add your first room above.</p>`}
        </div>
      </section>

      <section class="setup-card">
        <h3>Employee Credentials</h3>
        ${(data.employees || []).length
          ? (data.employees || []).map((employee) => `
              <div class="mini-row">
                <strong>${employee.name}</strong>
                <small>${employee.email} — ${employee.hotel_role || employee.role} — ${employee.status}</small>
              </div>
            `).join("")
          : `<p style="color:var(--muted);font-size:13px;">No employees added yet.</p>`}
      </section>

      <section class="setup-card">
        <h3>Service Queue</h3>
        ${tickets.length
          ? tickets.map((ticket) => `
              <div class="mini-row">
                <strong>Room ${ticket.room_no || "—"} — ${ticket.service_type}</strong>
                <small>${ticket.title} — ${ticket.status} — ${ticket.timer || ""}</small>
              </div>
            `).join("")
          : `<p style="color:var(--muted);font-size:13px;">No queue items yet.</p>`}
      </section>
    `;

    document.querySelector("#roomTypeSelect").addEventListener("change", (event) => {
      document.querySelector("#manualRoomType").classList.toggle("hidden", event.target.value !== "Manual Entry");
    });
    document.querySelector("#hotelProfileForm").addEventListener("submit", submitHotelProfile);
    document.querySelector("#roomForm").addEventListener("submit", submitRoom);
    document.querySelector("#employeeForm").addEventListener("submit", submitEmployee);
    document.querySelector("#queueForm").addEventListener("submit", submitQueue);
  } catch (error) {
    message.textContent = error.message;
    showToast(error.message, "error");
  }
}

async function submitHotelProfile(event) {
  event.preventDefault();
  const btn = event.currentTarget.querySelector("button[type=submit]");
  setButtonLoading(btn, true);
  try {
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.user_id = session.id;
    payload.cover_image = await fileToDataUrl(form.cover_file.files[0]);
    if (!payload.cover_image) delete payload.cover_image;
    await api("/api/hotel/profile", { method: "POST", body: JSON.stringify(payload) });
    showToast("Hotel profile saved.", "success");
    await loadHotelSetup();
  } catch (err) {
    showToast(err.message, "error");
    setButtonLoading(btn, false);
  }
}

async function submitRoom(event) {
  event.preventDefault();
  const btn = event.currentTarget.querySelector("button[type=submit]");
  setButtonLoading(btn, true);
  try {
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.user_id = session.id;
    payload.image_url = await fileToDataUrl(form.room_file.files[0]);
    await api("/api/hotel/rooms", { method: "POST", body: JSON.stringify(payload) });
    showToast("Room added successfully.", "success");
    await loadHotelSetup();
  } catch (err) {
    showToast(err.message, "error");
    setButtonLoading(btn, false);
  }
}

async function submitEmployee(event) {
  event.preventDefault();
  const btn = event.currentTarget.querySelector("button[type=submit]");
  setButtonLoading(btn, true);
  try {
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    payload.user_id = session.id;
    await api("/api/hotel/employees", { method: "POST", body: JSON.stringify(payload) });
    showToast("Employee credentials created.", "success");
    await loadHotelSetup();
  } catch (err) {
    showToast(err.message, "error");
    setButtonLoading(btn, false);
  }
}

async function submitQueue(event) {
  event.preventDefault();
  const btn = event.currentTarget.querySelector("button[type=submit]");
  setButtonLoading(btn, true);
  try {
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    payload.user_id = session.id;
    await api("/api/hotel/services", { method: "POST", body: JSON.stringify(payload) });
    showToast("Queue item added.", "success");
    await loadHotelSetup();
  } catch (err) {
    showToast(err.message, "error");
    setButtonLoading(btn, false);
  }
}

async function showHotelSetup() {
  if (session?.default_domain !== "hotels") return;
  document.querySelector("#screenFrame").classList.add("hidden");
  document.querySelector("#accountsView").classList.add("hidden");
  document.querySelector("#hotelSetupView").classList.remove("hidden");
  document.querySelector("#hotelSetupBtn").classList.add("active");
  await loadHotelSetup();
}

async function showAccounts() {
  if (session?.default_domain !== "admin") return;
  document.querySelector("#screenFrame").classList.add("hidden");
  document.querySelector("#accountsView").classList.remove("hidden");
  document.querySelector("#accountsBtn").classList.add("active");
  await loadAccounts();
}

// ─── Login form ───
document.querySelector("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.querySelector("#loginMessage");
  message.textContent = "";
  message.classList.remove("success");
  const btn = document.querySelector("#authSubmit");
  setButtonLoading(btn, true);
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  try {
    if (authMode === "create") {
      const data = await api("/api/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      message.textContent = data.message;
      message.classList.add("success");
      if (data.user) {
        session = data.user;
        localStorage.setItem("apexSession", JSON.stringify(session));
        localStorage.removeItem("apexScreen");
        activeScreen = "";
        showApp();
        await loadScreens();
      } else {
        setButtonLoading(btn, false);
      }
      return;
    }
    const data = await api("/api/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    session = data.user;
    localStorage.setItem("apexSession", JSON.stringify(session));
    localStorage.removeItem("apexScreen");
    activeScreen = "";
    showApp();
    showToast(`Welcome back, ${session.name}!`, "success");
    try {
      await loadScreens();
    } catch (screenError) {
      console.error("Screen loading error:", screenError);
      message.textContent = "App loaded but screens couldn't load: " + screenError.message;
      setButtonLoading(btn, false);
    }
  } catch (error) {
    message.textContent = error.message;
    setButtonLoading(btn, false);
  }
});

// ─── Auth tabs ───
document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => setAuthMode(button.dataset.mode));
});

// ─── Domain change ───
document.querySelector("#domainInput").addEventListener("change", () => toggleHotelCreateFields());

// ─── Logout ───
document.querySelector("#logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("apexSession");
  localStorage.removeItem("apexScreen");
  session = null;
  screens = [];
  activeScreen = "";
  document.querySelector("#screenFrame").src = "about:blank";
  showLogin();
  showToast("Signed out successfully.");
});

document.querySelector("#accountsBtn").addEventListener("click", showAccounts);
document.querySelector("#hotelSetupBtn").addEventListener("click", showHotelSetup);

document.querySelector("#closeAccountsBtn").addEventListener("click", () => {
  document.querySelector("#accountsView").classList.add("hidden");
  document.querySelector("#screenFrame").classList.remove("hidden");
  document.querySelector("#accountsBtn").classList.remove("active");
});

document.querySelector("#closeHotelSetupBtn").addEventListener("click", () => {
  document.querySelector("#hotelSetupView").classList.add("hidden");
  document.querySelector("#screenFrame").classList.remove("hidden");
  document.querySelector("#hotelSetupBtn").classList.remove("active");
});

// ─── Clickable demo accounts ───
document.querySelectorAll(".demo-accounts span").forEach((span) => {
  const email = span.textContent.trim();
  span.title = `Click to auto-fill ${email}`;
  span.addEventListener("click", () => {
    const creds = DEMO_ACCOUNTS[email];
    if (!creds) return;
    document.querySelector("#emailInput").value = email;
    document.querySelector("#passwordInput").value = creds.password;
    document.querySelector("#domainInput").value = creds.domain;
    setAuthMode("signin");
    showToast(`Credentials filled for ${email}`);
    document.querySelector("#domainInput").dispatchEvent(new Event("change"));
  });
});

// ─── Init ───
setAuthMode("signin");

async function boot() {
  if (session && session.id) {
    // Session exists - restore app
    renderUser();
    showApp();
    try {
      await loadScreens();
      if (activeScreen) {
        openScreen(activeScreen);
      }
    } catch (e) {
      console.error("Boot error:", e);
      showLogin();
    }
  } else {
    // No session - show login
    showLogin();
  }
}

boot();
