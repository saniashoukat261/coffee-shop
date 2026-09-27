document.addEventListener('DOMContentLoaded', function () {
    // LOADING SCREEN HANDLER
    const loader = document.getElementById('loading-screen');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }, 600);
    }

    // Theme Toggle Setup
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggleBtn.textContent = '☀️';
    }

    themeToggleBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.textContent = '☀️';
        }
    });

    // Mobile Hamburger Toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinksList = document.querySelector('.navbar ul.nav-links');
    if (hamburgerBtn && navLinksList) {
        hamburgerBtn.addEventListener('click', () => {
            navLinksList.classList.toggle('active');
        });

        document.querySelectorAll('.navbar ul.nav-links li a').forEach(link => {
            link.addEventListener('click', () => {
                navLinksList.classList.remove('active');
            });
        });
    }

    // Scroll Spy for Sticky Navbar Links Active State
    const navLinks = document.querySelectorAll('.navbar ul li a');
    const sections = document.querySelectorAll('section, header');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Newsletter Subscription Handler
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletterEmail').value.trim();

            try {
                const res = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (data.success) {
                    alert(data.message || 'Thank you for subscribing! ☕');
                    newsletterForm.reset();
                } else {
                    alert(data.message || 'Something went wrong. Please try again.');
                }
            } catch (err) {
                console.error(err);
                alert('Could not reach the server. Please check your connection and try again.');
            }
        });
    }

    // Contact Form Submission Handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });
                const data = await res.json();
                if (data.success) {
                    showToast("✓ Message sent! We'll get back to you soon.");
                    contactForm.reset();
                } else {
                    alert('Something went wrong: ' + (data.message || 'please try again.'));
                }
            } catch (err) {
                console.error(err);
                alert('Could not reach the server. Please check your connection and try again.');
            }
        });
    }

    // Table Reservation Submission Handler
    const tableReservationForm = document.getElementById('tableReservationForm');
    if (tableReservationForm) {
        tableReservationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const date = document.getElementById('resDate').value;
            const time = document.getElementById('resTime').value;
            const guests = document.getElementById('resGuests').value;
            const name = document.getElementById('resName').value.trim();
            const phone = document.getElementById('resPhone').value.trim();

            try {
                const res = await fetch('/api/reservations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, phone, date, time, guests })
                });
                const data = await res.json();
                if (data.success) {
                    alert(`🎉 Table successfully reserved for ${guests} guest(s) on ${date} at ${time}! We look forward to seeing you.`);
                    tableReservationForm.reset();
                } else {
                    alert('Something went wrong: ' + (data.message || 'please try again.'));
                }
            } catch (err) {
                console.error(err);
                alert('Could not reach the server. Please check your connection and try again.');
            }
        });
    }

    // Menu Filtering and Searching Logic
    const filterTabs = document.querySelectorAll('.filter-tab');
    const menuSearchInput = document.getElementById('menuSearchInput');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filter = tab.getAttribute('data-filter');

            // Query fresh each click, since menu items are loaded dynamically from the database
            const menuCategories = document.querySelectorAll('.cards, .menu-grid');
            const categoryTitles = document.querySelectorAll('.menu-category-title');

            menuCategories.forEach((cat, idx) => {
                const catType = cat.getAttribute('data-category');
                if (filter === 'all' || catType === filter) {
                    cat.style.display = 'grid';
                    if (categoryTitles[idx]) categoryTitles[idx].style.display = 'block';
                } else {
                    cat.style.display = 'none';
                    if (categoryTitles[idx]) categoryTitles[idx].style.display = 'none';
                }
            });
        });
    });

    if (menuSearchInput) {
        menuSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.card, .menu-item').forEach(item => {
                const name = item.getAttribute('data-name').toLowerCase();
                if (name.includes(query)) {
                    item.style.display = item.classList.contains('menu-item') ? 'flex' : 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Load and render the menu from the database
    const CATEGORY_TITLES = {
        signature: 'Signature Drinks',
        hot: 'Hot Classics',
        iced: 'Iced & Refreshing',
        treats: 'Artisan Specials & Treats',
        snacks: 'Snacks & Bites'
    };
    const CATEGORY_ORDER = ['signature', 'hot', 'iced', 'treats', 'snacks'];

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function renderMenu(items) {
        const container = document.getElementById('menuContentContainer');
        if (!container) return;

        if (!items.length) {
            container.innerHTML = '<p style="text-align:center; padding: 40px 0;">No menu items available right now. Please check back soon.</p>';
            return;
        }

        // Group items by category, keeping any category not in our known list at the end
        const byCategory = {};
        items.forEach(item => {
            const cat = item.category || 'other';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(item);
        });
        const categoriesInOrder = [
            ...CATEGORY_ORDER.filter(c => byCategory[c]),
            ...Object.keys(byCategory).filter(c => !CATEGORY_ORDER.includes(c))
        ];

        let html = '';
        categoriesInOrder.forEach((cat, idx) => {
            const title = CATEGORY_TITLES[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
            const marginTop = idx === 0 ? '' : ' style="margin-top: 40px;"';
            html += `<h3 class="menu-category-title"${marginTop}>${escapeHtml(title)}</h3>`;

            if (cat === 'signature') {
                // Signature items render as image cards
                html += `<div class="cards" data-category="${cat}">`;
                byCategory[cat].forEach(item => {
                    const price = Number(item.price).toFixed(2);
                    html += `
                        <div class="card" data-name="${escapeHtml(item.name)}" data-price="${price}" data-category="${cat}">
                            ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">` : ''}
                            <div class="card-content">
                                <h3>${escapeHtml(item.name)}</h3>
                                <p>${escapeHtml(item.description || '')}</p>
                                <span>$${price}</span>
                                <button class="add-btn" onclick="handleAddToCart('${escapeHtml(item.name).replace(/'/g, "\\'")}', ${price}, '${cat}')" aria-label="Add ${escapeHtml(item.name)} to cart">+</button>
                            </div>
                        </div>`;
                });
                html += `</div>`;
            } else {
                // Every other category renders as a simple list row
                html += `<div class="menu-grid" data-category="${cat}">`;
                byCategory[cat].forEach(item => {
                    const price = Number(item.price).toFixed(2);
                    html += `
                        <div class="menu-item" data-name="${escapeHtml(item.name)}" data-price="${price}" data-category="${cat}">
                            <span>${escapeHtml(item.name)}</span>
                            <div class="menu-right"><span>$${price}</span><button class="add-btn-small" onclick="handleAddToCart('${escapeHtml(item.name).replace(/'/g, "\\'")}', ${price}, '${cat}')">+</button></div>
                        </div>`;
                });
                html += `</div>`;
            }
        });

        container.innerHTML = html;

        // Re-attach the wishlist heart buttons and re-apply the active filter now that items exist
        attachWishlistButtons();
        const activeTab = document.querySelector('.filter-tab.active');
        if (activeTab) activeTab.click();
    }

    async function loadMenu() {
        const container = document.getElementById('menuContentContainer');
        try {
            const res = await fetch('/api/menu');
            const data = await res.json();
            if (data.success) {
                renderMenu(data.data);
            } else {
                if (container) container.innerHTML = '<p style="text-align:center; padding: 40px 0;">Could not load the menu right now.</p>';
            }
        } catch (err) {
            console.error('Failed to load menu:', err);
            if (container) container.innerHTML = '<p style="text-align:center; padding: 40px 0;">Could not reach the server to load the menu. Please refresh the page.</p>';
        }
    }
    loadMenu();

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            item.classList.toggle('active');
            const span = btn.querySelector('span');
            span.textContent = item.classList.contains('active') ? '-' : '+';
        });
    });

    // CUSTOMER REVIEWS SLIDER LOGIC
    const track = document.getElementById('reviewTrack');
    const cards = track ? track.querySelectorAll('.review-card') : [];
    const nextBtn = document.getElementById('nextReview');
    const prevBtn = document.getElementById('prevReview');

    let currentIndex = 0;
    if (track && cards.length > 0) {
        function getCardWidth() {
            return cards[0].offsetWidth + 25;
        }

        function updateSlider() {
            let maxVisible = window.innerWidth <= 768 ? 1 : (window.innerWidth <= 992 ? 2 : 3);
            if (currentIndex > cards.length - maxVisible) {
                currentIndex = Math.max(0, cards.length - maxVisible);
            }
            track.style.transform = `translateX(-${currentIndex * getCardWidth()}px)`;
        }

        if (nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => {
                let maxVisible = window.innerWidth <= 768 ? 1 : (window.innerWidth <= 992 ? 2 : 3);
                if (currentIndex < cards.length - maxVisible) {
                    currentIndex++;
                } else {
                    currentIndex = 0;
                }
                updateSlider();
            });

            prevBtn.addEventListener('click', () => {
                let maxVisible = window.innerWidth <= 768 ? 1 : (window.innerWidth <= 992 ? 2 : 3);
                if (currentIndex > 0) {
                    currentIndex--;
                } else {
                    currentIndex = Math.max(0, cards.length - maxVisible);
                }
                updateSlider();
            });
        }
    }

    // WISHLIST FUNCTIONALITY ❤️
    let wishlist = [];
    const wishlistModal = document.getElementById('wishlistModal');
    const openWishlistModalBtn = document.getElementById('openWishlistModalBtn');
    const closeWishlistModal = document.getElementById('closeWishlistModal');
    const closeWishlistBtn = document.getElementById('closeWishlistBtn');
    const wishlistItemsList = document.getElementById('wishlistItemsList');
    const wishlistCount = document.getElementById('wishlistCount');

    if (openWishlistModalBtn) {
        openWishlistModalBtn.addEventListener('click', () => wishlistModal.classList.add('active'));
        closeWishlistModal.addEventListener('click', () => wishlistModal.classList.remove('active'));
        closeWishlistBtn.addEventListener('click', () => wishlistModal.classList.remove('active'));
    }

    function attachWishlistButtons() {
        document.querySelectorAll('.card').forEach(card => {
            if (card.querySelector('.wishlist-btn')) return; // don't add a duplicate heart button
            const itemName = card.getAttribute('data-name');
            const itemPrice = card.getAttribute('data-price');

            const wishBtn = document.createElement('button');
            wishBtn.className = 'wishlist-btn';
            wishBtn.innerHTML = '❤️';
            wishBtn.title = 'Add to Wishlist';
            wishBtn.setAttribute('aria-label', `Add ${itemName} to wishlist`);

            wishBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                wishBtn.classList.toggle('active');

                if (wishBtn.classList.contains('active')) {
                    wishlist.push({ name: itemName, price: itemPrice });
                    showToast("Added to Wishlist ❤️");
                    wishBtn.setAttribute('aria-label', `Remove ${itemName} from wishlist`);
                } else {
                    wishlist = wishlist.filter(i => i.name !== itemName);
                    showToast("Removed from Wishlist");
                    wishBtn.setAttribute('aria-label', `Add ${itemName} to wishlist`);
                }
                updateWishlistUI();
            });

            card.appendChild(wishBtn);
        });
    }
    attachWishlistButtons();

    function updateWishlistUI() {
        if (!wishlistCount || !wishlistItemsList) return;
        wishlistCount.textContent = wishlist.length;
        wishlistItemsList.innerHTML = '';

        if (wishlist.length === 0) {
            wishlistItemsList.innerHTML = '<p class="empty-cart-text">Your wishlist is empty.</p>';
        } else {
            wishlist.forEach((item, index) => {
                const row = document.createElement('div');
                row.className = 'cart-item-row';
                row.innerHTML = `
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>$${Number(item.price).toFixed(2)}</small>
                    </div>
                    <button onclick="window.removeFromWishlist(${index})" style="background:none;border:none;color:red;cursor:pointer;font-size:16px;">&times;</button>
                `;
                wishlistItemsList.appendChild(row);
            });
        }
    }

    window.removeFromWishlist = function(index) {
        wishlist.splice(index, 1);
        updateWishlistUI();
    };

    // Cart State & Promo Discounts
    let cart = [];
    let appliedDiscount = 0;
    let appliedPromoName = '';

    const cartSidebar = document.getElementById('cartSidebar');
    const viewCartBtn = document.getElementById('viewCartBtn');
    const closeCartBtn = document.getElementById('closeCart');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartCountEl = document.getElementById('cartCount');
    const cartTotalEl = document.getElementById('cartTotal');
    const sidebarTotalEl = document.getElementById('sidebarTotal');
    const toastNotification = document.getElementById('toastNotification');
    const promoCodeInput = document.getElementById('promoCodeInput');
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    const discountDisplayLine = document.getElementById('discountDisplayLine');
    
    const addressModal = document.getElementById('addressModal');
    const proceedToAddressBtn = document.getElementById('proceedToAddress');
    const closeAddressModalBtn = document.getElementById('closeAddressModal');
    const addressForm = document.getElementById('addressForm');

    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModalBtn = document.getElementById('closePaymentModal');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');

    const trackingModal = document.getElementById('trackingModal');
    const finishOrderBtn = document.getElementById('finishOrderBtn');

    function addToCart(name, price, customDetails = {}) {
        // Build a unique key from whatever customization details this item actually has,
        // so two different combinations (drink options, or food add-ons) are tracked separately.
        const detailsKey = Object.keys(customDetails).length
            ? Object.values(customDetails).join('|')
            : 'default';
        const customKey = `${name} (${detailsKey})`;
        const existingItem = cart.find(i => i.uniqueKey === customKey);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ uniqueKey: customKey, name, price, qty: 1, details: customDetails });
        }
        updateCartUI();
    }

    function showToast(message) {
        if (!toastNotification) return;
        toastNotification.textContent = message;
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 2500);
    }

    function updateCartUI() {
        if (!cartItemsList || !cartCountEl || !cartTotalEl || !sidebarTotalEl) return;
        let totalCount = 0;
        let subtotalPrice = 0;
        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-cart-text">Your cart is empty.</p>';
            appliedDiscount = 0;
            appliedPromoName = '';
            if (discountDisplayLine) discountDisplayLine.style.display = 'none';
        } else {
            cart.forEach((item, index) => {
                totalCount += item.qty;
                subtotalPrice += item.price * item.qty;

                const row = document.createElement('div');
                row.className = 'cart-item-row';
                const detailsLine = item.details.size
                    ? `${item.details.size || ''}, ${item.details.temp || ''}`
                    : (item.details.addons && item.details.addons !== 'None' ? `Add-ons: ${item.details.addons}` : '');
                row.innerHTML = `
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>$${item.price.toFixed(2)}${detailsLine ? ' | ' + detailsLine : ''}</small>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
                            <button onclick="window.decreaseQty(${index})" style="width:20px;height:20px;background:var(--accent);color:white;border:none;border-radius:4px;cursor:pointer;">-</button>
                            <span>${item.qty}</span>
                            <button onclick="window.increaseQty(${index})" style="width:20px;height:20px;background:var(--accent);color:white;border:none;border-radius:4px;cursor:pointer;">+</button>
                        </div>
                    </div>
                    <div>
                        <span>$${(item.price * item.qty).toFixed(2)}</span>
                        <button onclick="window.removeItem(${index})" style="background:none;border:none;color:red;margin-left:10px;cursor:pointer;">&times;</button>
                    </div>
                `;
                cartItemsList.appendChild(row);
            });
        }

        let finalTotal = subtotalPrice - appliedDiscount;
        if (finalTotal < 0) finalTotal = 0;

        cartCountEl.textContent = totalCount;
        cartTotalEl.textContent = finalTotal.toFixed(2);
        sidebarTotalEl.textContent = finalTotal.toFixed(2);
    }

    window.increaseQty = function(index) {
        cart[index].qty += 1;
        updateCartUI();
    };

    window.decreaseQty = function(index) {
        if (cart[index].qty > 1) {
            cart[index].qty -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCartUI();
    };

    window.removeItem = function(index) {
        cart.splice(index, 1);
        updateCartUI();
    };

    function applyPromoCode(code) {
        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        if (subtotal === 0) {
            showToast("Your cart is empty!");
            return;
        }

        const cleanCode = code.trim().toUpperCase();
        if (cleanCode === 'WELCOME20') {
            appliedDiscount = subtotal * 0.20;
            appliedPromoName = 'WELCOME20 (20% OFF)';
            showToast("🎉 WELCOME20 Discount Applied!");
        } else if (cleanCode === 'BOGO') {
            let allItemsExpanded = [];
            cart.forEach(item => {
                for (let i = 0; i < item.qty; i++) {
                    allItemsExpanded.push(item.price);
                }
            });
            if (allItemsExpanded.length >= 2) {
                allItemsExpanded.sort((a, b) => a - b);
                appliedDiscount = allItemsExpanded[0];
                appliedPromoName = 'BOGO Special (1 Free Item)';
                showToast("☕ BOGO Special Applied!");
            } else {
                alert("Add at least 2 items to your cart to use the BOGO Special!");
                return;
            }
        } else {
            alert("Invalid promo code!");
            return;
        }

        if (discountDisplayLine) {
            discountDisplayLine.style.display = 'block';
            discountDisplayLine.textContent = `Promo Applied: ${appliedPromoName} (-$${appliedDiscount.toFixed(2)})`;
        }
        updateCartUI();
    }

    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', () => {
            if (promoCodeInput) applyPromoCode(promoCodeInput.value);
        });
    }

    window.applyOfferCode = function(codeType) {
        if (cart.length === 0) {
            addToCart('Latte', 5.00, { size: 'Small', temp: 'Hot', shot: 'Regular', milk: 'Whole Milk', sugar: 'Normal' });
            if (codeType === 'BOGO') {
                addToCart('Espresso', 4.00, { size: 'Small', temp: 'Hot', shot: 'Regular', milk: 'Whole Milk', sugar: 'Normal' });
            }
        }
        cartSidebar.classList.add('open');
        applyPromoCode(codeType);
    };

    // Food items (snacks, treats) get a simpler customization popup with toppings/extras.
    // Drink items (signature, hot, iced) get the size/temp/milk/sugar popup.
    const FOOD_CATEGORIES = ['snacks', 'treats'];

    window.handleAddToCart = function(itemName, itemPrice, category) {
        if (FOOD_CATEGORIES.includes(category)) {
            openFoodCustomizationModal(itemName, itemPrice);
        } else {
            openCustomizationModal(itemName, itemPrice);
        }
    };

    const FOOD_ADDONS = [
        { id: 'butter', label: 'Extra Butter', price: 0.30 },
        { id: 'jam', label: 'Fruit Jam', price: 0.40 },
        { id: 'chocolate', label: 'Chocolate Drizzle', price: 0.50 },
        { id: 'whippedcream', label: 'Whipped Cream', price: 0.50 },
        { id: 'toasted', label: 'Toasted', price: 0 }
    ];

    window.openFoodCustomizationModal = function(itemName, itemPrice) {
        const addonRows = FOOD_ADDONS.map(a => `
            <label class="addon-row" style="display:flex; align-items:center; gap:8px; padding:6px 0; cursor:pointer;">
                <input type="checkbox" class="food-addon-checkbox" data-id="${a.id}" data-price="${a.price}">
                <span>${a.label}${a.price > 0 ? ` (+ $${a.price.toFixed(2)})` : ' (no charge)'}</span>
            </label>`).join('');

        const modalHtml = `
            <div class="modal-overlay active" id="foodCustomModal">
                <div class="modal-content">
                    <h3>Customize Your ${itemName}</h3>
                    <div class="customization-options">
                        <div class="custom-group">
                            <label>Add-ons (optional)</label>
                            ${addonRows}
                        </div>
                        <div class="custom-group">
                            <label>Special Instructions (optional)</label>
                            <textarea id="foodSpecialInstructions" rows="2" placeholder="e.g. cut in half, no nuts..." style="width:100%;"></textarea>
                        </div>
                    </div>
                    <button class="btn checkout-btn" id="confirmFoodCustomBtn">Add to Cart</button>
                    <button class="cancel-btn" onclick="document.getElementById('foodCustomModal').remove()">Cancel</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('confirmFoodCustomBtn').addEventListener('click', () => {
            const checkedBoxes = document.querySelectorAll('.food-addon-checkbox:checked');
            const selectedAddons = [];
            let addonTotal = 0;
            checkedBoxes.forEach(cb => {
                const addon = FOOD_ADDONS.find(a => a.id === cb.getAttribute('data-id'));
                if (addon) {
                    selectedAddons.push(addon.label);
                    addonTotal += addon.price;
                }
            });
            const instructions = document.getElementById('foodSpecialInstructions').value.trim();
            const finalPrice = itemPrice + addonTotal;

            addToCart(itemName, finalPrice, {
                addons: selectedAddons.length ? selectedAddons.join(', ') : 'None',
                instructions: instructions || 'None'
            });

            document.getElementById('foodCustomModal').remove();
            showToast(`${itemName} added to cart ✓`);
        });
    };

    window.openCustomizationModal = function(itemName, itemPrice) {
        const modalHtml = `
            <div class="modal-overlay active" id="customModal">
                <div class="modal-content">
                    <h3>Customize Your ${itemName}</h3>
                    <div class="customization-options">
                        <div class="custom-group">
                            <label>Size</label>
                            <select id="custSize">
                                <option value="Small">Small (Standard)</option>
                                <option value="Medium">Medium (+ $0.50)</option>
                                <option value="Large">Large (+ $1.00)</option>
                            </select>
                        </div>
                        <div class="custom-group">
                            <label>Temperature</label>
                            <select id="custTemp">
                                <option value="Hot">Hot</option>
                                <option value="Cold">Cold / Iced</option>
                            </select>
                        </div>
                        <div class="custom-group">
                            <label>Shot Options</label>
                            <select id="custShot">
                                <option value="Regular">Regular Shot</option>
                                <option value="Extra Shot">Extra Espresso Shot (+ $0.75)</option>
                            </select>
                        </div>
                        <div class="custom-group">
                            <label>Milk Type</label>
                            <select id="custMilk">
                                <option value="Whole Milk">Whole Milk</option>
                                <option value="Oat Milk">Oat Milk (+ $0.60)</option>
                                <option value="Almond Milk">Almond Milk (+ $0.60)</option>
                                <option value="Skim Milk">Skim Milk</option>
                            </select>
                        </div>
                        <div class="custom-group">
                            <label>Sugar Level</label>
                            <select id="custSugar">
                                <option value="Normal">Normal Sweet</option>
                                <option value="Less Sugar">Less Sugar</option>
                                <option value="No Sugar">Unsweetened</option>
                                <option value="Extra Sugar">Extra Sweet</option>
                            </select>
                        </div>
                    </div>
                    <button class="btn checkout-btn" id="confirmCustomBtn">Add to Cart</button>
                    <button class="cancel-btn" onclick="document.getElementById('customModal').remove()">Cancel</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('confirmCustomBtn').addEventListener('click', () => {
            const size = document.getElementById('custSize').value;
            const temp = document.getElementById('custTemp').value;
            const shot = document.getElementById('custShot').value;
            const milk = document.getElementById('custMilk').value;
            const sugar = document.getElementById('custSugar').value;
            
            let finalPrice = itemPrice;
            if (size === 'Medium') finalPrice += 0.50;
            if (size === 'Large') finalPrice += 1.00;
            if (shot === 'Extra Shot') finalPrice += 0.75;
            if (milk === 'Oat Milk' || milk === 'Almond Milk') finalPrice += 0.60;

            document.getElementById('customModal').remove();
            addToCart(itemName, finalPrice, { size, temp, shot, milk, sugar });
            showToast(`✓ Added ${itemName} to Cart! 🛒`);
        });
    };

    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', () => cartSidebar.classList.add('open'));
        closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('open'));
    }

    let loggedInUser = null;
    fetch('/api/auth/me').then(r => r.json()).then(data => {
        if (data.loggedIn) loggedInUser = data.user;
    }).catch(() => {});

    if (proceedToAddressBtn) {
        proceedToAddressBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            cartSidebar.classList.remove('open');

            // Prefill from the customer's saved address, if they're logged in and have one
            if (loggedInUser) {
                const fullNameInput = document.getElementById('fullName');
                const phoneInput = document.getElementById('deliveryPhone');
                const streetInput = document.getElementById('deliveryAddress');
                const addr = loggedInUser.address || {};
                if (fullNameInput && !fullNameInput.value) fullNameInput.value = addr.fullName || loggedInUser.name || '';
                if (phoneInput && !phoneInput.value) phoneInput.value = addr.phone || '';
                if (streetInput && addr.street && streetInput.value === 'Burewala, Punjab, Pakistan') {
                    streetInput.value = addr.city ? `${addr.street}, ${addr.city}` : addr.street;
                }
            }

            addressModal.classList.add('active');
        });

        closeAddressModalBtn.addEventListener('click', () => addressModal.classList.remove('active'));

        addressForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addressModal.classList.remove('active');
            paymentModal.classList.add('active');
        });

        closePaymentModalBtn.addEventListener('click', () => {
            paymentModal.classList.remove('active');
            addressModal.classList.add('active');
        });
    }

    // PAYMENT METHOD - SHOW/HIDE EXTRA DETAILS FIELDS
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const cardDetails = document.getElementById('cardDetails');
    const walletDetails = document.getElementById('walletDetails');

    function updatePaymentExtraFields() {
        const selected = document.querySelector('input[name="payment"]:checked');
        const value = selected ? selected.value : 'cod';

        if (cardDetails) cardDetails.classList.toggle('active', value === 'card');
        if (walletDetails) walletDetails.classList.toggle('active', value === 'wallet');
    }

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', updatePaymentExtraFields);
    });
    updatePaymentExtraFields();

    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', async () => {
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            const paymentValue = selectedPayment ? selectedPayment.value : 'cod';

            if (paymentValue === 'card') {
                const cardNumber = document.getElementById('cardNumber').value.trim();
                const cardExpiry = document.getElementById('cardExpiry').value.trim();
                const cardCvv = document.getElementById('cardCvv').value.trim();
                const cardName = document.getElementById('cardName').value.trim();
                if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
                    alert('Please fill in all card details to continue.');
                    return;
                }
            } else if (paymentValue === 'wallet') {
                const walletNumber = document.getElementById('walletNumber').value.trim();
                if (!walletNumber) {
                    alert('Please enter your JazzCash / EasyPaisa account number to continue.');
                    return;
                }
            }

            // Save the order to the database before clearing the cart
            const customerName = document.getElementById('fullName')
                ? document.getElementById('fullName').value.trim()
                : 'Guest';
            const orderItems = cart.map(i => ({ name: i.name, price: i.price, quantity: i.qty }));
            const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

            try {
                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customerName, items: orderItems, total })
                });
                const data = await res.json();
                if (!data.success) {
                    alert('Could not place order: ' + (data.message || 'please try again.'));
                    return;
                }
            } catch (err) {
                console.error(err);
                alert('Could not reach the server. Please check your connection and try again.');
                return;
            }

            paymentModal.classList.remove('active');
            trackingModal.classList.add('active');
            
            const steps = [
                document.getElementById('step1'),
                document.getElementById('step2'),
                document.getElementById('step3'),
                document.getElementById('step4')
            ];

            steps.forEach(s => s.classList.remove('active'));
            steps[0].classList.add('active');

            setTimeout(() => {
                steps[0].classList.remove('active');
                steps[1].classList.add('active');
            }, 1500);

            setTimeout(() => {
                steps[1].classList.remove('active');
                steps[2].classList.add('active');
            }, 3500);

            setTimeout(() => {
                steps[2].classList.remove('active');
                steps[3].classList.add('active');
            }, 5500);

            cart = [];
            updateCartUI();
        });

        finishOrderBtn.addEventListener('click', () => {
            trackingModal.classList.remove('active');
        });
    }

    const scrollTopBtn = document.querySelector('.scroll-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
});