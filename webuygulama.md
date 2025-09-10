# Ayakkabı E‑Ticaret Mini Uygulaması (Instagram → Web)

Instagram’da ayakkabı satan sayfanın ürünlerini basit ve hızlı bir şekilde web üzerinden satabilmesi için **kullanıcı girişi olmadan** çalışan mini e‑ticaret uygulaması. Odak: Vans, Nike, Adidas, New Balance ve **Daha Fazlası** (diğer markalar) koleksiyonları.

---

## 1) Amaç & Kapsam

* Instagram kataloglarındaki ürünleri web’de listelemek, ürün detayında **numara seçimi** ile **sepete eklemek**, sepet üzerinden **Kapıda Ödeme** veya **EFT/Havale** ile siparişi tamamlamak.
* **Üyelik yok**, yalnızca misafir alışverişi.
* Minimum teknik bağımlılık; statik JSON + localStorage ile çalışabilir.

---

## 2) Öne Çıkan Özellikler

* **Markalar sekmesi**: Vans, Nike, Adidas, New Balance, "Daha Fazlası".
* **Ürün Listeleme**: grid görünüm, hızlı filtreler (Marka, Numara, Cinsiyet/Unisex, Fiyat aralığı), sıralama (En yeni, Fiyat ↑/↓, Popüler).
* **Arama**: başlık/sku/etiket bazlı.
* **İlan (Ürün) Detayı**:

  * Çoklu görsel, başlık, fiyat, açıklama, stok durumu.
  * **Numara (EU 36–46)** seçici (stok dışı numaralar disable).
  * Adet seçici, **Sepete Ekle**.
  * Ek butonlar: **Favorilere Ekle** (opsiyonel, localStorage), **Paylaş**, **WhatsApp’tan Sor** (href: `https://wa.me/<telefon>?text=...`).
  * **Benzer ürünler** bölümü.
* **Sepet**:

  * Ürün adı, numara, adet, birim fiyat, ara toplam.
  * Adet arttır/azalt, sil, **Sepeti Temizle**.
  * Kargo ücreti (ör: 99₺) veya **X₺ üzeri ücretsiz kargo** eşiği.
  * Ödeme adımına geçiş (Checkout).
* **Ödeme (Checkout)** – *Misafir formu*:

  * Ad Soyad, Telefon, E‑posta (opsiyonel), Adres, İl/İlçe, Teslimat Notu.
  * **Ödeme Yöntemi**: Kapıda Ödeme, EFT/Havale (IBAN + açıklama).
  * Sipariş özeti + onay (KVKK/Aydınlatma metni onayı kutusu).
* **Bildirimler**: Sepete ekleme/toast, stok uyarıları.
* **SEO/Paylaşım**: Sayfa başlıkları, meta açıklamaları, OpenGraph görselleri.
* **Responsive**: Mobil öncelikli tasarım.

---

## 3) Sayfalar & Rotalar

* `/` – Ana sayfa: hero, öne çıkanlar, markalar, yeni gelenler.
* `/urunler` – Tüm ürünler + filtre/sıralama.
* `/marka/:brand` – Marka bazlı liste.
* `/urun/:slug` – Ürün detay.
* `/sepet` – Sepet.
* `/odeme` – Ödeme (checkout) adımı.
* `/hakkimizda`, `/iade-kosullari`, `/iletisim` – Statik sayfalar.

> **Not**: Üyelik/hesap sayfaları **yok**.

---

## 4) Butonlar (Minimum)

* **Ürün Kartı**: Sepete Ekle, Detaya Git, Favori (opsiyonel ♥).
* **Detay Sayfası**: Numara seçici, Adet ±, Sepete Ekle, WhatsApp’tan Sor, Paylaş.
* **Sepet**: Adet ±, Kaldır, Sepeti Temizle, Ödemeye Geç.
* **Ödeme**: Geri (Sepete dön), Siparişi Onayla.
* **Filtre Alanı**: Uygula, Temizle.

---

## 5) Akış (User Flow)

