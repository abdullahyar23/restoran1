// Global variables
let menuItems = [];
let categories = {};
let categoryOrder = [];
let restaurantSettings = {};
let themeSettings = {};
let currentEditingCategory = null;
let currentEditingProduct = null;
let notificationInterval = null;

// Notification system for new orders
function initializeNotificationSystem() {
    // Check for new notifications every 3 seconds
    notificationInterval = setInterval(checkForNewOrders, 3000);
    console.log('🔔 Bildirim sistemi başlatıldı');
}

function checkForNewOrders() {
    try {
        const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        console.log('🔍 Bildirim kontrolü:', notifications.length, 'toplam bildirim');
        
        const unreadCount = notifications.filter(n => !n.read).length;
        console.log('📬 Okunmamış bildirim sayısı:', unreadCount);
        
        // Update notification badge if exists
        updateNotificationBadge(unreadCount);
        
        // Show latest unread notification
        const latestUnread = notifications.find(n => !n.read);
        if (latestUnread) {
            console.log('🔔 Yeni bildirim bulundu:', latestUnread);
            if (isTabActive('tables')) {
                console.log('📋 Masa sekmesi aktif, bildirim gösteriliyor');
                showOrderNotification(latestUnread);
                // Mark as read
                latestUnread.read = true;
                localStorage.setItem('adminNotifications', JSON.stringify(notifications));
                
                // Update tables display to show new order
                updateTablesDisplay();
            } else {
                console.log('📋 Masa sekmesi aktif değil');
            }
        } else {
            console.log('📭 Yeni bildirim yok');
        }
        
    } catch (error) {
        console.error('Bildirim kontrolü hatası:', error);
    }
}

// Check if a specific tab is active
function isTabActive(tabName) {
    const activeTab = document.querySelector('.tab.active');
    return activeTab && activeTab.getAttribute('data-tab') === tabName;
}

function updateNotificationBadge(count) {
    // Create or update notification badge on tables tab
    const tablesTab = document.querySelector('[data-tab="tables"]');
    if (!tablesTab) return;
    
    let badge = tablesTab.querySelector('.notification-badge');
    
    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: #e74c3c;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 11px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                animation: pulse 2s infinite;
            `;
            
            // Add pulsing animation
            if (!document.getElementById('notification-styles')) {
                const style = document.createElement('style');
                style.id = 'notification-styles';
                style.textContent = `
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.2); }
                        100% { transform: scale(1); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            tablesTab.style.position = 'relative';
            tablesTab.appendChild(badge);
        }
        badge.textContent = count > 99 ? '99+' : count;
    } else if (badge) {
        badge.remove();
    }
}

function showOrderNotification(notification) {
    // Show a temporary notification popup
    const notificationDiv = document.createElement('div');
    notificationDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 9999;
        max-width: 350px;
        animation: slideInRight 0.5s ease-out;
        cursor: pointer;
    `;
    
    // Add slide animation
    if (!document.getElementById('notification-animations')) {
        const style = document.createElement('style');
        style.id = 'notification-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    notificationDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">${notification.title}</div>
        <div style="font-size: 14px; opacity: 0.9;">${notification.message}</div>
        <div style="font-size: 11px; opacity: 0.7; margin-top: 8px;">
            ${new Date(notification.timestamp).toLocaleTimeString('tr-TR')}
        </div>
    `;
    
    // Click to dismiss
    notificationDiv.onclick = () => {
        notificationDiv.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notificationDiv.remove(), 300);
        
        // Switch to table modal if clicked
        if (notification.tableNumber) {
            setTimeout(() => openTableModal(notification.tableNumber), 350);
        }
    };
    
    document.body.appendChild(notificationDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notificationDiv.parentNode) {
            notificationDiv.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notificationDiv.remove(), 300);
        }
    }, 5000);
    
    // Play notification sound (if browser allows)
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmA');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore audio errors
    } catch (e) {}
}

function isTabActive(tabName) {
    const activeTab = document.querySelector('.tab.active');
    return activeTab && activeTab.getAttribute('data-tab') === tabName;
}

function clearAllNotifications() {
    localStorage.removeItem('adminNotifications');
    updateNotificationBadge(0);
}

// Image processing functions
function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Resim boyutu çok büyük! Maksimum 5MB olmalı.');
        input.value = '';
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('Lütfen geçerli bir resim dosyası seçin!');
        input.value = '';
        return;
    }
    
    resizeAndPreviewImage(file);
}

function resizeAndPreviewImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Create canvas for resizing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate new dimensions (max 300x300, maintain aspect ratio)
            const maxSize = 300;
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }
            }
            
            // Set canvas size
            canvas.width = width;
            canvas.height = height;
            
            // Draw resized image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with compression
            const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
            
            // Show preview
            const preview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');
            previewImg.src = resizedImage;
            preview.style.display = 'block';
            
            // Store the resized image data
            document.getElementById('product-image').value = resizedImage;
            
            // Update storage indicator after image processing
            setTimeout(updateStorageIndicator, 100);
            
            console.log(`Resim optimize edildi: ${img.width}x${img.height} → ${width}x${height}`);
            console.log(`Dosya boyutu: ${Math.round(file.size / 1024)}KB → ${Math.round(resizedImage.length / 1024)}KB`);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleUrlImagePreview(input) {
    const url = input.value.trim();
    const preview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        // Clear file input when URL is used
        document.getElementById('product-image-file').value = '';
        
        // Show URL image preview
        previewImg.src = url;
        preview.style.display = 'block';
        
        // Handle image load errors
        previewImg.onerror = function() {
            preview.style.display = 'none';
            console.log('Resim yüklenemedi, URL geçersiz olabilir');
        };
    } else if (url === '') {
        // Hide preview if URL is cleared
        preview.style.display = 'none';
        previewImg.src = '';
    }
}

// Storage monitoring functions
function calculateStorageUsage() {
    try {
        const used = JSON.stringify(localStorage).length;
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        const usedKB = Math.round(used / 1024);
        const maxKB = Math.round(maxSize / 1024);
        const percentage = Math.round((used / maxSize) * 100);
        
        return {
            used: used,
            usedKB: usedKB,
            maxKB: maxKB,
            percentage: percentage,
            remaining: maxKB - usedKB
        };
    } catch (error) {
        console.error('Storage calculation error:', error);
        return {
            used: 0,
            usedKB: 0,
            maxKB: 5120,
            percentage: 0,
            remaining: 5120
        };
    }
}

function updateStorageIndicator() {
    const storage = calculateStorageUsage();
    const fillElement = document.getElementById('storage-fill');
    const infoElement = document.getElementById('storage-info');
    
    if (fillElement && infoElement) {
        // Update progress bar
        fillElement.style.width = `${storage.percentage}%`;
        
        // Update text info
        infoElement.textContent = `${storage.usedKB} KB / ${storage.maxKB} KB (${storage.percentage}%)`;
        
        // Change color based on usage
        if (storage.percentage < 50) {
            fillElement.style.background = '#28a745'; // Green
        } else if (storage.percentage < 80) {
            fillElement.style.background = '#ffc107'; // Yellow
        } else {
            fillElement.style.background = '#dc3545'; // Red
        }
        
        // Log details
        console.log(`💾 Storage: ${storage.percentage}% (${storage.usedKB}KB/${storage.maxKB}KB)`);
        
        // Show warning if storage is getting full
        if (storage.percentage > 90) {
            console.warn('⚠️ LocalStorage nearly full! Consider removing some images.');
        }
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeTabs();
    loadCategories();
    loadProducts();
    loadRestaurantSettings();
    loadThemeSettings();
    setupEventListeners();
    
    // Initialize storage indicator
    updateStorageIndicator();
    
    // Update storage indicator every 5 seconds
    setInterval(updateStorageIndicator, 5000);
    
    // Initialize notification system for new orders
    initializeNotificationSystem();
    
    // Initialize table system if on tables tab
    if (document.querySelector('.tab.active')?.getAttribute('data-tab') === 'tables') {
        setTimeout(initializeTableSystem, 500);
    }
});

// Tab functionality
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPanel = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and target panel
            tab.classList.add('active');
            document.getElementById(targetPanel).classList.add('active');
            
            // Initialize table system when tables tab is activated
            if (targetPanel === 'tables') {
                setTimeout(() => {
                    initializeTableSystem();
                    // Reload table data to catch any new orders
                    loadTableSettings();
                    updateTablesDisplay();
                }, 100);
                // Mark table notifications as read when tables tab is opened
                setTimeout(() => {
                    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
                    notifications.forEach(n => n.read = true);
                    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
                    updateNotificationBadge(0);
                }, 500);
            }
        });
    });
}

// Load data from JSON files
async function loadData() {
    try {
        console.log('Loading data...');
        
        // Try to load from localStorage first
        const localMenuItems = localStorage.getItem('menuItems');
        const localCategories = localStorage.getItem('categories');
        const localCategoryOrder = localStorage.getItem('categoryOrder');
        const localRestaurantSettings = localStorage.getItem('restaurantSettings');
        const localThemeSettings = localStorage.getItem('themeSettings');

        // If we have localStorage data, use it
        if (localMenuItems) {
            menuItems = JSON.parse(localMenuItems);
            categories = JSON.parse(localCategories) || {};
            categoryOrder = JSON.parse(localCategoryOrder) || Object.keys(categories);
            restaurantSettings = JSON.parse(localRestaurantSettings) || {};
            themeSettings = JSON.parse(localThemeSettings) || {};
            
            // Also load table settings
            loadTableSettings();
            
            console.log('Loaded data from localStorage');
            return;
        }

        // Try to load from session storage
        const sessionData = {
            menuItems: sessionStorage.getItem('menuItems.json'),
            categories: sessionStorage.getItem('categories.json'),
            categoryOrder: sessionStorage.getItem('categoryOrder.json'),
            restaurantSettings: sessionStorage.getItem('restaurantSettings.json'),
            themeSettings: sessionStorage.getItem('themeSettings.json')
        };

        // If we have session data, use it
        if (sessionData.menuItems) {
            menuItems = JSON.parse(sessionData.menuItems);
            categories = JSON.parse(sessionData.categories);
            categoryOrder = JSON.parse(sessionData.categoryOrder);
            restaurantSettings = JSON.parse(sessionData.restaurantSettings);
            themeSettings = JSON.parse(sessionData.themeSettings);
            console.log('Loaded data from session storage');
            return;
        }

        // Otherwise, try to load from files
        const cacheBuster = `?v=${new Date().getTime()}`;
        const responses = await Promise.all([
            fetch('data/menuItems.json' + cacheBuster).catch(() => ({ ok: false })),
            fetch('data/categories.json' + cacheBuster).catch(() => ({ ok: false })),
            fetch('data/categoryOrder.json' + cacheBuster).catch(() => ({ ok: false })),
            fetch('data/restaurantSettings.json' + cacheBuster).catch(() => ({ ok: false })),
            fetch('data/themeSettings.json' + cacheBuster).catch(() => ({ ok: false }))
        ]);

        // Load menu items
        if (responses[0].ok) {
            menuItems = await responses[0].json();
        } else {
            console.warn('menuItems.json not found, using default data');
            menuItems = [];
        }

        // Load categories
        if (responses[1].ok) {
            categories = await responses[1].json();
        } else {
            console.warn('categories.json not found, using default data');
            categories = {
                'sushi': 'Sushi',
                'sashimi': 'Sashimi',
                'rolls': 'Makiler',
                'appetizers': 'Başlangıçlar',
                'beverages': 'İçecekler'
            };
        }

        // Load category order
        if (responses[2].ok) {
            categoryOrder = await responses[2].json();
        } else {
            console.warn('categoryOrder.json not found, using default data');
            categoryOrder = Object.keys(categories);
        }

        // Load restaurant settings
        if (responses[3].ok) {
            restaurantSettings = await responses[3].json();
        } else {
            console.warn('restaurantSettings.json not found, using default data');
            restaurantSettings = {
                name: 'KOKOYAKİ SUSHİ',
                phone: '0538 599 50 40',
                address: 'Güzeloba Mahallesi Lara Caddesi Yavuz Apt. No: 389/E<br>Muratpaşa Antalya',
                instagram: '',
                facebook: '',
                website: ''
            };
        }

        // Load theme settings
        if (responses[4].ok) {
            themeSettings = await responses[4].json();
        } else {
            console.warn('themeSettings.json not found, using default data');
            themeSettings = {
                primaryColor: '#e74c3c',
                secondaryColor: '#2c3e50',
                accentColor: '#f39c12',
                backgroundColor: '#f8f8f8',
                fontFamily: "'Arial', sans-serif",
                borderRadius: '15px',
                showPrices: true,
                showDescriptions: true,
                logo: null
            };
        }

        // Save loaded data to localStorage for future use
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('categoryOrder', JSON.stringify(categoryOrder));
        localStorage.setItem('restaurantSettings', JSON.stringify(restaurantSettings));
        localStorage.setItem('themeSettings', JSON.stringify(themeSettings));

        console.log('Data loaded successfully from files and saved to localStorage');
    } catch (error) {
        console.error('Error loading data:', error);
        showAlert('Veri yüklenirken hata oluştu', 'error');
    }
}

