/**
 * CollegeXchange Vanilla JavaScript Frontend Application
 * Communicates with Express REST API endpoints (/api/listings, /api/categories, etc.)
 */

// Global State
const STATE = {
  demoUser: {
    id: 'usr_001',
    name: 'Aarav Sharma',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    hostel: 'Hostel B'
  },
  currentView: 'marketplace', // 'marketplace' | 'dashboard'
  categories: [],
  listings: [],
  favorites: [],
  favoritesMap: {},
  messages: [],
  searchQuery: '',
  selectedCategory: '',
  selectedCondition: '',
  selectedSort: 'newest',
  selectedListingType: '',
  selectedListing: null,
  contactingListing: null,
  sellStep: 1,
  sellData: {
    title: '',
    category_id: '',
    category_name: '',
    description: '',
    price: '',
    rent_price: '',
    condition: 'GOOD',
    location: 'Library Block',
    images: ['/uploads/sample_product.svg']
  }
};

// API Fetch Helper
async function api(endpoint, options = {}) {
  try {
    const res = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-demo-user-id': STATE.demoUser.id,
        ...options.headers
      },
      ...options
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || `HTTP error ${res.status}`);
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

// Toast System
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Application Initialization
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await fetchCategories();
  await fetchFavorites();
  await fetchMessages();
  await fetchListings();
});

// Setup Event Listeners
function setupEventListeners() {
  // Brand Logo Click
  document.getElementById('navBrand').addEventListener('click', () => switchView('marketplace'));
  document.getElementById('btnNavMarketplace').addEventListener('click', () => switchView('marketplace'));
  document.getElementById('btnNavDashboard').addEventListener('click', () => switchView('dashboard'));
  document.getElementById('btnNavSell').addEventListener('click', openSellModal);

  // Search & Filters
  document.getElementById('searchInput').addEventListener('input', (e) => {
    STATE.searchQuery = e.target.value;
    fetchListings();
  });

  const filterTypeEl = document.getElementById('filterListingType');
  if (filterTypeEl) {
    filterTypeEl.addEventListener('change', (e) => {
      STATE.selectedListingType = e.target.value;
      fetchListings();
    });
  }

  const sortEl = document.getElementById('selectSort');
  if (sortEl) {
    sortEl.addEventListener('change', (e) => {
      STATE.selectedSort = e.target.value;
      fetchListings();
    });
  }

  const contactTypeEl = document.getElementById('contactDealType');
  if (contactTypeEl) {
    contactTypeEl.addEventListener('change', (e) => {
      if (!STATE.contactingListing) return;
      const mode = e.target.value;
      const seller = STATE.contactingListing.seller_name;
      const title = STATE.contactingListing.title;
      if (mode === 'RENT') {
        const rentAmt = STATE.contactingListing.rent_price ? `₹${STATE.contactingListing.rent_price}/mo` : '';
        document.getElementById('contactMessageContent').value = `Hi ${seller}! Is the "${title}" available for rent (${rentAmt})? I would like to rent it on a monthly basis.`;
      } else {
        const buyAmt = STATE.contactingListing.price ? `₹${STATE.contactingListing.price}` : '';
        document.getElementById('contactMessageContent').value = `Hi ${seller}! Is the "${title}" still available (${buyAmt})? I am interested in buying it.`;
      }
    });
  }

  // Modal Close Buttons
  document.getElementById('btnCloseDetail').addEventListener('click', closeDetailModal);
  document.getElementById('btnCloseSell').addEventListener('click', closeSellModal);
  document.getElementById('btnCloseContact').addEventListener('click', closeContactModal);
  document.getElementById('btnCancelContact').addEventListener('click', closeContactModal);

  // Sell Modal Controls
  document.getElementById('btnSellNext').addEventListener('click', handleSellNext);
  document.getElementById('btnSellBack').addEventListener('click', handleSellBack);

  // Dashboard Tabs
  document.getElementById('tabMyListings').addEventListener('click', () => switchDashTab('listings'));
  document.getElementById('tabSavedItems').addEventListener('click', () => switchDashTab('favorites'));
  document.getElementById('tabMessages').addEventListener('click', () => switchDashTab('messages'));

  // Send Message Trigger
  document.getElementById('btnSendContact').addEventListener('click', handleSendContactMessage);
}

