// Boton modo oscuro //
const darkMode = document.querySelector(".dark-mode");
const body = document.body;


if (localStorage.getItem("modoOscuro") === "activado") {
  body.classList.add("active");
}

darkMode.addEventListener("click", () => {
  body.classList.toggle("active");

  if (body.classList.contains("active")) {
    localStorage.setItem("modoOscuro", "activado");
  } else {
    localStorage.setItem("modoOscuro", "desactivado");
  }
});

