// === Estado global ===
let productosOriginal = []; // productos tal cual vienen del fetch
let estado = {
  min: null,
  max: null,
  orden: null, // 'PRECIO_ASC' | 'PRECIO_DESC' | 'RELEV_DESC' | null
};

// Helpers
const $ = (sel) => document.querySelector(sel);
const isMobilePanel = () => window.matchMedia("(max-width: 575.98px)").matches;

function normalizarNumero(val) {
  if (val === "" || val === null || typeof val === "undefined") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

// === Filtro y Orden ===
function aplicarFiltro(lista, { min, max }) {
  if (min == null && max == null) return lista.slice();
  return lista.filter((p) => {
    const c = Number(p.cost);
    if (!Number.isFinite(c)) return false;
    if (min != null && c < min) return false;
    if (max != null && c > max) return false;
    return true;
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
      // sin orden
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
    card.classList.add("card");
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
    contenedor.appendChild(card);
  });
}

function aplicarYRender() {
  const filtrados = aplicarFiltro(productosOriginal, estado);
  const result = aplicarOrden(filtrados, estado.orden);
  renderProductos(result);
}

// === Panel Lateral (abrir/cerrar, overlay y empuje del contenido) ===
function abrirPanel() {
  $("#panelFiltros").classList.add("abierto");
  $("#btnAbrirFiltros").style.display = "none"; // ocultar el botón

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

  $("#btnAbrirFiltros").style.display = "inline-block"; // volver a mostrarlo
}


function cerrarPanelSiMovil() {
  if (isMobilePanel()) cerrarPanel();
}

// === Carga de productos ===
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

// === UI y eventos ===
function inicializarUI() {
  const inpMin = $("#precioMin");
  const inpMax = $("#precioMax");

  // Botón abrir/cerrar + overlay
  $("#btnAbrirFiltros").addEventListener("click", abrirPanel);
  $("#btnCerrarFiltros").addEventListener("click", cerrarPanel);
  $("#overlayFiltros").addEventListener("click", cerrarPanel);

  // Aplicar filtro (y cerrar si es móvil)
  $("#btnFiltrar").addEventListener("click", () => {
    const min = normalizarNumero(inpMin.value);
    const max = normalizarNumero(inpMax.value);

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

  // Limpiar todo
  $("#btnLimpiar").addEventListener("click", () => {
    estado.min = null;
    estado.max = null;
    estado.orden = null;
    inpMin.value = "";
    inpMax.value = "";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  // Orden
  $("#ordPrecioAsc").addEventListener("click", () => {
    estado.orden = "PRECIO_ASC";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  $("#ordPrecioDesc").addEventListener("click", () => {
    estado.orden = "PRECIO_DESC";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  $("#ordRelevDesc").addEventListener("click", () => {
    estado.orden = "RELEV_DESC";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  // Cerrar panel si cambia el breakpoint (por si el usuario rota el dispositivo)
  window.addEventListener("resize", () => {
    // Si el panel está abierto y pasamos a desktop, ocultamos overlay (se usa empuje).
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

// Marca visual en botones de orden
function actualizarBotonesOrden() {
  const map = {
    PRECIO_ASC: "#ordPrecioAsc",
    PRECIO_DESC: "#ordPrecioDesc",
    RELEV_DESC: "#ordRelevDesc",
  };
  ["#ordPrecioAsc", "#ordPrecioDesc", "#ordRelevDesc"].forEach((sel) =>
    $(sel).classList.remove("active")
  );
  if (estado.orden && map[estado.orden]) $(map[estado.orden]).classList.add("active");
}

// Init
cargarProductos();