// Navigation View Switcher
function switchView(viewName) {
  STATE.currentView = viewName;
  const viewMarketplace = document.getElementById('viewMarketplace');
  const viewDashboard = document.getElementById('viewDashboard');
  const btnNavMarketplace = document.getElementById('btnNavMarketplace');
  const btnNavDashboard = document.getElementById('btnNavDashboard');

  if (viewName === 'marketplace') {
    viewMarketplace.style.display = 'block';
    viewDashboard.style.display = 'none';
    btnNavMarketplace.className = 'btn btn-sm btn-primary';
    btnNavDashboard.className = 'btn btn-sm btn-outline';
  } else {
    viewMarketplace.style.display = 'none';
    viewDashboard.style.display = 'block';
    btnNavMarketplace.className = 'btn btn-sm btn-outline';
    btnNavDashboard.className = 'btn btn-sm btn-primary';
    renderDashboard();
  }
}

// Data Fetchers
async function fetchCategories() {
  try {
    const res = await api('/categories');
    if (res.data) {
      STATE.categories = res.data;
      renderCategoryTabStrip();
    }
  } catch (err) {
    showToast('Error loading categories');
  }
}

async function fetchFavorites() {
  try {
    const res = await api(`/favorites?student_id=${STATE.demoUser.id}`);
    if (res.data) {
      STATE.favorites = res.data;
      STATE.favoritesMap = {};
      res.data.forEach(f => {
        if (f.listing_id) STATE.favoritesMap[f.listing_id] = f.id;
      });
      updateFavBadge();
    }
  } catch (err) {
    console.error('Error fetching favorites:', err);
  }
}

async function fetchMessages() {
  try {
    const res = await api(`/messages?user_id=${STATE.demoUser.id}`);
    if (res.data) STATE.messages = res.data;
  } catch (err) {
    console.error('Error fetching messages:', err);
  }
}

async function fetchListings() {
  try {
    const params = new URLSearchParams();
    if (STATE.searchQuery) params.append('search', STATE.searchQuery);
    if (STATE.selectedCategory) params.append('category', STATE.selectedCategory);
    if (STATE.selectedCondition) params.append('condition', STATE.selectedCondition);
    if (STATE.selectedSort) params.append('sort', STATE.selectedSort);
    if (STATE.selectedListingType) params.append('listing_type', STATE.selectedListingType);

    const res = await api(`/listings?${params.toString()}`);
    if (res.data) {
      STATE.listings = res.data;
      renderProductGrid();
      document.getElementById('resultsCount').innerHTML = `Showing <strong>${res.data.length}</strong> campus items`;
    }
  } catch (err) {
    showToast('Error fetching listings');
  }
}

// UI Renderers
function renderCategoryTabStrip() {
  const container = document.getElementById('categoryTabStrip');
  let html = `<button class="category-tab ${STATE.selectedCategory === '' ? 'active' : ''}" onclick="selectCategory('')">All Items</button>`;
  
  STATE.categories.forEach(cat => {
    const active = STATE.selectedCategory === cat.slug ? 'active' : '';
    html += `<button class="category-tab ${active}" onclick="selectCategory('${cat.slug}')">${cat.name}</button>`;
  });
  
  container.innerHTML = html;
}

window.selectCategory = function(slug) {
  STATE.selectedCategory = slug;
  renderCategoryTabStrip();
  fetchListings();
};

