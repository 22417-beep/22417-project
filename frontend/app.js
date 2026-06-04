const watchesGrid = document.getElementById('watches-grid');
const detailModal = document.getElementById('detail-modal');
const addModal = document.getElementById('add-modal');
const addWatchForm = document.getElementById('add-watch-form');
const toastContainer = document.getElementById('toast-container');

let watchesData = [];
let currentWatchId = null;
let currentCardElement = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchWatches();
  document.getElementById('open-add-modal-btn').addEventListener('click', () => openModal(addModal));
  document.getElementById('close-add-btn').addEventListener('click', () => closeModal(addModal));
  document.getElementById('close-detail-btn').addEventListener('click', () => closeModal(detailModal));
  window.addEventListener('click', (e) => {
    if (e.target === detailModal) closeModal(detailModal);
    if (e.target === addModal) closeModal(addModal);
  });
  addWatchForm.addEventListener('submit', handleAddWatch);
});

async function fetchWatches() {
  try {
    const res = await fetch('/api/watches');
    if (!res.ok) throw new Error();
    watchesData = await res.json();
    renderWatches(watchesData);
  } catch {
    showToast('Greshka pri zarejdane!', true);
    watchesGrid.innerHTML = `<div class="loading"><i class="fa-solid fa-triangle-exclamation"></i><span>Nemoja da zaredi chasovnicite.</span></div>`;
  }
}

function renderWatches(watches) {
  if (!watches.length) {
    watchesGrid.innerHTML = `<div class="loading"><i class="fa-solid fa-hourglass-empty"></i><span>Nyama namereni chasovnici.</span></div>`;
    return;
  }
  watchesGrid.innerHTML = '';
  watches.forEach(watch => {
    const card = document.createElement('div');
    card.className = 'watch-card';
    card.dataset.id = watch._id;
    card.innerHTML = `
      <div class="watch-card-img-wrapper">
        <img src="${watch.imageUrl}" alt="${watch.name}" onerror="this.src='https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600'">
        <span class="watch-card-badge">${watch.brand}</span>
      </div>
      <div class="watch-card-body">
        <span class="watch-card-brand">${watch.brand}</span>
        <h3 class="watch-card-title">${watch.name}</h3>
        <p class="watch-card-price">${watch.price}</p>
      </div>`;
    card.addEventListener('click', () => showWatchDetails(watch, card));
    watchesGrid.appendChild(card);
  });
}

function openModal(modal) { modal.classList.add('active'); }
function closeModal(modal) { modal.classList.remove('active'); }

function showWatchDetails(watch, card) {
  document.getElementById('detail-image').src = watch.imageUrl;
  document.getElementById('detail-brand').textContent = watch.brand;
  document.getElementById('detail-name').textContent = watch.name;
  document.getElementById('detail-price').textContent = watch.price;
  document.getElementById('detail-desc').textContent = watch.description;
  currentWatchId = watch._id;
  currentCardElement = card;
  openModal(detailModal);
}

window.handleDetailDelete = async function handleDetailDelete() {
  if (!currentWatchId) return;
  if (!confirm('Iztrii chasovnika?')) return;

  try {
    const res = await fetch(`/api/watches/${currentWatchId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();

    closeModal(detailModal);

    if (currentCardElement) {
      currentCardElement.classList.add('removing');
      setTimeout(() => {
        currentCardElement.remove();
        watchesData = watchesData.filter(w => w._id !== currentWatchId);
        if (!watchesData.length) renderWatches([]);
        currentWatchId = null;
        currentCardElement = null;
      }, 400);
    }

    showToast('Chasovnikat e iztrit!');
  } catch {
    showToast('Greshka pri triene!', true);
  }
}

async function handleAddWatch(e) {
  e.preventDefault();
  const newWatch = {
    name: document.getElementById('watch-name').value,
    brand: document.getElementById('watch-brand').value,
    price: document.getElementById('watch-price').value,
    imageUrl: document.getElementById('watch-image').value,
    description: document.getElementById('watch-desc').value
  };

  try {
    const res = await fetch('/api/watches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWatch)
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
    const saved = await res.json();
    watchesData.push(saved);
    closeModal(addModal);
    addWatchForm.reset();
    renderWatches(watchesData);
    showToast('Chasovnikat e dobaven!');
  } catch (err) {
    showToast(err.message || 'Greshka pri dobavyane!', true);
  }
}

function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = `toast${isError ? ' toast-error' : ''}`;
  toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i><span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