1. Kullanıcı `/urunler`’de ürünleri görür → filtreler/arar.
2. Ürün detayında numara & adet seçer → **Sepete Ekle**.
3. `/sepet`’te kontrol eder → **Ödemeye Geç**.
4. `/odeme` formunu doldurur, ödeme yöntemini seçer:

   * **Kapıda Ödeme**: Ödeme yöntemi = Kapıda; sipariş notuna bilgi eklenir.
   * **EFT/Havale**: IBAN ve alıcı adı gösterilir; açıklama alanında sipariş numarası bilgilendirilir.
5. **Siparişi Onayla** → Özet ekranı + teşekkür.

---

## 6) Ödeme Yöntemleri

* **Kapıda Ödeme**: Nakit/Kart kapıda (kart cihazı opsiyonel bilgi). Kargo firması/kurye notu gösterilebilir.
* **EFT/Havale**:

  * IBAN: `TR00 0000 0000 0000 0000 0000 00` (örnek, .env ile yönetilecek)
  * Alıcı Adı: `Şirket Adı`
  * Açıklama: `SIP-{{siparis_no}}-{{ad_soyad}}`

> **NOT**: Online POS **yok**. Sipariş sistemde oluşturulur; ödeme takibi manuel yapılır.

---

## 7) Veri Modeli (Örnek)

```json
// Product
{
  "id": "p_101",
  "slug": "vans-old-skool-black",
  "title": "Vans Old Skool Black",
  "brand": "Vans",
  "price": 2899,
  "currency": "TRY",
  "images": ["/img/vans-old-1.jpg", "/img/vans-old-2.jpg"],
  "sizes": [36,37,38,39,40,41,42,43,44,45,46],
  "stockBySize": {"40": 5, "41": 2, "42": 0},
  "gender": "Unisex",
  "tags": ["skate", "classic"],
  "description": "Klasik siyah-beyaz Old Skool."
}

// CartItem
{
  "productId": "p_101",
  "size": 41,
  "qty": 1,
  "unitPrice": 2899
}

// Order (frontend tarafında oluşan taslak)
{
  "id": "SIP-2025-000123",
  "items": [{"productId": "p_101", "size": 41, "qty": 1, "unitPrice": 2899}],
  "shipping": {
    "fullName": "Ad Soyad",
    "phone": "+90...",
    "email": "opsiyonel@eposta.com",
    "address": "Açık adres",
    "city": "İstanbul",
    "district": "Kadıköy",
    "note": "Zil çalışmıyor"
  },
  "paymentMethod": "KAPIDA" | "EFT",
  "totals": {"subTotal": 2899, "shipping": 99, "grandTotal": 2998}
}
```

**LocalStorage Anahtarları**

* `cart:v1` – sepet içeriği
* `fav:v1` – favoriler (opsiyonel)
* `checkout:v1` – doldurulan form taslağı

---

## 8) Filtreleme & Sıralama

* **Filtreler**: marka (Vans, Nike, Adidas, New Balance, Daha Fazlası), numara, cinsiyet (Erkek/Kadın/Unisex), fiyat aralığı, stokta var.
* **Sıralama**: en yeni, fiyat artan/azalan, popüler (satış/etiket bazlı).

---

## 9) UI Taslakları (ASCII Wireframe)

```
[Header]
  LOGO   |  Arama [........]  |  Sepet (3)
  Markalar: Vans | Nike | Adidas | New Balance | Daha Fazlası
---------------------------------------------------------------
[Filtreler] Marka [v]  Numara [v]  Fiyat [----]  Sırala [v]  Uygula  Temizle

[Ürün Kartı]
+------------------+
|  IMG             |
|  Başlık          |
|  Fiyat           |
|  Sepete Ekle  i  |
+------------------+

[Detay]
IMG GALLERİ | Başlık, Fiyat
Açıklama
Numara: [36][37][38][39][40][41][42][43][44][45][46]
Adet: [-] 1 [+]
[Sepete Ekle]  [WhatsApp’tan Sor]  [Paylaş]
Benzer Ürünler: [kart][kart][kart]

[Sepet]
Ürün | Numara | Adet ± | Fiyat | Kaldır
Ara Toplam: xxx   Kargo: 99   Toplam: yyy
[Ödemeye Geç]   [Sepeti Temizle]

[Ödeme]
Form alanları...
Ödeme: (o) Kapıda  ( ) EFT/Havale [IBAN Göster]
[ Siparişi Onayla ]
```

