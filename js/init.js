// === Base local de datos ===
const DATA_BASE = "./Data";

// === Rutas de JSON según tu carpeta ===
const CATEGORIES_URL              = `${DATA_BASE}/cats/cat.json`;

const PUBLISH_PRODUCT_URL         = `${DATA_BASE}/sell/publish.json`;

const PRODUCTS_URL                = `${DATA_BASE}/cats_products/`;        // se usa con ID + EXT_TYPE
const PRODUCT_INFO_URL            = `${DATA_BASE}/products/`;            // se usa con ID + EXT_TYPE
const PRODUCT_INFO_COMMENTS_URL   = `${DATA_BASE}/products_comments/`;   // se usa con ID + EXT_TYPE

const CART_INFO_URL               = `${DATA_BASE}/user_cart/`;           // se usa con ID + EXT_TYPE
const CART_BUY_URL                = `${DATA_BASE}/cart/buy.json`;

const EXT_TYPE = ".json";


// === Spinner ===
let showSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "none";
}


// === getJSONData ===
let getJSONData = function(url){
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
    .then(function(response) {
      result.status = "ok";
      result.data = response;
      hideSpinner();
      return result;
    })
    .catch(function(error) {
      result.status = "error";
      result.data = error;
      hideSpinner();
      return result;
    });
}


// === Contador del carrito ===
function updateCartCount() {
  const carrito = JSON.parse(localStorage.getItem("cartItems")) || [];
  const total = carrito.reduce((acc, item) => acc + item.quantity, 0);

  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = total;
}
