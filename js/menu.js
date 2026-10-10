/* Menu: items, prices and categories live in data/menu.json */
const CI={All:'ri-apps-line',Coffee:'ri-cup-line','Non-coffee':'ri-drinks-2-line',Bakes:'ri-cake-3-line',Brunch:'ri-restaurant-line'};
let menu = null;
let cat = 'All';

function drawMenu() {
  const tabs = ['All', ...menu.categories];
  $('#tabs').innerHTML = tabs.map(c =>
    `<button class="tab" aria-pressed="${c === cat}" data-c="${esc(c)}"><i class="${CI[c] || 'ri-restaurant-line'}"></i>${esc(c)}</button>`).join('');
  const items = menu.items.filter(m => cat === 'All' || m.category === cat);
  $('#mgrid').innerHTML = items.length ? items.map((m, i) => {
    const sold = m.available === false;
    const badge = sold ? 'Sold out' : m.badge;
    return `<article class="mc rv${sold ? ' sold' : ''}" style="--d:${(i % 3) * 90}ms">
      <div class="mi">${m.image ? `<img src="${esc(m.image)}" alt="${esc(m.name)}" loading="lazy">` : ''}${badge ? `<span class="bd">${esc(badge)}</span>` : ''}</div>
      <div class="mt"><h3>${esc(m.name)}</h3><i></i><span>${esc(menu.currency)}${Number(m.price).toLocaleString()}</span></div>
      <p>${esc(m.description)}</p>
    </article>`;
  }).join('') : '<p class="empty">No items in this category yet.</p>';
  watch($('#mgrid'));
}

$('#tabs').onclick = e => {
  const b = e.target.closest('[data-c]');
  if (b) { cat = b.dataset.c; drawMenu(); }
};

(async function init() {
  try {
    const res = await fetch('data/menu.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    menu = await res.json();
    drawMenu();
  } catch (err) {
    $('#mgrid').innerHTML = '<p class="empty">Could not load data/menu.json. If you opened index.html by double-clicking it, run a local server (for example VS Code Live Server) so the browser can read the file.</p>';
  }
})();