// Save data to JSON files
async function saveData() {
    try {
        // Save data to localStorage for immediate use
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('categoryOrder', JSON.stringify(categoryOrder));
        localStorage.setItem('restaurantSettings', JSON.stringify(restaurantSettings));
        localStorage.setItem('themeSettings', JSON.stringify(themeSettings));

        // Also save to sessionStorage as backup
        sessionStorage.setItem('menuItems.json', JSON.stringify(menuItems, null, 2));
        sessionStorage.setItem('categories.json', JSON.stringify(categories, null, 2));
        sessionStorage.setItem('categoryOrder.json', JSON.stringify(categoryOrder, null, 2));
        sessionStorage.setItem('restaurantSettings.json', JSON.stringify(restaurantSettings, null, 2));
        sessionStorage.setItem('themeSettings.json', JSON.stringify(themeSettings, null, 2));

        // Update the current page data immediately
        window.postMessage({
            type: 'DATA_UPDATED',
            data: {
                menuItems,
                categories,
                categoryOrder,
                restaurantSettings,
                themeSettings
            }
        }, '*');

        showAlert('Veriler başarıyla kaydedildi! Ana menü otomatik güncellendi.', 'success');
        
        // Update storage indicator after saving
        updateStorageIndicator();
        
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        showAlert('Veriler kaydedilirken hata oluştu', 'error');
        return false;
    }
}

// Category Management
function loadCategories() {
    const container = document.getElementById('categories-sortable');
    container.innerHTML = '';

    // Update category filter in products tab
    updateCategoryFilter();

    if (categoryOrder.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Henüz kategori eklenmemiş</p></div>';
        return;
    }

    categoryOrder.forEach(categoryId => {
        if (categories[categoryId]) {
            const li = document.createElement('li');
            li.className = 'sortable-item';
            li.draggable = true;
            li.dataset.categoryId = categoryId;
            
            li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="drag-handle">☰</span>
                    <strong>${categories[categoryId]}</strong>
                    <span style="color: #6c757d; font-size: 0.9em;">(${getProductCountForCategory(categoryId)} ürün)</span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-warning" onclick="editCategory('${categoryId}')">✏️ Düzenle</button>
                    <button class="btn btn-danger" onclick="deleteCategory('${categoryId}')">🗑️ Sil</button>
                </div>
            `;
            
            container.appendChild(li);
        }
    });

    setupSortable();
}

function getProductCountForCategory(categoryId) {
    return menuItems.filter(item => item.category === categoryId).length;
}

function updateCategoryFilter() {
    const filter = document.getElementById('category-filter');
    const productCategory = document.getElementById('product-category');
    
    // Clear existing options except "Tüm Kategoriler"
    filter.innerHTML = '<option value="">Tüm Kategoriler</option>';
    productCategory.innerHTML = '<option value="">Kategori Seçin</option>';
    
    categoryOrder.forEach(categoryId => {
        if (categories[categoryId]) {
            const option1 = document.createElement('option');
            option1.value = categoryId;
            option1.textContent = categories[categoryId];
            filter.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = categoryId;
            option2.textContent = categories[categoryId];
            productCategory.appendChild(option2);
        }
    });
}

function setupSortable() {
    const container = document.getElementById('categories-sortable');
    let draggedElement = null;

    container.addEventListener('dragstart', (e) => {
        draggedElement = e.target;
        e.target.classList.add('dragging');
    });

    container.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        draggedElement = null;
    });

    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const dragging = document.querySelector('.dragging');
        
        if (afterElement == null) {
            container.appendChild(dragging);
        } else {
            container.insertBefore(dragging, afterElement);
        }
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        updateCategoryOrder();
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateCategoryOrder() {
    const items = document.querySelectorAll('#categories-sortable .sortable-item');
    categoryOrder = Array.from(items).map(item => item.dataset.categoryId);
    saveData();
}

function openCategoryModal(categoryId = null) {
    currentEditingCategory = categoryId;
    const modal = document.getElementById('category-modal');
    const title = document.getElementById('category-modal-title');
    const nameInput = document.getElementById('category-name');
    
    if (categoryId) {
        title.textContent = 'Kategori Düzenle';
        nameInput.value = categories[categoryId];
    } else {
        title.textContent = 'Yeni Kategori Ekle';
        nameInput.value = '';
    }
    
    modal.style.display = 'block';
    nameInput.focus();
}

function closeCategoryModal() {
    document.getElementById('category-modal').style.display = 'none';
    currentEditingCategory = null;
}

function editCategory(categoryId) {
    openCategoryModal(categoryId);
}

function deleteCategory(categoryId) {
    const productCount = getProductCountForCategory(categoryId);
    
    if (productCount > 0) {
        showAlert(`Bu kategoride ${productCount} ürün bulunuyor. Önce ürünleri silin veya başka kategoriye taşıyın.`, 'error');
        return;
    }
    
    if (confirm(`"${categories[categoryId]}" kategorisini silmek istediğinizden emin misiniz?`)) {
        delete categories[categoryId];
        categoryOrder = categoryOrder.filter(id => id !== categoryId);
        loadCategories();
        saveData();
        showAlert('Kategori başarıyla silindi!', 'success');
    }
}

// Product Management
function loadProducts() {
    const container = document.getElementById('products-grid');
    const categoryFilter = document.getElementById('category-filter').value;
    
    container.innerHTML = '';
    
    if (menuItems.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Henüz ürün eklenmemiş</p></div>';
        return;
    }

    if (categoryFilter) {
        // Show products from selected category only
        const filteredProducts = menuItems.filter(item => item.category === categoryFilter);
        
        if (filteredProducts.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Bu kategoride ürün bulunmuyor</p></div>';
            return;
        }

        const categoryName = categories[categoryFilter] || 'Bilinmeyen Kategori';
        const categorySection = createCategorySection(categoryFilter, categoryName, filteredProducts);
        container.appendChild(categorySection);
    } else {
        // Show all products grouped by category
        const categorizedProducts = {};
        
        // Group products by category
        menuItems.forEach(product => {
            if (!categorizedProducts[product.category]) {
                categorizedProducts[product.category] = [];
            }
            categorizedProducts[product.category].push(product);
        });

        // Create sections for each category
        categoryOrder.forEach(categoryId => {
            if (categorizedProducts[categoryId] && categorizedProducts[categoryId].length > 0) {
                const categoryName = categories[categoryId] || 'Bilinmeyen Kategori';
                const categorySection = createCategorySection(categoryId, categoryName, categorizedProducts[categoryId]);
                container.appendChild(categorySection);
            }
        });

        // Add products from categories not in categoryOrder
        Object.keys(categorizedProducts).forEach(categoryId => {
            if (!categoryOrder.includes(categoryId) && categorizedProducts[categoryId].length > 0) {
                const categoryName = categories[categoryId] || 'Bilinmeyen Kategori';
                const categorySection = createCategorySection(categoryId, categoryName, categorizedProducts[categoryId]);
                container.appendChild(categorySection);
            }
        });
    }
    
    // Setup drag and drop for products
    setupProductDragAndDrop();
}

function createCategorySection(categoryId, categoryName, products) {
    const section = document.createElement('div');
    section.className = 'category-section';
    section.style.marginBottom = '30px';
    
    const header = document.createElement('h4');
    header.style.color = '#2c3e50';
    header.style.marginBottom = '15px';
    header.style.paddingBottom = '8px';
    header.style.borderBottom = '2px solid #e74c3c';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.innerHTML = `
        <span>📂 ${categoryName}</span>
        <span style="font-size: 12px; color: #6c757d; font-weight: normal;">${products.length} ürün</span>
    `;
    section.appendChild(header);

    const sortableList = document.createElement('ul');
    sortableList.className = 'sortable-list';
    sortableList.id = `products-sortable-${categoryId}`;
    sortableList.dataset.categoryId = categoryId;
    
    products.forEach(product => {
        const productLi = document.createElement('li');
        productLi.className = 'sortable-item';
        productLi.draggable = true;
        productLi.dataset.productId = product.id;
        productLi.dataset.categoryId = categoryId;
        
        const tagsHtml = product.tags ? product.tags.map(tag => 
            `<span class="tag ${tag}">${getTagText(tag)}</span>`
        ).join(' ') : '';
        
        productLi.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; width: 100%;">
                <span class="drag-handle">☰</span>
                <div style="flex: 1;">
                    <div class="grid-item-title">${product.name}</div>
                    <div class="grid-item-details">
                        <strong>Fiyat:</strong> ${product.price} ₺
                        ${product.description ? ` | <strong>Açıklama:</strong> ${product.description}` : ''}
                        ${tagsHtml ? `<br><strong>Etiketler:</strong> ${tagsHtml}` : ''}
                    </div>
                </div>
                <div class="grid-item-actions">
                    <button class="btn btn-warning" onclick="editProduct('${product.id}')">✏️ Düzenle</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">🗑️ Sil</button>
                </div>
            </div>
        `;
        
        sortableList.appendChild(productLi);
    });
    
    section.appendChild(sortableList);
    return section;
}

function filterProducts() {
    loadProducts();
}

// Product drag and drop functionality
function setupProductDragAndDrop() {
    const productLists = document.querySelectorAll('[id^="products-sortable"]');
    
    productLists.forEach(productsList => {
        const productItems = productsList.querySelectorAll('.sortable-item');
        
        productItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                item.classList.add('dragging');
                e.dataTransfer.setData('text/plain', item.dataset.productId);
                e.dataTransfer.setData('text/category', item.dataset.categoryId);
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const draggingItem = productsList.querySelector('.dragging');
                if (!draggingItem) return;
                
                // Only allow reordering within the same category
                if (draggingItem.dataset.categoryId === productsList.dataset.categoryId) {
                    const siblings = [...productsList.querySelectorAll('.sortable-item:not(.dragging)')];
                    
                    const nextSibling = siblings.find(sibling => {
                        return e.clientY <= sibling.getBoundingClientRect().top + sibling.offsetHeight / 2;
                    });
                    
                    productsList.insertBefore(draggingItem, nextSibling);
                }
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                saveProductOrder();
            });
        });
    });
}

function saveProductOrder() {
    const categoryFilter = document.getElementById('category-filter').value;
    
    if (categoryFilter) {
        // Save order for specific category
        const productsList = document.getElementById(`products-sortable-${categoryFilter}`);
        if (productsList) {
            const productItems = [...productsList.querySelectorAll('.sortable-item')];
            const categoryProducts = menuItems.filter(p => p.category === categoryFilter);
            const otherProducts = menuItems.filter(p => p.category !== categoryFilter);
            const newOrder = productItems.map(item => item.dataset.productId);
            
            const reorderedCategoryProducts = [];
            newOrder.forEach(id => {
                const product = categoryProducts.find(p => p.id.toString() === id);
                if (product) reorderedCategoryProducts.push(product);
            });
            
            // Rebuild menuItems array maintaining other categories' order
            const newMenuItems = [];
            
            // Add products from other categories in their original positions
            menuItems.forEach(product => {
                if (product.category !== categoryFilter) {
                    newMenuItems.push(product);
                }
            });
            
            // Insert reordered category products at the end
            newMenuItems.push(...reorderedCategoryProducts);
            
            menuItems = newMenuItems;
        }
    } else {
        // Save order for all categories
        const newMenuItems = [];
        
        categoryOrder.forEach(categoryId => {
            const productsList = document.getElementById(`products-sortable-${categoryId}`);
            if (productsList) {
                const productItems = [...productsList.querySelectorAll('.sortable-item')];
                const newOrder = productItems.map(item => item.dataset.productId);
                
                newOrder.forEach(id => {
                    const product = menuItems.find(p => p.id.toString() === id);
                    if (product) newMenuItems.push(product);
                });
            }
        });
        
        // Add any remaining products not in the ordered categories
        menuItems.forEach(product => {
            if (!newMenuItems.find(p => p.id === product.id)) {
                newMenuItems.push(product);
            }
        });
        
        menuItems = newMenuItems;
    }
    
    saveData();
    console.log('Ürün sıralaması kaydedildi');
}

function openProductModal(productId = null) {
    currentEditingProduct = productId;
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    
    // Clear form
    document.getElementById('product-form').reset();
    
    // Clear image preview
    const preview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    preview.style.display = 'none';
    previewImg.src = '';
    document.getElementById('product-image-file').value = '';
    
    if (productId) {
        title.textContent = 'Ürün Düzenle';
        const product = menuItems.find(p => p.id.toString() === productId.toString());
        if (product) {
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-description').value = product.description || '';
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-image').value = product.image || '';
            
            // Show existing image preview if available
            if (product.image) {
                previewImg.src = product.image;
                preview.style.display = 'block';
            }
            
            // Set tags
            const tagSelect = document.getElementById('product-tags');
            Array.from(tagSelect.options).forEach(option => {
                option.selected = product.tags && product.tags.includes(option.value);
            });
        }
    } else {
        title.textContent = 'Yeni Ürün Ekle';
    }
    
    modal.style.display = 'block';
    document.getElementById('product-name').focus();
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    currentEditingProduct = null;
    
    // Clear image preview
    const preview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    preview.style.display = 'none';
    previewImg.src = '';
    document.getElementById('product-image-file').value = '';
}

