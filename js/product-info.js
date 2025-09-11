// product-info.js
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Obtener el ID del producto guardado en localStorage (lo setea products.js al click)
    const productID = localStorage.getItem("productID");
    if (!productID) {
      document.querySelector("main .container").innerHTML = `
        <div class="alert alert-danger text-center">
          No se seleccionó ningún producto.
        </div>`;
      return;
    }

    // URL de la API
    const url = `https://japceibal.github.io/emercado-api/products/${productID}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("No se pudo obtener el producto con ID " + productID);
    }

    const product = await response.json();

    // Generar el carrusel de imágenes
    const carouselItems = (product.images || [])
      .map(
        (img, index) => `
        <div class="carousel-item ${index === 0 ? "active" : ""}">
          <img src="${img}" class="d-block w-100" alt="${product.name}">
        </div>
      `
      )
      .join("");

    // Renderizar la info en el contenedor principal
    const container = document.querySelector("main .container");
    container.innerHTML = `
      <div class="product-info">
        <h2 class="product-title">${product.name}</h2>
        <p class="product-category text-muted">${product.category || ""}</p>

        <div id="productCarousel" class="carousel slide mb-4" data-bs-ride="carousel">
          <div class="carousel-inner">
            ${carouselItems}
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
          </button>
        </div>

        <div class="product-details">
          <h4 class="text-success">$${product.cost} ${product.currency || ""}</h4>
          <p>${product.description || ""}</p>
          <p><strong>Vendidos:</strong> ${product.soldCount ?? 0}</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error al cargar el producto:", error);
    document.querySelector("main .container").innerHTML = `
      <div class="alert alert-danger text-center">
        Ocurrió un error al cargar la información del producto.
      </div>`;
  }
});
