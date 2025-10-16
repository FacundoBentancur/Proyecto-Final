document.addEventListener("DOMContentLoaded", function() {
  // Chequeo de login
  if (localStorage.getItem("loggedIn") !== "true") {
    alert("Por favor, inicia sesión para acceder a esta página");
    window.location.href = "login.html";
    return; // detener ejecución
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const usuario = localStorage.getItem("usuario");
  const loggedIn = localStorage.getItem("loggedIn");

  if (loggedIn === "true" && usuario) {
    // Busca el contenedor de la navbar
    const navbar = document.querySelector(".navbar-nav");

    // Si existe, agrega el nombre a la derecha
    if (navbar) {
      const li = document.createElement("li");
      li.classList.add("nav-item", "dropdown");

      li.innerHTML = `
        <a 
          class="nav-link dropdown-toggle text-white" 
          href="#" 
          id="usuarioDropdown" 
          role="button" 
          data-bs-toggle="dropdown" 
          aria-expanded="false">
          ${usuario}
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="usuarioDropdown">
          <li><a class="dropdown-item" href="/my-profile.html">Mi perfil</a></li>
          <li><a class="dropdown-item" href="/configuracion.html">Configuración</a></li>
          <li><a class="dropdown-item" href="/historial-de-compras.html">Historial de compras</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" id="cerrarSesion">Cerrar sesión</a></li>
        </ul>
      `;

      navbar.appendChild(li);

      // Acción de cerrar sesión
      document.getElementById("cerrarSesion").addEventListener("click", () => {
        localStorage.removeItem("usuario");
        localStorage.setItem("loggedIn", "false");
        window.location.href = "/login.html";
      });
    }
  }
});
