// === Estado global ===
let categoriasOriginal = [];
let estado = {
  min: null,
  max: null,
  orden: null, // "AZ" | "ZA" | "CANT"
};

// ---------- Utilidades ----------
const $ = (sel) => document.querySelector(sel);
const isMobilePanel = () => window.matchMedia("(max-width: 575.98px)").matches;

function normalizarNumero(val) {
  if (val === "" || val === null || typeof val === "undefined") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

// ---------- Transformaciones ----------
function aplicarFiltroCantidad(lista, { min, max }) {
  if (min == null && max == null) return lista.slice();
  return lista.filter((c) => {
    const n = Number(c.productCount);
    if (!Number.isFinite(n)) return false;
    if (min != null && n < min) return false;
    if (max != null && n > max) return false;
    return true;
  });
}

function aplicarOrden(lista, orden) {
  const arr = lista.slice();
  switch (orden) {
    case "AZ":
      arr.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "ZA":
      arr.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "CANT":
      arr.sort((a, b) => b.productCount - a.productCount);
      break;
    default:
      break;
  }
  return arr;
}

function renderCategorias(lista) {
  const cont = $("#cat-list-container");
  cont.innerHTML = "";

  if (!lista.length) {
    cont.innerHTML = `<p class="text-center text-muted">No hay categorías que coincidan.</p>`;
    return;
  }

  lista.forEach((cat) => {
    const card = document.createElement("div");
    card.classList.add("card", "cursor-active");
    card.innerHTML = `
      <div class="card-img">
        <img src="${cat.imgSrc}" alt="${cat.description}">
      </div>
      <div class="card-body">
        <h2>${cat.name}</h2>
        <p>${cat.description}</p>
        <p class="text-muted">Cantidad: ${cat.productCount}</p>
      </div>
    `;
    card.addEventListener("click", () => {
      localStorage.setItem("catID", cat.id);
      window.location = "products.html";
    });
    cont.appendChild(card);
  });
}

function aplicarYRender() {
  let lista = categoriasOriginal;
  lista = aplicarFiltroCantidad(lista, estado);
  const result = aplicarOrden(lista, estado.orden);
  renderCategorias(result);
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

// ---------- Inicialización ----------
async function cargarCategorias() {
  try {
    const url = "https://japceibal.github.io/emercado-api/cats/cat.json";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error cargando categorías");
    const data = await res.json();

    categoriasOriginal = Array.isArray(data) ? data : [];
    aplicarYRender();
    inicializarUI();
  } catch (e) {
    console.error(e);
    $("#cat-list-container").innerHTML = `<p class="text-danger">Error al cargar categorías.</p>`;
  }
}

function inicializarUI() {
  const inpMin = $("#minCant");
  const inpMax = $("#maxCant");

  $("#btnAbrirFiltros")?.addEventListener("click", abrirPanel);
  $("#btnCerrarFiltros")?.addEventListener("click", cerrarPanel);
  $("#overlayFiltros")?.addEventListener("click", cerrarPanel);

  // Aplicar filtros
  $("#btnFiltrar")?.addEventListener("click", () => {
    const min = normalizarNumero(inpMin?.value);
    const max = normalizarNumero(inpMax?.value);

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

  // Limpiar
  $("#btnLimpiar")?.addEventListener("click", () => {
    estado.min = null;
    estado.max = null;
    estado.orden = null;
    if (inpMin) inpMin.value = "";
    if (inpMax) inpMax.value = "";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  // Orden
  $("#ordAZ")?.addEventListener("click", () => {
    estado.orden = "AZ";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  $("#ordZA")?.addEventListener("click", () => {
    estado.orden = "ZA";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
  });

  $("#ordCant")?.addEventListener("click", () => {
    estado.orden = "CANT";
    actualizarBotonesOrden();
    aplicarYRender();
    cerrarPanelSiMovil();
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
  ["#ordAZ", "#ordZA", "#ordCant"].forEach((sel) =>
    $(sel)?.classList.remove("active")
  );
  if (estado.orden) $(map[estado.orden])?.classList.add("active");
}

cargarCategorias();
