// init.js – Config global de rutas + helper de fetch

// Base del backend
const API_BASE = "http://localhost:3000/data";

// Rutas JSON del backend
const CATEGORIES_URL            = `${API_BASE}/cats/cat.json`;
const PUBLISH_PRODUCT_URL       = `${API_BASE}/sell/publish.json`;

const PRODUCTS_URL              = `${API_BASE}/cats_products/`;        // + ID + EXT_TYPE
const PRODUCT_INFO_URL          = `${API_BASE}/products/`;            // + ID + EXT_TYPE
const PRODUCT_INFO_COMMENTS_URL = `${API_BASE}/products_comments/`;   // + ID + EXT_TYPE

const CART_INFO_URL             = `${API_BASE}/user_cart/`;           // + ID + EXT_TYPE
const CART_BUY_URL              = `${API_BASE}/cart/buy.json`;

const EXT_TYPE = ".json";

// Spinner
let showSpinner = () => {
  document.getElementById("spinner-wrapper").style.display = "block";
};

let hideSpinner = () => {
  document.getElementById("spinner-wrapper").style.display = "none";
};

let getJSONData = function(url) {
  let result = {};
  showSpinner();
  return fetch(url)
    .then(response => {
      if (response.ok) return response.json();
      throw Error(response.statusText);
    })
    .then(function(response) {
      result.status = 'ok';
      result.data = response;
      hideSpinner();
      return result;
    })
    .catch(function(error) {
      result.status = 'error';
      result.data = error;
      hideSpinner();
      return result;
    });
};

// Badge del carrito
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const count = cart.reduce((acc, p) => acc + p.quantity, 0);

  const badge = document.getElementById("cartBadge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-block" : "none";
  }
}

document.addEventListener("DOMContentLoaded", updateCartCount);
window.addEventListener("carrito:actualizado", updateCartCount);
