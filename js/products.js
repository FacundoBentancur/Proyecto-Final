async function cargarProductos() {
  try {
    // Pedir datos de la API
    const response = await fetch("https://japceibal.github.io/emercado-api/cats_products/101.json");
    const data = await response.json();

    // Mostrar categoría en pantalla
    document.getElementById("categoria").textContent = `CATÁLOGO DE PRODUCTOS - ${data.catName}`;

    // Renderizar productos
    const contenedor = document.getElementById("productos");
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
    console.error("Error al pedir el JSON:", error);
  }
}

cargarProductos();

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
  });
}