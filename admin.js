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
            
            // Initialize statistics when statistics tab is activated
            if (targetPanel === 'statistics') {
                setTimeout(() => {
                    initializeStatistics();
                }, 100);
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
    
    // UI'yi güncelle
    const tableCountInput = document.getElementById('table-count');
    if (tableCountInput) {
        tableCountInput.value = tableSettings.tableCount;
        console.log(`🔧 Admin: Input değeri ayarlandı: ${tableSettings.tableCount}`);
    }
    
    // Tamamlanan siparişleri kontrol et
    const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    console.log('📦 Tamamlanan sipariş sayısı:', completedOrders.length);
    
    // Masa ızgarasını oluştur
    generateTablesGrid();
    
    // Bildirimleri göster
    updateNotificationsDisplay();
    
    // Boş masalardaki tamamlanan siparişleri otomatik temizle
    cleanEmptyTablesCompletedOrders();
    
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
        console.log(`🔧 Admin: Masa sayısı input güncellendi: ${tableSettings.tableCount}`);
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

// Update table count - now auto-applies changes
function updateTableCount() {
    const tableCountInput = document.getElementById('table-count');
    const newCount = parseInt(tableCountInput.value);
    
    if (newCount < 1 || newCount > 100) {
        alert('Masa sayısı 1 ile 100 arasında olmalıdır!');
        tableCountInput.value = tableSettings.tableCount;
        return;
    }
    
    // Değişiklik olup olmadığını kontrol et
    if (newCount !== tableSettings.tableCount) {
        // Değişiklik var, hemen uygula
        console.log(`📝 Admin: Masa sayısı değiştirildi: ${tableSettings.tableCount} → ${newCount}`);
        
        // Ayarları hemen uygula
        applyTableSettingsInternal(newCount);
        
        // Kullanıcıya bildir
        showAlert(`✅ Masa sayısı ${newCount} olarak güncellendi!`, 'success');
    }
}

// Internal function to apply table settings without UI feedback
function applyTableSettingsInternal(newCount) {
    const oldCount = tableSettings.tableCount;
    tableSettings.tableCount = newCount;
    
    console.log(`🔄 Admin: Masa sayısı uygulanıyor: ${oldCount} → ${newCount}`);
    
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
                lastUpdate: null,
                completedOrders: []
            };
        }
    }
    
    tableSettings.tables = newTables;
    saveTableSettings();
    generateTablesGrid();
    
    console.log(`✅ Admin: ${tableSettings.tableCount} masa ayarları uygulandı`);
}

// Apply table settings (button handler)
function applyTableSettings() {
    const tableCountInput = document.getElementById('table-count');
    const newCount = parseInt(tableCountInput.value);
    
    if (newCount < 1 || newCount > 100) {
        alert('Masa sayısı 1 ile 100 arasında olmalıdır!');
        tableCountInput.value = tableSettings.tableCount;
        return;
    }
    
    // Use internal function
    applyTableSettingsInternal(newCount);
    
    // Update button appearance
    const applyButton = document.querySelector('button[onclick="applyTableSettings()"]');
    if (applyButton) {
        applyButton.style.background = '';
        applyButton.style.animation = '';
        applyButton.innerHTML = '✅ Masa Ayarlarını Uygula';
    }
    
    alert(`✅ ${tableSettings.tableCount} masa başarıyla oluşturuldu!`);
}

// Generate tables grid
function generateTablesGrid() {
    const container = document.getElementById('tablesGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    console.log('🏠 Admin: Masalar güncelleniyor...');
    console.log('📊 tableSettings:', tableSettings);
    console.log('📋 Masa sayısı:', tableSettings.tableCount);
    console.log('🏢 Tanımlı masalar:', Object.keys(tableSettings.tables || {}));
    
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
        // Masa tanımı yoksa oluştur
        if (!tableSettings.tables[i]) {
            console.log(`🔧 Admin: Masa ${i} tanımı eksik, oluşturuluyor...`);
            tableSettings.tables[i] = {
                number: i,
                orders: {},
                isEmpty: true,
                totalAmount: 0,
                lastUpdate: null,
                completedOrders: []
            };
        }
        
        const table = tableSettings.tables[i];
        console.log(`🏠 Masa ${i}:`, table.isEmpty ? 'BOŞ' : 'DOLU', `(${Object.keys(table.orders).length} kişi)`);
        
        const tableCard = createTableCard(table);
        container.appendChild(tableCard);
    }
    
    // Eksik masa tanımları oluşturulduysa kaydet
    saveTableSettings();
}

