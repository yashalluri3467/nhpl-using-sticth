document.addEventListener('DOMContentLoaded', () => {
  fetchData('getEvents', 'events-body', renderEvent);
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
      container.innerHTML = '<tr><td colspan="4">No data found.</td></tr>';
      return;
    }
    
    container.innerHTML = data.map(renderFn).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<tr><td colspan="4" style="color: #ef4444;">Failed to load data from shared database.</td></tr>';
  }
}

function renderEvent(ev) {
  const date = new Date(ev.created_at).toLocaleString();
  let color = '#9ca3af';
  if (ev.level === 'error') color = '#ef4444';
  if (ev.level === 'warn') color = '#f59e0b';
  if (ev.level === 'info') color = '#3b82f6';
  
  return `
    <tr>
      <td>#${ev.id}</td>
      <td style="color: ${color}; font-weight: 600;">${ev.level.toUpperCase()}</td>
      <td>${ev.message}</td>
      <td style="color: #9ca3af;">${date}</td>
    </tr>
  `;
}
