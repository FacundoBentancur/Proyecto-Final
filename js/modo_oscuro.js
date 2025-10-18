// Botón modo oscuro //
document.addEventListener("DOMContentLoaded", () => {
  const darkMode = document.querySelector(".dark-mode");
  const body = document.body;

  if (!darkMode) return;

  // Aplica el modo guardado
  if (localStorage.getItem("modoOscuro") === "activado") {
    body.classList.add("active");
  }

  // Alternar modo al hacer click
  darkMode.addEventListener("click", () => {
    body.classList.toggle("active");

    if (body.classList.contains("active")) {
      localStorage.setItem("modoOscuro", "activado");
    } else {
      localStorage.setItem("modoOscuro", "desactivado");
    }
  });
});