---

## 10) Dosya Yapısı (Öneri – React + Vite + Tailwind)

```
src/
  components/
    ProductCard.tsx
    SizePicker.tsx
    QuantityInput.tsx
    Price.tsx
    BrandTabs.tsx
    Filters.tsx
    CartDrawer.tsx
    Toast.tsx
  pages/
    Home.tsx
    Products.tsx
    ProductDetail.tsx
    Cart.tsx
    Checkout.tsx
    Static/
      About.tsx
      Returns.tsx
      Contact.tsx
  lib/
    cart.ts
    storage.ts
    currency.ts
    router.tsx
    mock.ts (products.json loader)
  data/
    products.json
  styles/
    globals.css
main.tsx
index.html
```

---

## 11) Bileşen Davranışları (Kısa)

* **SizePicker**: stok dışı numaraları `disabled`; seçili numara tek.
* **CartDrawer**/**Cart Page**: her değişiklikte localStorage güncellenir.
* **Checkout**: form valid değilse onay butonu pasif; yöntem seçimine göre bilgi paneli değişir.

---

## 12) Hatalar & Kenar Durumlar

* Numara seçmeden sepete ekleme → uyarı.
* Stok 0 olan numara → seçilemez.
* Sepet boş → ödeme sayfasına geçiş engellenir.
* Ağ/JSON yüklenemedi → tekrar dene/placeholder.

---

## 13) Performans & SEO

* Görsellerde `lazy` yükleme, `srcset`/`sizes`.
* Liste sayfasında sayfalama veya sonsuz scroll (opsiyonel).
* Başlık/meta/OG etiketleri; marka/ürün için SEO dostu slug.

---

## 14) Çevre Değişkenleri (.env örneği)

```
VITE_SHOP_NAME="Instagram Sneaker Store"
VITE_CONTACT_PHONE="+90XXXXXXXXXX"
VITE_EFT_IBAN="TR00 0000 0000 0000 0000 0000 00"
VITE_EFT_RECEIVER="Şirket Adı"
VITE_FREE_SHIPPING_THRESHOLD=1500
VITE_SHIPPING_FEE=99
```

---

## 15) Geliştirme (Cursor için hızlı başlangıç)

1. **Vite + React** projesi oluştur (TS önerilir).
2. Tailwind kur → `container`, `grid`, `rounded-2xl`, `shadow` tasarım dili.
3. `data/products.json` ekle, `lib/mock.ts` ile fetch et.
4. Rotaları kur (`react-router-dom`).
5. Bileşenleri ekle: kart, detay, sepet, ödeme.
6. localStorage entegrasyonu.
7. Test: Mobil ve masaüstü, boş sepet, stok dışı senaryolar.

---

## 16) Teslim Kriterleri (Acceptance)

* Ürün listeleme/filtreleme çalışıyor.
* Detayda numara seçimi zorunlu, stok dışı numara seçilemiyor.
* Sepete ekle/çıkar/adet ± çalışıyor.
* Ödeme sayfasında form validasyonu var; Kapıda/EFT ayrımı net.
* Onaydan sonra sipariş özeti; sepet temizleniyor.

---

## 17) Yasal/İçerik

* **Aydınlatma Metni**, **Çerez Politikası**, **İade/Değişim Koşulları** statik sayfalarda.
* WhatsApp linki ve telefon bilgisi .env’den gelir.

---

## 18) Gelecek İyileştirmeler (Opsiyonel)

* Kupon kodu, çoklu adres, favoriler listesi.
* Admin mini-paneli (yalnızca ürün JSON güncelleyici).
* Online POS entegrasyonu.

---

**Hazır!** Bu dosyayı README.md olarak kullanıp Cursor’da adım adım geliştirebilirsin.
