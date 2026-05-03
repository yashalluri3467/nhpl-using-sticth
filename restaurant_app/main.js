document.addEventListener('DOMContentLoaded', () => {
  fetchData('getRestaurants', 'restaurants-grid', renderRestaurant);
});

async function fetchData(action, elementId, renderFn) {
  const container = document.getElementById(elementId);
  try {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    
    if (!res.ok) throw new Error('Network error');
    
    const { data } = await res.json();
    if (!data || data.length === 0) {
      container.innerHTML = '<p>No data found.</p>';
      return;
    }
    
    container.innerHTML = data.map(renderFn).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="color: #ef4444;">Failed to load data from shared database.</p>';
  }
}

function renderRestaurant(rest) {
  let menuHtml = '';
  try {
    const menu = typeof rest.menu === 'string' ? JSON.parse(rest.menu) : rest.menu;
    if (menu && menu.length) {
      menuHtml = '<div class="menu-items">' + menu.map(m => `
        <div class="menu-item">
          <span>${m.name}</span>
          <span style="color:#f97316;">₹${m.price}</span>
        </div>
      `).join('') + '</div>';
    }
  } catch (e) {}

  return `
    <div class="card">
      <div class="card-title">${rest.name}</div>
      <div class="card-text">${rest.area} • ★ ${rest.rating}</div>
      ${menuHtml}
    </div>
  `;
}