function editProduct(productId) {
    openProductModal(productId);
}

function deleteProduct(productId) {
    const product = menuItems.find(p => p.id.toString() === productId.toString());
    if (product && confirm(`"${product.name}" ürününü silmek istediğinizden emin misiniz?`)) {
        menuItems = menuItems.filter(p => p.id.toString() !== productId.toString());
        loadProducts();
        saveData();
        showAlert('Ürün başarıyla silindi!', 'success');
    }
}

function getTagText(tag) {
    const tagTexts = {
        'vegetarian': 'Vejeteryan',
        'vegan': 'Vegan',
        'spicy': 'Acılı',
        'gluten-free': 'Glutensiz'
    };
    return tagTexts[tag] || tag.toUpperCase();
}

// Settings Management
function loadRestaurantSettings() {
    document.getElementById('restaurant-name').value = restaurantSettings.name || '';
    document.getElementById('restaurant-phone').value = restaurantSettings.phone || '';
    document.getElementById('restaurant-address').value = restaurantSettings.address || '';
    document.getElementById('restaurant-instagram').value = restaurantSettings.instagram || '';
    document.getElementById('restaurant-facebook').value = restaurantSettings.facebook || '';
    document.getElementById('restaurant-website').value = restaurantSettings.website || '';
}

function loadThemeSettings() {
    document.getElementById('primary-color').value = themeSettings.primaryColor || '#e74c3c';
    document.getElementById('secondary-color').value = themeSettings.secondaryColor || '#2c3e50';
    document.getElementById('accent-color').value = themeSettings.accentColor || '#f39c12';
    document.getElementById('background-color').value = themeSettings.backgroundColor || '#f8f8f8';
    document.getElementById('font-family').value = themeSettings.fontFamily || "'Arial', sans-serif";
    
    const borderRadius = parseInt(themeSettings.borderRadius) || 15;
    document.getElementById('border-radius').value = borderRadius;
    document.getElementById('border-radius-value').textContent = borderRadius + 'px';
    
    document.getElementById('show-prices').checked = themeSettings.showPrices !== false;
    document.getElementById('show-descriptions').checked = themeSettings.showDescriptions !== false;
    document.getElementById('logo-url').value = themeSettings.logo || '';
}

// Event Listeners
function setupEventListeners() {
    // Category form
    document.getElementById('category-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('category-name').value.trim();
        
        if (name) {
            if (currentEditingCategory) {
                // Edit existing category
                categories[currentEditingCategory] = name;
                showAlert('Kategori başarıyla güncellendi!', 'success');
            } else {
                // Add new category
                const categoryId = generateId();
                categories[categoryId] = name;
                categoryOrder.push(categoryId);
                showAlert('Kategori başarıyla eklendi!', 'success');
            }
            
            loadCategories();
            saveData();
            closeCategoryModal();
        }
    });

    // Product form
    document.getElementById('product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('product-name').value.trim();
        const category = document.getElementById('product-category').value;
        const description = document.getElementById('product-description').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const image = document.getElementById('product-image').value.trim();
        
        // Get selected tags
        const tagSelect = document.getElementById('product-tags');
        const tags = Array.from(tagSelect.selectedOptions).map(option => option.value);
        
        if (name && category && !isNaN(price)) {
            const productData = {
                name,
                category,
                description: description || null,
                price,
                image: image || null,
                tags: tags.length > 0 ? tags : null
            };
            
            if (currentEditingProduct) {
                // Edit existing product
                const productIndex = menuItems.findIndex(p => p.id.toString() === currentEditingProduct.toString());
                if (productIndex !== -1) {
                    menuItems[productIndex] = { ...menuItems[productIndex], ...productData };
                    showAlert('Ürün başarıyla güncellendi!', 'success');
                }
            } else {
                // Add new product
                productData.id = generateId();
                menuItems.push(productData);
                showAlert('Ürün başarıyla eklendi!', 'success');
            }
            
            loadProducts();
            saveData();
            closeProductModal();
        }
    });

    // Restaurant settings form
    document.getElementById('restaurant-settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        restaurantSettings = {
            name: document.getElementById('restaurant-name').value.trim(),
            phone: document.getElementById('restaurant-phone').value.trim(),
            address: document.getElementById('restaurant-address').value.trim(),
            instagram: document.getElementById('restaurant-instagram').value.trim(),
            facebook: document.getElementById('restaurant-facebook').value.trim(),
            website: document.getElementById('restaurant-website').value.trim()
        };
        
        saveData();
        showAlert('Restoran ayarları başarıyla kaydedildi!', 'success');
    });

    // Theme settings form
    document.getElementById('theme-settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        themeSettings = {
            primaryColor: document.getElementById('primary-color').value,
            secondaryColor: document.getElementById('secondary-color').value,
            accentColor: document.getElementById('accent-color').value,
            backgroundColor: document.getElementById('background-color').value,
            fontFamily: document.getElementById('font-family').value,
            borderRadius: document.getElementById('border-radius').value + 'px',
            showPrices: document.getElementById('show-prices').checked,
            showDescriptions: document.getElementById('show-descriptions').checked,
            logo: document.getElementById('logo-url').value.trim() || null
        };
        
        saveData();
        showAlert('Tema ayarları başarıyla kaydedildi!', 'success');
    });

    // Border radius slider
    document.getElementById('border-radius').addEventListener('input', (e) => {
        document.getElementById('border-radius-value').textContent = e.target.value + 'px';
    });

    // Modal close on outside click
    window.addEventListener('click', (e) => {
        const categoryModal = document.getElementById('category-modal');
        const productModal = document.getElementById('product-modal');
        
        if (e.target === categoryModal) {
            closeCategoryModal();
        }
        if (e.target === productModal) {
            closeProductModal();
        }
    });
}

