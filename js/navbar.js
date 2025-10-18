document.addEventListener("DOMContentLoaded", function () {
  // ✅ Chequeo de login
  if (localStorage.getItem("loggedIn") !== "true") {
    alert("Por favor, inicia sesión para acceder a esta página");
    window.location.href = "login.html";
    return;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const usuario = localStorage.getItem("usuario");
  const loggedIn = localStorage.getItem("loggedIn");

  if (loggedIn === "true" && usuario) {
    const navbar = document.querySelector(".navbar-nav");
    if (!navbar) return;

    function getAvatarSrc() {
      const fromLocal = localStorage.getItem("avatarLocal");
      if (fromLocal) return fromLocal;

      try {
        const perfil = JSON.parse(localStorage.getItem("perfil"));
        if (perfil && perfil.avatarDataUrl) return perfil.avatarDataUrl;
      } catch {}
      return "img/placeholderUSR.png";
    }

    const li = document.createElement("li");
    li.classList.add("nav-item", "dropdown", "d-flex", "align-items-center");

    li.innerHTML = `
      <a class="nav-link dropdown-toggle d-flex align-items-center text-white"
         href="#" id="usuarioDropdown" role="button" data-bs-toggle="dropdown"
         aria-expanded="false">
        <img id="navbarAvatar" src="${getAvatarSrc()}" alt="Avatar"
             class="rounded-circle me-2"
             style="width: 32px; height: 32px; object-fit: cover; border: 1px solid #ccc;">
        <span id="navbarUserName">${usuario}</span>
      </a>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="usuarioDropdown">
        <li><a class="dropdown-item" href="my-profile.html">Mi perfil</a></li>
        <li><a class="dropdown-item" href="configuracion.html">Configuración</a></li>
        <li><a class="dropdown-item" href="cart.html">Historial</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#" id="cerrarSesion">Cerrar sesión</a></li>
      </ul>
    `;

    navbar.appendChild(li);

    window.addEventListener("profile:avatar-updated", (ev) => {
      const img = document.getElementById("navbarAvatar");
      if (img && ev?.detail?.src) img.src = ev.detail.src;
    });

    document.getElementById("cerrarSesion")?.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
});
