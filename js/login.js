function showAlertSuccess() {
  const alert = document.getElementById("alert-success");
  alert.classList.add("show");
  alert.querySelector("p").textContent = "Datos correctos. Redirigiendo...";
}

function showAlertError(msg) {
  const alert = document.getElementById("alert-danger");
  alert.classList.add("show");
  alert.querySelector("p").textContent = msg;
}

// --- Validación de contraseña ---
function passwordMissingParts(pw) {
  const missing = [];

  const hasUpper = /[A-ZÑÁÉÍÓÚ]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);

  if (!hasUpper) missing.push("una mayúscula");
  if (!hasNumber) missing.push("un número");
  if (!hasSpecial) missing.push("un caracter especial");

  return { hasUpper, hasNumber, hasSpecial, missing };
}

function updatePasswordHints(pw) {
  const { hasUpper, hasNumber, hasSpecial } = passwordMissingParts(pw);

  const mark = (el, ok) => {
    el.classList.toggle("text-success", ok);
    el.classList.toggle("text-muted", !ok);
    el.classList.toggle("fw-semibold", ok);
  };

  mark(document.getElementById("reqUpper"), hasUpper);
  mark(document.getElementById("reqNumber"), hasNumber);
  mark(document.getElementById("reqSpecial"), hasSpecial);
}

document.getElementById("password").addEventListener("input", (e) => {
  updatePasswordHints(e.target.value);
});

// --- Mostrar / ocultar contraseña ---
document.getElementById("togglePassword").addEventListener("click", () => {
  const input = document.getElementById("password");
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  // Accesibilidad
  const btn = document.getElementById("togglePassword");
  btn.setAttribute("aria-pressed", String(isHidden));
});

// --- Flujo de login ---
document.getElementById("ingBtn").addEventListener("click", function () {
  const usuario = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value.trim();
  const terminos = document.getElementById("terminos").checked;

  if (usuario === "") {
    showAlertError("El campo Usuario es obligatorio.");
    return;
  }

  if (password === "") {
    showAlertError("El campo Contraseña es obligatorio.");
    return;
  }

  const { missing } = passwordMissingParts(password);
  if (missing.length > 0) {
    // Mensaje detallado de qué faltó
    const listado = missing.join(", ").replace(/, ([^,]*)$/, " y $1");
    showAlertError(`La contraseña no cumple con los requisitos: falta ${listado}.`);
    return;
  }

  if (!terminos) {
    showAlertError("Debe aceptar los términos y condiciones.");
    return;
  }

  // Guardar login en localStorage
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("usuario", usuario);

  showAlertSuccess();

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
});
