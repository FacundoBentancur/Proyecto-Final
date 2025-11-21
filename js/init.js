// init.js  – Config global de rutas + helper de fetch

// Base de los JSON locales
const DATA_BASE = "./Data";

// Rutas a los JSON según tu estructura de carpetas
const CATEGORIES_URL            = `${DATA_BASE}/cats/cat.json`;
const PUBLISH_PRODUCT_URL       = `${DATA_BASE}/sell/publish.json`;

const PRODUCTS_URL              = `${DATA_BASE}/cats_products/`;        // + ID + EXT_TYPE
const PRODUCT_INFO_URL          = `${DATA_BASE}/products/`;            // + ID + EXT_TYPE
const PRODUCT_INFO_COMMENTS_URL = `${DATA_BASE}/products_comments/`;   // + ID + EXT_TYPE

const CART_INFO_URL             = `${DATA_BASE}/user_cart/`;           // + ID + EXT_TYPE
const CART_BUY_URL              = `${DATA_BASE}/cart/buy.json`;

const EXT_TYPE = ".json";


// === Spinner global ===
let showSpinner = function () {
  const sp = document.getElementById("spinner-wrapper");
  if (sp) sp.style.display = "block";
};

let hideSpinner = function () {
  const sp = document.getElementById("spinner-wrapper");
  if (sp) sp.style.display = "none";
};


// === Helper genérico para pedir JSON local ===
let getJSONData = function (url) {
  let result = {};
  showSpinner();
  return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(function (response) {
      result.status = "ok";
      result.data = response;
      hideSpinner();
      return result;
    })
    .catch(function (error) {
      result.status = "error";
      result.data = error;
      hideSpinner();
      return result;
    });
};


// === Pequeño wrapper para que product-info pueda seguir usando updateCartCount() ===
function updateCartCount() {
  // Si navbar.js ya expuso la función completa, la usamos
  if (typeof window.actualizarContadorCarrito === "function") {
    window.actualizarContadorCarrito();
    return;
  }

  // Fallback simple (por si se llama en una página sin navbar)
  const raw = localStorage.getItem("cartItems") || localStorage.getItem("carrito") || "[]";
  let carrito;
  try { carrito = JSON.parse(raw); } catch { carrito = []; }

  const total = carrito.reduce((acc, item) => acc + (item.quantity ?? item.count ?? 1), 0);
  const badge = document.getElementById("cartBadge") || document.getElementById("cart-count");
  if (badge) badge.textContent = total;
}

// Actualizar al cargar la página y cuando cambie el storage
document.addEventListener("DOMContentLoaded", updateCartCount);
window.addEventListener("storage", (e) => {
  if (e.key === "cartItems" || e.key === "carrito") updateCartCount();
});
