document.addEventListener("DOMContentLoaded", () => {
  const usuario = localStorage.getItem("usuario");
  const loggedIn = localStorage.getItem("loggedIn");

  if (loggedIn === "true" && usuario) {
    // Busca el contenedor de la navbar
    const navbar = document.querySelector(".navbar-nav");

    // Si existe, agrega el nombre a la derecha
    if (navbar) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="nav-link text-white">${usuario}</span>`;
      navbar.appendChild(li);
    }
  }
});