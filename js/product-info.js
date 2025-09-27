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
    const apiComments = await responseComments.json();

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
      </div>
    `;

    // ----- Comentarios: API + usuario (localStorage) -----
    const STORAGE_KEY = `userComments:${productID}`;

    // Normalizar comentarios de API al mismo formato
    const baseComments = apiComments.map(c => ({
      user: c.user,
      dateTime: c.dateTime,
      score: Number(c.score) || 0,
      description: c.description
    }));

    // Cargar comentarios del usuario guardados
    let userComments = [];
    try {
      const guardados = localStorage.getItem(STORAGE_KEY);
      userComments = guardados ? JSON.parse(guardados) : [];
    } catch {
      userComments = [];
    }

    // Mezclar en un solo arreglo
    let comentariosAll = [...baseComments, ...userComments];
    let idx = 0;

    // --- VISTA CARRUSEL ---
    const comentarioCardEl = document.getElementById("comentarioActual");
    const indicadoresEl = document.getElementById("indicadoresCarrusel");
    const prevEl = document.getElementById("prevComentario");
    const nextEl = document.getElementById("nextComentario");

    function estrellasHTML(n) {
      const lleno = "★".repeat(n);
      const vacio = "☆".repeat(5 - n);
      return `<div class="estrellas" aria-label="Calificación ${n} de 5">${lleno}${vacio}</div>`;
    }

    function renderComentarioCarrusel() {
      if (!comentariosAll.length) {
        comentarioCardEl.innerHTML = `<p class="text-muted mb-0">Aún no hay comentarios.</p>`;
        indicadoresEl.innerHTML = "";
        return;
      }
      const c = comentariosAll[idx];
      comentarioCardEl.innerHTML = `
        <p><b>${c.user}</b> <span class="text-muted" style="font-size:0.85em">(${c.dateTime})</span></p>
        ${estrellasHTML(c.score)}
        <p>${c.description}</p>
      `;
      indicadoresEl.innerHTML = comentariosAll
        .map((_, i) => `<span class="${i === idx ? 'dot active' : 'dot'}" aria-hidden="true"></span>`)
        .join("");
    }

    function siguiente() {
      if (!comentariosAll.length) return;
      idx = (idx + 1) % comentariosAll.length;
      renderComentarioCarrusel();
    }
    function anterior() {
      if (!comentariosAll.length) return;
      idx = (idx - 1 + comentariosAll.length) % comentariosAll.length;
      renderComentarioCarrusel();
    }

    if (prevEl && nextEl) {
      prevEl.addEventListener("click", anterior);
      nextEl.addEventListener("click", siguiente);

      // Accesible por teclado
      const navKeyHandler = (fn) => (e) => {
        if (e.key === "Enter" || e.key === " " || e.code === "Space") {
          e.preventDefault(); fn();
        }
      };
      prevEl.addEventListener("keydown", navKeyHandler(anterior));
      nextEl.addEventListener("keydown", navKeyHandler(siguiente));
    }

    // Primera render del carrusel
    renderComentarioCarrusel();

    // --- VISTA LISTA ---
    const listaEl = document.getElementById("comentariosLista");
    function renderLista() {
      if (!listaEl) return;
      if (!comentariosAll.length) {
        listaEl.innerHTML = `<div class="comentario-card"><p class="text-muted mb-0">Aún no hay comentarios.</p></div>`;
        return;
      }
      listaEl.innerHTML = comentariosAll.map(c => `
        <div class="comentario-card">
          <p><b>${c.user}</b> <span class="text-muted" style="font-size:0.85em">(${c.dateTime})</span></p>
          ${estrellasHTML(c.score)}
          <p>${c.description}</p>
        </div>
      `).join("");
    }
    renderLista();

    // --- Toggle de vistas por resolución (fallback JS basado SOLO en ancho) ---
    const carruselEl = document.getElementById("comentariosCarrusel");
    function applyCommentView() {
      const useCarrusel = window.innerWidth <= 600; // solo ancho
      carruselEl.style.display = useCarrusel ? "flex" : "none";
      listaEl.style.display = useCarrusel ? "none" : "block";
      // Indicadores solo cuando hay carrusel y hay comentarios:
      indicadoresEl.style.display = (useCarrusel && comentariosAll.length > 0) ? "block" : "none";
    }

    applyCommentView();
    window.addEventListener("resize", applyCommentView);
    window.addEventListener("orientationchange", applyCommentView);

    // Exponer función para el botón "Enviar"
    window.enviarComentario = function () {
      const rating = document.querySelector('input[name="rating"]:checked');
      const comentario = document.getElementById("comentario").value.trim();

      if (!rating) { alert("Por favor selecciona una calificación."); return; }
      if (!comentario) { alert("Por favor escribe un comentario."); return; }

      const usuario = localStorage.getItem("usuario") || "Usuario";
      const now = new Date();
      const fechaHora =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0") + " " +
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0") + ":" +
        String(now.getSeconds()).padStart(2, "0");

      const nuevo = {
        user: usuario,
        dateTime: fechaHora,
        score: Number(rating.value),
        description: comentario
      };

      // Persistir en localStorage de este producto
      userComments.push(nuevo);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userComments));

      // Actualizar arreglo total y mostrar el último
      comentariosAll.push(nuevo);
      idx = comentariosAll.length - 1;

      // Re-render de ambas vistas
      renderComentarioCarrusel();
      renderLista();
    };

  } catch (error) {
    console.error("Error al cargar el producto:", error);
    document.querySelector("main .container").innerHTML = `
      <div class="alert alert-danger text-center">
        Ocurrió un error al cargar la información del producto.
      </div>`;
  }
});
