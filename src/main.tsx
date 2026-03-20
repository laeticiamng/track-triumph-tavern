import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import i18n from "./i18n";

// Sync html lang attribute with i18n language
const updateHtmlLang = () => {
  document.documentElement.lang = i18n.language?.substring(0, 2) || "fr";
};
updateHtmlLang();
i18n.on("languageChanged", updateHtmlLang);

// Global unhandled error listeners — catch anything the ErrorBoundary misses
window.addEventListener("error", (event) => {
  console.error("[GLOBAL ERROR]", event.error?.message || event.message, event.filename, event.lineno);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[UNHANDLED PROMISE]", event.reason);
});

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[SW] registered", reg.scope);
      })
      .catch((err) => {
        console.warn("[SW] registration failed", err);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </StrictMode>
);
