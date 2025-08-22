async function cargarProductos() {
  try {
    // 1) Buscar catID en la URL (?cat=...)
    const params = new URLSearchParams(location.search);
    const catFromQuery = params.get("cat");

    // 2) Si no hay en la URL, revisar localStorage
    const catFromStorage = localStorage.getItem("catID");

    // 3) Usar el que exista (URL > localStorage). Si no hay, dar error
    const catID = catFromQuery || catFromStorage;
    if (!catID) {
      console.error("Error: no se proporcionó un catID en la URL ni en localStorage.");
      document.getElementById("categoria").textContent =
        "Error: no se seleccionó ninguna categoría.";
      return;
    }

    const url = `https://japceibal.github.io/emercado-api/cats_products/${catID}.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("No se pudo obtener la categoría con el ID " + catID);
    }

    const data = await response.json();

    // Mostrar categoría en pantalla
    document.getElementById("categoria").textContent =
      `CATÁLOGO DE PRODUCTOS - ${data.catName}`;

    // Renderizar productos
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";

    data.products.forEach(prod => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <div class="card-img">
          <img src="${prod.image}" alt="${prod.name}">
        </div>
        <div class="card-body">
          <h2>${prod.name}</h2>
          <p class="precio">$${prod.cost} ${prod.currency}</p>
          <p>${prod.description}</p>
          <p class="vendidos">Vendidos: ${prod.soldCount}</p>
        </div>
      `;
      contenedor.appendChild(card);
    });

  } catch (error) {
    console.error("Error al cargar los productos:", error);
    document.getElementById("categoria").textContent =
      "Error al cargar los productos.";
  }
}

cargarProductos();

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
  });
}
