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

    // ====== PRODUCTO (JSON local vía getJSONData) ======
    const urlProduct = `${PRODUCT_INFO_URL}${productID}${EXT_TYPE}`;
    const resProd = await getJSONData(urlProduct);
    if (resProd.status !== "ok") {
      throw new Error("No se pudo obtener el producto con ID " + productID);
    }
    const product = resProd.data;

    // ====== COMENTARIOS (JSON local) ======
    let apiComments = [];
    try {
      const urlComments = `${PRODUCT_INFO_COMMENTS_URL}${productID}${EXT_TYPE}`;
      const resComments = await getJSONData(urlComments);
      if (resComments.status === "ok" && Array.isArray(resComments.data)) {
        apiComments = resComments.data;
      }
    } catch (err) {
      console.warn("No se pudieron cargar comentarios del producto:", err);
    }

    // Generar el carrusel de imágenes del producto
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
    `;

    // ===== Comentarios: API + usuario (solo en memoria, sin localStorage) =====

    // Normalizar comentarios de API al mismo formato
    const baseComments = apiComments.map(c => ({
      user: c.user,
      dateTime: c.dateTime,
      score: Number(c.score) || 0,
      description: c.description
    }));

    // Comentarios del usuario en memoria (no persistentes)
    let userComments = [];

    // Mezclar en un solo arreglo
    let comentariosAll = [...baseComments, ...userComments];
    let idx = 0;

    // --- VISTA CARRUSEL (comentarios) ---
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

    // Primera render del carrusel de comentarios
    renderComentarioCarrusel();

    // --- VISTA LISTA (comentarios) ---
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

    // Exponer función para el botón "Enviar" (sin persistir)
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

      // Guardar solo en memoria durante la sesión actual
      userComments.push(nuevo);

      // Actualizar arreglo total y mostrar el último
      comentariosAll.push(nuevo);
      idx = comentariosAll.length - 1;

      // Re-render de ambas vistas
      renderComentarioCarrusel();
      renderLista();

      // (Opcional) limpiar inputs
      document.getElementById("comentario").value = "";
      const checked = document.querySelector('input[name="rating"]:checked');
      if (checked) checked.checked = false;
    };

    // ====== Productos relacionados (Grid desktop + Carrusel mobile) ======
    let relatedItems = Array.isArray(product.relatedProducts)
      ? [...product.relatedProducts]
      : [];

    // ===== BOTÓN DOBLE (COMPRAR + AGREGAR) =====
    const dualButtonsHTML = `
      <div class="dual-button-container my-4">

        <button id="button_buy" type="button" class="dual-btn left-btn">
          Comprar ahora
        </button>

        <button id="button_add_cart" type="button" class="dual-btn right-btn" title="Añadir al carrito">
          <span class="add-cart-icon">🛒</span> +
        </button>

      </div>
    `;

    container.insertAdjacentHTML("beforeend", dualButtonsHTML);

    // ===== LÓGICA DEL BOTÓN COMPRAR =====
    document.getElementById("button_buy")?.addEventListener("click", () => {
      const id = product.id;
      const carrito = JSON.parse(localStorage.getItem("cartItems")) || [];

      let existe = carrito.find(item => item.id === id);
      if (existe) {
        existe.quantity += 1;
      } else {
        carrito.push({ id: id, quantity: 1 });
      }

      localStorage.setItem("cartItems", JSON.stringify(carrito));
      updateCartCount();
      window.location.href = "cart.html";
    });

    // ===== LÓGICA DEL BOTÓN AGREGAR AL CARRITO =====
    const addToCart = document.getElementById("button_add_cart");

    if (addToCart) {
      addToCart.addEventListener("click", () => {
        const id = product.id;
        const carrito = JSON.parse(localStorage.getItem("cartItems")) || [];

        let existe = carrito.find(item => item.id === id);
        if (existe) {
          existe.quantity += 1;
        } else {
          carrito.push({ id: id, quantity: 1 });
        }

        localStorage.setItem("cartItems", JSON.stringify(carrito));
        updateCartCount();
        window.dispatchEvent(new Event("carrito:actualizado"));

        // Animación feedback
        addToCart.innerHTML = `<span class="cart-icon">✔️</span> Listo!`;
        addToCart.disabled = true;

        setTimeout(() => {
          addToCart.innerHTML = `<span class="cart-icon">🛒</span> +`;
          addToCart.disabled = false;
        }, 1200);
      });
    }

    const relatedHTML = `
      <div class="related-products mt-5">
        <h3>Productos relacionados</h3>

        <!-- Grid centrado (desktop/tablet) -->
        <div id="relatedGrid"></div>

        <!-- Carrusel (≤600px) -->
        <div id="relatedCarrusel" class="comentarios-carrusel mt-2" aria-live="polite">
          <div class="carrusel-overlay left" id="prevRelated" role="button" tabindex="0" aria-label="Producto anterior">
            <span class="arrow">‹</span>
          </div>

          <div class="carrusel-viewport">
            <div class="card cursor-active shadow-sm h-100" id="relatedActual"><!-- render por JS --></div>
          </div>

          <div class="carrusel-overlay right" id="nextRelated" role="button" tabindex="0" aria-label="Producto siguiente">
            <span class="arrow">›</span>
          </div>
        </div>

        <div id="relatedIndicadores" class="indicadores mt-2" aria-hidden="true"></div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", relatedHTML);

    const relatedGrid = document.getElementById("relatedGrid");
    const relatedCardEl = document.getElementById("relatedActual");
    const relatedPrevEl = document.getElementById("prevRelated");
    const relatedNextEl = document.getElementById("nextRelated");
    const relatedIndicadoresEl = document.getElementById("relatedIndicadores");

    function cardHTML(item, showPrice = false) {
      const price = showPrice && item.cost && item.currency
        ? `<p class="card-text text-success mb-0">$${item.cost} ${item.currency}</p>` : "";
      return `
        <img src="${item.image}" class="card-img-top" alt="${item.name}">
        <div class="card-body">
          <h5 class="card-title">${item.name}</h5>
          ${price}
        </div>
      `;
    }

    function goToProduct(id) {
      localStorage.setItem("productID", id);
      window.location = "product-info.html";
    }

    // Grid centrado (desktop/tablet)
    function renderRelatedGrid() {
      if (!relatedGrid) return;
      relatedGrid.innerHTML = "";
      relatedItems.forEach(item => {
        const card = document.createElement("div");
        card.className = "card cursor-active shadow-sm";
        card.style.width = "220px";
        card.innerHTML = cardHTML(item, true);
        card.addEventListener("click", () => goToProduct(item.id));
        relatedGrid.appendChild(card);
      });
    }

    // Carrusel mobile
    let idxRel = 0;

    function renderRelatedCarrusel() {
      if (!relatedItems.length) {
        relatedCardEl.innerHTML = `<div class="p-3 text-muted">No hay productos relacionados.</div>`;
        relatedIndicadoresEl.innerHTML = "";
        return;
      }
      const it = relatedItems[idxRel];
      relatedCardEl.innerHTML = cardHTML(it, !!(it.cost && it.currency));
      relatedCardEl.onclick = () => goToProduct(it.id);

      relatedIndicadoresEl.innerHTML = relatedItems
        .map((_, i) => `<span class="${i === idxRel ? 'dot active' : 'dot'}" aria-hidden="true"></span>`)
        .join("");
    }

    function siguienteRel() {
      if (!relatedItems.length) return;
      idxRel = (idxRel + 1) % relatedItems.length;
      renderRelatedCarrusel();
    }
    function anteriorRel() {
      if (!relatedItems.length) return;
      idxRel = (idxRel - 1 + relatedItems.length) % relatedItems.length;
      renderRelatedCarrusel();
    }

    if (relatedPrevEl && relatedNextEl) {
      relatedPrevEl.addEventListener("click", anteriorRel);
      relatedNextEl.addEventListener("click", siguienteRel);

      const navKeyHandlerRel = (fn) => (e) => {
        if (e.key === "Enter" || e.key === " " || e.code === "Space") {
          e.preventDefault(); fn();
        }
      };
      relatedPrevEl.addEventListener("keydown", navKeyHandlerRel(anteriorRel));
      relatedNextEl.addEventListener("keydown", navKeyHandlerRel(siguienteRel));
    }

    // Primer render
    renderRelatedGrid();
    renderRelatedCarrusel();

    // ====== Más productos de la misma categoría (JSON local) ======
    try {
      const urlCategoria = `${PRODUCTS_URL}${product.catID}${EXT_TYPE}`;
      const resCat = await getJSONData(urlCategoria);
      if (resCat.status === "ok" && resCat.data && Array.isArray(resCat.data.products)) {
        const dataCat = resCat.data;

        // Filtrar: excluir el actual y los que ya están en relatedItems
        const yaRelacionados = new Set(relatedItems.map(r => r.id));
        const extras = dataCat.products
          .filter(p => p.id != product.id && !yaRelacionados.has(p.id))
          .slice(0, 3); // mostrar solo 3 extra

        if (extras.length > 0) {
          // Agregar a la fuente única
          relatedItems = [...relatedItems, ...extras];

          // Re-render de grid y carrusel para reflejar los extras
          renderRelatedGrid();
          renderRelatedCarrusel();
        }
      }
    } catch (err) {
      console.warn("No se pudieron cargar productos extra de la categoría:", err);
    }

  } catch (error) {
    console.error("Error al cargar el producto:", error);
    document.querySelector("main .container").innerHTML = `
      <div class="alert alert-danger text-center">
        Ocurrió un error al cargar la información del producto.
      </div>`;
  }
});