// Utility Functions
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function showAlert(message, type = 'success') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'success' ? 'success' : 'error'}`;
    alert.textContent = message;
    
    // Insert at the top of the active tab panel
    const activePanel = document.querySelector('.tab-panel.active');
    activePanel.insertBefore(alert, activePanel.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Download all JSON files manually
function downloadAllFiles() {
    const dataToDownload = {
        'menuItems.json': menuItems,
        'categories.json': categories,
        'categoryOrder.json': categoryOrder,
        'restaurantSettings.json': restaurantSettings,
        'themeSettings.json': themeSettings
    };

    Object.keys(dataToDownload).forEach(filename => {
        setTimeout(() => {
            downloadJSON(filename, dataToDownload[filename]);
        }, 100 * Object.keys(dataToDownload).indexOf(filename));
    });

    showAlert('Tüm JSON dosyaları indiriliyor! İndirilen dosyaları data/ klasörüne kopyalayın.', 'success');
}

// Download individual JSON file
function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== TABLE MANAGEMENT SYSTEM ====================

// Global table variables
let tableSettings = {}; // Boş başlat, loadTableSettings'den yüklenecek

let currentTableModal = null;

// Initialize table system
function initializeTableSystem() {
    console.log('🏠 Masa sistemi başlatılıyor...');
    
    // Önce masa ayarlarını yükle
    loadTableSettings();
    
    // Eğer hala boşsa default ayarları başlat
    if (!tableSettings.tableCount) {
        initializeDefaultTableSettings();
    }
    
    // Tamamlanan siparişleri kontrol et
    const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    console.log('📦 Tamamlanan sipariş sayısı:', completedOrders.length);
    
    // Masa ızgarasını oluştur
    generateTablesGrid();
    
    // Bildirimleri göster
    updateNotificationsDisplay();
    
    // Periyodik güncelleme başlat
    setInterval(() => {
        updateTablesDisplay();
        updateNotificationsDisplay();
    }, 2000); // Her 2 saniyede bir güncelle
    
    console.log('✅ Masa sistemi hazır');
}

// Load table settings from localStorage
function loadTableSettings() {
    const saved = localStorage.getItem('tableSettings');
    console.log('📋 Admin: Masa ayarları yükleniyor:', saved ? 'Veri var' : 'Veri yok');
    
    if (saved) {
        try {
            const loadedSettings = JSON.parse(saved);
            // Mevcut tableSettings'i tamamen değiştir
            tableSettings = loadedSettings;
            console.log('📊 Admin: Yüklenmiş masa ayarları:', tableSettings);
            console.log('🏠 Admin: Masa sayısı:', tableSettings.tableCount);
            console.log('📋 Admin: Masalar:', Object.keys(tableSettings.tables || {}).length, 'masa tanımlı');
            
            // Show details of occupied tables
            Object.values(tableSettings.tables || {}).forEach(table => {
                if (!table.isEmpty && table.orders && Object.keys(table.orders).length > 0) {
                    console.log(`🍽️ Admin: Masa ${table.number} dolu - ${Object.keys(table.orders).length} kişi, ${table.totalAmount} ₺`);
                }
            });
        } catch (error) {
            console.error('❌ Admin: Masa ayarları yüklenirken hata:', error);
            // Hata durumunda varsayılan değerleri kullan
            initializeDefaultTableSettings();
        }
    } else {
        console.log('📋 Admin: Veri bulunamadı, varsayılan ayarlar kullanılıyor');
        initializeDefaultTableSettings();
    }
    
    // Update UI
    const tableCountInput = document.getElementById('table-count');
    if (tableCountInput) {
        tableCountInput.value = tableSettings.tableCount;
    }
}

// Initialize default table settings
function initializeDefaultTableSettings() {
    console.log('🏠 Admin: Varsayılan masa ayarları başlatılıyor...');
    
    // Mevcut ayarları koru, sadece eksik olanları ekle
    if (!tableSettings.tableCount) {
        tableSettings.tableCount = 10;
    }
    
    if (!tableSettings.tables) {
        tableSettings.tables = {};
    }
    
    // Gerekli masa sayısı kadar boş masa oluştur
    for (let i = 1; i <= tableSettings.tableCount; i++) {
        if (!tableSettings.tables[i]) {
            tableSettings.tables[i] = {
                number: i,
                orders: {},
                isEmpty: true,
                totalAmount: 0,
                lastUpdate: null,
                completedOrders: []
            };
        }
    }
    
    console.log('✅ Admin: Varsayılan masa ayarları hazırlandı');
    saveTableSettings();
}

// Save table settings to localStorage
function saveTableSettings() {
    try {
        const dataToSave = JSON.stringify(tableSettings);
        localStorage.setItem('tableSettings', dataToSave);
        console.log('💾 Admin: Masa ayarları kaydedildi:', Object.keys(tableSettings.tables || {}).length, 'masa');
    } catch (error) {
        console.error('❌ Admin: Masa ayarları kaydedilirken hata:', error);
    }
}

// Update table count
function updateTableCount() {
    const tableCountInput = document.getElementById('table-count');
    const newCount = parseInt(tableCountInput.value);
    
    if (newCount < 1 || newCount > 100) {
        alert('Masa sayısı 1 ile 100 arasında olmalıdır!');
        tableCountInput.value = tableSettings.tableCount;
        return;
    }
    
    tableSettings.tableCount = newCount;
}

// Apply table settings
function applyTableSettings() {
    updateTableCount();
    
    // Initialize tables object for new count
    const newTables = {};
    for (let i = 1; i <= tableSettings.tableCount; i++) {
        if (tableSettings.tables[i]) {
            newTables[i] = tableSettings.tables[i];
        } else {
            newTables[i] = {
                number: i,
                orders: {},
                isEmpty: true,
                totalAmount: 0,
                lastUpdate: null
            };
        }
    }
    
    tableSettings.tables = newTables;
    saveTableSettings();
    generateTablesGrid();
    
    alert(`✅ ${tableSettings.tableCount} masa başarıyla oluşturuldu!`);
}

// Generate tables grid
function generateTablesGrid() {
    const container = document.getElementById('tablesGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    // tableSettings henüz yüklenmediyse bekle
    if (!tableSettings || !tableSettings.hasOwnProperty('tableCount')) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; grid-column: 1/-1;">Masa ayarları yükleniyor...</p>';
        return;
    }
    
    if (tableSettings.tableCount === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d; grid-column: 1/-1;">Henüz masa tanımlanmamış. Yukarıdan masa sayısını belirleyip "Masa Ayarlarını Uygula" butonuna tıklayın.</p>';
        return;
    }
    
    for (let i = 1; i <= tableSettings.tableCount; i++) {
        const table = tableSettings.tables[i] || {
            number: i,
            orders: {},
            isEmpty: true,
            totalAmount: 0,
            lastUpdate: null
        };
        
        const tableCard = createTableCard(table);
        container.appendChild(tableCard);
    }
}

// Create table card element
function createTableCard(table) {
    const card = document.createElement('div');
    card.className = `table-card ${table.isEmpty ? 'empty' : 'occupied'}`;
    card.onclick = () => openTableModal(table.number);
    
    const personCount = Object.keys(table.orders).length;
    const statusText = table.isEmpty ? 'BOŞ' : `${personCount} KİŞİ`;
    const statusClass = table.isEmpty ? 'empty' : 'occupied';
    
    // Count new orders
    let newOrdersCount = 0;
    if (!table.isEmpty && table.orders) {
        Object.keys(table.orders).forEach(personId => {
            const person = table.orders[personId];
            if (person.items) {
                person.items.forEach(item => {
                    // Sadece henüz submit edilmemiş ve yeni olan siparişleri say
                    if (item.isNew && !item.isSubmitted) {
                        newOrdersCount++;
                    }
                });
            }
        });
    }
    
    // New orders indicator
    let newOrdersIndicator = '';
    if (newOrdersCount > 0) {
        newOrdersIndicator = `
            <div class="new-orders-badge" style="position: absolute; top: -8px; right: -8px; background: #ff4757; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; animation: pulse 1.5s infinite;">
                ${newOrdersCount}
            </div>
        `;
    }
    
    // Calculate payment status if table is not empty
    let paymentStatusHtml = '';
    if (!table.isEmpty) {
        const totalAmount = table.totalAmount || 0;
        
        // Calculate paid amounts
        let totalPaid = 0;
        let totalPartialPaid = 0;
        
        // Tam ödenen kişilerin toplamı
        if (table.orders) {
            Object.keys(table.orders).forEach(personId => {
                const person = table.orders[personId];
                const personTotal = person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const paymentInfo = table.persons?.[person.name] || {};
                
                if (paymentInfo.paymentStatus === 'paid') {
                    totalPaid += personTotal;
                }
            });
        }
        
        // Kısmi ödemeler
        if (table.partialPayments && table.partialPayments.length > 0) {
            totalPartialPaid = table.partialPayments.reduce((sum, payment) => sum + payment.amount, 0);
        }
        
        const totalPaidAmount = totalPaid + totalPartialPaid;
        const remainingDebt = totalAmount - totalPaidAmount;
        
        let paymentIcon = '';
        let paymentColor = '';
        let paymentText = '';
        
        if (remainingDebt <= 0) {
            paymentIcon = '✅';
            paymentColor = '#27ae60';
            paymentText = remainingDebt < 0 ? `FAZLA: ${Math.abs(remainingDebt).toFixed(2)} ₺` : 'TAM ÖDENDİ';
        } else if (totalPaidAmount > 0) {
            paymentIcon = '⏳';
            paymentColor = '#f39c12';
            paymentText = `KALAN: ${remainingDebt.toFixed(2)} ₺`;
        } else {
            paymentIcon = '⭕';
            paymentColor = '#e74c3c';
            paymentText = `BORÇ: ${remainingDebt.toFixed(2)} ₺`;
        }
        
        paymentStatusHtml = `
            <div class="payment-status" style="background: ${paymentColor}; color: white; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: bold; margin: 5px 0; text-align: center;">
                ${paymentIcon} ${paymentText}
            </div>
        `;
    }
    
    card.innerHTML = `
        <div style="position: relative;">
            ${newOrdersIndicator}
            <div class="table-number">MASA ${table.number}</div>
        </div>
        <div class="table-status ${statusClass}">${statusText}</div>
        <div class="table-info">
            ${table.isEmpty ? 'Müşteri bekleniyor' : `Toplam: ${table.totalAmount.toFixed(2)} ₺`}
        </div>
        ${paymentStatusHtml}
        ${!table.isEmpty ? `
            <div class="order-summary">
                ${Object.keys(table.orders).slice(0, 3).map(personId => {
                    const person = table.orders[personId];
                    const itemCount = person.items.length;
                    const personTotal = person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    return `<div class="order-summary-item">
                        <span>${person.name}</span>
                        <span>${personTotal.toFixed(2)} ₺</span>
                    </div>`;
                }).join('')}
                ${Object.keys(table.orders).length > 3 ? `<div class="order-summary-item"><span>+${Object.keys(table.orders).length - 3} kişi daha</span><span></span></div>` : ''}
            </div>
        ` : ''}
        <div class="table-actions">
            <button class="btn btn-primary" onclick="event.stopPropagation(); openTableModal(${table.number})">
                👁️ Detay
            </button>
            ${!table.isEmpty ? `
                <button class="btn btn-warning" onclick="event.stopPropagation(); clearTable(${table.number})">
                    🧹 Temizle
                </button>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Update tables display
function updateTablesDisplay() {
    console.log('🔄 Admin: Updating tables display...');
    
    // Reload table settings to get latest admin data (includes submitted orders)
    loadTableSettings();
    
    // Also ensure completed orders are available
    const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    console.log('📦 Admin: Loaded completed orders:', completedOrders.length);
    
    // Regenerate the grid to show current state
    generateTablesGrid();
    
    console.log('✅ Admin: Tables display updated');
}

// Debug function - localStorage durumunu kontrol et
function debugLocalStorage() {
    console.log('🔍 LocalStorage Debug:');
    console.log('📋 tableSettings:', localStorage.getItem('tableSettings'));
    console.log('📦 completedOrders:', localStorage.getItem('completedOrders'));
    console.log('📋 tableData:', localStorage.getItem('tableData'));
    
    try {
        const tableSettings = JSON.parse(localStorage.getItem('tableSettings') || '{}');
        console.log('📊 Parsed tableSettings:', tableSettings);
        
        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        console.log('📦 Parsed completedOrders:', completedOrders.length, 'orders');
    } catch (error) {
        console.error('❌ Parse error:', error);
    }
}

// Global olarak erişilebilir yap
window.debugLocalStorage = debugLocalStorage;

// Clear all tables
function clearAllTables() {
    if (confirm('Tüm masaları temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
        Object.keys(tableSettings.tables).forEach(tableNum => {
            tableSettings.tables[tableNum] = {
                number: parseInt(tableNum),
                orders: {},
                isEmpty: true,
                totalAmount: 0,
                lastUpdate: null
            };
        });
        
        saveTableSettings();
        generateTablesGrid();
        
        // Also clear customer table data
        localStorage.removeItem('tableData');
        
        alert('✅ Tüm masalar temizlendi!');
    }
}

// Open table modal
function openTableModal(tableNumber) {
    currentTableModal = tableNumber;
    const table = tableSettings.tables[tableNumber];
    
    if (!table) return;
    
    const modal = document.getElementById('table-modal');
    const titleElement = document.getElementById('table-modal-title');
    
    titleElement.textContent = `MASA ${tableNumber} - Sipariş Detayları`;
    
    // Populate admin product list
    populateAdminProductList();
    
    updateTableModalContent(table);
    modal.style.display = 'block';
}

// Close table modal
function closeTableModal() {
    document.getElementById('table-modal').style.display = 'none';
    currentTableModal = null;
    
    // Clear admin product form
    document.getElementById('admin-person-select').value = '';
    document.getElementById('admin-person-name').value = '';
    document.getElementById('admin-product-select').value = '';
    document.getElementById('admin-product-quantity').value = '1';
    document.getElementById('admin-product-price').value = '';
}

// Populate admin product list
function populateAdminProductList() {
    const productSelect = document.getElementById('admin-product-select');
    productSelect.innerHTML = '<option value="">Ürün seçin</option>';
    
    // Group products by category
    const categorizedProducts = {};
    menuItems.forEach(product => {
        const categoryName = categories[product.category] || 'Diğer';
        if (!categorizedProducts[categoryName]) {
            categorizedProducts[categoryName] = [];
        }
        categorizedProducts[categoryName].push(product);
    });
    
    // Add products to select grouped by category
    Object.keys(categorizedProducts).forEach(categoryName => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = categoryName;
        
        categorizedProducts[categoryName].forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - ${product.price} ₺`;
            option.dataset.price = product.price;
            option.dataset.name = product.name;
            optgroup.appendChild(option);
        });
        
        productSelect.appendChild(optgroup);
    });
    
    // Update price when product is selected
    productSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const priceInput = document.getElementById('admin-product-price');
        
        if (selectedOption.dataset.price) {
            priceInput.value = selectedOption.dataset.price;
        } else {
            priceInput.value = '';
        }
    });
}

// Admin add product to table
function adminAddProductToTable() {
    const personSelect = document.getElementById('admin-person-select');
    const personNameInput = document.getElementById('admin-person-name');
    const productSelect = document.getElementById('admin-product-select');
    const quantity = parseInt(document.getElementById('admin-product-quantity').value);
    const price = parseFloat(document.getElementById('admin-product-price').value);
    
    // Get person name from either dropdown or input
    let personName = '';
    let personId = '';
    
    if (personSelect.value) {
        // Use existing person
        personId = personSelect.value;
        personName = personSelect.options[personSelect.selectedIndex].text;
    } else if (personNameInput.value.trim()) {
        // Create new person
        personName = personNameInput.value.trim();
        personId = personName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    } else {
        // No person specified - add as "Admin Siparişi"
        personName = 'Admin Siparişi';
        personId = 'admin_order_' + Date.now();
    }
    
    if (!productSelect.value) {
        alert('Lütfen bir ürün seçin!');
        return;
    }
    
    if (!quantity || quantity < 1) {
        alert('Lütfen geçerli bir adet girin!');
        return;
    }
    
    if (!price || price <= 0) {
        alert('Lütfen geçerli bir fiyat girin!');
        return;
    }
    
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const productName = selectedOption.dataset.name;
    const productId = productSelect.value;
    
    // Get current table
    const table = tableSettings.tables[currentTableModal];
    if (!table) return;
    
    // Add product to table orders
    if (!table.orders[personId]) {
        table.orders[personId] = {
            name: personName,
            items: []
        };
    }
    
    // Check if product already exists for this person
    const existingItemIndex = table.orders[personId].items.findIndex(item => item.id === productId);
    
    if (existingItemIndex >= 0) {
        // Update quantity
        table.orders[personId].items[existingItemIndex].quantity += quantity;
        // Update timestamp for quantity change
        table.orders[personId].items[existingItemIndex].lastModified = new Date().toISOString();
    } else {
        // Add new item
        table.orders[personId].items.push({
            id: productId,
            name: productName,
            price: price,
            quantity: quantity,
            orderedAt: new Date().toISOString(), // Admin tarafından ekleme zamanı
            isAdminAdded: true, // Admin tarafından eklendi işareti
            addedBy: 'admin'
        });
    }
    
    // Update table status
    table.isEmpty = false;
    table.lastUpdate = new Date().toISOString();
    
    // Recalculate total amount
    let totalAmount = 0;
    Object.values(table.orders).forEach(person => {
        person.items.forEach(item => {
            totalAmount += item.price * item.quantity;
        });
    });
    table.totalAmount = totalAmount;
    
    // Save changes
    saveTableSettings();
    
    // Update display
    updateTableModalContent(table);
    updateTablesDisplay();
    
    // Clear form
    document.getElementById('admin-person-select').value = '';
    document.getElementById('admin-person-name').value = '';
    document.getElementById('admin-product-select').value = '';
    document.getElementById('admin-product-quantity').value = '1';
    document.getElementById('admin-product-price').value = '';
    
    // Show success message
    showAlert(`✅ ${productName} (${quantity} adet) ${personName} için eklendi!`, 'success');
}

// Remove item from person's order
function removeItemFromPerson(personId, itemIndex) {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    const table = tableSettings.tables[currentTableModal];
    if (!table || !table.orders[personId]) return;
    
    const person = table.orders[personId];
    const removedItem = person.items[itemIndex];
    
    // Remove item from array
    person.items.splice(itemIndex, 1);
    
    // If person has no items left, remove person
    if (person.items.length === 0) {
        delete table.orders[personId];
    }
    
    // Check if table is empty
    if (Object.keys(table.orders).length === 0) {
        table.isEmpty = true;
        table.totalAmount = 0;
    } else {
        // Recalculate total amount
        let totalAmount = 0;
        Object.values(table.orders).forEach(person => {
            person.items.forEach(item => {
                totalAmount += item.price * item.quantity;
            });
        });
        table.totalAmount = totalAmount;
    }
    
    table.lastUpdate = new Date().toISOString();
    
    // Save changes
    saveTableSettings();
    
    // Update display
    updateTableModalContent(table);
    updateTablesDisplay();
    
    // Show success message
    showAlert(`🗑️ ${removedItem.name} silindi!`, 'success');
}

// Remove person from table
function removePersonFromTable(personId) {
    const table = tableSettings.tables[currentTableModal];
    if (!table || !table.orders[personId]) return;
    
    const person = table.orders[personId];
    const itemCount = person.items.length;
    
    if (!confirm(`${person.name} adlı kişiyi ve ${itemCount} ürününü silmek istediğinizden emin misiniz?`)) {
        return;
    }
    
    // Remove person from orders
    delete table.orders[personId];
    
    // Check if table is empty
    if (Object.keys(table.orders).length === 0) {
        table.isEmpty = true;
        table.totalAmount = 0;
    } else {
        // Recalculate total amount
        let totalAmount = 0;
        Object.values(table.orders).forEach(person => {
            person.items.forEach(item => {
                totalAmount += item.price * item.quantity;
            });
        });
        table.totalAmount = totalAmount;
    }
    
    table.lastUpdate = new Date().toISOString();
    
    // Save changes
    saveTableSettings();
    
    // Update display
    updateTableModalContent(table);
    updateTablesDisplay();
    
    // Show success message
    showAlert(`🗑️ ${person.name} masa ${currentTableModal}'den silindi!`, 'success');
}

