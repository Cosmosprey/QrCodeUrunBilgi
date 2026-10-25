// Loaded first on every page (a separate, tiny module): it translates the page before the Firebase code has
// finished loading, so nobody sees the other language flash by.
import { initI18n } from "./i18n.js";

initI18n();