function renderProductGrid() {
  const container = document.getElementById('productGrid');
  if (STATE.listings.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3 class="empty-state-title">No listings found</h3>
        <p class="empty-state-subtitle">Try adjusting your search query, clearing filters, or choosing a different category.</p>
      </div>`;
    return;
  }

  container.innerHTML = STATE.listings.map(item => {
    const isSold = item.status === 'SOLD';
    const isOwn = item.seller_id === STATE.demoUser.id;
    const isFav = !!STATE.favoritesMap[item.id];
    const rawImg = item.images && item.images.length > 0 ? item.images[0] : '/uploads/sample_product.svg';
    const imageUrl = rawImg.replace('.jpg', '.svg');

    const hasBuy = item.price && Number(item.price) > 0;
    const hasRent = item.rent_price && Number(item.rent_price) > 0;

    let priceFormatted = '';
    let typeTag = '';

    if (hasBuy && hasRent) {
      priceFormatted = `<div>₹${item.price} <span style="font-size:0.75rem; color:#1E40AF; font-weight:700; display:block;">Rent: ₹${item.rent_price}/mo</span></div>`;
      typeTag = `<span class="condition-badge" style="position:static; background:#3B82F6;">BUY & RENT</span>`;
    } else if (hasRent) {
      priceFormatted = `<span style="color:#1E40AF;">₹${item.rent_price}/mo</span>`;
      typeTag = `<span class="condition-badge" style="position:static; background:#1D4ED8;">FOR RENT</span>`;
    } else {
      priceFormatted = `₹${item.price || 0}`;
      typeTag = `<span class="condition-badge" style="position:static; background:#0F5132;">FOR SALE</span>`;
    }

    return `
      <div class="product-card" onclick="openDetailModal('${item.id}')">
        <div class="product-card-image-wrapper">
          <img src="${imageUrl}" alt="${item.title}" class="product-card-image" onerror="this.src='/uploads/sample_product.svg'">
          <span class="condition-badge">${item.condition}</span>
          ${isSold ? '<div class="sold-overlay">SOLD</div>' : ''}
        </div>
        <div class="product-card-body">
          <div class="product-card-header">
            <h3 class="product-card-title">${item.title}</h3>
            <div class="product-card-price">${priceFormatted}</div>
          </div>
          <div style="display:flex; gap:6px; margin-bottom: 8px;">
            ${typeTag}
          </div>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
            ${item.location || 'Campus'} • ${item.category_name}
          </p>
          <div class="product-card-meta">
            <span>Seller: ${isOwn ? 'You' : item.seller_name}</span>
            ${!isOwn ? `
              <button class="btn btn-sm ${isFav ? 'btn-primary' : 'btn-outline'}" style="padding:2px 8px; font-size:0.72rem;" onclick="toggleFavorite(event, '${item.id}')">
                ${isFav ? 'Saved' : 'Save'}
              </button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Favorite Action
window.toggleFavorite = async function(event, listingId) {
  if (event) event.stopPropagation();
  const existingFavId = STATE.favoritesMap[listingId];
  try {
    if (existingFavId) {
      await api(`/favorites/${existingFavId}`, { method: 'DELETE' });
      showToast('Item removed from saved favorites');
    } else {
      await api('/favorites', {
        method: 'POST',
        body: JSON.stringify({ listing_id: listingId, student_id: STATE.demoUser.id })
      });
      showToast('Item saved to your favorites');
    }
    await fetchFavorites();
    renderProductGrid();
    if (STATE.currentView === 'dashboard') renderDashboard();
  } catch (err) {
    showToast('Failed to update favorite');
  }
};

function updateFavBadge() {
  const badge = document.getElementById('favCountBadge');
  const count = STATE.favorites.length;
  if (count > 0) {
    badge.innerText = `(${count})`;
    badge.style.display = 'inline';
  } else {
    badge.style.display = 'none';
  }
}

// Product Detail Modal
window.openDetailModal = function(id) {
  const listing = STATE.listings.find(l => l.id === id);
  if (!listing) return;

  STATE.selectedListing = listing;
  const isOwn = listing.seller_id === STATE.demoUser.id;
  const isSold = listing.status === 'SOLD';
  const isFav = !!STATE.favoritesMap[listing.id];
  const rawImg = listing.images && listing.images.length > 0 ? listing.images[0] : '/uploads/sample_product.svg';

  const hasBuy = listing.price && Number(listing.price) > 0;
  const hasRent = listing.rent_price && Number(listing.rent_price) > 0;

  document.getElementById('detailCategoryLocation').innerText = `${listing.category_name} • ${listing.location}`;
  document.getElementById('detailTitle').innerText = listing.title;

  const priceEl = document.getElementById('detailPrice');
  const rentPriceEl = document.getElementById('detailRentPrice');
  const typeBadgeEl = document.getElementById('detailListingTypeBadge');

  if (hasBuy) {
    priceEl.innerText = `₹${listing.price} (Full Purchase)`;
    priceEl.style.display = 'block';
  } else {
    priceEl.style.display = 'none';
  }

  if (hasRent) {
    rentPriceEl.innerText = `₹${listing.rent_price} / month (Monthly Rent)`;
    rentPriceEl.style.display = 'block';
  } else {
    rentPriceEl.style.display = 'none';
  }

  if (hasBuy && hasRent) {
    typeBadgeEl.innerText = 'BUY & RENT AVAILABLE';
    typeBadgeEl.style.background = '#3B82F6';
  } else if (hasRent) {
    typeBadgeEl.innerText = 'MONTHLY RENT ONLY';
    typeBadgeEl.style.background = '#1D4ED8';
  } else {
    typeBadgeEl.innerText = 'FOR SALE ONLY';
    typeBadgeEl.style.background = '#0F5132';
  }

  document.getElementById('detailCondition').innerText = `${listing.condition} CONDITION`;
  document.getElementById('detailStatus').innerText = listing.status;
  document.getElementById('detailStatus').style.background = isSold ? 'var(--brand-sold)' : 'var(--brand-accent)';
  document.getElementById('detailDescription').innerText = listing.description || 'No detailed description provided.';
  document.getElementById('detailSellerName').innerText = listing.seller_name;
  document.getElementById('detailSellerLocation').innerText = `Location: ${listing.location || 'Campus'}`;
  document.getElementById('detailImage').src = rawImg.replace('.jpg', '.svg');

  const actionsContainer = document.getElementById('detailActions');
  let buttonsHtml = '';

  if (!isOwn && !isSold) {
    buttonsHtml += `
      <button class="btn btn-primary" onclick="triggerContactModal()">Contact Seller (${listing.seller_name})</button>
      <button class="btn ${isFav ? 'btn-secondary' : 'btn-outline'}" onclick="toggleFavorite(null, '${listing.id}')">
        ${isFav ? 'Remove from Saved' : 'Save Item'}
      </button>
    `;
  }

  if (isOwn) {
    buttonsHtml += `
      ${isSold 
        ? `<button class="btn btn-secondary" onclick="markListingActive('${listing.id}')">Mark as ACTIVE</button>` 
        : `<button class="btn btn-secondary" onclick="markListingSold('${listing.id}')">Mark as SOLD</button>`}
      <button class="btn btn-danger" onclick="deleteListing('${listing.id}')">Delete Listing</button>
    `;
  }

  actionsContainer.innerHTML = buttonsHtml;
  document.getElementById('modalProductDetail').style.display = 'flex';
};

function closeDetailModal() {
  document.getElementById('modalProductDetail').style.display = 'none';
  STATE.selectedListing = null;
}

// Listing Seller Actions
window.markListingSold = async function(id) {
  try {
    await api(`/listings/${id}/sold`, { method: 'PATCH' });
    showToast('Listing marked as SOLD');
    closeDetailModal();
    fetchListings();
    if (STATE.currentView === 'dashboard') renderDashboard();
  } catch (err) {
    showToast('Failed to mark listing as sold');
  }
};

window.markListingActive = async function(id) {
  try {
    await api(`/listings/${id}/active`, { method: 'PATCH' });
    showToast('Listing marked back as ACTIVE');
    closeDetailModal();
    fetchListings();
    if (STATE.currentView === 'dashboard') renderDashboard();
  } catch (err) {
    showToast('Failed to mark listing as active');
  }
};

window.deleteListing = async function(id) {
  try {
    await api(`/listings/${id}`, { method: 'DELETE' });
    showToast('Listing deleted');
    closeDetailModal();
    fetchListings();
    if (STATE.currentView === 'dashboard') renderDashboard();
  } catch (err) {
    showToast('Failed to delete listing');
  }
};

// Sell Item Progressive Modal (4-step)
function openSellModal() {
  STATE.sellStep = 1;
  STATE.sellData = {
    title: '',
    category_id: STATE.categories[0]?.id || 'cat_001',
    category_name: STATE.categories[0]?.name || 'Academic',
    description: '',
    price: '',
    rent_price: '',
    condition: 'GOOD',
    location: 'Library Block',
    images: ['/uploads/sample_product.svg']
  };

  const sellPriceEl = document.getElementById('sellPrice');
  const sellRentPriceEl = document.getElementById('sellRentPrice');
  if (sellPriceEl) sellPriceEl.value = '';
  if (sellRentPriceEl) sellRentPriceEl.value = '';

  renderSellCategoryOptions();
  renderSellStepUI();
  document.getElementById('modalSellItem').style.display = 'flex';
}

function closeSellModal() {
  document.getElementById('modalSellItem').style.display = 'none';
}

function renderSellCategoryOptions() {
  const container = document.getElementById('sellCategoryList');
  container.innerHTML = STATE.categories.map(cat => `
    <button class="btn ${STATE.sellData.category_id === cat.id ? 'btn-primary' : 'btn-outline'}" style="justify-content: flex-start; padding: 16px;" onclick="selectSellCategory('${cat.id}', '${cat.name}')">
      <div style="text-align: left;">
        <div style="font-weight: 700;">${cat.name}</div>
        <div style="font-size: 0.75rem; opacity: 0.85;">${cat.description || ''}</div>
      </div>
    </button>
  `).join('');
}

window.selectSellCategory = function(catId, catName) {
  STATE.sellData.category_id = catId;
  STATE.sellData.category_name = catName;
  STATE.sellStep = 2;
  renderSellStepUI();
};

function renderSellStepUI() {
  const step = STATE.sellStep;
  document.getElementById('sellStepLabel').innerText = `STEP 0${step} OF 04`;
  document.getElementById('sellError').style.display = 'none';

  // Titles
  const titles = [
    'What are you selling or renting?',
    'Tell us about it.',
    'Set price & location.',
    'Review & Publish.'
  ];
  document.getElementById('sellStepTitle').innerText = titles[step - 1];

  // Step Pills
  [1, 2, 3, 4].forEach(s => {
    const pill = document.getElementById(`pillStep${s}`);
    if (s <= step) pill.classList.add('active');
    else pill.classList.remove('active');

    const contentDiv = document.getElementById(`sellStep${s}`);
    if (s === step) contentDiv.style.display = 'block';
    else contentDiv.style.display = 'none';
  });

  // Buttons
  const btnBack = document.getElementById('btnSellBack');
  const btnNext = document.getElementById('btnSellNext');

  btnBack.style.display = step > 1 ? 'inline-flex' : 'none';
  btnNext.innerText = step === 4 ? 'Publish Listing' : 'Next Step';

  if (step === 4) {
    document.getElementById('reviewTitle').innerText = STATE.sellData.title;

    const buyTxt = STATE.sellData.price ? `Buy: ₹${STATE.sellData.price}` : 'Not for sale';
    const rentTxt = STATE.sellData.rent_price ? `Rent: ₹${STATE.sellData.rent_price}/mo` : 'Not for rent';

    let typeTxt = 'BUY ONLY';
    if (STATE.sellData.price && STATE.sellData.rent_price) typeTxt = 'BUY & RENT';
    else if (STATE.sellData.rent_price) typeTxt = 'MONTHLY RENT ONLY';

    document.getElementById('reviewPrice').innerText = buyTxt;
    document.getElementById('reviewRentPrice').innerText = rentTxt;
    document.getElementById('reviewListingType').innerText = typeTxt;
    document.getElementById('reviewCategory').innerText = STATE.sellData.category_name;
    document.getElementById('reviewCondition').innerText = STATE.sellData.condition;
    document.getElementById('reviewLocation').innerText = STATE.sellData.location;
    document.getElementById('reviewSeller').innerText = STATE.demoUser.name;
  }
}

function handleSellNext() {
  const step = STATE.sellStep;
  const errDiv = document.getElementById('sellError');
  errDiv.style.display = 'none';

  if (step === 2) {
    const title = document.getElementById('sellTitle').value.trim();
    const desc = document.getElementById('sellDescription').value.trim();
    const cond = document.getElementById('sellCondition').value;

    if (!title) {
      errDiv.innerText = 'Please enter a product title.';
      errDiv.style.display = 'block';
      return;
    }
    if (!desc) {
      errDiv.innerText = 'Please enter a short description.';
      errDiv.style.display = 'block';
      return;
    }

    STATE.sellData.title = title;
    STATE.sellData.description = desc;
    STATE.sellData.condition = cond;
  }

  if (step === 3) {
    const buyVal = document.getElementById('sellPrice').value.trim();
    const rentVal = document.getElementById('sellRentPrice').value.trim();
    const loc = document.getElementById('sellLocation').value;

    const buyNum = buyVal !== '' ? Number(buyVal) : NaN;
    const rentNum = rentVal !== '' ? Number(rentVal) : NaN;

    const hasValidBuy = !isNaN(buyNum) && buyNum > 0;
    const hasValidRent = !isNaN(rentNum) && rentNum > 0;

    if (!hasValidBuy && !hasValidRent) {
      errDiv.innerText = 'Please enter at least one valid price (Full Purchase Price or Monthly Rent Price).';
      errDiv.style.display = 'block';
      return;
    }

    if ((!isNaN(buyNum) && buyNum < 0) || (!isNaN(rentNum) && rentNum < 0)) {
      errDiv.innerText = 'Price values cannot be negative.';
      errDiv.style.display = 'block';
      return;
    }

    STATE.sellData.price = hasValidBuy ? buyNum : 0;
    STATE.sellData.rent_price = hasValidRent ? rentNum : 0;
    STATE.sellData.location = loc;
  }

  if (step === 4) {
    publishListing();
    return;
  }

  STATE.sellStep = Math.min(STATE.sellStep + 1, 4);
  renderSellStepUI();
}

function handleSellBack() {
  STATE.sellStep = Math.max(STATE.sellStep - 1, 1);
  renderSellStepUI();
}

async function publishListing() {
  try {
    await api('/listings', {
      method: 'POST',
      body: JSON.stringify({
        ...STATE.sellData,
        seller_id: STATE.demoUser.id,
        seller_name: STATE.demoUser.name
      })
    });
    showToast('Listing created and published successfully!');
    closeSellModal();
    fetchListings();
  } catch (err) {
    showToast('Failed to publish listing');
  }
}

// Contact Seller Modal
window.triggerContactModal = function() {
  if (!STATE.selectedListing) return;
  STATE.contactingListing = STATE.selectedListing;
  closeDetailModal();

  const item = STATE.contactingListing;
  const hasBuy = item.price && Number(item.price) > 0;
  const hasRent = item.rent_price && Number(item.rent_price) > 0;

  const dealTypeSelect = document.getElementById('contactDealType');
  dealTypeSelect.innerHTML = '';

  if (hasBuy) {
    dealTypeSelect.innerHTML += `<option value="BUY">Buy item outright (₹${item.price})</option>`;
  }
  if (hasRent) {
    dealTypeSelect.innerHTML += `<option value="RENT">Rent item on monthly basis (₹${item.rent_price}/mo)</option>`;
  }

  document.getElementById('contactSellerName').innerText = item.seller_name;

  let priceSummary = '';
  if (hasBuy && hasRent) priceSummary = `Buy ₹${item.price} • Rent ₹${item.rent_price}/mo`;
  else if (hasRent) priceSummary = `Rent ₹${item.rent_price}/mo`;
  else priceSummary = `Buy ₹${item.price}`;

  document.getElementById('contactListingContext').innerHTML = `Regarding: <strong>${item.title}</strong> (${priceSummary})`;

  const initialMode = hasBuy ? 'BUY' : 'RENT';
  dealTypeSelect.value = initialMode;

  if (initialMode === 'RENT') {
    document.getElementById('contactMessageContent').value = `Hi ${item.seller_name}! Is the "${item.title}" available for rent (₹${item.rent_price}/mo)? I would like to rent it on a monthly basis.`;
  } else {
    document.getElementById('contactMessageContent').value = `Hi ${item.seller_name}! Is the "${item.title}" still available (₹${item.price})? I am interested in buying it.`;
  }

  document.getElementById('contactError').style.display = 'none';
  document.getElementById('modalContactSeller').style.display = 'flex';
};

function closeContactModal() {
  document.getElementById('modalContactSeller').style.display = 'none';
  STATE.contactingListing = null;
}

async function handleSendContactMessage() {
  const content = document.getElementById('contactMessageContent').value.trim();
  const errDiv = document.getElementById('contactError');
  errDiv.style.display = 'none';

  if (!content) {
    errDiv.innerText = 'Message content cannot be empty.';
    errDiv.style.display = 'block';
    return;
  }

  try {
    await api('/messages', {
      method: 'POST',
      body: JSON.stringify({
        listing_id: STATE.contactingListing.id,
        sender_id: STATE.demoUser.id,
        sender_name: STATE.demoUser.name,
        receiver_id: STATE.contactingListing.seller_id,
        receiver_name: STATE.contactingListing.seller_name,
        content
      })
    });
    showToast(`Message sent to ${STATE.contactingListing.seller_name}`);
    closeContactModal();
    fetchMessages();
  } catch (err) {
    showToast('Error sending message');
  }
}

// Student Dashboard Renderers
let currentDashTab = 'listings'; // 'listings' | 'favorites' | 'messages'

function switchDashTab(tabName) {
  currentDashTab = tabName;
  document.getElementById('tabMyListings').className = tabName === 'listings' ? 'btn btn-primary' : 'btn btn-outline';
  document.getElementById('tabSavedItems').className = tabName === 'favorites' ? 'btn btn-primary' : 'btn btn-outline';
  document.getElementById('tabMessages').className = tabName === 'messages' ? 'btn btn-primary' : 'btn btn-outline';
  renderDashboard();
}

function renderDashboard() {
  const myListings = STATE.listings.filter(l => l.seller_id === STATE.demoUser.id);
  document.getElementById('dashStatListings').innerText = myListings.length;
  document.getElementById('dashStatFavorites').innerText = STATE.favorites.length;
  document.getElementById('dashStatMessages').innerText = STATE.messages.length;

  const container = document.getElementById('dashTabContent');

  if (currentDashTab === 'listings') {
    if (myListings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h4 class="empty-state-title">You haven't listed any items yet</h4>
          <p class="empty-state-subtitle">Click "+ Sell Item" to post your unused books, calculators, or hostel essentials.</p>
        </div>`;
      return;
    }
    container.innerHTML = `
      <table class="dashboard-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Buy / Rent Price</th>
            <th>Condition</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${myListings.map(item => {
            const hasBuy = item.price && Number(item.price) > 0;
            const hasRent = item.rent_price && Number(item.rent_price) > 0;
            let priceDisplay = '';
            if (hasBuy && hasRent) priceDisplay = `₹${item.price} <span style="font-size:0.75rem; color:#1E40AF; font-weight:700;">(Rent ₹${item.rent_price}/mo)</span>`;
            else if (hasRent) priceDisplay = `<span style="color:#1E40AF;">₹${item.rent_price}/mo</span>`;
            else priceDisplay = `₹${item.price || 0}`;

            return `
              <tr>
                <td style="font-weight:700; cursor:pointer;" onclick="openDetailModal('${item.id}')">${item.title}</td>
                <td style="font-weight:700; color:var(--brand-accent);">${priceDisplay}</td>
                <td>${item.condition}</td>
                <td>
                  <span class="condition-badge" style="position:static; background:${item.status === 'SOLD' ? 'var(--brand-sold)' : 'var(--brand-accent)'};">${item.status}</span>
                </td>
                <td>
                  <div style="display:flex; gap:8px;">
                    ${item.status === 'ACTIVE' 
                      ? `<button class="btn btn-sm btn-secondary" onclick="markListingSold('${item.id}')">Mark Sold</button>` 
                      : `<button class="btn btn-sm btn-secondary" onclick="markListingActive('${item.id}')">Mark Active</button>`}
                    <button class="btn btn-sm btn-danger" onclick="deleteListing('${item.id}')">Delete</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  if (currentDashTab === 'favorites') {
    if (STATE.favorites.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h4 class="empty-state-title">No saved items</h4>
          <p class="empty-state-subtitle">Browse the marketplace and click "Save" to keep track of items you want.</p>
        </div>`;
      return;
    }
    container.innerHTML = `
      <table class="dashboard-table">
        <thead>
          <tr>
            <th>Saved Item</th>
            <th>Buy / Rent Price</th>
            <th>Seller</th>
            <th>Campus Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${STATE.favorites.map(fav => {
            const item = fav.listing;
            let priceDisplay = '-';
            if (item) {
              const hasBuy = item.price && Number(item.price) > 0;
              const hasRent = item.rent_price && Number(item.rent_price) > 0;
              if (hasBuy && hasRent) priceDisplay = `₹${item.price} (Rent ₹${item.rent_price}/mo)`;
              else if (hasRent) priceDisplay = `₹${item.rent_price}/mo`;
              else priceDisplay = `₹${item.price || 0}`;
            }

            return `
              <tr>
                <td style="font-weight:700; cursor:pointer;" onclick="openDetailModal('${fav.listing_id}')">${item ? item.title : 'Item'}</td>
                <td style="font-weight:700; color:var(--brand-accent);">${priceDisplay}</td>
                <td>${item ? item.seller_name : '-'}</td>
                <td>${item ? item.location : '-'}</td>
                <td>
                  <button class="btn btn-sm btn-danger" onclick="removeFavoriteFromDash('${fav.id}')">Remove</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  if (currentDashTab === 'messages') {
    if (STATE.messages.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h4 class="empty-state-title">No messages yet</h4>
          <p class="empty-state-subtitle">When buyers reach out to you or when you contact a seller, your HTTP messages will appear here.</p>
        </div>`;
      return;
    }
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${STATE.messages.map(msg => `
          <div style="background:var(--bg-surface); border:1px solid var(--border-light); padding:16px; border-radius:var(--radius-md);">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.8rem; color:var(--text-muted);">
              <div>From: <strong style="color:var(--text-main);">${msg.sender_name}</strong> → To: <strong style="color:var(--text-main);">${msg.receiver_name}</strong></div>
              <div>${new Date(msg.created_at).toLocaleString()}</div>
            </div>
            <p style="font-size:0.9rem; color:var(--text-main);">${msg.content}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
}

window.removeFavoriteFromDash = async function(favId) {
  try {
    await api(`/favorites/${favId}`, { method: 'DELETE' });
    showToast('Removed from saved items');
    await fetchFavorites();
    renderDashboard();
    renderProductGrid();
  } catch (err) {
    showToast('Failed to remove favorite');
  }
};
