// ========== APP STATE ==========
let appData = {
  consultants: [],
  equipment: [],
  reading: [],
  services: [],
  videos: []
};

let currentPage = 'services';
let currentBook = null;

// ========== DOM Elements ==========
const pages = {
  consult: document.getElementById('consultPage'),
  equipment: document.getElementById('equipmentPage'),
  reading: document.getElementById('readingPage'),
  services: document.getElementById('servicesPage'),
  videos: document.getElementById('videosPage')
};

const toast = document.getElementById('toastMsg');

// ========== Helper Functions ==========
function showMessage(text, isSuccess = true) {
  toast.innerText = text;
  toast.style.opacity = '1';
  toast.style.backgroundColor = isSuccess ? '#2a7a2f' : '#1a2e15';
  setTimeout(() => toast.style.opacity = '0', 2000);
}

// ========== Load JSON Files ==========
async function loadJSON(filename) {
  try {
    const response = await fetch(`data/${filename}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
}

async function loadAllData() {
  showMessage('Loading data...', true);
  
  const [consultants, equipment, reading, services, videos] = await Promise.all([
    loadJSON('consultants.json'),
    loadJSON('equipment.json'),
    loadJSON('reading.json'),
    loadJSON('services.json'),
    loadJSON('videos.json')
  ]);
  
  appData.consultants = consultants;
  appData.equipment = equipment;
  appData.reading = reading;
  appData.services = services;
  appData.videos = videos;
  
  updateStats();
  setupFilterChips();
  renderCurrentPage();
  showMessage('Ready!', true);
}

function updateStats() {
  const statsRow = document.getElementById('statsRow');
  statsRow.innerHTML = `
    <div class="stat-item"><i class="fas fa-tractor"></i> ${appData.equipment.length} Equip</div>
    <div class="stat-item"><i class="fas fa-hand-sparkles"></i> ${appData.services.length} Services</div>
    <div class="stat-item"><i class="fas fa-chalkboard-user"></i> ${appData.consultants.length} Experts</div>
    <div class="stat-item"><i class="fas fa-video"></i> ${appData.videos.length} Videos</div>
  `;
}

function setupFilterChips() {
  // Equipment categories
  const equipChips = document.getElementById('equipFilterChips');
  const equipCategories = [...new Set(appData.equipment.map(e => e.category))];
  equipChips.innerHTML = '<button class="chip active" data-filter="all">All</button>' + 
    equipCategories.map(cat => `<button class="chip" data-filter="${cat}">${cat}</button>`).join('');
  
  // Service categories
  const serviceChips = document.getElementById('serviceFilterChips');
  const serviceCategories = [...new Set(appData.services.map(s => s.category))];
  serviceChips.innerHTML = '<button class="chip active" data-filter="all">All</button>' + 
    serviceCategories.map(cat => `<button class="chip" data-filter="${cat}">${cat}</button>`).join('');
}

// ========== RENDER CONSULTANTS ==========
function renderConsultants() {
  const grid = document.getElementById('consultantsGrid');
  if (!grid) return;
  
  if (appData.consultants.length === 0) {
    grid.innerHTML = '<div class="empty-state">👨‍🌾 No consultants found</div>';
    return;
  }
  
  grid.innerHTML = appData.consultants.map(c => `
    <div class="consult-card">
      <div class="card-header">
        <div class="card-icon"><i class="fas ${c.icon || 'fa-user-graduate'}"></i></div>
        <div class="card-title">
          <h4>${c.name}</h4>
          <div class="rating"><i class="fas fa-star"></i> ${c.rating} (${c.reviews})</div>
        </div>
        <div class="status-badge">${c.available ? '🟢 Available' : '🔴 Busy'}</div>
      </div>
      <div class="meta"><i class="fas fa-graduation-cap"></i> ${c.specialty}</div>
      <div class="meta"><i class="fas fa-clock"></i> ${c.experience}</div>
      <div class="card-actions">
        <button class="btn-outline consult-call" data-name="${c.name}" data-phone="${c.phone}"><i class="fas fa-phone-alt"></i> Call</button>
        <button class="btn-chat consult-chat" data-name="${c.name}"><i class="fab fa-whatsapp"></i> Chat</button>
        <button class="btn-primary consult-book" data-name="${c.name}">Book</button>
      </div>
    </div>
  `).join('');
  
  attachConsultantEvents();
}

function attachConsultantEvents() {
  document.querySelectorAll('.consult-call').forEach(btn => 
    btn.addEventListener('click', (e) => { e.stopPropagation(); showMessage(`📞 Calling ${btn.dataset.name}`); }));
  document.querySelectorAll('.consult-chat').forEach(btn => 
    btn.addEventListener('click', (e) => { e.stopPropagation(); showMessage(`💬 WhatsApp ${btn.dataset.name}`); }));
  document.querySelectorAll('.consult-book').forEach(btn => 
    btn.addEventListener('click', (e) => { e.stopPropagation(); showMessage(`📅 Booked ${btn.dataset.name}`); }));
}

// ========== RENDER EQUIPMENT ==========
function renderEquipment() {
  const grid = document.getElementById('equipmentGrid');
  if (!grid) return;
  
  let filtered = [...appData.equipment];
  const sort = document.getElementById('sortSelect')?.value || 'default';
  if (sort === 'price_low') filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
  if (sort === 'price_high') filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
  
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state">🚜 No equipment found</div>';
    return;
  }
  
  grid.innerHTML = filtered.map(e => `
    <div class="equip-card">
      <div class="card-header">
        <div class="card-icon"><i class="fas fa-${e.icon}"></i></div>
        <div class="card-title">
          <h4>${e.name}</h4>
          <div class="rating"><i class="fas fa-star"></i> ${e.rating} (${e.reviews})</div>
        </div>
        <div class="status-badge">${e.available ? '🟢 Available' : '🟡 Rented'}</div>
      </div>
      <div class="meta"><i class="fas fa-map-marker-alt"></i> ${e.location}</div>
      <div class="price-info">₹${e.pricePerDay}/day + ₹${e.deposit} deposit</div>
      <div class="card-actions">
        <button class="btn-outline equip-call" data-name="${e.name}"><i class="fas fa-phone-alt"></i> Call</button>
        <button class="btn-chat equip-chat" data-name="${e.name}"><i class="fab fa-whatsapp"></i> Chat</button>
        <button class="btn-primary equip-book" data-name="${e.name}" data-price="${e.pricePerDay}" data-deposit="${e.deposit}">Book</button>
      </div>
    </div>
  `).join('');
  
  attachEquipmentEvents();
}

function attachEquipmentEvents() {
  document.querySelectorAll('.equip-call').forEach(btn => 
    btn.addEventListener('click', (e) => { e.stopPropagation(); showMessage(`📞 Calling about ${btn.dataset.name}`); }));
  document.querySelectorAll('.equip-chat').forEach(btn => 
    btn.addEventListener('click', (e) => { e.stopPropagation(); showMessage(`💬 WhatsApp about ${btn.dataset.name}`); }));
  document.querySelectorAll('.equip-book').forEach(btn => 
    btn.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      currentBook = { name: btn.dataset.name, price: parseInt(btn.dataset.price), deposit: parseInt(btn.dataset.deposit) };
      openModal();
    }));
}

// ========== RENDER READING ==========
function renderReading() {
  const grid = document.getElementById('readingGrid');
  if (!grid) return;
  
  if (appData.reading.length === 0) {
    grid.innerHTML = '<div class="empty-state">📚 No articles found</div>';
    return;
  }
  
  grid.innerHTML = appData.reading.map(r => `
    <div class="read-card">
      <div class="read-icon"><i class="fas ${r.icon}"></i></div>
      <div>
        <h4>${r.title}</h4>
        <p>${r.description}</p>
        <div class="meta"><i class="fas fa-calendar"></i> ${r.date} • ${r.readTime}</div>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.read-card').forEach(card => 
    card.addEventListener('click', () => showMessage(`📖 Opening article...`)));
}

// ========== RENDER SERVICES ==========
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;
  
  if (appData.services.length === 0) {
    grid.innerHTML = '<div class="empty-state">🔧 No services found</div>';
    return;
  }
  
  grid.innerHTML = appData.services.map(s => `
    <div class="service-card">
      <div class="card-header">
        <div class="card-icon"><i class="fas fa-${s.icon}"></i></div>
        <div class="card-title">
          <h4>${s.name}</h4>
          <div class="rating"><i class="fas fa-star"></i> ${s.rating} (${s.reviews})</div>
        </div>
      </div>
      <div class="tags">${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="meta"><i class="fas fa-map-marker-alt"></i> ${s.location} | ${s.price}</div>
      <div class="card-actions">
        <button class="btn-outline service-call" data-name="${s.name}"><i class="fas fa-phone-alt"></i> Call</button>
        <button class="btn-chat service-chat" data-name="${s.name}"><i class="fab fa-whatsapp"></i> Chat</button>
        <button class="btn-primary service-request" data-name="${s.name}">Request</button>
      </div>
    </div>
  `).join('');
  
  attachServiceEvents();
}