// Update table modal content
function updateTableModalContent(table) {
    const personsContainer = document.getElementById('table-persons-container');
    const summaryContainer = document.getElementById('table-detail-summary');
    
    personsContainer.innerHTML = '';
    
    // tableSettings'den ödeme durumlarını al - her iki yapıyı da kontrol et
    const tableData = JSON.parse(localStorage.getItem('tableSettings') || '{}');
    let currentTableData = null;
    
    console.log('🔍 Table Data:', tableData);
    console.log('🔍 Current Table Modal:', currentTableModal);
    
    // İki farklı veri yapısını kontrol et
    if (tableData.tables && tableData.tables[currentTableModal]) {
        currentTableData = tableData.tables[currentTableModal];
        console.log('📊 Veri yapısı: tables[' + currentTableModal + ']');
    } else if (tableData[currentTableModal]) {
        currentTableData = tableData[currentTableModal];
        console.log('📊 Veri yapısı: direkt[' + currentTableModal + ']');
    }
    
    console.log('📋 Current Table Data:', currentTableData);
    
    // Tamamlanan siparişleri göster - önce masa verisinden kontrol et, yoksa global veriden al
    let completedOrdersHtml = '';
    let completedOrdersToShow = [];
    
    // Önce masa verisinden kontrol et
    if (currentTableData && currentTableData.completedOrders && currentTableData.completedOrders.length > 0) {
        completedOrdersToShow = currentTableData.completedOrders;
    } else {
        // Global completedOrders'dan bu masa için siparişleri al
        const globalCompletedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        completedOrdersToShow = globalCompletedOrders.filter(order => order.tableNumber == currentTableModal);
    }
    
    if (completedOrdersToShow.length > 0) {
        completedOrdersHtml = '<div style="background: #f8f9fa; border-radius: 10px; padding: 15px; margin-bottom: 20px; border: 2px solid #17a2b8;">';
        completedOrdersHtml += '<h4 style="color: #17a2b8; margin-bottom: 15px;">📦 Tamamlanan Siparişler</h4>';
        
        completedOrdersToShow.forEach((order, index) => {
            const orderTime = new Date(order.completedAt).toLocaleString('tr-TR');
            let orderTotal = 0;
            
            completedOrdersHtml += '<div style="background: white; border-radius: 8px; padding: 10px; margin-bottom: 10px; border: 1px solid #dee2e6;">';
            completedOrdersHtml += '<div style="font-weight: bold; color: #17a2b8; margin-bottom: 8px; display: flex; justify-content: space-between;">';
            completedOrdersHtml += '<span>📋 Sipariş #' + (index + 1) + '</span>';
            completedOrdersHtml += '<span style="font-size: 12px; color: #6c757d;">' + orderTime + '</span>';
            completedOrdersHtml += '</div>';
            
            Object.values(order.cart).forEach(item => {
                const itemTotal = item.price * item.quantity;
                orderTotal += itemTotal;
                completedOrdersHtml += '<div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 3px;">';
                completedOrdersHtml += '<span>' + item.name + ' x' + item.quantity + '</span>';
                completedOrdersHtml += '<span>' + itemTotal.toFixed(2) + ' ₺</span>';
                completedOrdersHtml += '</div>';
            });
            
            completedOrdersHtml += '<div style="text-align: right; font-weight: bold; color: #17a2b8; margin-top: 8px; border-top: 1px solid #f0f0f0; padding-top: 5px;">';
            completedOrdersHtml += 'Toplam: ' + orderTotal.toFixed(2) + ' ₺';
            completedOrdersHtml += '</div>';
            completedOrdersHtml += '</div>';
        });
        
        completedOrdersHtml += '</div>';
    }
    
    if (table.isEmpty || !table.orders || Object.keys(table.orders).length === 0) {
        personsContainer.innerHTML = completedOrdersHtml + '<p style="grid-column: 1/-1; text-align: center; color: #6c757d; padding: 40px;">Bu masa henüz boş. Müşteri siparişi bekleniyor.</p>';
        summaryContainer.innerHTML = '<p style="text-align: center; color: #6c757d;">Sipariş bulunmuyor.</p>';
        return;
    }
    
    // Tamamlanan siparişleri container'a ekle
    if (completedOrdersHtml) {
        personsContainer.innerHTML = completedOrdersHtml;
    }
    
    // Generate person cards
    Object.keys(table.orders).forEach(personId => {
        const person = table.orders[personId];
        const personCard = document.createElement('div');
        personCard.className = 'person-card';
        
        const personTotal = person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Ödeme durumunu kontrol et
        const paymentInfo = currentTableData?.persons?.[person.name] || {};
        const paymentStatus = paymentInfo.paymentStatus || 'pending';
        
        console.log('👤 ' + person.name + ' - Ödeme durumu: ' + paymentStatus + ', Tutar: ' + personTotal);
        
        let paymentStatusHtml = '';
        let paymentActionsHtml = '';
        
        if (paymentStatus === 'paid') {
            const paidAt = paymentInfo.paidAt ? new Date(paymentInfo.paidAt).toLocaleString('tr-TR') : '';
            paymentStatusHtml = '<div class="payment-status paid">✅ Ödendi ' + (paidAt ? '(' + paidAt + ')' : '') + '</div>';
        } else {
            // Ödeme bekleniyor veya bekliyor durumları için buton göster
            paymentStatusHtml = '<div class="payment-status pending">⏳ Ödeme Bekleniyor</div>';
            paymentActionsHtml = '<button class="btn btn-success btn-sm" onclick="processPersonPayment(\'' + person.name + '\')" style="margin-top: 10px; width: 100%;">💰 ' + personTotal.toFixed(2) + ' ₺ Tahsil Et</button>';
        }
        
        let itemsHtml = '';
        if (person.items.length === 0) {
            itemsHtml = '<p style="color: #6c757d; font-style: italic;">Henüz sipariş verilmemiş</p>';
        } else {
            itemsHtml = person.items.map((item, itemIndex) => {
                // Check if item is new (last 10 minutes)
                const orderTime = item.orderedAt ? new Date(item.orderedAt) : new Date(0);
                const now = new Date();
                const timeDiff = (now - orderTime) / (1000 * 60); // minutes
                const isNew = timeDiff <= 10; // 10 dakika içinde sipariş verildi
                
                // Determine item status and styling
                let statusIcon = '';
                let itemStyle = 'display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee; border-radius: 4px; margin-bottom: 3px;';
                let timeInfo = '';
                let roundInfo = '';
                
                // Order round information
                if (item.orderRound && item.orderRound > 1) {
                    roundInfo = ` (${item.orderRound}. sipariş)`;
                }
                
                if (isNew && item.isNew && !item.isSubmitted) {
                    if (item.isAdditionalOrder) {
                        statusIcon = '➕ ';
                        itemStyle += ' background: linear-gradient(135deg, #e8f5e8, #c8e6c9); border-left: 4px solid #4caf50; box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);';
                        timeInfo = '<small style="color: #2e7d32; font-size: 10px; display: block;">İlave sipariş' + roundInfo + ' - ' + orderTime.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + '</small>';
                    } else {
                        statusIcon = '🆕 ';
                        itemStyle += ' background: linear-gradient(135deg, #fff3cd, #ffeaa7); border-left: 4px solid #ffc107; box-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);';
                        timeInfo = '<small style="color: #856404; font-size: 10px; display: block;">Yeni sipariş' + roundInfo + ' - ' + orderTime.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + '</small>';
                    }
                } else if (item.isAdminAdded) {
                    statusIcon = '👨‍💼 ';
                    itemStyle += ' background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-left: 4px solid #2196f3; box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);';
                    timeInfo = '<small style="color: #1565c0; font-size: 10px; display: block;">Admin ekledi' + roundInfo + ' - ' + orderTime.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + '</small>';
                } else if (item.isAdditionalOrder && item.isSubmitted) {
                    statusIcon = '📋 ';
                    itemStyle += ' background: linear-gradient(135deg, #f3e5f5, #e1bee7); border-left: 3px solid #9c27b0;';
                    timeInfo = '<small style="color: #6a1b9a; font-size: 10px; display: block;">İlave sipariş (tamamlandı)' + roundInfo + ' - ' + orderTime.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + '</small>';
                } else if (orderTime.getTime() > 0) {
                    statusIcon = item.isSubmitted ? '✅ ' : '📝 ';
                    if (item.isSubmitted) {
                        itemStyle += ' background: linear-gradient(135deg, #f1f8e9, #dcedc8); border-left: 3px solid #8bc34a;';
                        timeInfo = '<small style="color: #33691e; font-size: 10px; display: block;">Tamamlandı' + roundInfo + ' - ' + orderTime.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + '</small>';
                    } else {
                        timeInfo = '<small style="color: #6c757d; font-size: 10px; display: block;">Sipariş' + roundInfo + ' - ' + orderTime.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + '</small>';
                    }
                }
                
                return '<div class="person-item" style="' + itemStyle + '">' +
                    '<div style="flex: 1;">' +
                        '<div>' + statusIcon + '<span>' + item.name + ' x' + item.quantity + '</span></div>' +
                        timeInfo +
                    '</div>' +
                    '<div style="display: flex; align-items: center; gap: 10px;">' +
                        '<span style="font-weight: bold;">' + (item.price * item.quantity).toFixed(2) + ' ₺</span>' +
                        '<button class="btn btn-danger btn-sm" onclick="removeItemFromPerson(\'' + personId + '\', ' + itemIndex + ')" style="padding: 2px 6px; font-size: 10px;" title="Ürünü sil">' +
                            '🗑️' +
                        '</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }
        
        personCard.innerHTML = 
            '<div class="person-header" style="position: relative;">' +
                '<div class="person-name">👤 ' + person.name + '</div>' +
                '<div style="display: flex; align-items: center; gap: 10px;">' +
                    '<div class="person-total">' + personTotal.toFixed(2) + ' ₺</div>' +
                    '<button class="btn btn-danger btn-sm" onclick="removePersonFromTable(\'' + personId + '\')" style="padding: 4px 8px; font-size: 11px;" title="Kişiyi sil">' +
                        '❌' +
                    '</button>' +
                '</div>' +
            '</div>' +
            paymentStatusHtml +
            '<div class="person-items">' + itemsHtml + '</div>' +
            paymentActionsHtml;
        
        personsContainer.appendChild(personCard);
    });
    
    // Eğer mevcut siparişler varsa ancak tamamlanan siparişler de varsa, ayırıcı ekle
    if (completedOrdersHtml && Object.keys(table.orders).length > 0) {
        const separator = document.createElement('div');
        separator.style.cssText = 'margin: 20px 0; border-top: 2px solid #e9ecef; padding-top: 20px;';
        separator.innerHTML = '<h4 style="color: #28a745; margin-bottom: 15px;">🍽️ Aktif Siparişler</h4>';
        personsContainer.appendChild(separator);
    }
    
    // Generate summary with payment info
    let totalPaid = 0;
    let totalPending = 0;
    let completedOrdersTotal = 0;
    
    // Tamamlanan siparişlerin toplamını hesapla
    if (currentTableData && currentTableData.completedOrders) {
        currentTableData.completedOrders.forEach(order => {
            Object.values(order.cart).forEach(item => {
                completedOrdersTotal += item.price * item.quantity;
            });
        });
    }
    
    // Mevcut siparişlerin toplamını hesapla
    let activeOrdersTotal = 0;
    
    const summaryDetails = Object.keys(table.orders).map(personId => {
        const person = table.orders[personId];
        const personTotal = person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const paymentInfo = currentTableData?.persons?.[person.name] || {};
        const paymentStatus = paymentInfo.paymentStatus || 'pending';
        
        activeOrdersTotal += personTotal;
        
        if (paymentStatus === 'paid') {
            totalPaid += personTotal;
        } else {
            totalPending += personTotal;
        }
        
        const statusIcon = paymentStatus === 'paid' ? '✅' : '⏳';
        
        return '<div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>' + statusIcon + ' ' + person.name + ': ' + person.items.length + ' ürün</span><span>' + personTotal.toFixed(2) + ' ₺</span></div>';
    }).join('');
    
    // Calculate partial payments
    let totalPartialPaid = 0;
    let partialPaymentsHtml = '';
    if (currentTableData?.partialPayments && currentTableData.partialPayments.length > 0) {
        partialPaymentsHtml = '<div style="border-top: 1px solid #ddd; margin: 10px 0; padding-top: 10px;"><div style="font-weight: bold; color: #17a2b8; margin-bottom: 5px;">💵 Kısmi Ödemeler:</div>';
        currentTableData.partialPayments.forEach((payment, index) => {
            totalPartialPaid += payment.amount;
            const paymentTime = new Date(payment.paidAt).toLocaleString('tr-TR');
            partialPaymentsHtml += '<div style="font-size: 12px; margin-bottom: 3px;">• ' + payment.amount.toFixed(2) + ' ₺ (' + paymentTime + ')</div>';
        });
        partialPaymentsHtml += '<div style="font-weight: bold; color: #17a2b8;">Toplam Kısmi: ' + totalPartialPaid.toFixed(2) + ' ₺</div></div>';
    }
    
    const remainingAmount = table.totalAmount - totalPaid - totalPartialPaid;
    
    let summaryHtml = '<div style="font-weight: bold; margin-bottom: 10px; color: #2c3e50;">📋 Masa Özeti:</div>' + summaryDetails;
    
    summaryHtml += '<div style="border-top: 1px solid #ddd; margin: 10px 0; padding-top: 10px;">';
    
    // Tamamlanan siparişlerin özeti
    if (completedOrdersTotal > 0) {
        summaryHtml += '<div style="color: #17a2b8; margin-bottom: 3px;">📦 Tamamlanan Siparişler: ' + completedOrdersTotal.toFixed(2) + ' ₺</div>';
    }
    
    // Aktif siparişlerin özeti
    if (activeOrdersTotal > 0) {
        summaryHtml += '<div style="color: #28a745; margin-bottom: 3px;">🍽️ Aktif Siparişler: ' + activeOrdersTotal.toFixed(2) + ' ₺</div>';
    }
    
    if (totalPaid > 0) {
        summaryHtml += '<div style="color: #28a745; margin-bottom: 3px;">✅ Tam Ödenen: ' + totalPaid.toFixed(2) + ' ₺</div>';
    }
    if (totalPending > 0) {
        summaryHtml += '<div style="color: #6c757d; margin-bottom: 3px;">⏳ Bekleyen: ' + totalPending.toFixed(2) + ' ₺</div>';
    }
    summaryHtml += '</div>' + partialPaymentsHtml;
    
    // Genel toplam hesaplama (tamamlanan + aktif siparişler)
    const grandTotal = completedOrdersTotal + activeOrdersTotal;
    const totalPaidIncludingPartial = totalPaid + totalPartialPaid;
    const finalRemainingAmount = grandTotal - totalPaidIncludingPartial;
    
    summaryHtml += '<div style="border-top: 2px solid #e74c3c; margin-top: 10px; padding-top: 10px; font-weight: bold; color: #e74c3c;">';
    summaryHtml += '<div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>GENEL TOPLAM:</span><span>' + grandTotal.toFixed(2) + ' ₺</span></div>';
    if (totalPaidIncludingPartial > 0) {
        summaryHtml += '<div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #28a745;"><span>TOPLAM ÖDENMİŞ:</span><span>' + totalPaidIncludingPartial.toFixed(2) + ' ₺</span></div>';
    }
    if (finalRemainingAmount > 0) {
        // Kalan borç - büyük ve dikkat çekici
        summaryHtml += '<div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 15px; border-radius: 10px; margin: 10px 0; text-align: center; box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3); border: 2px solid #dc3545;">';
        summaryHtml += '<div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">⚠️ KALAN BORÇ</div>';
        summaryHtml += '<div style="font-size: 28px; font-weight: 900; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">' + finalRemainingAmount.toFixed(2) + ' ₺</div>';
        summaryHtml += '</div>';
    } else if (finalRemainingAmount < 0) {
        // Fazla ödeme - dikkat çekici yeşil
        summaryHtml += '<div style="background: linear-gradient(135deg, #28a745, #218838); color: white; padding: 15px; border-radius: 10px; margin: 10px 0; text-align: center; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); border: 2px solid #28a745;">';
        summaryHtml += '<div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">💰 FAZLA ÖDENMİŞ</div>';
        summaryHtml += '<div style="font-size: 28px; font-weight: 900; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">' + Math.abs(finalRemainingAmount).toFixed(2) + ' ₺</div>';
        summaryHtml += '</div>';
    } else if (finalRemainingAmount === 0 && grandTotal > 0) {
        // Tam ödenmiş - dikkat çekici yeşil
        summaryHtml += '<div style="background: linear-gradient(135deg, #28a745, #218838); color: white; padding: 15px; border-radius: 10px; margin: 10px 0; text-align: center; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); border: 2px solid #28a745;">';
        summaryHtml += '<div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">✅ TAM ÖDENDİ</div>';
        summaryHtml += '<div style="font-size: 24px; font-weight: 700;">BORÇ YOK</div>';
        summaryHtml += '</div>';
    }
    summaryHtml += '</div>';
    
    summaryContainer.innerHTML = summaryHtml;
    
    // Update person dropdown for admin product addition
    updateAdminPersonDropdown(table);
}

// Update admin person dropdown with existing persons from current table
function updateAdminPersonDropdown(table) {
    const personSelect = document.getElementById('admin-person-select');
    if (!personSelect) return;
    
    // Clear existing options (except the default one)
    personSelect.innerHTML = '<option value="">Kişi seçin (isteğe bağlı)</option>';
    
    if (!table || !table.orders) return;
    
    // Add existing persons to dropdown
    Object.keys(table.orders).forEach(personId => {
        const person = table.orders[personId];
        if (person && person.name) {
            const option = document.createElement('option');
            option.value = personId;
            option.textContent = person.name;
            personSelect.appendChild(option);
        }
    });
    
    // Add event listener to sync dropdown selection with input
    personSelect.onchange = function() {
        const personNameInput = document.getElementById('admin-person-name');
        if (this.value) {
            // If a person is selected from dropdown, clear the input
            personNameInput.value = '';
            personNameInput.placeholder = 'Seçili kişi: ' + this.options[this.selectedIndex].text;
        } else {
            // If no person selected, restore original placeholder
            personNameInput.placeholder = 'Veya yeni kişi adı girin';
        }
    };
}

// Get current table from modal
function getCurrentTableData() {
    const tableData = JSON.parse(localStorage.getItem('tableSettings') || '{}');
    const tableId = currentTableModal;
    
    if (tableData.tables && tableData.tables[tableId]) {
        return tableData.tables[tableId];
    } else if (tableData[tableId]) {
        return tableData[tableId];
    }
    
    return null;
}

// Clear specific table orders
function clearTableOrders() {
    if (!currentTableModal) return;
    
    if (confirm('Masa ' + currentTableModal + ' siparişlerini temizlemek istediğinizden emin misiniz?\n\nBu işlem:\n• Tüm aktif siparişleri\n• Tamamlanan siparişleri\n• Ödeme bilgilerini\n• Kısmi ödemeleri\nsilecektir!')) {
        // Masa verilerini tamamen temizle
        if (tableSettings.tables && tableSettings.tables[currentTableModal]) {
            tableSettings.tables[currentTableModal] = {
                number: parseInt(currentTableModal),
                orders: {},
                isEmpty: true,
                totalAmount: 0,
                lastUpdate: null,
                status: 'empty'
            };
        }
        
        // Direct yapıyı da temizle
        if (tableSettings[currentTableModal]) {
            tableSettings[currentTableModal] = {
                number: parseInt(currentTableModal),
                orders: {},
                isEmpty: true,
                totalAmount: 0,
                lastUpdate: null,
                status: 'empty'
            };
        }
        
        // Müşteri tarafındaki tamamlanan siparişleri de temizle
        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        const filteredOrders = completedOrders.filter(order => order.tableId !== currentTableModal.toString());
        localStorage.setItem('completedOrders', JSON.stringify(filteredOrders));
        
        console.log('🧹 Masa ' + currentTableModal + ' tamamen temizlendi');
        console.log('📋 Kalan tamamlanan siparişler:', filteredOrders.length);
        
        saveTableSettings();
        updateTableModalContent(tableSettings.tables[currentTableModal] || { isEmpty: true, orders: {} });
        generateTablesGrid();
        
        alert('✅ Masa ' + currentTableModal + ' tamamen temizlendi!\n\n• Tüm siparişler silindi\n• Ödeme bilgileri sıfırlandı\n• Tamamlanan siparişler temizlendi');
    }
}

// Mark table as completed
function markTableCompleted() {
    if (!currentTableModal) return;
    
    const table = tableSettings.tables[currentTableModal];
    if (table.isEmpty) {
        alert('Bu masa zaten boş!');
        return;
    }
    
    if (confirm(`Masa ${currentTableModal} siparişi tamamlandı olarak işaretlensin mi?\n\n✅ Sipariş tamamlanacak\n🧹 Masa temizlenecek\n📋 Yeni müşteri için hazır hale gelecek`)) {
        // Siparişi tamamlanmış olarak kaydet (isteğe bağlı - sipariş geçmişi için)
        const completedOrder = {
            tableNumber: currentTableModal,
            completedAt: new Date().toISOString(),
            orders: JSON.parse(JSON.stringify(table.orders)), // Deep copy
            totalAmount: table.totalAmount,
            completedBy: 'admin'
        };
        
        // Tamamlanan siparişleri kaydet
        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        completedOrders.push(completedOrder);
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        
        // Masayı temizle
        tableSettings.tables[currentTableModal] = {
            number: currentTableModal,
            orders: {},
            isEmpty: true,
            totalAmount: 0,
            lastUpdate: null,
            completedOrders: []
        };
        
        // Müşteri tarafındaki veriyi de temizle
        const customerTableData = JSON.parse(localStorage.getItem('tableData') || '{}');
        if (customerTableData.selectedTable == currentTableModal) {
            localStorage.removeItem('tableData');
        }
        
        // Değişiklikleri kaydet
        saveTableSettings();
        updateTablesDisplay();
        
        // Modalı kapat
        closeTableModal();
        
        // Başarı mesajı
        alert(`✅ Masa ${currentTableModal} siparişi tamamlandı!\n\n📦 Sipariş geçmişe kaydedildi\n🧹 Masa yeni müşteri için hazır\n💰 Toplam: ${table.totalAmount.toFixed(2)} ₺`);
    }
}

// Mark new orders as seen/read
function markNewOrdersAsSeen() {
    if (!currentTableModal) return;
    
    const table = tableSettings.tables[currentTableModal];
    if (!table || !table.orders) return;
    
    let newOrdersFound = false;
    
    // Tüm kişilerin tüm siparişlerini gez ve yeni olanları işaretle
    Object.keys(table.orders).forEach(personId => {
        const person = table.orders[personId];
        if (person.items) {
            person.items.forEach(item => {
                // Sadece henüz submit edilmemiş ve yeni olan siparişleri işaretle
                if (item.isNew && !item.isSubmitted) {
                    item.isNew = false; // Görüldü olarak işaretle
                    item.seenAt = new Date().toISOString(); // Görülme zamanı
                    newOrdersFound = true;
                }
            });
        }
    });
    
    if (newOrdersFound) {
        // Değişiklikleri kaydet
        saveTableSettings();
        
        // Modal içeriğini yenile
        updateTableModalContent(table);
        
        // Masa grid'ini yenile (belki bildirim sayısı değişmiş olabilir)
        updateTablesDisplay();
        
        showAlert('✅ Yeni siparişler görüldü olarak işaretlendi!', 'success');
    } else {
        showAlert('ℹ️ Bu masada yeni sipariş bulunmuyor.', 'info');
    }
}

// Clear specific table
function clearTable(tableNumber) {
    if (confirm(`Masa ${tableNumber} siparişlerini temizlemek istediğinizden emin misiniz?`)) {
        tableSettings.tables[tableNumber] = {
            number: tableNumber,
            orders: {},
            isEmpty: true,
            totalAmount: 0,
            lastUpdate: null
        };
        
        saveTableSettings();
        generateTablesGrid();
        
        alert(`✅ Masa ${tableNumber} temizlendi!`);
    }
}

// Initialize table system when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeTableSystem, 500);
});

// Close table modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('table-modal');
    const transferModal = document.getElementById('table-transfer-modal');
    if (event.target === modal) {
        closeTableModal();
    }
    if (event.target === transferModal) {
        closeTableTransferModal();
    }
});

