function showAlertSuccess() {
  const alert = document.getElementById("alert-success");
  alert.classList.add("show");

  // Se agrega un mensaje de success
  alert.querySelector("p").textContent = "Datos correctos. Redirigiendo...";
}

function showAlertError(msg) {
  const alert = document.getElementById("alert-danger");
  alert.classList.add("show");

  // Se agrega un mensaje de error personalizado
  alert.querySelector("p").textContent = msg;
}

document.getElementById("ingBtn").addEventListener("click", function() {
  let usuario = document.getElementById("usuario").value.trim();
  let password = document.getElementById("password").value.trim();
  let terminos = document.getElementById("terminos").checked;

  if (usuario === "") {
    showAlertError("El campo Usuario es obligatorio.");
    return;
  }

  if (password === "") {
    showAlertError("El campo Contraseña es obligatorio.");
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

