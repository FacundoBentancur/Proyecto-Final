document.addEventListener("DOMContentLoaded", () => {

  // ====================================
  // ALERTAS (NO BOOTSTRAP)
  // ====================================
  function showAlertSuccess(msg) {
    const ok = document.getElementById("alert-success");
    const err = document.getElementById("alert-danger");

    err.classList.add("d-none");

    ok.querySelector("p").textContent = msg;
    ok.classList.remove("d-none");
  }

  function showAlertError(msg) {
    const ok = document.getElementById("alert-success");
    const err = document.getElementById("alert-danger");

    ok.classList.add("d-none");

    err.querySelector("p").textContent = msg;
    err.classList.remove("d-none");
  }


  // ====================================
  // VALIDACIÓN CONTRASEÑA
  // ====================================
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


  // ====================================
  // MOSTRAR / OCULTAR CONTRASEÑA
  // ====================================
  const toggleBtn = document.getElementById("togglePassword");
  toggleBtn.addEventListener("click", () => {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
  });


  // ====================================
  // LOGIN
  // ====================================
  document.getElementById("ingBtn").addEventListener("click", async () => {
    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();
    const terminos = document.getElementById("terminos").checked;

    if (!usuario) return showAlertError("El campo Usuario es obligatorio.");
    if (!password) return showAlertError("El campo Contraseña es obligatorio.");
    if (!terminos) return showAlertError("Debe aceptar los términos y condiciones.");

    const { missing } = passwordMissingParts(password);
    if (missing.length > 0) {
      const listado = missing.join(", ").replace(/, ([^,]*)$/, " y $1");
      return showAlertError(`La contraseña no cumple los requisitos: falta ${listado}.`);
    }

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password })
      });

      const data = await res.json();
      if (!res.ok) return showAlertError(data.error || "Credenciales incorrectas.");

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", data.usuario);
      localStorage.setItem("loggedIn", "true");

      showAlertSuccess("Inicio de sesión exitoso. Redirigiendo...");

      setTimeout(() => window.location.href = "index.html", 3000);

    } catch (err) {
      showAlertError("Error de conexión con el servidor.");
    }
  });


  // ====================================
  // REGISTRO
  // ====================================
  document.getElementById("regBtn").addEventListener("click", async () => {
    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!usuario) return showAlertError("Debe ingresar un nombre de usuario.");
    if (!password) return showAlertError("Debe ingresar una contraseña.");

    const { missing } = passwordMissingParts(password);
    if (missing.length > 0) {
      const listado = missing.join(", ").replace(/, ([^,]*)$/, " y $1");
      return showAlertError(`La contraseña no cumple los requisitos: falta ${listado}.`);
    }

    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password })
      });

      const data = await res.json();
      if (!res.ok) return showAlertError(data.error || "No se pudo registrar.");

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", data.usuario);
      localStorage.setItem("loggedIn", "true");

      showAlertSuccess("Registrado correctamente. Redirigiendo...");

      setTimeout(() => window.location.href = "index.html", 3000);

    } catch (err) {
      showAlertError("Error de conexión con el servidor.");
    }
  });

});
