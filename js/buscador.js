const API_BASE = "https://japceibal.github.io/emercado-api/cats_products/";
const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";

let todosLosProductos = [];
let searchInput, searchBtn, searchResults;

// ========== Cargar todos los productos ==========
async function cargarTodosLosProductos() {
  try {
    const res = await fetch(CATEGORIES_URL);
    const categorias = await res.json();

    const promises = categorias.map(cat =>
      fetch(API_BASE + cat.id + ".json").then(r => r.json())
    );

    const dataCategorias = await Promise.all(promises);

    todosLosProductos = dataCategorias.flatMap(c => 
      (c.products || []).map(p => ({ ...p, catName: c.catName }))
    );
  } catch (e) {
    console.error("Error cargando productos para buscador:", e);
  }
}

// ========== Filtrar productos ==========
function buscarProductos(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return todosLosProductos.filter(p => {
    const n = (p.name || "").toLowerCase();
    const d = (p.description || "").toLowerCase();
    return n.includes(q) || d.includes(q);
  }).slice(0, 10); // máximo 10 resultados
}

// ========== Mostrar resultados ==========
function mostrarResultados(lista) {
  searchResults.innerHTML = "";
  if (!lista.length) {
    searchResults.classList.remove("show");
    return;
  }

  lista.forEach(prod => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a class="dropdown-item d-flex align-items-center gap-2" href="product-info.html" data-id="${prod.id}">
        <img src="${prod.image}" alt="${prod.name}" width="40" height="40" class="rounded">
        <span>
          <strong>${prod.name}</strong><br>
          <small class="text-muted">${prod.catName}</small>
        </span>
      </a>
    `;
    searchResults.appendChild(li);
  });

  searchResults.classList.add("show");
}

// ========== Inicializar ==========
document.addEventListener("DOMContentLoaded", async () => {
  searchInput = document.getElementById("searchInput");
  searchBtn = document.getElementById("searchBtn");
  searchResults = document.getElementById("searchResults");

  if (!searchInput || !searchResults) return;

  await cargarTodosLosProductos();

  // Búsqueda en tiempo real
  searchInput.addEventListener("input", () => {
    const results = buscarProductos(searchInput.value);
    mostrarResultados(results);
  });

  // Enter → simula click en primer resultado
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = searchResults.querySelector("a");
      if (first) first.click();
    }
    if (e.key === "Escape") {
      searchInput.value = "";
      searchResults.classList.remove("show");
    }
  });

  // Click en botón de lupa → mismo comportamiento que Enter
  searchBtn.addEventListener("click", () => {
    const first = searchResults.querySelector("a");
    if (first) first.click();
  });

  // Guardar productID en localStorage
  searchResults.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      const a = e.target.closest("a");
      const id = a.getAttribute("data-id");
      if (id) localStorage.setItem("productID", id);
      searchResults.classList.remove("show");
    }
  });
});
