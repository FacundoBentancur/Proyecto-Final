let productosOriginal = []; // Fuente "cruda" que llega del fetch; nunca se modifica
let estado = {
  min: null,        // Precio mínimo vigente del filtro
  max: null,        // Precio máximo vigente del filtro
  orden: null,      // 'PRECIO_ASC' | 'PRECIO_DESC' | 'RELEV_DESC' | null
  busqueda: ""      // Texto actual del buscador
};

// ---------- Utilidades básicas ----------
const $ = (sel) => document.querySelector(sel); // Atajo para querySelector
const isMobilePanel = () => window.matchMedia("(max-width: 575.98px)").matches; // ¿El panel debe comportarse "modal"?

/**
 * Convierte un valor de input a número válido o null.
 * - Si está vacío/indefinido, retorna null (sin filtrar).
 * - Si no es un número válido, también retorna null.
 */
function normalizarNumero(val) {
  if (val === "" || val === null || typeof val === "undefined") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

/**
 * Crea una versión "debounced" de una función.
 * - Agrupa sucesivas invocaciones y sólo ejecuta la última luego de "wait" ms.
 * - Ideal para "input" de búsqueda en tiempo real.
 */
function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// ---------- Transformaciones: filtro y orden ----------

/**
 * Filtra por rango de precio [min, max].
 * - Si ambos son null, devuelve la lista tal cual.
 */
function aplicarFiltroPrecio(lista, { min, max }) {
  if (min == null && max == null) return lista.slice();
  return lista.filter((p) => {
    const c = Number(p.cost);
    if (!Number.isFinite(c)) return false;
    if (min != null && c < min) return false;
    if (max != null && c > max) return false;
    return true;
  });
}

/**
 * Filtra por texto de búsqueda en "name" o "description".
 * - No distingue mayúsculas/minúsculas.
 * - Cadena vacía => sin filtro.
 */
function aplicarFiltroBusqueda(lista, termino) {
  const q = (termino || "").toString().trim().toLowerCase();
  if (!q) return lista.slice();
  return lista.filter(p => {
    const n = (p.name || "").toLowerCase();
    const d = (p.description || "").toLowerCase();
    return n.includes(q) || d.includes(q);
  });
}

/**
 * Ordena la lista según el criterio actual.
 * - PRECIO_ASC / PRECIO_DESC / RELEV_DESC (soldCount)
 * - Si no hay criterio, devuelve una copia sin ordenar.
 */
function aplicarOrden(lista, orden) {
  const arr = lista.slice();
  switch (orden) {
    case "PRECIO_ASC":
      arr.sort((a, b) => a.cost - b.cost);
      break;
    case "PRECIO_DESC":
      arr.sort((a, b) => b.cost - a.cost);
      break;
    case "RELEV_DESC":
      arr.sort((a, b) => b.soldCount - a.soldCount);
      break;
    default:
      // Sin orden explícito
      break;
  }
  return arr;
}

/**
 * Dibuja las tarjetas de productos en el contenedor principal.
 * - Si no hay resultados, muestra un texto de estado.
 * - Cada card guarda el productID y navega a product-info.html al click.
 */
function renderProductos(lista) {
  const contenedor = $("#productos");
  contenedor.innerHTML = "";

  if (!lista.length) {
    const vacio = document.createElement("p");
    vacio.className = "text-center text-muted m-0";
    vacio.textContent = "No hay productos que coincidan con el filtro.";
    contenedor.appendChild(vacio);
    return;
  }

  lista.forEach((prod) => {
    const card = document.createElement("div");
    card.classList.add("card", "cursor-active");
    card.innerHTML = `
      <div class="card-img">
        <img src="${prod.image}" alt="${prod.name}">
      </div>
      <div class="card-body">
        <h2>${prod.name}</h2>
        <p class="precio">$${prod.cost} ${prod.currency || ""}</p>
        <p>${prod.description}</p>
        <p class="vendidos">Vendidos: ${prod.soldCount}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      if (prod && typeof prod.id !== "undefined") {
        localStorage.setItem("productID", prod.id);
      }
      window.location = "product-info.html";
    });

    contenedor.appendChild(card);
  });
}

/**
 * Aplica todos los filtros/orden vigentes y vuelve a renderizar.
 * - Punto único de verdad para actualizar la UI tras cambios en "estado".
 */
function aplicarYRender() {
  let lista = productosOriginal;
  lista = aplicarFiltroPrecio(lista, estado);
  lista = aplicarFiltroBusqueda(lista, estado.busqueda);
  const result = aplicarOrden(lista, estado.orden);
  renderProductos(result);
}

// ---------- Panel lateral de filtros (apertura/cierre y responsive) ----------

/**
 * Abre el panel de filtros.
 * - En móvil muestra overlay.
 * - En escritorio empuja el contenido principal.
 * - Oculta el botón de abrir para evitar duplicados.
 */
function abrirPanel() {
  $("#panelFiltros").classList.add("abierto");
  $("#btnAbrirFiltros").style.display = "none";

  if (isMobilePanel()) {
    $("#overlayFiltros").hidden = false;
  } else {
    $("#main").classList.add("con-panel");
  }
}

/**
 * Cierra el panel de filtros y restaura el layout.
 */
function cerrarPanel() {
  $("#panelFiltros").classList.remove("abierto");
  $("#overlayFiltros").hidden = true;
  $("#main").classList.remove("con-panel");
  $("#btnAbrirFiltros").style.display = "inline-block";
}

/**
 * Cierra el panel sólo si estamos en modo móvil.
 * - Se usa después de aplicar una acción (filtrar/ordenar) para mejorar UX.
 */
function cerrarPanelSiMovil() {
  if (isMobilePanel()) cerrarPanel();
}

// ---------- Carga remota de productos ----------

/**
 * Descarga la categoría actual y guarda sus productos.
 * - Prioriza ?cat= de la URL; si no existe, usa localStorage.catID.
 * - Si no hay catID, muestra mensaje de error en la UI.
 * - Tras cargar, inicializa UI y renderiza según el estado.
 */
async function cargarProductos() {
  try {
    const params = new URLSearchParams(location.search);
    const catFromQuery = params.get("cat");
    const catFromStorage = localStorage.getItem("catID");
    const catID = catFromQuery || catFromStorage;

    if (!catID) {
      console.error("Error: no se proporcionó un catID en la URL ni en localStorage.");
      $("#categoria").textContent = "Error: no se seleccionó ninguna categoría.";
      return;
    }

    const url = `https://japceibal.github.io/emercado-api/cats_products/${catID}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("No se pudo obtener la categoría con el ID " + catID);

    const data = await response.json();

    $("#categoria").textContent = `CATÁLOGO DE PRODUCTOS - ${data.catName}`;
    productosOriginal = Array.isArray(data.products) ? data.products : [];
    aplicarYRender();

    inicializarUI();
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    $("#categoria").textContent = "Error al cargar los productos.";
  }
}

// ---------- Enlaces de UI y manejo de eventos ----------

/**
 * Conecta todos los elementos de la interfaz con la lógica:
 * - Botones de abrir/cerrar panel y overlay
 * - Filtro por precio (aplica e invierte min/max si están cruzados)
 * - Botón "Limpiar" (restaura estado inicial)
 * - Botones de orden (marca activa y re-renderiza)
 * - Buscador en navbar (input con debounce, botón, Enter/Escape)
 * - Ajustes del panel al cambiar el tamaño de la ventana
 */
function inicializarUI() {
  const inpMin = $("#precioMin");
  const inpMax = $("#precioMax");

  // Abrir/cerrar panel + overlay
  $("#btnAbrirFiltros")?.addEventListener("click", abrirPanel);
  $("#btnCerrarFiltros")?.addEventListener("click", cerrarPanel);
  $("#overlayFiltros")?.addEventListener("click", cerrarPanel);

  // Aplicar filtro por precio
  $("#btnFiltrar")?.addEventListener("click", () => {
    const min = normalizarNumero(inpMin.value);
    const max = normalizarNumero(inpMax.value);

    // Si el usuario ingresó min > max, se corrige automáticamente
    if (min != null && max != null && min > max) {
      estado.min = max;
      estado.max = min;
      inpMin.value = estado.min;
      inpMax.value = estado.max;
    } else {
      estado.min = min;
      estado.max = max;
    }

    aplicarYRender();
    cerrarPanelSiMovil();
  });

  // Limpiar filtros, orden y búsqueda
  $("#btnLimpiar")?.addEventListener("click", () => {
    estado.min = null;
    estado.max = null;
    estado.orden = null;
    estado.busqueda = "";
    if (inpMin) inpMin.value = "";
    if (inpMax) inpMax.value = "";
    const searchInput = $("#searchInput");
    if (searchInput) searchInput.value = "";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  // Ordenar por precio ascendente
  $("#ordPrecioAsc")?.addEventListener("click", () => {
    estado.orden = "PRECIO_ASC";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  // Ordenar por precio descendente
  $("#ordPrecioDesc")?.addEventListener("click", () => {
    estado.orden = "PRECIO_DESC";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  // Ordenar por relevancia (vendidos desc)
  $("#ordRelevDesc")?.addEventListener("click", () => {
    estado.orden = "RELEV_DESC";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  // ---- Buscador en la navbar ----
  const searchInput = $("#searchInput");
  const searchBtn = $("#searchBtn");

  // Búsqueda en tiempo real (debounced)
  searchInput?.addEventListener(
    "input",
    debounce(() => {
      estado.busqueda = (searchInput.value || "").trim();
      aplicarYRender();
    }, 200)
  );

  // Click en botón "Buscar"
  searchBtn?.addEventListener("click", () => {
    estado.busqueda = (searchInput?.value || "").trim();
    aplicarYRender();
  });

  // Enter busca / Escape limpia
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      estado.busqueda = (searchInput.value || "").trim();
      aplicarYRender();
    } else if (e.key === "Escape") {
      searchInput.value = "";
      estado.busqueda = "";
      aplicarYRender();
    }
  });

  // Mantiene el comportamiento correcto del panel si el viewport cambia
  window.addEventListener("resize", () => {
    if ($("#panelFiltros").classList.contains("abierto")) {
      if (isMobilePanel()) {
        $("#main").classList.remove("con-panel");
        $("#overlayFiltros").hidden = false;
      } else {
        $("#overlayFiltros").hidden = true;
        $("#main").classList.add("con-panel");
      }
    }
  });
}

/**
 * Actualiza la marca visual del botón de orden activo.
 * - Quita "active" de todos y lo agrega al seleccionado.
 */
function actualizarBotonesOrden() {
  const map = {
    PRECIO_ASC: "#ordPrecioAsc",
    PRECIO_DESC: "#ordPrecioDesc",
    RELEV_DESC: "#ordRelevDesc",
  };
  ["#ordPrecioAsc", "#ordPrecioDesc", "#ordRelevDesc"].forEach((sel) =>
    $(sel)?.classList.remove("active")
  );
  if (estado.orden && map[estado.orden]) $(map[estado.orden])?.classList.add("active");
}

// ---------- Punto de entrada ----------
cargarProductos();
