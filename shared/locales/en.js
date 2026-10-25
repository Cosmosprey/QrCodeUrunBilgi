// English texts. Keep the keys identical to tr.js; a test checks it.
// {name} marks a value that is filled in. "key.one" is the singular form (used when the count is exactly 1).

export const en = {
    // ---- page titles
    "admin.title": "Admin Panel | QR Product Information System",
    "product.title": "Product Details",
    "product.titleWithName": "{name} | Product Details",

    // ---- product categories (the stored value stays Turkish; only the label is translated)
    "category.food": "Food",
    "category.drink": "Beverages",
    "category.cleaning": "Cleaning supplies",

    // ---- admin: sign-in
    "login.heading": "Admin Login",
    "login.username": "Username",
    "login.password": "Password",
    "login.submit": "SIGN IN",
    "login.error.credentials": "Wrong username or password.",
    "login.error.tooMany": "Too many failed attempts. Please try again later.",
    "login.error.network": "Could not reach the server. Check your connection.",
    "login.error.other": "Could not sign in. Please try again.",
    "login.error.noAdmin": "This account has no admin rights.",
    "panel.logout": "Sign out",
    "panel.logoutTitle": "Sign out",

    // ---- admin: product form
    "form.addTitle": "Add Product",
    "form.editTitle": "Edit Product",
    "form.nameLabel": "Product name",
    "form.namePlaceholder": "Product Name",
    "form.price": "Price (₺)",
    "form.category": "Category",
    "form.dateType": "Date type",
    "form.date": "Use-by / best-before date (SKT / TETT)",
    "form.stockLabel": "Stock quantity",
    "form.stockPlaceholder": "Stock Quantity",
    "form.descriptionLabel": "Product description",
    "form.descriptionPlaceholder": "Product description...",
    "form.image": "Product image",
    "form.save": "SAVE",
    "form.update": "UPDATE",
    "form.cancel": "CANCEL",

    // ---- admin: product list
    "list.heading": "Products",
    "list.searchLabel": "Search products",
    "list.searchPlaceholder": "Search products...",
    "list.prev": "Previous page",
    "list.next": "Next page",
    "list.loading": "Loading products...",
    "list.empty": "No products yet. Add the first one with the form on the left.",
    "list.noResults": "No products match your search.",
    "list.confirmDelete": "Do you want to delete this product?",
    "list.deleteError": "The product could not be deleted. Please try again.",
    "list.loadError": "Products could not be loaded. Please reload the page.",
    "card.edit": "Edit",
    "card.delete": "Delete",
    "card.qr": "Show QR",
    "card.noDescription": "No description.",
    "card.stockOk": "Stock: {count}",
    "card.stockLow": "Low stock: {count}",
    "card.stockOut": "Out of stock",

    // ---- admin: messages
    "toast.saved": "Product saved.",
    "toast.updated": "Product updated.",
    "toast.deleted": "Product deleted.",
    "toast.shrunk": "{saved} Image shrunk: {from} → {to}.",
    "error.save.imageTooLarge": "The image could not be made small enough. Choose a smaller image.",
    "error.save.imageUnreadable": "The image could not be read. Try another image.",
    "error.save.denied": "You are not allowed to do this, or the data is invalid.",
    "error.save.conflict":
        "This product was changed somewhere else. The list was reloaded: check the current values and edit again.",
    "error.save.gone": "This product no longer exists (it was deleted somewhere else). The list was reloaded.",
    "error.save.failed": "The product could not be saved. Please try again.",

    // ---- messages returned by the pure validation functions
    "error.image.type": "The image must be JPEG, PNG, WebP or GIF.",
    "error.image.gifTooLarge": "GIF files can be at most 2 MB.",
    "error.image.tooLarge": "The image can be at most 25 MB.",
    "error.name.length": "The product name must be 2 to 70 characters.",
    "error.price.range": "The price must be between 0.01 and 1,000,000.",
    "error.stock.range": "The stock must be a whole number from 0 to 1,000,000.",
    "error.date.invalid": "Enter a valid date.",
    "error.date.pastSkt": "A product whose use-by date has passed cannot be added.",
    "error.site.invalid":
        "Enter a valid address. It must start with http:// or https:// (e.g. http://192.168.1.20:5000).",
    "error.site.scheme": "The address must start with http:// or https://.",
    "error.site.credentials": "The address cannot contain a user name or password.",
    "error.site.queryOrHash": "The address cannot contain ? or #.",

    // ---- admin: QR window
    "qr.title": "QR Code",
    "qr.siteLabel": "Site address (used in the QR code)",
    "qr.save": "Save",
    "qr.download": "Download PNG",
    "qr.print": "Print",
    "qr.close": "Close",
    "qr.localWarning":
        'This address only works on this computer: phones and other devices cannot reach "localhost", so scanning the QR code would not open the page. Enter your computer\'s network address and press Save (e.g. http://192.168.1.20:5000).',
    "qr.saved": "Address saved.",
    "qr.saveFailed": "The address could not be saved. Please try again.",

    // ---- customer page
    "product.loading": "Loading product information...",
    "product.notFound.title": "Product Not Found",
    "product.notFound.text": "Please scan the QR code again or contact the manager.",
    "product.loadError.title": "Connection Problem",
    "product.loadError.text":
        "The product information could not be loaded. Check your internet connection and try again.",
    "product.retry": "Try Again",
    "product.image": "Product",
    "product.priceLabel": "Price",
    "product.descriptionLabel": "Product Description",
    "product.noDescription": "No description provided.",
    "product.notSpecified": "Not specified",
    "product.priceUpdated": "Price last updated: {date}",
    "product.stock.ok": "IN STOCK",
    "product.stock.low": "ONLY {count} LEFT!",
    "product.stock.out": "OUT OF STOCK",
    "product.date.skt": "Use by (SKT)",
    "product.date.tett": "Best before (TETT)",
    "product.expiry.days": "{count} days left",
    "product.expiry.days.one": "{count} day left",
    "product.expiry.today": "Last day today",
    "product.expiry.expired": "Expired",
    "product.coupon.title": "Sustainability deal!",
    "product.coupon.skt": "Because the use-by date is near, get {discount} at the checkout with the code {code}!",
    "product.coupon.tett":
        "Because the best-before date has passed, get {discount} at the checkout with the code {code}!",
    "product.coupon.discount": "{percent}% off",
    "product.coupon.demo": "Demo feature: there is no real checkout."
};
