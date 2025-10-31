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

    // --- Crear enlace de carrito con badge ---
    const liCarrito = document.createElement("li");
    liCarrito.classList.add("nav-item", "d-flex", "align-items-center", "ms-2");

    liCarrito.innerHTML = `
      <a class="nav-link text-white d-flex align-items-center position-relative" href="cart.html">
        <i class="bi bi-cart" style="font-size: 1.3rem; position: relative;"></i>
        <span id="cartCount"
              class="badge bg-danger rounded-pill position-absolute"
              style="font-size: 0.75rem; top: 0; right: 0; transform: translate(40%, -40%);">
          0
        </span>
      </a>
    `;

    // --- Crear menú de usuario ---
    const liUsuario = document.createElement("li");
    liUsuario.classList.add("nav-item", "dropdown", "d-flex", "align-items-center", "ms-3");

    liUsuario.innerHTML = `
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

    // ✅ Insertar el carrito justo antes del usuario
    navbar.appendChild(liCarrito);
    navbar.appendChild(liUsuario);

    // --- Función para actualizar el contador del carrito ---
    function actualizarContadorCarrito() {
      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      const badge = document.getElementById("cartCount");
      if (!badge) return;

      // 🔢 Sumar cantidades (usando 'count' o 1 por producto)
      let cantidad = 0;
      for (const producto of carrito) {
        cantidad += producto.count ? producto.count : 1;
      }

      badge.textContent = cantidad;
      // ✅ Siempre visible, aunque esté en 0
      badge.style.display = "inline-block";
    }

    // 🔁 Hacer accesible globalmente para otros scripts
    window.actualizarContadorCarrito = actualizarContadorCarrito;

    // Llamar al cargar
    actualizarContadorCarrito();

    // Permitir actualización con evento personalizado
    window.addEventListener("carrito:actualizado", actualizarContadorCarrito);

    // --- Actualizar avatar dinámicamente ---
    window.addEventListener("profile:avatar-updated", (ev) => {
      const img = document.getElementById("navbarAvatar");
      if (img && ev?.detail?.src) img.src = ev.detail.src;
    });

    // --- Cierre de sesión ---
    document.getElementById("cerrarSesion")?.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
});