// ==================== TABLE TRANSFER SYSTEM ====================

// Open table transfer modal
function openTableTransferModal() {
    if (!currentTableModal) return;
    
    const table = tableSettings.tables[currentTableModal];
    if (table.isEmpty || !table.orders || Object.keys(table.orders).length === 0) {
        alert('Bu masa boş! Aktarılacak sipariş bulunmuyor.');
        return;
    }
    
    const modal = document.getElementById('table-transfer-modal');
    const sourceInput = document.getElementById('source-table');
    const targetSelect = document.getElementById('target-table');
    const transferTitle = document.getElementById('table-transfer-title');
    const transferDescription = document.getElementById('transfer-description');
    
    // Set source table
    sourceInput.value = `Masa ${currentTableModal}`;
    transferTitle.textContent = `Masa ${currentTableModal} - Masa Değiştir`;
    
    const personCount = Object.keys(table.orders).length;
    const totalAmount = table.totalAmount;
    transferDescription.textContent = `Masa ${currentTableModal}'deki ${personCount} kişinin siparişleri (Toplam: ${totalAmount.toFixed(2)} ₺) hedef masaya aktarılacaktır.`;
    
    // Populate target table options
    targetSelect.innerHTML = '<option value="">Masa seçin...</option>';
    
    for (let i = 1; i <= tableSettings.tableCount; i++) {
        if (i !== currentTableModal) {
            const targetTable = tableSettings.tables[i];
            const isEmpty = targetTable.isEmpty || !targetTable.orders || Object.keys(targetTable.orders).length === 0;
            const status = isEmpty ? 'BOŞ' : `${Object.keys(targetTable.orders).length} kişi`;
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Masa ${i} (${status})`;
            targetSelect.appendChild(option);
        }
    }
    
    // Reset form
    document.getElementById('merge-orders').checked = false;
    document.getElementById('transfer-preview').style.display = 'none';
    
    // Setup target table change listener
    targetSelect.onchange = updateTransferPreview;
    
    modal.style.display = 'block';
}

// Close table transfer modal
function closeTableTransferModal() {
    document.getElementById('table-transfer-modal').style.display = 'none';
    document.getElementById('transfer-preview').style.display = 'none';
}

// Update transfer preview
function updateTransferPreview() {
    const targetTableNumber = parseInt(document.getElementById('target-table').value);
    const mergeOrders = document.getElementById('merge-orders').checked;
    const previewContainer = document.getElementById('transfer-preview');
    const previewContent = document.getElementById('preview-content');
    
    if (!targetTableNumber) {
        previewContainer.style.display = 'none';
        return;
    }
    
    const sourceTable = tableSettings.tables[currentTableModal];
    const targetTable = tableSettings.tables[targetTableNumber];
    
    let previewHTML = '';
    
    // Source table info
    previewHTML += `<div style="margin-bottom: 15px;">
        <strong>Kaynak Masa ${currentTableModal}:</strong><br>
        ${Object.keys(sourceTable.orders).map(personId => {
            const person = sourceTable.orders[personId];
            const personTotal = person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return `<span style="color: #e74c3c;">• ${person.name} (${person.items.length} ürün - ${personTotal.toFixed(2)} ₺)</span>`;
        }).join('<br>')}
    </div>`;
    
    // Target table info
    const targetIsEmpty = targetTable.isEmpty || !targetTable.orders || Object.keys(targetTable.orders).length === 0;
    
    if (!targetIsEmpty && mergeOrders) {
        previewHTML += `<div style="margin-bottom: 15px;">
            <strong>Hedef Masa ${targetTableNumber} (Mevcut Siparişler):</strong><br>
            ${Object.keys(targetTable.orders).map(personId => {
                const person = targetTable.orders[personId];
                const personTotal = person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                return `<span style="color: #27ae60;">• ${person.name} (${person.items.length} ürün - ${personTotal.toFixed(2)} ₺)</span>`;
            }).join('<br>')}
        </div>`;
    } else if (!targetIsEmpty && !mergeOrders) {
        previewHTML += `<div style="margin-bottom: 15px; color: #dc3545;">
            <strong>⚠️ Uyarı:</strong> Masa ${targetTableNumber}'deki mevcut siparişler silinecek!<br>
            ${Object.keys(targetTable.orders).map(personId => {
                const person = targetTable.orders[personId];
                const personTotal = person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                return `<span style="text-decoration: line-through; color: #6c757d;">• ${person.name} (${person.items.length} ürün - ${personTotal.toFixed(2)} ₺)</span>`;
            }).join('<br>')}
        </div>`;
    }
    
    // Final result
    const sourceTotal = sourceTable.totalAmount;
    const targetTotal = (!targetIsEmpty && mergeOrders) ? targetTable.totalAmount : 0;
    const finalTotal = sourceTotal + targetTotal;
    
    previewHTML += `<div style="border-top: 1px solid #dee2e6; padding-top: 10px;">
        <strong>İşlem Sonrası Masa ${targetTableNumber}:</strong><br>
        <span style="color: #2c3e50;">Toplam Tutar: ${finalTotal.toFixed(2)} ₺</span>
    </div>`;
    
    previewContent.innerHTML = previewHTML;
    previewContainer.style.display = 'block';
}

// Execute table transfer
function executeTableTransfer() {
    const targetTableNumber = parseInt(document.getElementById('target-table').value);
    const mergeOrders = document.getElementById('merge-orders').checked;
    
    if (!targetTableNumber) {
        alert('Lütfen hedef masa seçin!');
        return;
    }
    
    if (!currentTableModal) {
        alert('Kaynak masa bilgisi bulunamadı!');
        return;
    }
    
    const sourceTable = tableSettings.tables[currentTableModal];
    const targetTable = tableSettings.tables[targetTableNumber];
    
    const sourcePersonCount = Object.keys(sourceTable.orders).length;
    const targetPersonCount = targetTable.orders ? Object.keys(targetTable.orders).length : 0;
    
    let confirmMessage = `Masa ${currentTableModal}'deki ${sourcePersonCount} kişinin siparişleri Masa ${targetTableNumber}'ye aktarılacak.\n\n`;
    
    if (targetPersonCount > 0) {
        if (mergeOrders) {
            confirmMessage += `Hedef masadaki ${targetPersonCount} kişinin siparişleri korunacak ve yeni siparişlerle birleştirilecek.`;
        } else {
            confirmMessage += `⚠️ DİKKAT: Hedef masadaki ${targetPersonCount} kişinin siparişleri SİLİNECEK!`;
        }
    }
    
    confirmMessage += '\n\nBu işlemi gerçekleştirmek istediğinizden emin misiniz?';
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        // Prepare target table orders
        let newTargetOrders = {};
        
        // If merging, keep existing orders
        if (mergeOrders && targetTable.orders) {
            newTargetOrders = { ...targetTable.orders };
        }
        
        // Add source table orders to target
        Object.keys(sourceTable.orders).forEach(personId => {
            const person = sourceTable.orders[personId];
            
            // Check if person with same name already exists in target
            const existingPersonId = Object.keys(newTargetOrders).find(id => 
                newTargetOrders[id].name === person.name
            );
            
            if (existingPersonId && mergeOrders) {
                // Merge with existing person's orders
                newTargetOrders[existingPersonId].items.push(...person.items);
            } else {
                // Add as new person (generate new ID if needed)
                const newPersonId = existingPersonId ? generateId() : personId;
                newTargetOrders[newPersonId] = {
                    ...person,
                    name: existingPersonId ? `${person.name} (2)` : person.name
                };
            }
        });
        
        // Calculate new total
        const newTotal = Object.values(newTargetOrders).reduce((sum, person) => {
            return sum + person.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        }, 0);
        
        // Update target table
        tableSettings.tables[targetTableNumber] = {
            number: targetTableNumber,
            orders: newTargetOrders,
            isEmpty: Object.keys(newTargetOrders).length === 0,
            totalAmount: newTotal,
            lastUpdate: new Date().toISOString()
        };
        
        // Clear source table
        tableSettings.tables[currentTableModal] = {
            number: currentTableModal,
            orders: {},
            isEmpty: true,
            totalAmount: 0,
            lastUpdate: new Date().toISOString()
        };
        
        // Update customer-side table data if the transferred table is currently active
        const customerTableData = localStorage.getItem('tableData');
        if (customerTableData) {
            try {
                const tableData = JSON.parse(customerTableData);
                if (tableData.selectedTable == currentTableModal) {
                    // Update customer table data to new table
                    tableData.selectedTable = targetTableNumber;
                    tableData.persons = newTargetOrders;
                    localStorage.setItem('tableData', JSON.stringify(tableData));
                    
                    // Update the tracking variable
                    localStorage.setItem('lastCustomerTable', targetTableNumber.toString());
                }
            } catch (error) {
                console.error('Error updating customer table data:', error);
            }
        }
        
        // Save changes
        saveTableSettings();
        
        // Update displays
        generateTablesGrid();
        updateTableModalContent(tableSettings.tables[currentTableModal]);
        
        // Close modals
        closeTableTransferModal();
        closeTableModal();
        
        alert(`✅ Masa değiştirme başarılı!\n\nMasa ${currentTableModal} → Masa ${targetTableNumber}\n${sourcePersonCount} kişinin siparişleri aktarıldı.\nYeni toplam: ${newTotal.toFixed(2)} ₺`);
        
    } catch (error) {
        console.error('Masa transfer hatası:', error);
        alert('❌ Masa değiştirme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

// ==================== NOTIFICATIONS AND REFRESH FUNCTIONS ====================

// Show recent notifications in the notifications section
function updateNotificationsDisplay() {
    const notificationsSection = document.getElementById('notifications-section');
    const notificationSummary = document.getElementById('notification-summary');
    
    if (!notificationsSection || !notificationSummary) return;
    
    try {
        const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        const recentNotifications = notifications
            .filter(n => new Date() - new Date(n.timestamp) < 3600000) // Last 1 hour
            .slice(-5) // Last 5 notifications
            .reverse(); // Most recent first
        
        if (recentNotifications.length === 0) {
            notificationsSection.classList.remove('has-notifications');
            return;
        }
        
        notificationsSection.classList.add('has-notifications');
        
        notificationSummary.innerHTML = '';
        
        recentNotifications.forEach(notification => {
            const notificationDiv = document.createElement('div');
            notificationDiv.className = 'notification-item';
            notificationDiv.onclick = () => {
                if (notification.tableNumber) {
                    openTableModal(notification.tableNumber);
                }
            };
            
            const timeAgo = getTimeAgo(notification.timestamp);
            
            notificationDiv.innerHTML = `
                <div class="notification-title">${notification.title}</div>
                <div class="notification-time">${timeAgo}</div>
            `;
            
            notificationSummary.appendChild(notificationDiv);
        });
        
        // Add clear notifications button
        if (recentNotifications.length > 0) {
            const clearBtn = document.createElement('button');
            clearBtn.className = 'clear-notifications';
            clearBtn.textContent = '🧹 Bildirimleri Temizle';
            clearBtn.onclick = () => {
                clearAllNotifications();
                updateNotificationsDisplay();
            };
            notificationSummary.appendChild(clearBtn);
        }
        
    } catch (error) {
        console.error('Bildirim görüntüleme hatası:', error);
        notificationsSection.classList.remove('has-notifications');
    }
}

// Get time ago string
function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    
    return time.toLocaleDateString('tr-TR');
}

// Refresh tables view manually
function refreshTablesView() {
    console.log('🔄 Masalar manuel olarak yenileniyor...');
    
    // Show loading indicator
    const tablesGrid = document.getElementById('tablesGrid');
    if (tablesGrid) {
        tablesGrid.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">🔄 Yenileniyor...</div>';
    }
    
    // Force update tables display
    setTimeout(() => {
        updateTablesDisplay();
        updateNotificationsDisplay();
        
        // Show success message briefly
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 9999;
            font-weight: bold;
        `;
        successMsg.textContent = '✅ Masalar yenilendi';
        document.body.appendChild(successMsg);
        
        setTimeout(() => successMsg.remove(), 2000);
    }, 500);
}

