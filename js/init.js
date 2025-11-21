const CATEGORIES_URL = "./data/cat.json";

const PUBLISH_PRODUCT_URL = "./data/publish.json";

const PRODUCTS_URL = "./data/cats_products/";  

const PRODUCT_INFO_URL = "./data/products/";

const PRODUCT_INFO_COMMENTS_URL = "./data/products_comments/";

const CART_INFO_URL = "./data/user_cart/";

const CART_BUY_URL = "./data/buy.json";

const EXT_TYPE = ".json";


let showSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "none";
}

let getJSONData = function(url){
    let result = {};
    showSpinner();
    return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }else{
        throw Error(response.statusText);
      }
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
}

function updateCartCount() {
  const carrito = JSON.parse(localStorage.getItem("cartItems")) || [];
  const total = carrito.reduce((acc, item) => acc + item.quantity, 0);

  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = total;
}
