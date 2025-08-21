document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("autos").addEventListener("click", function() {
        localStorage.setItem("catID", 101);
        window.location = "products.html"
    });
    document.getElementById("juguetes").addEventListener("click", function() {
        localStorage.setItem("catID", 102);
        window.location = "products.html"
    });
    document.getElementById("muebles").addEventListener("click", function() {
        localStorage.setItem("catID", 103);
        window.location = "products.html"
    });
});

// LocalStorage - Inicio de Sesión

 document.addEventListener("DOMContentLoaded", function () {
    // Verifica si el usuario está logueado
    if (!sessionStorage.getItem("loggedIn")) {
        // Muestra una alerta indicando que debe loguearse
        alert("Por favor, inicia sesión para acceder a esta página");

        // Redirige a login.html
        window.location.href = "login.html";
    }
});
