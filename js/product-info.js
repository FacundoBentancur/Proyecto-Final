// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
  });
}