// Masa tamamen ödendiğinde müşteri sepetini temizle
function clearCustomerCartIfFullyPaid(tableId) {
    // localStorage'da müşteri sepet verilerini kontrol et
    const customerTableData = localStorage.getItem('selectedTable');
    const customerCartData = localStorage.getItem('cart');
    
    console.log('🔍 Müşteri sepeti kontrolü - Masa:', tableId);
    console.log('📱 Customer Table:', customerTableData);
    console.log('🛒 Customer Cart:', customerCartData);
    
    // Eğer müşteri bu masayı seçmişse sepeti temizle
    if (customerTableData === tableId.toString()) {
        console.log('✅ Müşteri sepeti temizleniyor - Masa:', tableId);
        
        // Sadece aktif sepeti temizle, tamamlanan siparişleri KORUR
        localStorage.removeItem('cart');
        localStorage.removeItem('selectedTable');
        localStorage.removeItem('customerName');
        localStorage.removeItem('tablePersons');
        
        // completedOrders'ı KOR! - Admin manuel temizleme yapmadığı sürece kalacak
        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        console.log('📋 Tamamlanan siparişler korundu:', completedOrders.length + ' sipariş');
        
        // Müşteri sayfasını yenile (eğer açıksa)
        try {
            // Eğer anamenu.html sayfası açıksa, sipariş özetini göstersin
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: 'PAYMENT_COMPLETED', tableId: tableId }, '*');
            }
        } catch (e) {
            console.log('🔄 Müşteri sayfası yenilenemedi (normal durum)');
        }
        
        showMessage('🛒 Müşteri sepeti temizlendi - Tamamlanan siparişler korundu', 'success');
    }
}

