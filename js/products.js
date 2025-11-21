// === Estado global ===
let productosOriginal = []; // Fuente "cruda" que llega del fetch; nunca se modifica
let estado = {
  min: null,        // Precio mínimo vigente del filtro
  max: null,        // Precio máximo vigente del filtro
  orden: null,      // 'PRECIO_ASC' | 'PRECIO_DESC' | 'RELEV_DESC' | null
  busqueda: ""      // Texto actual del buscador
};

// ---------- Utilidades básicas ----------
const $ = (sel) => document.querySelector(sel);
const isMobilePanel = () => window.matchMedia("(max-width: 575.98px)").matches;

function normalizarNumero(val) {
  if (val === "" || val === null || typeof val === "undefined") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

// Debounce para búsqueda en tiempo real
function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// ---------- Transformaciones: filtro y orden ----------
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

function aplicarFiltroBusqueda(lista, termino) {
  const q = (termino || "").toString().trim().toLowerCase();
  if (!q) return lista.slice();
  return lista.filter(p => {
    const n = (p.name || "").toLowerCase();
    const d = (p.description || "").toLowerCase();
    return n.includes(q) || d.includes(q);
  });
}

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
      break;
  }
  return arr;
}

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

    // Guardar productID y navegar al detalle
    card.addEventListener("click", () => {
      if (prod && typeof prod.id !== "undefined") {
        localStorage.setItem("productID", prod.id);
      }
      window.location = "product-info.html";
    });

    contenedor.appendChild(card);
  });
}

function aplicarYRender() {
  let lista = productosOriginal;
  lista = aplicarFiltroPrecio(lista, estado);
  lista = aplicarFiltroBusqueda(lista, estado.busqueda);
  const result = aplicarOrden(lista, estado.orden);
  renderProductos(result);
}

// ---------- Panel lateral ----------
function abrirPanel() {
  $("#panelFiltros").classList.add("abierto");
  $("#btnAbrirFiltros").style.display = "none";

  if (isMobilePanel()) {
    $("#overlayFiltros").hidden = false;
  } else {
    $("#main").classList.add("con-panel");
  }
}

function cerrarPanel() {
  $("#panelFiltros").classList.remove("abierto");
  $("#overlayFiltros").hidden = true;
  $("#main").classList.remove("con-panel");
  $("#btnAbrirFiltros").style.display = "inline-block";
}

function cerrarPanelSiMovil() {
  if (isMobilePanel()) cerrarPanel();
}

// ---------- Carga de productos usando JSON local ----------
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

    const url = `${PRODUCTS_URL}${catID}${EXT_TYPE}`;
    const res = await getJSONData(url);
    if (res.status !== "ok") throw new Error(res.data || "Error al obtener la categoría");

    const data = res.data;

    $("#categoria").textContent = `CATÁLOGO DE PRODUCTOS - ${data.catName}`;
    productosOriginal = Array.isArray(data.products) ? data.products : [];
    aplicarYRender();

    inicializarUI();
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    $("#categoria").textContent = "Error al cargar los productos.";
  }
}

// ---------- Enlaces de UI ----------
function inicializarUI() {
  const inpMin = $("#precioMin");
  const inpMax = $("#precioMax");

  // Abrir/cerrar panel + overlay
  $("#btnAbrirFiltros")?.addEventListener("click", abrirPanel);
  $("#btnCerrarFiltros")?.addEventListener("click", cerrarPanel);
  $("#overlayFiltros")?.addEventListener("click", cerrarPanel);

  // Aplicar filtro por precio
  $("#btnFiltrar")?.addEventListener("click", () => {
    const min = normalizarNumero(inpMin?.value);
    const max = normalizarNumero(inpMax?.value);

    if (min != null && max != null && min > max) {
      estado.min = max;
      estado.max = min;
      if (inpMin) inpMin.value = estado.min;
      if (inpMax) inpMax.value = estado.max;
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

  // Ordenar
  $("#ordPrecioAsc")?.addEventListener("click", () => {
    estado.orden = "PRECIO_ASC";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  $("#ordPrecioDesc")?.addEventListener("click", () => {
    estado.orden = "PRECIO_DESC";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  $("#ordRelevDesc")?.addEventListener("click", () => {
    estado.orden = "RELEV_DESC";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  // Buscador (navbar)
  const searchInput = $("#searchInput");
  const searchBtn = $("#searchBtn");

  // Búsqueda en tiempo real (con debounce)
  searchInput?.addEventListener(
    "input",
    debounce(() => {
      estado.busqueda = (searchInput.value || "").trim();
      aplicarYRender();
    }, 200)
  );

  // Botón Buscar
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

  // Mantener layout del panel según viewport
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
