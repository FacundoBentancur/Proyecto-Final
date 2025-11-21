// navbar.js
document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("loggedIn") !== "true") {
    alert("Por favor, inicia sesión para acceder a esta página");
    window.location.href = "login.html";
    return;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const usuario = localStorage.getItem("usuario");
  const loggedIn = localStorage.getItem("loggedIn");

  if (!(loggedIn === "true" && usuario)) return;

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

  // --- Carrito (navbar) ---
  const liCarrito = document.createElement("li");
  liCarrito.classList.add("nav-item", "d-flex", "align-items-center", "ms-2");
  liCarrito.innerHTML = `
    <a class="nav-link text-white d-flex align-items-center position-relative" href="cart.html" aria-label="Ir al carrito (navbar)">
      <i class="bi bi-bag-fill" style="font-size:1.4rem; position:relative;"></i>
      <span id="cartBadge" class="badge bg-danger rounded-pill position-absolute" style="font-size:0.75rem; top:0; right:0; transform: translate(40%, -40%);">0</span>
    </a>
  `;

  // --- Usuario ---
  const liUsuario = document.createElement("li");
  liUsuario.classList.add("nav-item", "dropdown", "d-flex", "align-items-center", "ms-3");
  liUsuario.innerHTML = `
    <a class="nav-link dropdown-toggle d-flex align-items-center text-white"
       href="#" id="usuarioDropdown" role="button" data-bs-toggle="dropdown"
       aria-expanded="false">
      <img id="navbarAvatar" src="${getAvatarSrc()}" alt="Avatar"
           class="rounded-circle me-2"
           style="width:32px;height:32px;object-fit:cover;border:1px solid #ccc;">
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
  navbar.appendChild(liCarrito);
  navbar.appendChild(liUsuario);

  // --- Contador carrito ---
  function actualizarContadorCarrito() {
  const raw = localStorage.getItem("cartItems") || localStorage.getItem("carrito") || "[]";
  let carrito;
  try { carrito = JSON.parse(raw); } catch { carrito = []; }
  const cantidad = carrito.reduce((acc, p) => acc + (p.quantity ?? p.count ?? 1), 0);
  const badge = document.getElementById("cartBadge");
  const badgeFloat = document.getElementById("cartBadgeFloat");
  const iconNavbar = document.querySelector(".bi-bag-fill"); // ícono del carrito en la navbar
  const iconFloat = document.querySelector("#cartBubble .bi-bag-fill"); // ícono del carrito flotante

  if (badge) badge.textContent = cantidad;
  if (badgeFloat) badgeFloat.textContent = cantidad;

  // === Agregar rebote al actualizar ===
  [iconNavbar, iconFloat].forEach(icon => {
    if (!icon) return;
    icon.classList.remove("cart-bounce"); // reinicia si ya estaba
    void icon.offsetWidth; // truco para forzar reflow y reiniciar animación
    icon.classList.add("cart-bounce");
  });
}

  window.addEventListener("carrito:actualizado", actualizarContadorCarrito);
  window.addEventListener("storage", (e) => {
    if (e.key === "cartItems" || e.key === "carrito") actualizarContadorCarrito();
  });
  window.actualizarContadorCarrito = actualizarContadorCarrito;
  actualizarContadorCarrito();

  // Avatar dinámico
  window.addEventListener("profile:avatar-updated", (ev) => {
    const img = document.getElementById("navbarAvatar");
    if (img && ev?.detail?.src) img.src = ev.detail.src;
  });

  document.getElementById("cerrarSesion")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // === BOTONES FLOTANTES ===
  const floatContainer = document.createElement("div");
  floatContainer.id = "floatButtonsContainer";
  document.body.appendChild(floatContainer);

  // --- Carrito flotante ---
  const cartBubble = document.createElement("div");
  cartBubble.id = "cartBubble";
  cartBubble.innerHTML = `
    <a href="cart.html" class="float-btn" aria-label="Ver carrito (flotante)">
      <i class="bi bi-bag-fill fs-4"></i>
      <span id="cartBadgeFloat" class="badge bg-danger rounded-pill position-absolute" style="font-size:0.75rem; top:-6px; right:-8px;">0</span>
    </a>
  `;
  floatContainer.appendChild(cartBubble);

  // --- Home flotante ---
  const homeBubble = document.createElement("div");
  homeBubble.id = "homeBubble";
  homeBubble.innerHTML = `
    <a href="index.html" class="float-btn" aria-label="Ir al inicio">
      <i class="bi bi-house fs-4"></i>
    </a>
  `;
  floatContainer.appendChild(homeBubble);

  // --- Subir flotante ---
  const topBubble = document.createElement("div");
  topBubble.id = "topBubble";
  topBubble.innerHTML = `
    <button class="float-btn" id="scrollTopBtn" aria-label="Subir">
      <i class="bi bi-arrow-up-short fs-4"></i>
    </button>
  `;
  floatContainer.appendChild(topBubble);

  // Mostrar/ocultar según visibilidad de la navbar
  const navbarEl = document.querySelector(".navbar");
  function toggleFloatingButtons(visible) {
    if (visible) {
      cartBubble.classList.remove("visible");
      homeBubble.classList.remove("visible");
      topBubble.classList.remove("visible");
    } else {
      cartBubble.classList.add("visible");
      homeBubble.classList.add("visible");
      topBubble.classList.add("visible");
    }
  }

  if (navbarEl) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries[0].isIntersecting;
      toggleFloatingButtons(visible);
    }, { threshold: 0.1 });
    observer.observe(navbarEl);
  } else {
    // Si no hay navbar, mostrarlos siempre
    cartBubble.classList.add("visible");
    homeBubble.classList.add("visible");
    topBubble.classList.add("visible");
  }

  // Acción "Subir"
  document.getElementById("scrollTopBtn")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Actualizar contador al final
  actualizarContadorCarrito();
});