function attachServiceEvents() {
  document.querySelectorAll('.service-call').forEach(btn => 
    btn.addEventListener('click', (e) => { e.stopPropagation(); showMessage(`📞 Calling ${btn.dataset.name}`); }));
  document.querySelectorAll('.service-chat').forEach(btn => 
    btn.addEventListener('click', (e) => { e.stopPropagation(); showMessage(`💬 WhatsApp ${btn.dataset.name}`); }));
  document.querySelectorAll('.service-request').forEach(btn => 
    btn.addEventListener('click', (e) => { e.stopPropagation(); showMessage(`✅ Request sent to ${btn.dataset.name}`); }));
}

// ========== RENDER VIDEOS ==========
function renderVideos() {
  const grid = document.getElementById('videosGrid');
  if (!grid) return;
  
  if (appData.videos.length === 0) {
    grid.innerHTML = '<div class="empty-state">🎬 No videos found</div>';
    return;
  }
  
  grid.innerHTML = appData.videos.map(v => `
    <div class="video-card">
      <div class="video-thumb"><i class="fas ${v.icon}"></i></div>
      <div>
        <h4>${v.title}</h4>
        <p>${v.description}</p>
        <div class="meta"><i class="fas fa-clock"></i> ${v.duration} • ${v.views}</div>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.video-card').forEach(card => 
    card.addEventListener('click', () => showMessage(`🎬 Playing video...`)));
}

// ========== FILTER FUNCTIONS ==========
function filterEquipment(filter, search) {
  let filtered = [...appData.equipment];
  if (filter !== 'all') filtered = filtered.filter(e => e.category === filter);
  if (search) filtered = filtered.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  
  const grid = document.getElementById('equipmentGrid');
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state">🚜 No equipment found</div>';
    return;
  }
  
  const sort = document.getElementById('sortSelect')?.value || 'default';
  if (sort === 'price_low') filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
  if (sort === 'price_high') filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
  
  grid.innerHTML = filtered.map(e => `
    <div class="equip-card">
      <div class="card-header">
        <div class="card-icon"><i class="fas fa-${e.icon}"></i></div>
        <div class="card-title">
          <h4>${e.name}</h4>
          <div class="rating"><i class="fas fa-star"></i> ${e.rating} (${e.reviews})</div>
        </div>
        <div class="status-badge">${e.available ? '🟢 Available' : '🟡 Rented'}</div>
      </div>
      <div class="meta"><i class="fas fa-map-marker-alt"></i> ${e.location}</div>
      <div class="price-info">₹${e.pricePerDay}/day + ₹${e.deposit} deposit</div>
      <div class="card-actions">
        <button class="btn-outline equip-call" data-name="${e.name}"><i class="fas fa-phone-alt"></i> Call</button>
        <button class="btn-chat equip-chat" data-name="${e.name}"><i class="fab fa-whatsapp"></i> Chat</button>
        <button class="btn-primary equip-book" data-name="${e.name}" data-price="${e.pricePerDay}" data-deposit="${e.deposit}">Book</button>
      </div>
    </div>
  `).join('');
  attachEquipmentEvents();
}

function filterServices(filter, search) {
  let filtered = [...appData.services];
  if (filter !== 'all') filtered = filtered.filter(s => s.category === filter);
  if (search) filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  
  const grid = document.getElementById('servicesGrid');
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state">🔧 No services found</div>';
    return;
  }
  
  grid.innerHTML = filtered.map(s => `
    <div class="service-card">
      <div class="card-header">
        <div class="card-icon"><i class="fas fa-${s.icon}"></i></div>
        <div class="card-title">
          <h4>${s.name}</h4>
          <div class="rating"><i class="fas fa-star"></i> ${s.rating} (${s.reviews})</div>
        </div>
      </div>
      <div class="tags">${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="meta"><i class="fas fa-map-marker-alt"></i> ${s.location} | ${s.price}</div>
      <div class="card-actions">
        <button class="btn-outline service-call" data-name="${s.name}"><i class="fas fa-phone-alt"></i> Call</button>
        <button class="btn-chat service-chat" data-name="${s.name}"><i class="fab fa-whatsapp"></i> Chat</button>
        <button class="btn-primary service-request" data-name="${s.name}">Request</button>
      </div>
    </div>
  `).join('');
  attachServiceEvents();
}

function filterConsultants(filter, search) {
  let filtered = [...appData.consultants];
  if (filter !== 'all') filtered = filtered.filter(c => c.category === filter);
  if (search) filtered = filtered.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  
  const grid = document.getElementById('consultantsGrid');
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state">👨‍🌾 No consultants found</div>';
    return;
  }
  
  grid.innerHTML = filtered.map(c => `
    <div class="consult-card">
      <div class="card-header">
        <div class="card-icon"><i class="fas ${c.icon || 'fa-user-graduate'}"></i></div>
        <div class="card-title">
          <h4>${c.name}</h4>
          <div class="rating"><i class="fas fa-star"></i> ${c.rating} (${c.reviews})</div>
        </div>
        <div class="status-badge">${c.available ? '🟢 Available' : '🔴 Busy'}</div>
      </div>
      <div class="meta"><i class="fas fa-graduation-cap"></i> ${c.specialty}</div>
      <div class="meta"><i class="fas fa-clock"></i> ${c.experience}</div>
      <div class="card-actions">
        <button class="btn-outline consult-call" data-name="${c.name}" data-phone="${c.phone}"><i class="fas fa-phone-alt"></i> Call</button>
        <button class="btn-chat consult-chat" data-name="${c.name}"><i class="fab fa-whatsapp"></i> Chat</button>
        <button class="btn-primary consult-book" data-name="${c.name}">Book</button>
      </div>
    </div>
  `).join('');
  attachConsultantEvents();
}

// ========== MODAL ==========
function openModal() {
  if (currentBook) {
    document.getElementById('modalEquipName').innerText = `Book ${currentBook.name}`;
    document.getElementById('priceBreakdown').innerHTML = `
      <strong>Price Breakdown:</strong><br>
      Rent: ₹${currentBook.price}/day<br>
      Deposit: ₹${currentBook.deposit}<br>
      <hr>
      <strong>Total: ₹${currentBook.price + currentBook.deposit}</strong>
    `;
    document.getElementById('bookingModal').classList.add('active');
  }
}

// ========== PAGE NAVIGATION ==========
function switchPage(pageId) {
  currentPage = pageId;
  Object.keys(pages).forEach(key => pages[key]?.classList.remove('active-page'));
  pages[pageId]?.classList.add('active-page');
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-page') === pageId) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  
  renderCurrentPage();
}

function renderCurrentPage() {
  switch (currentPage) {
    case 'consult': renderConsultants(); break;
    case 'equipment': renderEquipment(); break;
    case 'reading': renderReading(); break;
    case 'services': renderServices(); break;
    case 'videos': renderVideos(); break;
  }
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => 
    btn.addEventListener('click', () => switchPage(btn.getAttribute('data-page'))));
  
  document.getElementById('closeModalBtn')?.addEventListener('click', () => 
    document.getElementById('bookingModal').classList.remove('active'));
  document.getElementById('confirmBookBtn')?.addEventListener('click', () => {
    showMessage(`✅ Booking confirmed for ${currentBook?.name}`);
    document.getElementById('bookingModal').classList.remove('active');
  });
  document.getElementById('bookingModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('bookingModal')) 
      document.getElementById('bookingModal').classList.remove('active');
  });
  
  // Search inputs
  document.getElementById('consultSearch')?.addEventListener('input', (e) => {
    const filter = document.querySelector('#consultFilterChips .chip.active')?.dataset.filter || 'all';
    filterConsultants(filter, e.target.value);
  });
  document.getElementById('equipSearch')?.addEventListener('input', (e) => {
    const filter = document.querySelector('#equipFilterChips .chip.active')?.dataset.filter || 'all';
    filterEquipment(filter, e.target.value);
  });
  document.getElementById('serviceSearch')?.addEventListener('input', (e) => {
    const filter = document.querySelector('#serviceFilterChips .chip.active')?.dataset.filter || 'all';
    filterServices(filter, e.target.value);
  });
  document.getElementById('readingSearch')?.addEventListener('input', (e) => {
    const filtered = appData.reading.filter(r => r.title.toLowerCase().includes(e.target.value.toLowerCase()));
    const grid = document.getElementById('readingGrid');
    if (filtered.length === 0) grid.innerHTML = '<div class="empty-state">📚 No articles found</div>';
    else grid.innerHTML = filtered.map(r => `<div class="read-card"><div class="read-icon"><i class="fas ${r.icon}"></i></div><div><h4>${r.title}</h4><p>${r.description}</p><div class="meta"><i class="fas fa-calendar"></i> ${r.date} • ${r.readTime}</div></div></div>`).join('');
  });
  document.getElementById('videoSearch')?.addEventListener('input', (e) => {
    const filtered = appData.videos.filter(v => v.title.toLowerCase().includes(e.target.value.toLowerCase()));
    const grid = document.getElementById('videosGrid');
    if (filtered.length === 0) grid.innerHTML = '<div class="empty-state">🎬 No videos found</div>';
    else grid.innerHTML = filtered.map(v => `<div class="video-card"><div class="video-thumb"><i class="fas ${v.icon}"></i></div><div><h4>${v.title}</h4><p>${v.description}</p><div class="meta"><i class="fas fa-clock"></i> ${v.duration} • ${v.views}</div></div></div>`).join('');
  });
  document.getElementById('sortSelect')?.addEventListener('change', () => {
    const filter = document.querySelector('#equipFilterChips .chip.active')?.dataset.filter || 'all';
    const search = document.getElementById('equipSearch')?.value || '';
    filterEquipment(filter, search);
  });
  
  // Filter chips
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      const parent = e.target.parentElement;
      parent.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.dataset.filter;
      
      if (parent.id === 'equipFilterChips') {
        const search = document.getElementById('equipSearch')?.value || '';
        filterEquipment(filter, search);
      }
      if (parent.id === 'serviceFilterChips') {
        const search = document.getElementById('serviceSearch')?.value || '';
        filterServices(filter, search);
      }
      if (parent.id === 'consultFilterChips') {
        const search = document.getElementById('consultSearch')?.value || '';
        filterConsultants(filter, search);
      }
    }
  });
}

// ========== PWA INSTALL ==========
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installToast = document.getElementById('installToast');
  installToast.style.display = 'flex';
  document.getElementById('installBtn')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installToast.style.display = 'none';
    }
  });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW error:', err));
  });
}

// ========== INITIALIZE ==========
async function init() {
  setupEventListeners();
  await loadAllData();
}

init();