<<<<<<< HEAD
# 🍽️ Restoran Yönetim Platformu

Modern ve kullanıcı dostu restoran yönetim sistemi. Müşteriler dijital menüden sipariş verebilir, admin panelinden siparişler takip edilebilir.

## ✨ Özellikler

### 👥 Müşteri Arayüzü
- **Dijital Menü**: Kategorilere ayrılmış ürün listesi
- **Akıllı Sipariş**: Masa bazlı sipariş verme
- **Kişi Yönetimi**: Masa başı kişi bazlı sipariş takibi
- **İlave Sipariş**: Sipariş tamamlandıktan sonra ek sipariş verme
- **Sipariş Koruma**: Tamamlanan siparişlerde değişiklik engelleme
- **Dolu Masa Kontrolü**: Dolu masalarda sipariş verme engelleme

### 🎛️ Admin Paneli
- **Canlı Sipariş Takibi**: Real-time sipariş izleme
- **Masa Yönetimi**: Masa durumları ve sipariş detayları
- **Ödeme Takibi**: Kişi bazlı ödeme durumları
- **Manuel Sipariş**: Admin tarafından ürün ekleme/çıkarma
- **Yeni Sipariş Bildirimleri**: Gelen siparişleri ayırt etme
- **İlave Sipariş Takibi**: Sipariş turlarını görsel olarak ayırt etme
- **Sipariş Tamamlama**: Masa siparişlerini tamamlama ve temizleme
### 🎨 Görsel Özellikler
- **Responsive Tasarım**: Mobil ve desktop uyumlu
- **Modern UI/UX**: Kullanıcı dostu arayüz
- **Renk Kodlaması**: Sipariş durumlarına göre renk sistemi
- **Animasyonlar**: Dikkat çekici bildirim animasyonları
- **Durum Göstergeleri**: Net görsel feedback

## 🚀 Kullanılan Teknolojiler

- **Frontend**: HTML5, CSS3, JavaScript
- **Veri Depolama**: LocalStorage
- **Responsive**: CSS Grid & Flexbox
- **Icons**: Unicode Emoji
- **Cross-tab Communication**: LocalStorage Events

## 📱 Cihaz Uyumluluğu

- ✅ Desktop Bilgisayarlar
- ✅ Tabletler
- ✅ Akıllı Telefonlar
- ✅ Tüm Modern Tarayıcılar

## 🎯 Sipariş Süreci

### Müşteri Tarafı
1. **Masa Seçimi**: Boş masa numarası seçimi
2. **Kişi Ekleme**: İsim girme ve menüye geçiş
3. **Ürün Seçimi**: Kategorilerden ürün ekleme
4. **Sipariş Tamamlama**: İlk sipariş turunu bitirme
5. **İlave Sipariş**: Ek ürün ekleme (isteğe bağlı)

### Admin Tarafı
1. **Sipariş Bildirimi**: Yeni sipariş uyarısı alma
2. **Sipariş İnceleme**: Masa detaylarını görüntüleme
3. **Durum Takibi**: Sipariş hazırlık süreci
4. **Ödeme İşlemi**: Kişi bazlı tahsilat
5. **Masa Tamamlama**: Sipariş bitirme ve masa temizleme

### Gelişmiş Özellikler
=======
# Restaurant Menu Management System

Bu proje, restoran menüsü yönetimi için geliştirilmiş modern bir web uygulamasıdır. Admin paneli ile kategori ve ürün yönetimi yapabilir, müşteri menüsünü gerçek zamanlı olarak güncelleyebilirsiniz.

## � Özellikler

### Admin Paneli (`admin.html`)
>>>>>>> a6e047dcb4c3e972d289b2af3317d134ebbd8b81
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

<<<<<<< HEAD
## 🛠️ Kurulum ve Kullanım

### Kurulum
```bash
# Repository'yi klonlayın
git clone https://github.com/abdullahyar23/restoran-yonetim-platformu.git

# Proje klasörüne gidin
cd restoran-yonetim-platformu

# index.html dosyasını tarayıcıda açın
start admin.html  # Windows
# veya
open admin.html   # macOS
# veya dosyayı tarayıcıya sürükleyin
```

### İlk Kurulum
1. `admin.html` dosyasını açın
2. Restoran bilgilerinizi girin
3. Kategori ve ürünlerinizi ekleyin
4. Tema ayarlarınızı yapın
5. Müşteri menüsünü `anamenu.html` üzerinden paylaşın

### Klasör Yapısı
```
restoran-yonetim-platformu/
├── admin.html          # Admin paneli
├── admin.js           # Admin JavaScript kodları
├── anamenu.html       # Müşteri menüsü
├── data/              # Veri dosyaları
│   ├── categories.json
│   ├── menuItems.json
│   ├── restaurantSettings.json
│   └── themeSettings.json
├── images/            # Resim dosyaları
│   ├── logo/          # Logo resimleri
│   └── menu/          # Ürün resimleri
└── README.md          # Bu dosya
```

