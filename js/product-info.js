document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Recuperar el ID del producto que se guardó en products.js al hacer click
    const productID = localStorage.getItem("productID");

    // Si no existe productID, se muestra un mensaje de error en pantalla
    if (!productID) {
      document.querySelector("main .container").innerHTML = `
        <div class="alert alert-danger text-center">
          No se seleccionó ningún producto.
        </div>`;
      return;
    }

    // Construir la URL a la API según el productID
    const url = `https://japceibal.github.io/emercado-api/products/${productID}.json`;
    const response = await fetch(url);

    // Validar que la respuesta sea correcta
    if (!response.ok) {
      throw new Error("No se pudo obtener el producto con ID " + productID);
    }

    // Convertir la respuesta en objeto JSON con los datos del producto
    const product = await response.json();

    // Crear el HTML de las imágenes del producto para el carrusel
    const carouselItems = product.images
      .map(
        (img, index) => `
        <div class="carousel-item ${index === 0 ? "active" : ""}">
          <img src="${img}" class="d-block w-100" alt="${product.name}">
        </div>
      `
      )
      .join("");

    // Renderizar toda la información del producto dentro del contenedor principal
    const container = document.querySelector("main .container");
    container.innerHTML = `
      <div class="product-info">
        <h2 class="product-title">${product.name}</h2>
        <p class="product-category text-muted">${product.category}</p>

        <!-- Carrusel de imágenes -->
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

        <!-- Datos del producto -->
        <div class="product-details">
          <h4 class="text-success">$${product.cost} ${product.currency}</h4>
          <p>${product.description}</p>
          <p><strong>Vendidos:</strong> ${product.soldCount}</p>
        </div>
      </div>
    `;
  } catch (error) {
    // Si ocurre cualquier error en la carga, se muestra alerta en pantalla
    console.error("Error al cargar el producto:", error);
    document.querySelector("main .container").innerHTML = `
      <div class="alert alert-danger text-center">
        Ocurrió un error al cargar la información del producto.
      </div>`;
  }
});