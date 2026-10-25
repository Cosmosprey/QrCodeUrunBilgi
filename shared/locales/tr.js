// Turkish texts (the original language of the interface). Keep the keys identical to en.js; a test checks it.
// {name} marks a value that is filled in. "key.one" is the singular form used by languages that have one.

export const tr = {
    // ---- page titles
    "admin.title": "Admin Paneli | QR Kodlu Ürün Bilgi Sistemi",
    "product.title": "Ürün Detayı",
    "product.titleWithName": "{name} | Ürün Detayı",

    // ---- product categories (the stored value stays Turkish; only the label is translated)
    "category.food": "Yiyecek",
    "category.drink": "İçecek",
    "category.cleaning": "Temizlik Malzemeleri",

    // ---- admin: sign-in
    "login.heading": "Yönetici Girişi",
    "login.username": "Kullanıcı adı",
    "login.password": "Parola",
    "login.submit": "GİRİŞ YAP",
    "login.error.credentials": "Kullanıcı adı veya parola hatalı.",
    "login.error.tooMany": "Çok fazla hatalı deneme. Bir süre sonra tekrar deneyin.",
    "login.error.network": "Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.",
    "login.error.other": "Giriş yapılamadı. Lütfen tekrar deneyin.",
    "login.error.noAdmin": "Bu hesabın yönetici yetkisi yok.",
    "panel.logout": "Çıkış",
    "panel.logoutTitle": "Çıkış yap",

    // ---- admin: product form
    "form.addTitle": "Ürün Ekle",
    "form.editTitle": "Ürünü Düzenle",
    "form.nameLabel": "Ürün adı",
    "form.namePlaceholder": "Ürün Adı",
    "form.price": "Fiyat (₺)",
    "form.category": "Kategori",
    "form.dateType": "Tarih türü",
    "form.date": "SKT / TETT tarihi",
    "form.stockLabel": "Stok adedi",
    "form.stockPlaceholder": "Stok Adedi",
    "form.descriptionLabel": "Ürün açıklaması",
    "form.descriptionPlaceholder": "Ürün açıklaması...",
    "form.image": "Ürün görseli",
    "form.save": "KAYDET",
    "form.update": "GÜNCELLE",
    "form.cancel": "İPTAL",

    // ---- admin: product list
    "list.heading": "Ürünler",
    "list.searchLabel": "Ürün ara",
    "list.searchPlaceholder": "Ürün ara...",
    "list.prev": "Önceki sayfa",
    "list.next": "Sonraki sayfa",
    "list.loading": "Ürünler yükleniyor...",
    "list.empty": "Henüz ürün yok. Soldaki formdan ilk ürünü ekleyin.",
    "list.noResults": "Aramanızla eşleşen ürün bulunamadı.",
    "list.confirmDelete": "Silmek istiyor musun?",
    "list.deleteError": "Ürün silinemedi. Lütfen tekrar deneyin.",
    "list.loadError": "Ürünler yüklenemedi. Lütfen sayfayı yenileyin.",
    "card.edit": "Düzenle",
    "card.delete": "Sil",
    "card.qr": "QR Göster",
    "card.noDescription": "Açıklama yok.",
    "card.stockOk": "Stok: {count}",
    "card.stockLow": "Kritik Stok: {count}",
    "card.stockOut": "Tükendi",

    // ---- admin: messages
    "toast.saved": "Ürün kaydedildi.",
    "toast.updated": "Ürün güncellendi.",
    "toast.deleted": "Ürün silindi.",
    "toast.shrunk": "{saved} Görsel küçültüldü: {from} → {to}.",
    "error.save.imageTooLarge": "Görsel yeterince küçültülemedi. Daha küçük bir görsel seçin.",
    "error.save.imageUnreadable": "Görsel okunamadı. Başka bir görsel deneyin.",
    "error.save.denied": "Bu işlem için yetkiniz yok veya girilen bilgiler geçersiz.",
    "error.save.conflict":
        "Bu ürün başka bir yerde değiştirilmiş. Liste yenilendi: güncel değerlere bakıp tekrar düzenleyin.",
    "error.save.gone": "Bu ürün artık yok (başka bir yerde silinmiş). Liste yenilendi.",
    "error.save.failed": "Ürün kaydedilemedi. Lütfen tekrar deneyin.",

    // ---- messages returned by the pure validation functions
    "error.image.type": "Görsel JPEG, PNG, WebP veya GIF olmalıdır.",
    "error.image.gifTooLarge": "GIF dosyaları en fazla 2 MB olabilir.",
    "error.image.tooLarge": "Görsel en fazla 25 MB olabilir.",
    "error.name.length": "Ürün adı 2 ile 70 karakter arasında olmalı.",
    "error.price.range": "Fiyat 0,01 ile 1.000.000 arasında olmalı.",
    "error.stock.range": "Stok, 0 ile 1.000.000 arasında bir tam sayı olmalı.",
    "error.date.invalid": "Geçerli bir tarih girin.",
    "error.date.pastSkt": "Son kullanma tarihi geçmiş bir ürün eklenemez.",
    "error.site.invalid":
        "Geçerli bir adres girin. Adres http:// veya https:// ile başlamalıdır (örn. http://192.168.1.20:5000).",
    "error.site.scheme": "Adres http:// veya https:// ile başlamalıdır.",
    "error.site.credentials": "Adres kullanıcı adı veya parola içeremez.",
    "error.site.queryOrHash": "Adres ? veya # içeremez.",

    // ---- admin: QR window
    "qr.title": "QR Kod",
    "qr.siteLabel": "Site adresi (QR kodunda kullanılır)",
    "qr.save": "Kaydet",
    "qr.download": "PNG indir",
    "qr.print": "Yazdır",
    "qr.close": "Kapat",
    "qr.localWarning":
        'Bu adres yalnızca bu bilgisayarda çalışır: telefonlar ve diğer cihazlar "localhost" adresine ulaşamaz, QR kodu okutulduğunda sayfa açılmaz. Bilgisayarın ağ adresini yazıp Kaydet\'e basın (örn. http://192.168.1.20:5000).',
    "qr.saved": "Adres kaydedildi.",
    "qr.saveFailed": "Adres kaydedilemedi. Lütfen tekrar deneyin.",

    // ---- customer page
    "product.loading": "Ürün bilgileri getiriliyor...",
    "product.notFound.title": "Ürün Bulunamadı",
    "product.notFound.text": "Lütfen QR kodu tekrar okutun veya yöneticiyle iletişime geçin.",
    "product.loadError.title": "Bağlantı Sorunu",
    "product.loadError.text": "Ürün bilgileri alınamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.",
    "product.retry": "Tekrar Dene",
    "product.image": "Ürün",
    "product.priceLabel": "Satış Fiyatı",
    "product.descriptionLabel": "Ürün Açıklaması",
    "product.noDescription": "Açıklama belirtilmedi.",
    "product.notSpecified": "Belirtilmedi",
    "product.priceUpdated": "Son Fiyat Güncelleme: {date}",
    "product.stock.ok": "STOKTA VAR",
    "product.stock.low": "SON {count} ÜRÜN!",
    "product.stock.out": "TÜKENDİ",
    "product.date.skt": "Son Kullanma Tarihi",
    "product.date.tett": "Tavsiye Edilen Tüketim Tarihi",
    "product.expiry.days": "{count} Gün Kaldı",
    "product.expiry.today": "Bugün son gün",
    "product.expiry.expired": "Tarihi Geçti",
    "product.coupon.title": "Sürdürülebilirlik Fırsatı!",
    "product.coupon.skt": "Ürünün SKT'si yaklaştığı için kasada {code} koduyla {discount} kazanın!",
    "product.coupon.tett":
        "Ürünün tavsiye edilen tüketim tarihi geçtiği için kasada {code} koduyla {discount} kazanın!",
    "product.coupon.discount": "%{percent} indirim",
    "product.coupon.demo": "Demo özelliği: gerçek bir ödeme akışı yoktur."
};