// Create table card element
function createTableCard(table) {
    // Güvenlik kontrolü
    if (!table || typeof table.number === 'undefined') {
        console.error('❌ Admin: Geçersiz masa verisi:', table);
        return document.createElement('div');
    }
    
    const card = document.createElement('div');
    card.className = `table-card ${table.isEmpty ? 'empty' : 'occupied'}`;
    card.onclick = () => {
        console.log(`🔘 Admin: Masa ${table.number} kartına tıklandı`);
        openTableModal(table.number);
    };
    
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
window.cleanupTables3And4 = cleanupTables3And4;
window.forceCleanCompletedOrdersForTables = forceCleanCompletedOrdersForTables;
window.cleanEmptyTablesCompletedOrders = cleanEmptyTablesCompletedOrders;
window.clearAllCompletedOrders = clearAllCompletedOrders;

// Tüm masalardaki tamamlanan siparişleri temizle (sadece completed orders)
function clearAllCompletedOrders() {
    console.log('🧹 Tüm masalardaki tamamlanan siparişler temizleniyor...');
    
    let totalCleaned = 0;
    let tablesWithCompleted = [];
    
    // TableSettings içindeki her masanın completedOrders'ını temizle
    if (tableSettings.tables) {
        Object.keys(tableSettings.tables).forEach(tableNum => {
            if (tableSettings.tables[tableNum].completedOrders && tableSettings.tables[tableNum].completedOrders.length > 0) {
                totalCleaned += tableSettings.tables[tableNum].completedOrders.length;
                tablesWithCompleted.push(tableNum);
                tableSettings.tables[tableNum].completedOrders = [];
            }
        });
    }
    
    // Global completedOrders'ı da temizle
    const globalCompleted = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    const globalCount = globalCompleted.length;
    localStorage.setItem('completedOrders', JSON.stringify([]));
    
    // TableData içindeki completedOrders'ı da temizle
    const tableData = JSON.parse(localStorage.getItem('tableData') || '{}');
    let tableDataCleaned = 0;
    if (tableData) {
        Object.keys(tableData).forEach(tableKey => {
            if (tableData[tableKey] && tableData[tableKey].completedOrders) {
                tableDataCleaned += tableData[tableKey].completedOrders.length;
                tableData[tableKey].completedOrders = [];
            }
        });
        localStorage.setItem('tableData', JSON.stringify(tableData));
    }
    
    // Değişiklikleri kaydet
    saveTableSettings();
    generateTablesGrid();
    
    console.log(`✅ Temizleme tamamlandı:
    - TableSettings: ${totalCleaned} sipariş (${tablesWithCompleted.length} masa)
    - Global completedOrders: ${globalCount} sipariş
    - TableData: ${tableDataCleaned} sipariş`);
    
    showAlert(`✅ Tüm tamamlanan siparişler temizlendi! 
    (${totalCleaned + globalCount + tableDataCleaned} sipariş)`, 'success');
    
    return {
        tableSettings: totalCleaned,
        global: globalCount,
        tableData: tableDataCleaned,
        affectedTables: tablesWithCompleted
    };
}

// Clear all tables
function clearAllTables() {
    if (confirm('Tüm masaları temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
        Object.keys(tableSettings.tables).forEach(tableNum => {
            tableSettings.tables[tableNum] = {
                number: parseInt(tableNum),
                orders: {},
                isEmpty: true,
                totalAmount: 0,
                lastUpdate: null,
                completedOrders: [] // Tamamlanan siparişleri de temizle
            };
        });
        
        // Tüm global completedOrders'ı temizle
        localStorage.removeItem('completedOrders');
        
        saveTableSettings();
        generateTablesGrid();
        
        // Also clear customer table data
        localStorage.removeItem('tableData');
        
        alert('✅ Tüm masalar ve tamamlanan siparişler temizlendi!');
    }
}

// Open table modal
function openTableModal(tableNumber) {
    console.log(`🔔 Admin: Masa ${tableNumber} modalı açılıyor...`);
    console.log('📊 Mevcut tableSettings:', tableSettings);
    console.log('🏢 Mevcut masalar:', Object.keys(tableSettings.tables || {}));
    
    currentTableModal = tableNumber;
    
    // Ensure table exists, create if missing
    if (!tableSettings.tables[tableNumber]) {
        console.log(`🔧 Admin: Masa ${tableNumber} tanımı bulunamadı, yeni tanım oluşturuluyor...`);
        tableSettings.tables[tableNumber] = {
            number: tableNumber,
            orders: {},
            isEmpty: true,
            totalAmount: 0,
            lastUpdate: null,
            completedOrders: []
        };
        saveTableSettings();
        console.log(`✅ Admin: Masa ${tableNumber} tanımı oluşturuldu`);
    }
    
    const table = tableSettings.tables[tableNumber];
    console.log(`📋 Masa ${tableNumber} verisi:`, table);
    
    const modal = document.getElementById('table-modal');
    const titleElement = document.getElementById('table-modal-title');
    
    if (!modal) {
        console.error('❌ Admin: Modal element bulunamadı!');
        return;
    }
    
    if (!titleElement) {
        console.error('❌ Admin: Modal title element bulunamadı!');
        return;
    }
    
    titleElement.textContent = `MASA ${tableNumber} - Sipariş Detayları`;
    
    // Populate admin product list
    populateAdminProductList();
    
    // Auto-clean completed orders if table is empty but has completed orders
    if (table.isEmpty && table.completedOrders && table.completedOrders.length > 0) {
        console.log(`🧹 Boş masa ${tableNumber}'da tamamlanan siparişler bulundu, temizleniyor...`);
        table.completedOrders = [];
        
        // Global completedOrders'dan da temizle
        const globalCompletedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        const filteredOrders = globalCompletedOrders.filter(order => order.tableNumber != tableNumber);
        localStorage.setItem('completedOrders', JSON.stringify(filteredOrders));
        
        saveTableSettings();
        console.log(`✅ Masa ${tableNumber}'daki tamamlanan siparişler otomatik temizlendi`);
    }
    
    updateTableModalContent(table);
    modal.style.display = 'block';
    
    console.log(`✅ Admin: Masa ${tableNumber} modalı açıldı`);
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
    Object.values(table.orders || {}).forEach(person => {
        if (person && person.items) {
            person.items.forEach(item => {
                totalAmount += item.price * item.quantity;
            });
        }
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
    if (Object.keys(table.orders || {}).length === 0) {
        table.isEmpty = true;
        table.totalAmount = 0;
    } else {
        // Recalculate total amount
        let totalAmount = 0;
        Object.values(table.orders || {}).forEach(person => {
            if (person && person.items) {
                person.items.forEach(item => {
                    totalAmount += item.price * item.quantity;
                });
            }
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
    if (Object.keys(table.orders || {}).length === 0) {
        table.isEmpty = true;
        table.totalAmount = 0;
    } else {
        // Recalculate total amount
        let totalAmount = 0;
        Object.values(table.orders || {}).forEach(person => {
            if (person && person.items) {
                person.items.forEach(item => {
                    totalAmount += item.price * item.quantity;
                });
            }
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
    
    // Tamamlanan siparişler artık gösterilmiyor - kullanıcı istemedi
    
    if (table.isEmpty || !table.orders || Object.keys(table.orders).length === 0) {
        personsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6c757d; padding: 40px;">Bu masa henüz boş. Müşteri siparişi bekleniyor.</p>';
        summaryContainer.innerHTML = '<p style="text-align: center; color: #6c757d;">Sipariş bulunmuyor.</p>';
        return;
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
    
    // Generate summary with payment info
    let totalPaid = 0;
    let totalPending = 0;
    
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
    
    // Sadece aktif siparişlerin özeti
    if (activeOrdersTotal > 0) {
        summaryHtml += '<div style="color: #28a745; margin-bottom: 3px;">🍽️ Toplam Siparişler: ' + activeOrdersTotal.toFixed(2) + ' ₺</div>';
    }
    
    if (totalPaid > 0) {
        summaryHtml += '<div style="color: #28a745; margin-bottom: 3px;">✅ Tam Ödenen: ' + totalPaid.toFixed(2) + ' ₺</div>';
    }
    if (totalPending > 0) {
        summaryHtml += '<div style="color: #6c757d; margin-bottom: 3px;">⏳ Bekleyen: ' + totalPending.toFixed(2) + ' ₺</div>';
    }
    summaryHtml += '</div>' + partialPaymentsHtml;
    
    // Toplam hesaplama (sadece aktif siparişler)
    const grandTotal = activeOrdersTotal;
    const totalPaidIncludingPartial = totalPaid + totalPartialPaid;
    const finalRemainingAmount = grandTotal - totalPaidIncludingPartial;
    
    summaryHtml += '<div style="border-top: 2px solid #e74c3c; margin-top: 10px; padding-top: 10px; font-weight: bold; color: #e74c3c;">';
    summaryHtml += '<div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>TOPLAM:</span><span>' + grandTotal.toFixed(2) + ' ₺</span></div>';
    if (totalPaidIncludingPartial > 0) {
        summaryHtml += '<div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #28a745;"><span>ÖDENMİŞ:</span><span>' + totalPaidIncludingPartial.toFixed(2) + ' ₺</span></div>';
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
        // Her kişi için ayrı ayrı tamamlanan sipariş kaydet (sadece henüz işlenmemişler için)
        if (table.orders && Object.keys(table.orders).length > 0) {
            Object.keys(table.orders).forEach(personId => {
                const person = table.orders[personId];
                if (person && person.items && person.items.length > 0) {
                    const personTotal = person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    
                    // Kişinin ödeme durumunu ve istatistik durumunu kontrol et
                    const personInPersonsStructure = table.persons && table.persons[person.name];
                    const alreadyProcessed = personInPersonsStructure && personInPersonsStructure.statisticsProcessed;
                    
                    // Sadece henüz istatistiklere işlenmemiş kişileri ekle
                    if (!alreadyProcessed) {
                        const completedOrder = {
                            id: `${currentTableModal}_${person.name}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                            tableNumber: currentTableModal,
                            customerName: person.name,
                            items: person.items,
                            totalAmount: personTotal,
                            paymentMethod: 'cash', // Default olarak nakit
                            completedAt: new Date().toISOString(),
                            paidAt: new Date().toISOString(),
                            completedBy: 'admin',
                            source: 'table_completion' // İstatistik kaynağını belirt
                        };
                        
                        // CompletedOrders listesine ekle
                        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
                        completedOrders.push(completedOrder);
                        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
                        
                        console.log('📊 Masa tamamlama - İstatistikler için sipariş kaydedildi:', completedOrder);
                    } else {
                        console.log('📊 Masa tamamlama - Kişi zaten işlenmiş, atlanıyor:', person.name);
                    }
                }
            });
        }
        
        // Siparişi tamamlanmış olarak kaydet (eski sistem için - isteğe bağlı)
        const completedOrder = {
            tableNumber: currentTableModal,
            completedAt: new Date().toISOString(),
            orders: JSON.parse(JSON.stringify(table.orders)), // Deep copy
            totalAmount: table.totalAmount,
            completedBy: 'admin'
        };
        
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
            lastUpdate: null,
            completedOrders: [] // Tamamlanan siparişleri de temizle
        };
        
        // Global completedOrders'dan bu masa için olan siparişleri de temizle
        const globalCompletedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        const filteredOrders = globalCompletedOrders.filter(order => order.tableNumber != tableNumber);
        localStorage.setItem('completedOrders', JSON.stringify(filteredOrders));
        
        saveTableSettings();
        generateTablesGrid();
        
        // Eğer modal açıksa güncelle
        if (currentTableModal == tableNumber) {
            updateTableModalContent(tableSettings.tables[tableNumber]);
        }
        
        alert(`✅ Masa ${tableNumber} ve tüm tamamlanan siparişleri temizlendi!`);
    }
}

// Clean completed orders for specific table
function cleanCompletedOrdersForTable(tableNumber) {
    if (confirm(`Masa ${tableNumber}'deki tamamlanan siparişleri temizlemek istediğinizden emin misiniz?`)) {
        // Masa bazlı tamamlanan siparişleri temizle
        if (tableSettings.tables[tableNumber]) {
            tableSettings.tables[tableNumber].completedOrders = [];
        }
        
        // Global completedOrders'dan bu masa için olan siparişleri temizle
        const globalCompletedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        const filteredOrders = globalCompletedOrders.filter(order => order.tableNumber != tableNumber);
        localStorage.setItem('completedOrders', JSON.stringify(filteredOrders));
        
        saveTableSettings();
        
        // Eğer modal açıksa güncelle
        if (currentTableModal == tableNumber) {
            updateTableModalContent(tableSettings.tables[tableNumber]);
        }
        
        alert(`✅ Masa ${tableNumber}'deki tamamlanan siparişler temizlendi!`);
    }
}

// Force clean all completed orders for specific tables (mass cleanup)
function forceCleanCompletedOrdersForTables(tableNumbers) {
    console.log('🧹 Toplu tamamlanan sipariş temizleme başlatılıyor...', tableNumbers);
    
    let totalCleaned = 0;
    
    tableNumbers.forEach(tableNumber => {
        // Masa bazlı tamamlanan siparişleri temizle
        if (tableSettings.tables[tableNumber]) {
            if (tableSettings.tables[tableNumber].completedOrders) {
                totalCleaned += tableSettings.tables[tableNumber].completedOrders.length;
                tableSettings.tables[tableNumber].completedOrders = [];
            }
        }
        
        console.log(`🧹 Masa ${tableNumber} completedOrders temizlendi`);
    });
    
    // Global completedOrders'dan belirtilen masalar için olan siparişleri temizle
    const globalCompletedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    const beforeCount = globalCompletedOrders.length;
    const filteredOrders = globalCompletedOrders.filter(order => !tableNumbers.includes(parseInt(order.tableNumber)));
    const afterCount = filteredOrders.length;
    const globalCleaned = beforeCount - afterCount;
    
    localStorage.setItem('completedOrders', JSON.stringify(filteredOrders));
    totalCleaned += globalCleaned;
    
    console.log(`🧹 Global completedOrders: ${beforeCount} → ${afterCount} (${globalCleaned} temizlendi)`);
    
    // Değişiklikleri kaydet
    saveTableSettings();
    
    // Eğer modal açıksa güncelle
    if (currentTableModal && tableNumbers.includes(parseInt(currentTableModal))) {
        updateTableModalContent(tableSettings.tables[currentTableModal]);
    }
    
    // Masaları güncelle
    generateTablesGrid();
    
    console.log(`✅ Toplam ${totalCleaned} tamamlanan sipariş temizlendi`);
    
    return totalCleaned;
}

// Clean completed orders from empty tables automatically
function cleanEmptyTablesCompletedOrders() {
    console.log('🧹 Boş masalardaki tamamlanan siparişler kontrol ediliyor...');
    
    let totalCleaned = 0;
    const emptyTablesWithCompletedOrders = [];
    
    // Tüm masaları kontrol et
    if (tableSettings.tables) {
        Object.keys(tableSettings.tables).forEach(tableNum => {
            const table = tableSettings.tables[tableNum];
            const isEmpty = table.isEmpty || !table.orders || Object.keys(table.orders).length === 0;
            
            if (isEmpty && table.completedOrders && table.completedOrders.length > 0) {
                console.log(`🧹 Boş masa ${tableNum}'da ${table.completedOrders.length} tamamlanan sipariş bulundu`);
                emptyTablesWithCompletedOrders.push(parseInt(tableNum));
                totalCleaned += table.completedOrders.length;
                table.completedOrders = [];
            }
        });
    }
    
    // Global completedOrders'dan boş masalar için olan siparişleri temizle
    const globalCompletedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    const beforeCount = globalCompletedOrders.length;
    
    const filteredOrders = globalCompletedOrders.filter(order => {
        const tableNumber = parseInt(order.tableNumber);
        const table = tableSettings.tables[tableNumber];
        
        if (table) {
            const isEmpty = table.isEmpty || !table.orders || Object.keys(table.orders).length === 0;
            return !isEmpty; // Sadece dolu masaların siparişlerini koru
        }
        
        return true; // Masa bulunamazsa siparişi koru
    });
    
    const afterCount = filteredOrders.length;
    const globalCleaned = beforeCount - afterCount;
    totalCleaned += globalCleaned;
    
    if (globalCleaned > 0) {
        localStorage.setItem('completedOrders', JSON.stringify(filteredOrders));
        console.log(`🧹 Global completedOrders: ${beforeCount} → ${afterCount} (${globalCleaned} temizlendi)`);
    }
    
    if (totalCleaned > 0) {
        saveTableSettings();
        console.log(`✅ Toplam ${totalCleaned} tamamlanan sipariş boş masalardan temizlendi`);
        console.log(`📋 Temizlenen masalar: ${emptyTablesWithCompletedOrders.join(', ')}`);
    } else {
        console.log('✅ Boş masalarda tamamlanan sipariş bulunamadı');
    }
    
    return totalCleaned;
}

// Immediate cleanup for table 3 and 4
function cleanupTables3And4() {
    const cleaned = forceCleanCompletedOrdersForTables([3, 4]);
    alert(`✅ Masa 3 ve Masa 4'teki ${cleaned} tamamlanan sipariş temizlendi!`);
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
        const newTotal = Object.values(newTargetOrders || {}).reduce((sum, person) => {
            if (person && person.items) {
                return sum + person.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
            }
            return sum;
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
        Object.values(tableData.orders || {}).forEach(person => {
            if (person && person.items) {
                const personTotal = person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                totalAmount += personTotal;
            }
        });
    }
    
    // Persons yapısından ödenen tutarı hesapla
    if (tableData.persons) {
        Object.values(tableData.persons || {}).forEach(person => {
            if (person && person.paymentStatus === 'paid' && person.paidAmount) {
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
        // Mark all unpaid persons as paid and save to statistics
        Object.keys(tableData.persons).forEach(personName => {
            const person = tableData.persons[personName];
            if (person.paymentStatus !== 'paid') {
                const personTotal = person.items ? person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
                if (personTotal > 0) {
                    person.paymentStatus = 'paid';
                    person.paidAt = new Date().toISOString();
                    person.paidAmount = personTotal;
                    person.statisticsProcessed = true; // Duplikasyon önleyici
                    
                    // Tamamlanan siparişi istatistikler için kaydet
                    const completedOrder = {
                        id: `${currentTableId}_${personName}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                        tableNumber: currentTableId,
                        customerName: personName,
                        items: person.items || [],
                        totalAmount: personTotal,
                        paymentMethod: 'cash', // Default olarak nakit
                        completedAt: new Date().toISOString(),
                        paidAt: new Date().toISOString(),
                        source: 'bulk_payment' // İstatistik kaynağını belirt
                    };
                    
                    // CompletedOrders listesine ekle
                    const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
                    completedOrders.push(completedOrder);
                    localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
                    
                    console.log('📊 Toplu ödeme - İstatistikler için tamamlanan sipariş kaydedildi:', completedOrder);
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
        tableData.persons[personName].statisticsProcessed = true; // Duplikasyon önleyici
        
        console.log('✅ Ödeme kaydedildi:', tableData.persons[personName]);
        
        // Tamamlanan siparişi istatistikler için kaydet
        const completedOrder = {
            id: `${currentTableId}_${personName}_${Date.now()}`,
            tableNumber: currentTableId,
            customerName: personName,
            items: personData.items || [],
            totalAmount: personTotal,
            paymentMethod: 'cash', // Default olarak nakit, gerekirse güncellenebilir
            completedAt: new Date().toISOString(),
            paidAt: new Date().toISOString(),
            source: 'individual_payment' // İstatistik kaynağını belirt
        };
        
        // CompletedOrders listesine ekle
        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        completedOrders.push(completedOrder);
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        
        console.log('📊 İstatistikler için tamamlanan sipariş kaydedildi:', completedOrder);
        
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

// ==================== STATISTICS SYSTEM ====================

// Initialize statistics when page loads
function initializeStatistics() {
    console.log('📊 İstatistik sistemi başlatılıyor...');
    
    // Set default date range (today)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    document.getElementById('stats-start-date').value = todayStr;
    document.getElementById('stats-end-date').value = todayStr;
    
    // Generate initial statistics
    generateStatistics();
}

// Apply quick filter to date range
function applyQuickFilter() {
    const filter = document.getElementById('stats-quick-filter').value;
    const today = new Date();
    const startDateInput = document.getElementById('stats-start-date');
    const endDateInput = document.getElementById('stats-end-date');
    
    let startDate = new Date();
    let endDate = new Date();
    
    switch (filter) {
        case 'today':
            // Bugün
            startDate = new Date(today);
            endDate = new Date(today);
            break;
            
        case 'yesterday':
            // Dün
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 1);
            endDate = new Date(startDate);
            break;
            
        case 'week':
            // Bu hafta (Pazartesi'den başlayarak)
            const dayOfWeek = today.getDay();
            const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Pazar = 0
            startDate = new Date(today);
            startDate.setDate(today.getDate() - daysFromMonday);
            endDate = new Date(today);
            break;
            
        case 'month':
            // Bu ay
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today);
            break;
            
        case 'all':
            // Tüm zamanlar - en eski veriyi bul
            const allCompletedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
            if (allCompletedOrders.length > 0) {
                const oldestOrder = allCompletedOrders.reduce((oldest, order) => {
                    const orderDate = new Date(order.completedAt);
                    return orderDate < oldest ? orderDate : oldest;
                }, new Date());
                startDate = new Date(oldestOrder);
            } else {
                startDate = new Date(today);
                startDate.setMonth(today.getMonth() - 1); // Son 1 ay
            }
            endDate = new Date(today);
            break;
    }
    
    startDateInput.value = startDate.toISOString().split('T')[0];
    endDateInput.value = endDate.toISOString().split('T')[0];
    
    // Auto-generate statistics
    generateStatistics();
}

// Main statistics generation function
function generateStatistics() {
    console.log('📊 İstatistikler oluşturuluyor...');
    
    const startDate = document.getElementById('stats-start-date').value;
    const endDate = document.getElementById('stats-end-date').value;
    
    if (!startDate || !endDate) {
        alert('Lütfen başlangıç ve bitiş tarihlerini seçin!');
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate + 'T23:59:59'); // End of day
    
    console.log(`📅 Tarih aralığı: ${start.toLocaleDateString('tr-TR')} - ${end.toLocaleDateString('tr-TR')}`);
    
    // Get filtered completed orders
    const filteredOrders = getFilteredCompletedOrders(start, end);
    console.log(`📦 Filtrelenmiş sipariş sayısı: ${filteredOrders.length}`);
    
    // Generate all statistics
    generateKeyMetrics(filteredOrders);
    generateTopProducts(filteredOrders);
    generateCategoryPerformance(filteredOrders);
    generateTimeAnalysis(filteredOrders);
    generatePaymentAnalysis(filteredOrders);
    generateTablePerformance(filteredOrders);
    generateSalesChart(filteredOrders, start, end);
    
    console.log('✅ İstatistikler güncellendi');
}

// Get completed orders within date range
function getFilteredCompletedOrders(startDate, endDate) {
    console.log('📦 Tamamlanan siparişler toplanıyor...');
    
    // Global completedOrders listesi
    const globalCompletedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    console.log(`📋 Global tamamlanan siparişler: ${globalCompletedOrders.length}`);
    
    // Masalardaki tamamlanan siparişleri de topla
    const tableCompletedOrders = [];
    if (tableSettings && tableSettings.tables) {
        Object.keys(tableSettings.tables).forEach(tableNum => {
            const table = tableSettings.tables[tableNum];
            if (table.completedOrders && Array.isArray(table.completedOrders)) {
                table.completedOrders.forEach(order => {
                    // Masa numarasını ekle
                    const orderWithTable = { ...order, tableNumber: tableNum };
                    tableCompletedOrders.push(orderWithTable);
                });
            }
        });
    }
    console.log(`🏢 Masalardaki tamamlanan siparişler: ${tableCompletedOrders.length}`);
    
    // Tüm siparişleri birleştir
    const allCompletedOrders = [...globalCompletedOrders, ...tableCompletedOrders];
    console.log(`📊 Toplam tamamlanan sipariş: ${allCompletedOrders.length}`);
    
    // Tarih filtresi uygula
    const filteredOrders = allCompletedOrders.filter(order => {
        if (!order.completedAt) return false;
        
        const orderDate = new Date(order.completedAt);
        return orderDate >= startDate && orderDate <= endDate;
    });
    
    console.log(`🗓️ Tarih filtresinden sonra: ${filteredOrders.length} sipariş`);
    
    return filteredOrders;
}

// Generate key metrics cards
function generateKeyMetrics(orders) {
    console.log('📊 Anahtar metrikler hesaplanıyor...');
    console.log(`📦 İşlenecek sipariş sayısı: ${orders.length}`);
    
    let totalSales = 0;
    let totalOrders = 0;
    const tableOrders = {};
    
    orders.forEach((order, index) => {
        console.log(`📋 Sipariş ${index + 1}:`, {
            tableNumber: order.tableNumber,
            customerName: order.customerName,
            completedAt: order.completedAt,
            itemCount: order.items ? order.items.length : 0,
            totalAmount: order.totalAmount
        });
        
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const itemTotal = (item.price || 0) * (item.quantity || 0);
                totalSales += itemTotal;
                console.log(`  📦 Ürün: ${item.name}, Fiyat: ${item.price}₺, Adet: ${item.quantity}, Toplam: ${itemTotal}₺`);
            });
        }
        totalOrders++;
        
        // Count orders per table
        const tableNum = order.tableNumber || 'Bilinmeyen';
        tableOrders[tableNum] = (tableOrders[tableNum] || 0) + 1;
    });
    
    const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Find busiest table
    let busiestTable = '-';
    let maxOrders = 0;
    Object.keys(tableOrders).forEach(table => {
        if (tableOrders[table] > maxOrders) {
            maxOrders = tableOrders[table];
            busiestTable = `Masa ${table} (${maxOrders} sipariş)`;
        }
    });
    
    // Update UI
    document.getElementById('total-sales-value').textContent = totalSales.toFixed(2) + ' ₺';
    document.getElementById('order-count-value').textContent = totalOrders.toLocaleString('tr-TR');
    document.getElementById('avg-order-value').textContent = avgOrder.toFixed(2) + ' ₺';
    document.getElementById('busiest-table-value').textContent = busiestTable;
    
    console.log(`💰 TOPLAM SATIŞ: ${totalSales.toFixed(2)} ₺`);
    console.log(`📋 TOPLAM SİPARİŞ: ${totalOrders}`);
    console.log(`📊 ORTALAMA SİPARİŞ: ${avgOrder.toFixed(2)} ₺`);
    console.log(`🏠 EN AKTİF MASA: ${busiestTable}`);
}

// Generate top products ranking
function generateTopProducts(orders) {
    const productStats = {};
    
    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const productId = item.id || item.name;
                if (!productStats[productId]) {
                    productStats[productId] = {
                        name: item.name || 'Bilinmeyen Ürün',
                        quantity: 0,
                        revenue: 0,
                        price: item.price || 0
                    };
                }
                
                productStats[productId].quantity += item.quantity || 0;
                productStats[productId].revenue += (item.price || 0) * (item.quantity || 0);
            });
        }
    });
    
    // Sort by revenue
    const topProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10); // Top 10
    
    const container = document.getElementById('top-products-list');
    if (topProducts.length === 0) {
        container.innerHTML = '<div class="loading">Bu tarih aralığında satış bulunamadı.</div>';
        return;
    }
    
    container.innerHTML = topProducts.map((product, index) => `
        <div class="product-rank-item">
            <div class="product-rank">${index + 1}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-details">Birim fiyat: ${product.price.toFixed(2)} ₺</div>
            </div>
            <div class="product-stats">
                <div class="product-revenue">${product.revenue.toFixed(2)} ₺</div>
                <div class="product-quantity">${product.quantity} adet</div>
            </div>
        </div>
    `).join('');
    
    console.log(`🏆 En çok satan ürün: ${topProducts[0]?.name} (${topProducts[0]?.revenue.toFixed(2)} ₺)`);
}

// Generate category performance analysis
function generateCategoryPerformance(orders) {
    const categoryStats = {};
    let totalRevenue = 0;
    
    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                // Find product category
                const product = menuItems.find(p => p.id == item.id || p.name === item.name);
                const categoryId = product?.category || 'unknown';
                const categoryName = categories[categoryId] || 'Diğer';
                
                if (!categoryStats[categoryName]) {
                    categoryStats[categoryName] = {
                        revenue: 0,
                        quantity: 0
                    };
                }
                
                const revenue = (item.price || 0) * (item.quantity || 0);
                categoryStats[categoryName].revenue += revenue;
                categoryStats[categoryName].quantity += item.quantity || 0;
                totalRevenue += revenue;
            });
        }
    });
    
    const container = document.getElementById('category-performance');
    if (totalRevenue === 0) {
        container.innerHTML = '<div class="loading">Bu tarih aralığında kategori verisi bulunamadı.</div>';
        return;
    }
    
    const sortedCategories = Object.entries(categoryStats)
        .sort(([,a], [,b]) => b.revenue - a.revenue);
    
    container.innerHTML = sortedCategories.map(([categoryName, stats]) => {
        const percentage = (stats.revenue / totalRevenue) * 100;
        return `
            <div class="performance-item">
                <div>
                    <div style="font-weight: bold; color: #2c3e50;">${categoryName}</div>
                    <div style="font-size: 12px; color: #6c757d;">${stats.quantity} ürün</div>
                    <div class="performance-bar">
                        <div class="performance-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: #27ae60;">${stats.revenue.toFixed(2)} ₺</div>
                    <div style="font-size: 12px; color: #6c757d;">%${percentage.toFixed(1)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Generate time-based analysis
function generateTimeAnalysis(orders) {
    const hourlyStats = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
        hourlyStats[i] = { revenue: 0, orders: 0 };
    }
    
    orders.forEach(order => {
        if (order.completedAt) {
            const hour = new Date(order.completedAt).getHours();
            let orderRevenue = 0;
            
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    orderRevenue += (item.price || 0) * (item.quantity || 0);
                });
            }
            
            hourlyStats[hour].revenue += orderRevenue;
            hourlyStats[hour].orders += 1;
        }
    });
    
    // Find peak hours
    const peakHours = Object.entries(hourlyStats)
        .filter(([hour, stats]) => stats.revenue > 0)
        .sort(([,a], [,b]) => b.revenue - a.revenue)
        .slice(0, 6);
    
    const container = document.getElementById('time-analysis');
    if (peakHours.length === 0) {
        container.innerHTML = '<div class="loading">Bu tarih aralığında saat bazlı veri bulunamadı.</div>';
        return;
    }
    
    container.innerHTML = peakHours.map(([hour, stats]) => {
        const timeRange = `${hour.padStart(2, '0')}:00 - ${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`;
        return `
            <div class="time-slot">
                <div class="time-label">${timeRange}</div>
                <div class="time-value">${stats.revenue.toFixed(2)} ₺ (${stats.orders} sipariş)</div>
            </div>
        `;
    }).join('');
}

// Generate payment methods analysis
function generatePaymentAnalysis(orders) {
    const paymentStats = {
        cash: { count: 0, amount: 0, label: 'Nakit' },
        card: { count: 0, amount: 0, label: 'Kart' },
        partial: { count: 0, amount: 0, label: 'Kısmi Ödeme' },
        unknown: { count: 0, amount: 0, label: 'Bilinmeyen' }
    };
    
    orders.forEach(order => {
        let orderTotal = 0;
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                orderTotal += (item.price || 0) * (item.quantity || 0);
            });
        }
        
        const paymentMethod = order.paymentMethod || 'unknown';
        if (paymentStats[paymentMethod]) {
            paymentStats[paymentMethod].count++;
            paymentStats[paymentMethod].amount += orderTotal;
        } else {
            paymentStats.unknown.count++;
            paymentStats.unknown.amount += orderTotal;
        }
    });
    
    const container = document.getElementById('payment-methods');
    const totalAmount = Object.values(paymentStats).reduce((sum, stats) => sum + stats.amount, 0);
    
    if (totalAmount === 0) {
        container.innerHTML = '<div class="loading">Bu tarih aralığında ödeme verisi bulunamadı.</div>';
        return;
    }
    
    container.innerHTML = Object.values(paymentStats)
        .filter(stats => stats.count > 0)
        .map(stats => {
            const percentage = (stats.amount / totalAmount) * 100;
            return `
                <div class="performance-item">
                    <div>
                        <div style="font-weight: bold; color: #2c3e50;">${stats.label}</div>
                        <div style="font-size: 12px; color: #6c757d;">${stats.count} işlem</div>
                        <div class="performance-bar">
                            <div class="performance-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold; color: #27ae60;">${stats.amount.toFixed(2)} ₺</div>
                        <div style="font-size: 12px; color: #6c757d;">%${percentage.toFixed(1)}</div>
                    </div>
                </div>
            `;
        }).join('');
}

// Generate table performance analysis
function generateTablePerformance(orders) {
    const tableStats = {};
    
    orders.forEach(order => {
        const tableNum = order.tableNumber || 'Bilinmeyen';
        if (!tableStats[tableNum]) {
            tableStats[tableNum] = { revenue: 0, orders: 0 };
        }
        
        let orderRevenue = 0;
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                orderRevenue += (item.price || 0) * (item.quantity || 0);
            });
        }
        
        tableStats[tableNum].revenue += orderRevenue;
        tableStats[tableNum].orders += 1;
    });
    
    const container = document.getElementById('table-performance');
    const totalRevenue = Object.values(tableStats).reduce((sum, stats) => sum + stats.revenue, 0);
    
    if (totalRevenue === 0) {
        container.innerHTML = '<div class="loading">Bu tarih aralığında masa verisi bulunamadı.</div>';
        return;
    }
    
    const sortedTables = Object.entries(tableStats)
        .sort(([,a], [,b]) => b.revenue - a.revenue)
        .slice(0, 10); // Top 10 tables
    
    container.innerHTML = sortedTables.map(([tableNum, stats]) => {
        const percentage = (stats.revenue / totalRevenue) * 100;
        const avgPerOrder = stats.orders > 0 ? stats.revenue / stats.orders : 0;
        return `
            <div class="performance-item">
                <div>
                    <div style="font-weight: bold; color: #2c3e50;">Masa ${tableNum}</div>
                    <div style="font-size: 12px; color: #6c757d;">${stats.orders} sipariş - Ort: ${avgPerOrder.toFixed(2)} ₺</div>
                    <div class="performance-bar">
                        <div class="performance-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: #27ae60;">${stats.revenue.toFixed(2)} ₺</div>
                    <div style="font-size: 12px; color: #6c757d;">%${percentage.toFixed(1)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Generate sales chart (simple text-based for now)
function generateSalesChart(orders, startDate, endDate) {
    const container = document.getElementById('sales-chart');
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="loading">Bu tarih aralığında satış verisi bulunamadı.</div>';
        return;
    }
    
    // Group orders by date
    const dailySales = {};
    const currentDate = new Date(startDate);
    
    // Initialize all dates in range
    while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        dailySales[dateKey] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calculate daily sales
    orders.forEach(order => {
        const orderDate = new Date(order.completedAt).toISOString().split('T')[0];
        let orderRevenue = 0;
        
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                orderRevenue += (item.price || 0) * (item.quantity || 0);
            });
        }
        
        if (dailySales.hasOwnProperty(orderDate)) {
            dailySales[orderDate] += orderRevenue;
        }
    });
    
    // Create simple chart visualization
    const maxSales = Math.max(...Object.values(dailySales));
    const chartHtml = Object.entries(dailySales).map(([date, sales]) => {
        const percentage = maxSales > 0 ? (sales / maxSales) * 100 : 0;
        const displayDate = new Date(date).toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'short' 
        });
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="width: 60px; font-size: 12px; color: #6c757d;">${displayDate}</div>
                <div style="flex: 1; margin: 0 10px;">
                    <div style="background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #e74c3c, #f39c12); height: 100%; width: ${percentage}%; transition: width 0.5s ease; border-radius: 10px;"></div>
                    </div>
                </div>
                <div style="width: 80px; text-align: right; font-weight: bold; color: #27ae60; font-size: 14px;">
                    ${sales.toFixed(0)} ₺
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px; color: #2c3e50; font-weight: bold;">
                Günlük Satış Trendi
            </div>
            ${chartHtml}
            <div style="text-align: center; margin-top: 15px; font-size: 12px; color: #6c757d;">
                Maksimum günlük satış: ${maxSales.toFixed(2)} ₺
            </div>
        </div>
    `;
}

// Export statistics to different formats
function exportStatistics(format) {
    const startDate = document.getElementById('stats-start-date').value;
    const endDate = document.getElementById('stats-end-date').value;
    
    if (!startDate || !endDate) {
        alert('Lütfen tarih aralığını seçin!');
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate + 'T23:59:59');
    const filteredOrders = getFilteredCompletedOrders(start, end);
    
    if (filteredOrders.length === 0) {
        alert('Bu tarih aralığında veri bulunamadı!');
        return;
    }
    
    switch (format) {
        case 'excel':
        case 'csv':
            exportToCSV(filteredOrders, startDate, endDate);
            break;
        case 'pdf':
            exportToPDF(filteredOrders, startDate, endDate);
            break;
        default:
            alert('Desteklenmeyen format!');
    }
}

// Export to CSV format
function exportToCSV(orders, startDate, endDate) {
    let csvContent = "Tarih,Masa,Ürün,Miktar,Birim Fiyat,Toplam,Müşteri\n";
    
    orders.forEach(order => {
        const orderDate = new Date(order.completedAt).toLocaleDateString('tr-TR');
        const tableNum = order.tableNumber || 'Bilinmeyen';
        const customer = order.customerName || 'Bilinmeyen';
        
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const total = (item.price || 0) * (item.quantity || 0);
                csvContent += `${orderDate},${tableNum},"${item.name}",${item.quantity},${item.price},${total.toFixed(2)},"${customer}"\n`;
            });
        }
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `satış_raporu_${startDate}_${endDate}.csv`;
    link.click();
    
    showAlert('📊 CSV raporu indirildi!', 'success');
}

// Export to PDF (simplified text format)
function exportToPDF(orders, startDate, endDate) {
    // Create a summary report
    let reportContent = `
SATIŞ RAPORU
Tarih Aralığı: ${new Date(startDate).toLocaleDateString('tr-TR')} - ${new Date(endDate).toLocaleDateString('tr-TR')}
Oluşturulma: ${new Date().toLocaleString('tr-TR')}

=====================================

`;
    
    let totalRevenue = 0;
    const productStats = {};
    
    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                totalRevenue += (item.price || 0) * (item.quantity || 0);
                const productName = item.name || 'Bilinmeyen';
                if (!productStats[productName]) {
                    productStats[productName] = { quantity: 0, revenue: 0 };
                }
                productStats[productName].quantity += item.quantity || 0;
                productStats[productName].revenue += (item.price || 0) * (item.quantity || 0);
            });
        }
    });
    
    reportContent += `ÖZET İSTATİSTİKLER:
- Toplam Satış: ${totalRevenue.toFixed(2)} ₺
- Toplam Sipariş: ${orders.length}
- Ortalama Sipariş: ${orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : 0} ₺

EN ÇOK SATAN ÜRÜNLER:
`;
    
    const topProducts = Object.entries(productStats)
        .sort(([,a], [,b]) => b.revenue - a.revenue)
        .slice(0, 10);
    
    topProducts.forEach(([product, stats], index) => {
        reportContent += `${index + 1}. ${product}: ${stats.quantity} adet - ${stats.revenue.toFixed(2)} ₺\n`;
    });
    
    // Download as text file (PDF generation would require additional library)
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `satış_raporu_${startDate}_${endDate}.txt`;
    link.click();
    
    showAlert('📄 Rapor metin dosyası olarak indirildi!', 'success');
}

// Global function to access statistics
window.generateStatistics = generateStatistics;
window.applyQuickFilter = applyQuickFilter;
window.exportStatistics = exportStatistics;

// ==================== DUPLICATE PREVENTION SYSTEM ====================

// Clean duplicate completed orders (same customer, same table, close timestamps)
function cleanDuplicateCompletedOrders() {
    console.log('🧹 Duplike tamamlanan siparişler temizleniyor...');
    
    const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    console.log('📦 Toplam kayıt sayısı:', completedOrders.length);
    
    if (completedOrders.length === 0) {
        console.log('✅ Temizlenecek kayıt bulunamadı');
        return 0;
    }
    
    // Group orders by customer and table
    const groupedOrders = {};
    
    completedOrders.forEach((order, index) => {
        const key = `${order.tableNumber}_${order.customerName}`;
        if (!groupedOrders[key]) {
            groupedOrders[key] = [];
        }
        groupedOrders[key].push({ ...order, originalIndex: index });
    });
    
    let duplicatesRemoved = 0;
    const finalOrders = [];
    
    // Process each group
    Object.keys(groupedOrders).forEach(key => {
        const orders = groupedOrders[key];
        
        if (orders.length === 1) {
            // Single order, keep it
            finalOrders.push(orders[0]);
        } else {
            // Multiple orders for same customer and table
            console.log(`🔍 ${key} için ${orders.length} kayıt bulundu`);
            
            // Sort by completion time
            orders.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
            
            // Group by close timestamps (within 5 minutes)
            const timeGroups = [];
            
            orders.forEach(order => {
                const orderTime = new Date(order.completedAt);
                let addedToGroup = false;
                
                for (let group of timeGroups) {
                    const groupTime = new Date(group[0].completedAt);
                    const timeDiff = Math.abs(orderTime - groupTime) / (1000 * 60); // minutes
                    
                    if (timeDiff <= 5) {
                        group.push(order);
                        addedToGroup = true;
                        break;
                    }
                }
                
                if (!addedToGroup) {
                    timeGroups.push([order]);
                }
            });
            
            // Keep only one order from each time group (the first one)
            timeGroups.forEach(group => {
                if (group.length > 1) {
                    console.log(`🧹 ${key} - ${group.length} duplike kayıt, sadece 1'i korunuyor`);
                    duplicatesRemoved += group.length - 1;
                    
                    // Keep the order with most complete data
                    const bestOrder = group.reduce((best, current) => {
                        const bestScore = (best.items?.length || 0) + (best.source ? 1 : 0);
                        const currentScore = (current.items?.length || 0) + (current.source ? 1 : 0);
                        return currentScore > bestScore ? current : best;
                    });
                    
                    finalOrders.push(bestOrder);
                } else {
                    finalOrders.push(group[0]);
                }
            });
        }
    });
    
    // Remove originalIndex property
    const cleanedOrders = finalOrders.map(order => {
        const { originalIndex, ...cleanOrder } = order;
        return cleanOrder;
    });
    
    // Save cleaned orders
    localStorage.setItem('completedOrders', JSON.stringify(cleanedOrders));
    
    console.log(`✅ Duplike temizleme tamamlandı:`);
    console.log(`📦 Önceki kayıt sayısı: ${completedOrders.length}`);
    console.log(`📦 Yeni kayıt sayısı: ${cleanedOrders.length}`);
    console.log(`🧹 Temizlenen duplike: ${duplicatesRemoved}`);
    
    return duplicatesRemoved;
}

// Auto-clean duplicates when statistics are generated
function generateStatisticsWithCleanup() {
    // First clean duplicates
    const duplicatesRemoved = cleanDuplicateCompletedOrders();
    
    if (duplicatesRemoved > 0) {
        console.log(`🧹 ${duplicatesRemoved} duplike kayıt temizlendi, istatistikler yeniden oluşturuluyor...`);
    }
    
    // Then generate statistics
    generateStatistics();
}

// Global functions
window.cleanDuplicateCompletedOrders = cleanDuplicateCompletedOrders;
window.generateStatisticsWithCleanup = generateStatisticsWithCleanup;
