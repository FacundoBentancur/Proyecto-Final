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

  // Validaciones de campos
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

  // Si pasa todas las validaciones
  showAlertSuccess();


  //  CAMBIÉ INDEX.HTML POR LOGIN.HTML

  // Redirigir después de 1.5 segundos, para que se vea el mensaje de éxito
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
});

// LocalStorage - Inicio de Sesión

function login() {
    // Se obtienen los valores de los campos de entrada a través de su ID.
    const username = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    // Se verifica si ambos campos están completos
    if (username && password) {
        // Se guarda el estado de inicio de sesión en sessionStorage
        localStorage.setItem("loggedIn", "true");

        // Se guarda el nombre de usuario y contraseña en localStorage
        localStorage.setItem("usuario", username);
        
        // Se mantiene como comentario para ser utilizado en el futuro cercano/próximo.
        // localStorage.setItem("password", password);

        // Se redirige al usuario a index.html
        window.location.href = "index.html";
    } else {
        // En el caso que la condición anterior no se cumpla (campos no están completos), se muestra una alerta
        alert("Por favor, complete ambos campos.");
    }
}