// Masanın tamamen ödenip ödenmediğini kontrol et
function isTableFullyPaid(tableData) {
    let totalAmount = 0;
    let paidAmount = 0;
    
    // Orders yapısından toplam tutarı hesapla
    if (tableData.orders) {
        Object.values(tableData.orders).forEach(person => {
            if (person.items) {
                const personTotal = person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                totalAmount += personTotal;
            }
        });
    }
    
    // Persons yapısından ödenen tutarı hesapla
    if (tableData.persons) {
        Object.values(tableData.persons).forEach(person => {
            if (person.paymentStatus === 'paid' && person.paidAmount) {
                paidAmount += person.paidAmount;
            }
        });
    }
    
    // Kısmi ödemeleri de dahil et
    if (tableData.partialPayments && tableData.partialPayments.length > 0) {
        const partialTotal = tableData.partialPayments.reduce((sum, payment) => sum + payment.amount, 0);
        paidAmount += partialTotal;
    }
    
    console.log('💰 Masa ödeme durumu - Toplam:', totalAmount, 'Bireysel ödenen:', paidAmount - (tableData.partialPayments ? tableData.partialPayments.reduce((sum, payment) => sum + payment.amount, 0) : 0), 'Kısmi ödenen:', tableData.partialPayments ? tableData.partialPayments.reduce((sum, payment) => sum + payment.amount, 0) : 0, 'Toplam ödenen:', paidAmount);
    return totalAmount > 0 && paidAmount >= totalAmount;
}

// Ödeme Yönetimi Fonksiyonları
function processAllPayments() {
    const currentTableId = document.getElementById('table-modal-title').textContent.split(' ')[1];
    const tableSettings = JSON.parse(localStorage.getItem('tableSettings') || '{}');
    
    console.log('🔍 Toplam ödeme işlemi başlatıldı');
    console.log('📋 Current Table ID:', currentTableId);
    
    // Check both possible data structures
    let tableData = null;
    if (tableSettings.tables && tableSettings.tables[currentTableId]) {
        tableData = tableSettings.tables[currentTableId];
    } else if (tableSettings[currentTableId]) {
        tableData = tableSettings[currentTableId];
    }
    
    if (!tableData || !tableData.persons) {
        showMessage('❌ Masa verisi bulunamadı', 'error');
        return;
    }
    
    let totalUnpaid = 0;
    let unpaidPersons = [];
    
    // Calculate total unpaid amount
    Object.keys(tableData.persons).forEach(personName => {
        const person = tableData.persons[personName];
        if (person.paymentStatus !== 'paid') {
            const personTotal = person.items ? person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
            if (personTotal > 0) {
                totalUnpaid += personTotal;
                unpaidPersons.push({ name: personName, amount: personTotal });
            }
        }
    });
    
    if (totalUnpaid === 0) {
        showMessage('ℹ️ Bu masada ödenecek hesap bulunmuyor', 'info');
        return;
    }
    
    let confirmMessage = `Masa ${currentTableId} - Toplam Hesap: ${totalUnpaid.toFixed(2)} ₺\n\nÖdenecek hesaplar:\n`;
    unpaidPersons.forEach(person => {
        confirmMessage += `• ${person.name}: ${person.amount.toFixed(2)} ₺\n`;
    });
    confirmMessage += `\nToplam ${totalUnpaid.toFixed(2)} ₺ tutarını tahsil ettiniz mi?`;
    
    if (confirm(confirmMessage)) {
        // Mark all unpaid persons as paid
        Object.keys(tableData.persons).forEach(personName => {
            const person = tableData.persons[personName];
            if (person.paymentStatus !== 'paid') {
                const personTotal = person.items ? person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
                if (personTotal > 0) {
                    person.paymentStatus = 'paid';
                    person.paidAt = new Date().toISOString();
                    person.paidAmount = personTotal;
                }
            }
        });
        
        // Masa tamamen ödendiyse müşteri sepetini temizle
        if (isTableFullyPaid(tableData)) {
            clearCustomerCartIfFullyPaid(currentTableId);
        }
        
        localStorage.setItem('tableSettings', JSON.stringify(tableSettings));
        updateTablesDisplay();
        openTableModal(currentTableId);
        
        showMessage('✅ Masa ' + currentTableId + ' - Toplam ' + totalUnpaid.toFixed(2) + ' ₺ tahsil edildi', 'success');
    }
}

function processPartialPayment() {
    const currentTableId = document.getElementById('table-modal-title').textContent.split(' ')[1];
    const tableSettings = JSON.parse(localStorage.getItem('tableSettings') || '{}');
    
    console.log('🔍 Kısmi ödeme işlemi başlatıldı');
    console.log('📋 Current Table ID:', currentTableId);
    console.log('🗂️ Table Settings:', tableSettings);
    
    // Check both possible data structures
    let tableData = null;
    if (tableSettings.tables && tableSettings.tables[currentTableId]) {
        tableData = tableSettings.tables[currentTableId];
        console.log('📊 Tablo verisi (tables yapısında):', tableData);
    } else if (tableSettings[currentTableId]) {
        tableData = tableSettings[currentTableId];
        console.log('📊 Tablo verisi (direkt yapısında):', tableData);
    }
    
    if (!tableData) {
        showMessage('❌ Masa verisi bulunamadı', 'error');
        console.error('❌ Masa verisi bulunamadı:', currentTableId);
        return;
    }
    
    // Initialize persons structure if it doesn't exist
    if (!tableData.persons && tableData.orders) {
        tableData.persons = {};
        console.log('📋 Persons yapısı oluşturuluyor...');
        
        Object.keys(tableData.orders).forEach(personId => {
            const person = tableData.orders[personId];
            if (person.name && person.items) {
                tableData.persons[person.name] = {
                    name: person.name,
                    items: person.items,
                    paymentStatus: 'pending'
                };
            }
        });
        console.log('✅ Persons yapısı oluşturuldu:', tableData.persons);
    }
    
    if (!tableData.persons || Object.keys(tableData.persons).length === 0) {
        showMessage('❌ Masa siparişi bulunamadı', 'error');
        console.error('❌ Persons verisi bulunamadı');
        return;
    }
    
    let totalUnpaid = 0;
    let unpaidPersons = [];
    
    // Calculate total unpaid amount from persons structure
    Object.keys(tableData.persons).forEach(personName => {
        const person = tableData.persons[personName];
        if (person.paymentStatus !== 'paid') {
            const personTotal = person.items ? person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
            if (personTotal > 0) {
                totalUnpaid += personTotal;
                unpaidPersons.push({ name: personName, amount: personTotal });
            }
        }
    });
    
    // Subtract any previous partial payments
    let previousPartialPayments = 0;
    if (tableData.partialPayments && tableData.partialPayments.length > 0) {
        previousPartialPayments = tableData.partialPayments.reduce((sum, payment) => sum + payment.amount, 0);
        totalUnpaid -= previousPartialPayments;
    }
    
    console.log('💰 Toplam ödenmemiş:', totalUnpaid);
    console.log('💵 Önceki kısmi ödemeler:', previousPartialPayments);
    console.log('👥 Ödenmemiş kişiler:', unpaidPersons);
    
    if (totalUnpaid <= 0) {
        showMessage('ℹ️ Bu masada ödenecek hesap bulunmuyor', 'info');
        return;
    }
    
    const paidAmount = parseFloat(prompt('Masa ' + currentTableId + ' - Toplam ödenecek: ' + totalUnpaid.toFixed(2) + ' ₺\n\nKaç TL tahsil edildi?'));
    
    if (isNaN(paidAmount) || paidAmount <= 0) {
        showMessage('❌ Geçerli bir tutar giriniz', 'error');
        return;
    }
    
    if (paidAmount > totalUnpaid) {
        showMessage('❌ Tahsil edilen tutar toplam hesaptan fazla olamaz', 'error');
        return;
    }
    
    // Create partial payment record
    const partialPayment = {
        amount: paidAmount,
        paidAt: new Date().toISOString(),
        remainingAmount: totalUnpaid - paidAmount
    };
    
    // Initialize table partial payments if not exists
    if (!tableData.partialPayments) {
        tableData.partialPayments = [];
    }
    
    tableData.partialPayments.push(partialPayment);
    
    console.log('✅ Kısmi ödeme kaydedildi:', partialPayment);
    
    // Eğer kalan tutar 0 ise masa tamamen ödendi, sepeti temizle
    if (partialPayment.remainingAmount <= 0) {
        clearCustomerCartIfFullyPaid(currentTableId);
    }
    
    localStorage.setItem('tableSettings', JSON.stringify(tableSettings));
    updateTablesDisplay();
    openTableModal(currentTableId);
    
    const remainingText = partialPayment.remainingAmount > 0 ? '\nKalan: ' + partialPayment.remainingAmount.toFixed(2) + ' ₺' : '\n✅ Masa tamamen ödendi!';
    showMessage('✅ Masa ' + currentTableId + ' - ' + paidAmount.toFixed(2) + ' ₺ kısmi ödeme alındı' + remainingText, 'success');
}

function clearAllPayments() {
    if (!confirm('Bu masadaki tüm ödeme durumlarını sıfırlamak istediğinizden emin misiniz?')) {
        return;
    }
    
    const currentTableId = document.getElementById('table-modal-title').textContent.split(' ')[1];
    const tableSettings = JSON.parse(localStorage.getItem('tableSettings') || '{}');
    
    // Check both possible data structures
    let tableData = null;
    if (tableSettings.tables && tableSettings.tables[currentTableId]) {
        tableData = tableSettings.tables[currentTableId];
    } else if (tableSettings[currentTableId]) {
        tableData = tableSettings[currentTableId];
    }
    
    if (!tableData || !tableData.persons) {
        showMessage('❌ Masa verisi bulunamadı', 'error');
        return;
    }
    
    Object.keys(tableData.persons).forEach(personName => {
        const person = tableData.persons[personName];
        delete person.paymentStatus;
        delete person.paidAt;
        delete person.paidAmount;
        delete person.paymentRequestedAt;
    });
    
    // Clear partial payments too
    if (tableData.partialPayments) {
        delete tableData.partialPayments;
    }
    
    localStorage.setItem('tableSettings', JSON.stringify(tableSettings));
    updateTablesDisplay();
    openTableModal(currentTableId);
    
    showMessage('🔄 Tüm ödeme durumları sıfırlandı', 'success');
}

function processPersonPayment(personName) {
    const currentTableId = document.getElementById('table-modal-title').textContent.split(' ')[1];
    const tableSettings = JSON.parse(localStorage.getItem('tableSettings') || '{}');
    
    console.log('🔍 Bireysel ödeme işlemi başlatıldı');
    console.log('📋 Current Table ID:', currentTableId);
    console.log('👤 Person Name:', personName);
    console.log('📊 Table Settings:', tableSettings);
    
    // Check both possible data structures
    let tableData = null;
    if (tableSettings.tables && tableSettings.tables[currentTableId]) {
        tableData = tableSettings.tables[currentTableId];
        console.log('📊 Veri yapısı: tables[' + currentTableId + ']');
    } else if (tableSettings[currentTableId]) {
        tableData = tableSettings[currentTableId];
        console.log('📊 Veri yapısı: direkt[' + currentTableId + ']');
    }
    
    console.log('📋 Table Data:', tableData);
    
    if (!tableData) {
        showMessage('❌ Masa verisi bulunamadı', 'error');
        return;
    }
    
    // Find person in orders
    let personData = null;
    let personTotal = 0;
    
    // Check in orders first
    if (tableData.orders) {
        Object.keys(tableData.orders).forEach(personId => {
            const person = tableData.orders[personId];
            if (person.name === personName) {
                personData = person;
                personTotal = person.items ? person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
                console.log('👤 Kişi orders yapısında bulundu:', person);
            }
        });
    }
    
    // If not found in orders, check in persons
    if (!personData && tableData.persons && tableData.persons[personName]) {
        personData = tableData.persons[personName];
        personTotal = personData.items ? personData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
        console.log('👤 Kişi persons yapısında bulundu:', personData);
    }
    
    if (!personData) {
        console.error('❌ Kişi bulunamadı. Aranan isim:', personName);
        console.error('📊 Mevcut orders:', tableData.orders);
        console.error('📊 Mevcut persons:', tableData.persons);
        showMessage('❌ ' + personName + ' adlı kişi bulunamadı', 'error');
        return;
    }
    
    if (personTotal === 0) {
        showMessage('❌ ' + personName + ' adlı kişinin ödenecek hesabı bulunmuyor', 'error');
        return;
    }
    
    if (confirm(personName + ' adlı kişinin ' + personTotal.toFixed(2) + ' ₺ tutarındaki hesabını tahsil ettiniz mi?')) {
        // Update payment status in persons structure
        if (!tableData.persons) {
            tableData.persons = {};
        }
        
        if (!tableData.persons[personName]) {
            tableData.persons[personName] = {
                name: personName,
                items: personData.items || [],
                paymentStatus: 'pending'
            };
        }
        
        tableData.persons[personName].paymentStatus = 'paid';
        tableData.persons[personName].paidAt = new Date().toISOString();
        tableData.persons[personName].paidAmount = personTotal;
        
        console.log('✅ Ödeme kaydedildi:', tableData.persons[personName]);
        
        // Masa tamamen ödendiyse müşteri sepetini temizle
        if (isTableFullyPaid(tableData)) {
            clearCustomerCartIfFullyPaid(currentTableId);
        }
        
        localStorage.setItem('tableSettings', JSON.stringify(tableSettings));
        updateTablesDisplay();
        openTableModal(currentTableId);
        
        showMessage('✅ ' + personName + ' - ' + personTotal.toFixed(2) + ' ₺ tahsil edildi', 'success');
    }
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => messageDiv.remove(), 3000);
}
