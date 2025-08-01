# Restaurant Menu Management System

Bu proje, restoran menüsü yönetimi için geliştirilmiş modern bir web uygulamasıdır. Admin paneli ile kategori ve ürün yönetimi yapabilir, müşteri menüsünü gerçek zamanlı olarak güncelleyebilirsiniz.

## � Özellikler

### Admin Paneli (`admin.html`)
- ✅ **Kategori Yönetimi**: Kategori ekleme, düzenleme, silme
- ✅ **Ürün Yönetimi**: Ürün ekleme, düzenleme, silme, resim yükleme
- ✅ **Sürükle-Bırak Sıralama**: Kategoriler ve ürünler için
- ✅ **Restoran Ayarları**: İsim, açıklama, logo, iletişim bilgileri
- ✅ **Tema Özelleştirme**: Renkler, yazı tipleri, arka plan
- ✅ **Otomatik Kaydetme**: localStorage kullanarak otomatik veri saklama
- ✅ **Gerçek Zamanlı Güncellemeler**: Değişiklikler anında menüye yansır

### Müşteri Menüsü (`anamenu.html`)
- ✅ **Dinamik Menü**: Admin panelindeki değişiklikler otomatik yansır
- ✅ **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- ✅ **Kategori Navigasyonu**: Kolay kategori geçişi
- ✅ **Ürün Detayları**: Fiyat, açıklama, resim gösterimi
- ✅ **Tema Desteği**: Admin panelinde seçilen tema otomatik uygulanır

## � Dosya Yapısı

```
menu/
├── admin.html          # Admin paneli ana sayfası
├── admin.js           # Admin paneli JavaScript kodları
├── anamenu.html       # Müşteri menüsü ana sayfası
├── data/              # JSON veri dosyaları
│   ├── menuItems.json
│   ├── categories.json
│   ├── categoryOrder.json
│   ├── restaurantSettings.json
│   └── themeSettings.json
└── README.md          # Bu dosya
```

## � Kurulum ve Kullanım

### 1. Projeyi İndirin
```bash
git clone [repository-url]
cd menu
```

### 2. Admin Panelini Açın
`admin.html` dosyasını tarayıcınızda açın.

### 3. Menüyü Görüntüleyin
`anamenu.html` dosyasını tarayıcınızda açın.

## � Veri Saklama

Sistem otomatik veri saklama kullanır:

- **localStorage**: Ana veri saklama, tarayıcı yerel belleğinde
- **JSON Dosyaları**: Yedek veri kaynağı (data/ klasöründe)
- **Otomatik Senkronizasyon**: Admin panelindeki değişiklikler anında localStorage'a kaydedilir

### Veri Yükleme Sırası:
1. localStorage'dan yükle
2. sessionStorage'dan yükle (yedek)
3. JSON dosyalarından yükle (son seçenek)

## 🎨 Tema Özelleştirme

Admin panelinde **Tema** sekmesi ile:
- Ana renk paleti
- Yazı tipi seçimi
- Arka plan renkleri
- Kart tasarımları
- Navigasyon stilleri

## 📱 Responsive Tasarım

- **Mobil**: 768px altı ekranlar için optimize
- **Tablet**: 768px-1024px arası ekranlar
- **Masaüstü**: 1024px üzeri ekranlar

## 🔄 Gerçek Zamanlı Güncellemeler

- Admin panelinde yapılan değişiklikler otomatik olarak localStorage'a kaydedilir
- Müşteri menüsü her 2 saniyede localStorage'ı kontrol eder
- Değişiklik tespit edildiğinde menü otomatik güncellenir

## 🛠️ Teknik Detaylar

### Kullanılan Teknolojiler:
- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, Transitions, Responsive Design
- **JavaScript ES6+**: Modern JavaScript özellikleri
- **localStorage API**: Otomatik veri saklama
- **Drag & Drop API**: Sürükle-bırak sıralama

### Tarayıcı Desteği:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🚨 Önemli Notlar

1. **Veri Yedekleme**: localStorage verilerinin yedeğini almayı unutmayın
2. **Tarayıcı Temizleme**: Tarayıcı verilerini temizlemek localStorage'ı siler
3. **Resim Yükleme**: Resimler base64 formatında localStorage'da saklanır
4. **Performans**: Çok büyük resimler localStorage limitini aşabilir

## 🔧 Sorun Giderme

### Admin paneli açılmıyor:
- JavaScript'in etkin olduğundan emin olun
- Tarayıcı konsolunda hata mesajlarını kontrol edin

### Veriler kayboldu:
- Tarayıcı localStorage'ını kontrol edin
- data/ klasöründeki JSON dosyalarını kontrol edin

### Menü güncellenmiyor:
- Admin paneli ile menü arasında 2 saniye bekleyin
- Tarayıcı sekmelerini yenileyin

## � Destek

Sorularınız için GitHub Issues kullanın.

## 📄 Lisans

MIT License - Detaylar için LICENSE dosyasına bakın.
