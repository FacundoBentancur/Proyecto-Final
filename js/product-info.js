// product-info.js
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Obtener el ID del producto guardado en localStorage
    const productID = localStorage.getItem("productID");
    if (!productID) {
      document.querySelector("main .container").innerHTML = `
        <div class="alert alert-danger text-center">
          No se seleccionó ningún producto.
        </div>`;
      return;
    }

    // URL del producto
    const urlProduct = `https://japceibal.github.io/emercado-api/products/${productID}.json`;
    const response = await fetch(urlProduct);
    if (!response.ok) throw new Error("No se pudo obtener el producto con ID " + productID);
    const product = await response.json();

    // URL de los comentarios
    const urlComments = `https://japceibal.github.io/emercado-api/products_comments/${productID}.json`;
    const responseComments = await fetch(urlComments);
    const comments = await responseComments.json();

    // Generar el carrusel de imágenes
    const carouselItems = (product.images || [])
      .map((img, index) => `
        <div class="carousel-item ${index === 0 ? "active" : ""}">
          <img src="${img}" class="d-block w-100" alt="${product.name}">
        </div>
      `).join("");

    // Renderizar la info del producto
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

        <div class="product-details mb-4">
          <h4 class="text-success">$${product.cost} ${product.currency || ""}</h4>
          <p>${product.description || ""}</p>
          <p><strong>Vendidos:</strong> ${product.soldCount ?? 0}</p>
        </div>

        <h4>Comentarios</h4>
        <!-- Contenedor principal de comentarios -->
        <div id="comentarios">
        </div>
      </div>
    `;

    // Mostrar comentarios existentes de la API
    const comentariosContainer = document.getElementById("comentarios");
    comments.forEach(c => {
      let estrellas = "★".repeat(c.score) + "☆".repeat(5 - c.score);
      const card = `
        <div class="comentario-card">
          <p><b>${c.user}</b> <span class="text-muted" style="font-size:0.85em">(${c.dateTime})</span></p>
          <p class="estrellas">${estrellas}</p>
          <p>${c.description}</p>
        </div>
      `;
      comentariosContainer.innerHTML += card;
    });

  } catch (error) {
    console.error("Error al cargar el producto:", error);
    document.querySelector("main .container").innerHTML = `
      <div class="alert alert-danger text-center">
        Ocurrió un error al cargar la información del producto.
      </div>`;
  }
});

// Función para enviar un nuevo comentario
function enviarComentario() {
  const rating = document.querySelector('input[name="rating"]:checked');
  const comentario = document.getElementById("comentario").value.trim();

  if (!rating) {
    alert("Por favor selecciona una calificación.");
    return;
  }
  if (comentario === "") {
    alert("Por favor escribe un comentario.");
    return;
  }

  const usuario = localStorage.getItem("usuario");

  const now = new Date();
  const fechaHora = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0") + " " +
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0") + ":" +
    String(now.getSeconds()).padStart(2, "0");

  const estrellasHTML = "★".repeat(rating.value) + "☆".repeat(5 - rating.value);

  const card = `
    <div class="comentario-card">
      <p><b>${usuario}</b> <span class="text-muted" style="font-size:0.85em">(${fechaHora})</span></p>
      <p class="estrellas">${estrellasHTML}</p>
      <p>${comentario}</p>
    </div>
  `;

  document.getElementById("comentarios").innerHTML += card;

  // Reset formulario
  document.getElementById("comentario").value = "";
  document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
}
