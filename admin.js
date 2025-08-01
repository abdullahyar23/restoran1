// Global variables
let menuItems = [];
let categories = {};
let categoryOrder = [];
let restaurantSettings = {};
let themeSettings = {};
let currentEditingCategory = null;
let currentEditingProduct = null;

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
            
            // Add active class to clicked tab and corresponding panel
            tab.classList.add('active');
            document.getElementById(targetPanel).classList.add('active');
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
let tableSettings = {
    tableCount: 10,
    tables: {}
};

let currentTableModal = null;

// Initialize table system
function initializeTableSystem() {
    loadTableSettings();
    generateTablesGrid();
    setInterval(updateTablesDisplay, 2000); // Update every 2 seconds
}

// Load table settings from localStorage
function loadTableSettings() {
    const saved = localStorage.getItem('tableSettings');
    if (saved) {
        tableSettings = JSON.parse(saved);
    }
    
    // Update UI
    const tableCountInput = document.getElementById('table-count');
    if (tableCountInput) {
        tableCountInput.value = tableSettings.tableCount;
    }
}

// Save table settings to localStorage
function saveTableSettings() {
    localStorage.setItem('tableSettings', JSON.stringify(tableSettings));
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
    
    card.innerHTML = `
        <div class="table-number">MASA ${table.number}</div>
        <div class="table-status ${statusClass}">${statusText}</div>
        <div class="table-info">
            ${table.isEmpty ? 'Müşteri bekleniyor' : `Toplam: ${table.totalAmount.toFixed(2)} ₺`}
        </div>
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
    // Get fresh table data from customer orders
    const customerTableData = localStorage.getItem('tableData');
    if (customerTableData) {
        const tableData = JSON.parse(customerTableData);
        
        // Update table settings based on customer orders
        if (tableData.selectedTable && tableSettings.tables[tableData.selectedTable]) {
            const tableNumber = tableData.selectedTable;
            
            if (!tableSettings.tables[tableNumber].orders) {
                tableSettings.tables[tableNumber].orders = {};
            }
            
            // Update orders for this table
            tableSettings.tables[tableNumber].orders = tableData.persons;
            tableSettings.tables[tableNumber].isEmpty = Object.keys(tableData.persons).length === 0;
            tableSettings.tables[tableNumber].lastUpdate = new Date().toISOString();
            
            // Calculate total
            const total = Object.values(tableData.persons).reduce((sum, person) => {
                return sum + person.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
            }, 0);
            
            tableSettings.tables[tableNumber].totalAmount = total;
        }
        
        saveTableSettings();
    }
    
    // Regenerate display only if on tables tab
    const tablesTab = document.querySelector('[data-tab="tables"]');
    if (tablesTab && tablesTab.classList.contains('active')) {
        generateTablesGrid();
    }
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
    
    updateTableModalContent(table);
    modal.style.display = 'block';
}

// Close table modal
function closeTableModal() {
    document.getElementById('table-modal').style.display = 'none';
    currentTableModal = null;
}

// Update table modal content
function updateTableModalContent(table) {
    const personsContainer = document.getElementById('table-persons-container');
    const summaryContainer = document.getElementById('table-detail-summary');
    
    personsContainer.innerHTML = '';
    
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
        
        personCard.innerHTML = `
            <div class="person-header">
                <div class="person-name">👤 ${person.name}</div>
                <div class="person-total">${personTotal.toFixed(2)} ₺</div>
            </div>
            <div class="person-items">
                ${person.items.map(item => `
                    <div class="person-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)} ₺</span>
                    </div>
                `).join('')}
                ${person.items.length === 0 ? '<p style="color: #6c757d; font-style: italic;">Henüz sipariş verilmemiş</p>' : ''}
            </div>
        `;
        
        personsContainer.appendChild(personCard);
    });
    
    // Generate summary
    summaryContainer.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px; color: #2c3e50;">📋 Masa Özeti:</div>
        ${Object.keys(table.orders).map(personId => {
            const person = table.orders[personId];
            const personTotal = person.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return `<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${person.name}: ${person.items.length} ürün</span>
                <span>${personTotal.toFixed(2)} ₺</span>
            </div>`;
        }).join('')}
        <div style="border-top: 2px solid #e74c3c; margin-top: 10px; padding-top: 10px; font-weight: bold; color: #e74c3c; display: flex; justify-content: space-between;">
            <span>TOPLAM:</span>
            <span>${table.totalAmount.toFixed(2)} ₺</span>
        </div>
    `;
}

// Clear specific table orders
function clearTableOrders() {
    if (!currentTableModal) return;
    
    if (confirm(`Masa ${currentTableModal} siparişlerini temizlemek istediğinizden emin misiniz?`)) {
        tableSettings.tables[currentTableModal] = {
            number: currentTableModal,
            orders: {},
            isEmpty: true,
            totalAmount: 0,
            lastUpdate: null
        };
        
        saveTableSettings();
        updateTableModalContent(tableSettings.tables[currentTableModal]);
        generateTablesGrid();
        
        alert('✅ Masa siparişleri temizlendi!');
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
    
    if (confirm(`Masa ${currentTableModal} siparişi tamamlandı olarak işaretlensin mi? Masa temizlenecek.`)) {
        // Here you could save to order history before clearing
        clearTableOrders();
        closeTableModal();
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
    if (event.target === modal) {
        closeTableModal();
    }
});