## 📖 Kullanım Kılavuzu

### Admin Paneli Kullanımı

#### 1. Kategori Yönetimi
- **Yeni Kategori Ekleme**: "Kategori Ekle" butonuna tıklayın
- **Düzenleme**: Kategori üzerine tıklayın ve düzenleyin
- **Silme**: Kategori yanındaki çöp kutusu ikonu
- **Sıralama**: Sürükle-bırak ile yeniden sıralayın

#### 2. Ürün Yönetimi
- **Yeni Ürün Ekleme**: "Ürün Ekle" butonuna tıklayın
- **Resim Yükleme**: Drag & drop ile resim ekleyin
- **Fiyat Ayarlama**: Numeric input ile fiyat belirleyin
- **Kategori Atama**: Dropdown'dan kategori seçin

#### 3. Sipariş Yönetimi
- **Yeni Siparişler**: Pulse animasyonu ile bildirim
- **Masa Detayları**: Sipariş ve kişi bilgilerini görüntüleme
- **Manual Ürün Ekleme**: Admin tarafından masa siparişine ürün ekleme
- **Ödeme Takibi**: Kişi bazlı ödeme durumu
- **Borç Görüntüleme**: Masa kartlarında kalan borç
- **Sipariş Tamamlama**: Masa siparişini bitirme

#### 4. Restoran Ayarları
- **Temel Bilgiler**: İsim, açıklama, adres
- **İletişim**: Telefon, email, sosyal medya
- **Logo**: Drag & drop ile logo yükleme
- **Çalışma Saatleri**: Açılış-kapanış saatleri

#### 5. Tema Özelleştirme
- **Ana Renkler**: Primary, secondary, accent
- **Yazı Tipleri**: Başlık ve içerik fontları
- **Arka Plan**: Renk veya gradient
- **Canlı Önizleme**: Değişiklikler anında görünür

### Müşteri Menüsü Kullanımı

#### 1. Masa Seçimi ve Giriş
- Boş masa numarasını girin
- İsminizi yazın
- "Menüye Geç" butonuna tıklayın

#### 2. Sipariş Verme
- Kategorilerden ürün seçin
- Adet belirleyin ve sepete ekleyin
- Sepeti kontrol edin
- "Siparişi Tamamla" butonuna tıklayın

#### 3. İlave Sipariş
- Sipariş tamamlandıktan sonra "İlave Sipariş Ver" seçeneği
- Yeni ürünler ekleyebilir
- Önceki siparişleri değiştiremez (koruma sistemi)

## 🔧 Teknik Detaylar

### LocalStorage Veri Yapısı
```javascript
// Masa ayarları
tableSettings = {
  [tableNumber]: {
    people: [...],           // Kişiler ve siparişleri
    totalAmount: number,     // Toplam tutar
    paidAmount: number,      // Ödenen tutar
    orderRounds: [...],      // Sipariş turları
    hasNewOrders: boolean,   // Yeni sipariş var mı
    lastOrderTime: timestamp // Son sipariş zamanı
  }
}

// Tamamlanan siparişler
completedOrders = [
  {
    tableNumber: number,
    people: [...],
    totalAmount: number,
    completedAt: timestamp
  }
]
```

### Sipariş Koruma Sistemi
- Teslim edilen siparişler düzenlenemez
- `isSubmitted` flag'i ile kontrol
- Visual feedback ile kullanıcı bilgilendirme
- Admin override yetkisi

### Cross-Tab Communication
- LocalStorage events ile real-time sync
- Admin ve müşteri paneli arasında veri senkronizasyonu
- Otomatik güncellemeler

## 🎨 Özelleştirme

### CSS Değişkenleri
```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  --accent-color: #your-color;
  --background: #your-color;
  --text-color: #your-color;
}
```

### Tema Seçenekleri
- Modern (varsayılan)
- Dark mode
- Özel renkler
- Gradient arka planlar

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Grid Sistemi
- CSS Grid Layout
- Flexbox containers
- Auto-fit columns
- Touch-friendly interfaces

## 🛡️ Güvenlik

### Veri Koruması
- Client-side validation
- Input sanitization
- LocalStorage encryption (opsiyonel)
- XSS protection

### Erişim Kontrolü
- Admin panel ayrı dosya
- URL-based access control
- Session management

## 🚀 Performans

### Optimizasyonlar
- Lazy loading images
- Event delegation
- Minimal DOM manipulation
- Efficient data structures

### Tarayıcı Uyumluluğu
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 16+

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

Proje Sahibi: [@abdullahyar23](https://github.com/abdullahyar23)

Proje Linki: [https://github.com/abdullahyar23/restoran-yonetim-platformu](https://github.com/abdullahyar23/restoran-yonetim-platformu)

## 🙏 Teşekkürler

- Tüm katkıda bulunanlar
- Feedback veren kullanıcılar
- Open source community

---
⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
=======
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
>>>>>>> a6e047dcb4c3e972d289b2af3317d134ebbd8b81
