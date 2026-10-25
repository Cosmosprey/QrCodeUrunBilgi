// Short messages that fade away ("Ürün kaydedildi."). The container is a polite live region, so screen
// readers announce them. Problems stay in the alert boxes next to the thing that failed.

const region = document.getElementById("toast-region");
const DEFAULT_DURATION_MS = 4000;

/** Shows a toast and removes it after `duration` milliseconds (or when it is clicked). */
export function showToast(message, { duration = DEFAULT_DURATION_MS } = {}) {
    const toast = document.createElement("div");
    toast.className = "app-toast";
    toast.textContent = message;

    const remove = () => toast.remove();
    toast.addEventListener("click", remove);
    setTimeout(remove, duration);

    region.append(toast);
    return toast;
}
