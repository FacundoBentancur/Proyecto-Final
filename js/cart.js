/*
const CARRITO_KEY = "carrito";
const $ = (s) => document.querySelector(s);


if (localStorage.getItem(productID) !== "true") { 
    then
    show product en CartPosition.html :D
};

*/

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("cartContent");
  const emptyState = document.getElementById("cartEmpty");

  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

  if (cartItems.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  // Crear tabla de carrito
  const table = document.createElement("table");
  table.className = "table align-middle";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Producto</th>
        <th>Precio</th>
        <th>Cantidad</th>
        <th>Subtotal</th>
        <th></th>
      </tr>
    </thead>
    <tbody id="cartTableBody"></tbody>
    <tfoot>
      <tr>
        <td colspan="3" class="text-end fw-bold">Total:</td>
        <td id="cartTotal" class="fw-bold"></td>
        <td></td>
      </tr>
    </tfoot>
  `;

  container.appendChild(table);

  const tbody = document.getElementById("cartTableBody");
  const totalEl = document.getElementById("cartTotal");

  let total = 0;

  // Cargar cada producto según su ID
  for (const item of cartItems) {
    const url = `https://japceibal.github.io/emercado-api/products/${item.id}.json`;
    const res = await fetch(url);
    const product = await res.json();

    const subtotal = product.cost * item.quantity;
    total += subtotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <img src="${product.images[0]}" width="80" class="me-2 rounded">
        ${product.name}
      </td>
      <td>${product.currency} ${product.cost}</td>
      <td>
        <input type="number" min="1" value="${item.quantity}" class="form-control form-control-sm w-auto" data-id="${product.id}">
      </td>
      <td>${product.currency} <span class="subtotal">${subtotal}</span></td>
      <td>
        <button class="btn btn-outline-danger btn-sm" data-remove="${product.id}">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  totalEl.textContent = `${cartItems[0]?.currency || "USD"} ${total}`;

  // --- Actualizar cantidad ---
  tbody.addEventListener("input", (e) => {
    if (e.target.matches('input[type="number"]')) {
      const id = Number(e.target.dataset.id);
      const newQty = Number(e.target.value);
      const row = e.target.closest("tr");
      const price = Number(row.children[1].textContent.replace(/[^0-9.]/g, ""));
      const subtotalEl = row.querySelector(".subtotal");
      const newSubtotal = price * newQty;
      subtotalEl.textContent = newSubtotal;

      // Actualizar en localStorage
      const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
      const prod = cart.find(p => p.id === id);
      if (prod) prod.quantity = newQty;
      localStorage.setItem("cartItems", JSON.stringify(cart));

      // Recalcular total
      const allSubtotals = [...document.querySelectorAll(".subtotal")].map(s => Number(s.textContent));
      totalEl.textContent = `${cartItems[0]?.currency || "USD"} ${allSubtotals.reduce((a, b) => a + b, 0)}`;
    }
  });

  // --- Eliminar producto ---
  tbody.addEventListener("click", (e) => {
    if (e.target.closest("[data-remove]")) {
      const id = Number(e.target.closest("[data-remove]").dataset.remove);
      let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
      cart = cart.filter(p => p.id !== id);
      localStorage.setItem("cartItems", JSON.stringify(cart));
      window.location.reload();
    }
  });
});

