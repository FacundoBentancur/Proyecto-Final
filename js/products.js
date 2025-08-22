/* const LISTA_AUTOS = "https://japceibal.github.io/emercado-api/cats_products/101.json"; 

/ let showSpinner = function(){
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
      } else {
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

// función que recibe un array con los productos y los muestra en pantalla
function showProductsList(array){
    let htmlContentToAppend = "";

    for(let i = 0; i < array.length; i++){ 
        let product = array[i];
        htmlContentToAppend += `
        <div class="list-group-item list-group-item-action">
            <div class="row">
                <div class="col-3">
                    <img src="${product.imgSrc}" alt="product image" class="img-thumbnail">
                </div>
                <div class="col">
                    <div class="d-flex w-100 justify-content-between">
                        <div class="mb-1">
                          <h4>${product.name} - ${product.currency} ${product.cost}</h4> 
                          <p>${product.description}</p> 
                        </div>
                        <small class="text-muted">Vendidos: ${product.soldCount}</small> 
                    </div>
                </div>
            </div>
        </div>
        `;
    }
    document.getElementById("cat-list-container").innerHTML = htmlContentToAppend; 
}

document.addEventListener("DOMContentLoaded", function(){
    getJSONData(LISTA_AUTOS).then(function(resultObj){
        if (resultObj.status === "ok") {
            let productsArray = resultObj.data.products; // 👈 importante
            showProductsList(productsArray);
        }
    });
}); 
*/
async function cargarProductos() {
  try {
    // 👉 pedir datos de la API
    const response = await fetch("https://japceibal.github.io/emercado-api/cats_products/101.json");
    const data = await response.json();

    // ver en consola si cargó bien
    console.log("Datos cargados:", data);

    // mostrar categoría en pantalla
    document.getElementById("categoria").textContent = `Categoría: ${data.catName}`;

    // renderizar productos
    const contenedor = document.getElementById("productos");
    data.products.forEach(prod => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${prod.image}" alt="${prod.name}">
        <h2>${prod.name}</h2>
        <p>${prod.description}</p>
        <p class="precio">${prod.cost} ${prod.currency}</p>
        <p class="vendidos">${prod.soldCount} vendidos</p>
      `;
      contenedor.appendChild(card);
    });

  } catch (error) {
    console.error("Error al pedir el JSON:", error);
  }
}

cargarProductos();
