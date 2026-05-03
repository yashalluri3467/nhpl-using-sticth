document.addEventListener('DOMContentLoaded', () => {
  fetchData('getHotels', 'hotels-grid', renderHotel);
  fetchData('getRestaurants', 'dining-grid', renderRestaurant);
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

function renderHotel(hotel) {
  const images = hotel.images || [];
  const imgUrl = typeof images === 'string' ? JSON.parse(images)[0] : images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=60';
  
  return `
    <div class="card">
      <img src="${imgUrl}" alt="${hotel.name}">
      <div class="card-body">
        <div class="card-title">${hotel.name}</div>
        <div class="card-text">${hotel.description || hotel.address}</div>
        <div class="card-price">₹${hotel.price} / night</div>
      </div>
    </div>
  `;
}

function renderRestaurant(rest) {
  const images = rest.images || [];
  const imgUrl = typeof images === 'string' ? JSON.parse(images)[0] : images[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=60';
  
  return `
    <div class="card">
      <img src="${imgUrl}" alt="${rest.name}">
      <div class="card-body">
        <div class="card-title">${rest.name}</div>
        <div class="card-text">${rest.area} • ★ ${rest.rating}</div>
        <button class="btn-primary" style="width: 100%; margin-top: 10px;">Order Now</button>
      </div>
    </div>
  `;
}
