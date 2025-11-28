// -------------------------------------------
// navbar.js – Versión corregida (no protege login.html)
// -------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

  // EVITAR PROTEGER login.html
  const archivoActual = window.location.pathname.split("/").pop().toLowerCase();

  // Páginas que NO deben tener protección
  const paginasLibres = ["login.html", "register.html", ""];

  if (!paginasLibres.includes(archivoActual)) {

    const token = localStorage.getItem("token");
    const usuario = localStorage.getItem("usuario");

    // Protección de páginas
    if (!token || !usuario) {
      alert("Por favor inicia sesión para acceder a esta página");
      window.location.href = "login.html";
      return;
    }
  }

});

document.addEventListener("DOMContentLoaded", () => {
  const usuario = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");

  if (!token || !usuario) return;

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

  // --- Carrito navbar ---
  const liCarrito = document.createElement("li");
  liCarrito.classList.add("nav-item", "d-flex", "align-items-center", "ms-2");
  liCarrito.innerHTML = `
    <a class="nav-link text-white d-flex align-items-center position-relative" href="cart.html">
      <i class="bi bi-bag-fill" style="font-size:1.4rem;"></i>
      <span id="cartBadge" class="badge bg-danger rounded-pill position-absolute" style="font-size:0.75rem; top:0; right:0; transform: translate(40%, -40%);">0</span>
    </a>
  `;

  // --- Usuario ---
  const liUsuario = document.createElement("li");
  liUsuario.classList.add("nav-item", "dropdown", "d-flex", "align-items-center", "ms-3");
  liUsuario.innerHTML = `
    <a class="nav-link dropdown-toggle d-flex align-items-center text-white"
       href="#" id="usuarioDropdown" data-bs-toggle="dropdown">
      <img id="navbarAvatar" src="${getAvatarSrc()}" class="rounded-circle me-2"
           style="width:32px;height:32px;object-fit:cover;border:1px solid #ccc;">
      <span id="navbarUserName">${usuario}</span>
    </a>

    <ul class="dropdown-menu dropdown-menu-end">
      <li><a class="dropdown-item" href="my-profile.html">Mi perfil</a></li>
      <li><a class="dropdown-item" href="configuracion.html">Configuración</a></li>
      <li><a class="dropdown-item" href="cart.html">Historial</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item" href="#" id="cerrarSesion">Cerrar sesión</a></li>
    </ul>
  `;

  navbar.appendChild(liCarrito);
  navbar.appendChild(liUsuario);

  // Contador carrito
  function actualizarContadorCarrito() {
    const raw = localStorage.getItem("cartItems") || "[]";
    let carrito;
    try { carrito = JSON.parse(raw); } catch { carrito = []; }
    const cantidad = carrito.reduce((acc, p) => acc + (p.quantity ?? 1), 0);
    const badge = document.getElementById("cartBadge");
    if (badge) badge.textContent = cantidad;
  }

  window.addEventListener("carrito:actualizado", actualizarContadorCarrito);
  actualizarContadorCarrito();

  // Cerrar sesión
  document.getElementById("cerrarSesion")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
  });
});
