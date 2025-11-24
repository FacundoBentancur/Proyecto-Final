document.addEventListener("DOMContentLoaded", async () => { 
  const container = document.getElementById("cartContent");
  const emptyState = document.getElementById("cartEmpty");

  // --- Tipo de cambio fijo (fallback) ---
  const FX = {
    USD_UYU: 40,
    UYU_USD: 1 / 40
  };

  // Elementos de Costos / Envío
  const checkoutPanel = document.getElementById("checkoutPanel");
  const costSubUSD = document.getElementById("costSubUSD");
  const costSubUYU = document.getElementById("costSubUYU");
  const costShipUSD = document.getElementById("costShipUSD");
  const costShipUYU = document.getElementById("costShipUYU");
  const costTotalUSD = document.getElementById("costTotalUSD");
  const costTotalUYU = document.getElementById("costTotalUYU");

  const shippingRadios = () => [...document.querySelectorAll('input[name="shippingOption"]')];

  // Lee carrito
  const stored =
    JSON.parse(localStorage.getItem("cartItems")) ||
    JSON.parse(localStorage.getItem("carrito")) ||
    [];

  if (!stored.length) {
    emptyState.style.display = "block";
    if (checkoutPanel) checkoutPanel.style.display = "none";
    return;
  }
  emptyState.style.display = "none";
  if (checkoutPanel) checkoutPanel.style.display = "block";

  // ---- Tabla (envuelta para responsive) ----
  const wrapper = document.createElement("div");
  wrapper.className = "table-responsive-md cart-table-responsive";

  const table = document.createElement("table");
  table.className = "table align-middle";
  table.style.tableLayout = "fixed";
  table.style.width = "100%";

  table.innerHTML = `
    <thead>
      <tr>
        <th style="width:42%;">Producto</th>
        <th style="width:20%;">Precio</th>
        <th style="width:12%;">Cant.</th>
        <th style="width:22%;">Subtotal<br><small class="text-muted">USD / UYU</small></th>
        <th style="width:4%;"></th>
      </tr>
    </thead>
    <tbody id="cartTableBody"></tbody>
  `;

  wrapper.appendChild(table);
  container.appendChild(wrapper);

  const tbody = document.getElementById("cartTableBody");

  const fmtUSD = new Intl.NumberFormat("es-UY", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const fmtUYU = new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU", maximumFractionDigits: 2 });

  for (const item of stored) {
    const url = `https://japceibal.github.io/emercado-api/products/${item.id}.json`;
    const res = await fetch(url);
    const product = await res.json();

    const unit = normalizeToUSDandUYU(product.currency, Number(product.cost), FX);
    const subtotalUSD = unit.usd * item.quantity;
    const subtotalUYU = unit.uyu * item.quantity;

    const tr = document.createElement("tr");
    tr.dataset.id = String(product.id);
    tr.dataset.unitUsd = String(unit.usd);
    tr.dataset.unitUyu = String(unit.uyu);

    tr.innerHTML = `
      <td>
        <img src="${product.images[0]}" width="72" class="me-2 rounded" alt="">
        ${product.name}
      </td>
      <td>${product.currency} ${Number(product.cost).toLocaleString("es-UY")}</td>
      <td>
        <input type="number" min="1" value="${item.quantity}" class="form-control form-control-sm text-center" style="max-width:70px;">
      </td>
      <td>
        <div>USD <span class="subtotal-usd">${fmtUSD.format(subtotalUSD)}</span></div>
        <div>UYU <span class="subtotal-uyu">${fmtUYU.format(subtotalUYU)}</span></div>
      </td>
      <td>
        <button class="btn btn-outline-danger btn-sm" data-remove="${product.id}">
          <i class="fa fa-trash" aria-hidden="true"></i>
          <span class="visually-hidden">Quitar</span>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  paintCosts(getCurrentSubtotal());

  // ---- Cambios de cantidad ----
  tbody.addEventListener("input", (e) => {
    if (!(e.target instanceof HTMLInputElement) || e.target.type !== "number") return;
    const row = e.target.closest("tr");
    if (!row) return;

    const id = Number(row.dataset.id);
    const qty = clampInt(Number(e.target.value), 1, 9999);

    const cart = readCartCompat();
    const prod = cart.find((p) => p.id === id);
    if (prod) {
      prod.quantity = qty;
      writeCartCompat(cart);
    }

    const unitUSD = Number(row.dataset.unitUsd);
    const unitUYU = Number(row.dataset.unitUyu);
    const subUSD = unitUSD * qty;
    const subUYU = unitUYU * qty;

    row.querySelector(".subtotal-usd").textContent = fmtUSD.format(subUSD);
    row.querySelector(".subtotal-uyu").textContent = fmtUYU.format(subUYU);

    paintCosts(getCurrentSubtotal());
    updateCartBadge();
  });

  // ---- Eliminar producto ----
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;

    const id = Number(btn.dataset.remove);
    let cart = readCartCompat().filter((p) => p.id !== id);
    writeCartCompat(cart);

    if (!cart.length) {
      location.reload();
      return;
    }
    btn.closest("tr").remove();
    paintCosts(getCurrentSubtotal());
    setTimeout(updateCartBadge, 0);
  });

  // ---- Cambio de tipo de envío ----
  shippingRadios().forEach(r =>
    r.addEventListener("change", () => paintCosts(getCurrentSubtotal()))
  );

  // ---- Helpers ----
  function clampInt(n, min, max) {
    n = Number.isFinite(n) ? Math.round(n) : min;
    return Math.min(Math.max(n, min), max);
  }

  function readCartCompat() {
    return (
      JSON.parse(localStorage.getItem("cartItems")) ||
      JSON.parse(localStorage.getItem("carrito")) ||
      []
    );
  }

  function writeCartCompat(items) {
    localStorage.setItem("cartItems", JSON.stringify(items));
    localStorage.setItem("carrito", JSON.stringify(items));
    window.dispatchEvent(new Event("carrito:actualizado"));
  }

  function normalizeToUSDandUYU(currency, amount, r) {
    if (currency === "USD") return { usd: amount, uyu: amount * r.USD_UYU };
    if (currency === "UYU" || currency === "UYU$" || currency === "$U") return { usd: amount * r.UYU_USD, uyu: amount };
    return { usd: amount, uyu: amount * r.USD_UYU };
  }

  function getCurrentSubtotal() {
    const rows = [...tbody.querySelectorAll("tr")];
    const usd = rows.reduce((acc, r) => acc + Number(r.dataset.unitUsd) * Number(r.querySelector("input").value), 0);
    const uyu = rows.reduce((acc, r) => acc + Number(r.dataset.unitUyu) * Number(r.querySelector("input").value), 0);
    return { usd, uyu };
  }

  function getSelectedShippingRate() {
    const selected = document.querySelector('input[name="shippingOption"]:checked');
    return selected ? Number(selected.value) : null;
  }

  function paintCosts(sub) {
    costSubUSD.textContent = fmtUSD.format(sub.usd);
    costSubUYU.textContent = fmtUYU.format(sub.uyu);

    const rate = getSelectedShippingRate();
    if (rate === null) {
      costShipUSD.textContent = "—";
      costShipUYU.textContent = "—";
      costTotalUSD.textContent = fmtUSD.format(sub.usd);
      costTotalUYU.textContent = fmtUYU.format(sub.uyu);
      return;
    }

    const shipUSD = sub.usd * rate;
    const shipUYU = sub.uyu * rate;

    costShipUSD.textContent = fmtUSD.format(shipUSD);
    costShipUYU.textContent = fmtUYU.format(shipUYU);

    const totalUSD = sub.usd + shipUSD;
    const totalUYU = sub.uyu + shipUYU;

    costTotalUSD.textContent = fmtUSD.format(totalUSD);
    costTotalUYU.textContent = fmtUYU.format(totalUYU);
  }

  function updateCartBadge() {
    const badge = document.getElementById("cartBadge");
    const cart = readCartCompat();
    const totalItems = cart.reduce((acc, p) => acc + p.quantity, 0);
    if (!badge) return;
    badge.textContent = totalItems;
    badge.style.display = "inline-block";
  }

  updateCartBadge();

  // === Forma de pago dinámica ===
  const radiosPago = document.querySelectorAll('input[name="paymentMethod"]');
  radiosPago.forEach(r => {
    r.addEventListener("change", updatePaymentFields);
  });

  updatePaymentFields();

  function updatePaymentFields() {
    const paymentDetails = document.getElementById("paymentDetails");
    if (!paymentDetails) return;

    const selected = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selected) {
      paymentDetails.innerHTML = "";
      return;
    }

    if (selected.value === "credit") {
      paymentDetails.innerHTML = `
        <form id="creditForm" class="row g-3 mt-2">
          <div class="col-md-6 col-lg-4">
            <label class="form-label">Número de tarjeta</label>
            <input type="text" class="form-control" id="cardNumber" inputmode="numeric"
                   maxlength="19" placeholder="1234 5678 9012 3456" required>
          </div>
          <div class="col-md-3 col-lg-2">
            <label class="form-label">Vencimiento</label>
            <input type="text" class="form-control" id="cardExpiry" placeholder="MM/AA" maxlength="5" required>
          </div>
          <div class="col-md-2 col-lg-2">
            <label class="form-label">CVV</label>
            <input type="text" class="form-control" id="cardCVV" inputmode="numeric" maxlength="4" placeholder="123" required>
          </div>
          <div class="col-12">
            <label class="form-label">Nombre del titular</label>
            <input type="text" class="form-control" id="cardHolder" placeholder="Nombre del titular de la tarjeta" required>
          </div>
        </form>
      `;
    } else if (selected.value === "bank") {
      paymentDetails.innerHTML = `
        <form id="bankForm" class="row g-3 mt-2">
          <div class="col-md-6 col-lg-5">
            <label class="form-label">Número de cuenta</label>
            <input type="text" class="form-control" id="bankAccount" placeholder="Ej: 00123456789" required>
          </div>
          <div class="col-md-6 col-lg-5">
            <label class="form-label">Banco</label>
            <input type="text" class="form-control" id="bankName" placeholder="Ej: BROU, Itaú, Santander..." required>
          </div>
        </form>
      `;
    } else {
      paymentDetails.innerHTML = "";
    }
  }
});

// ---- Añadimos el evento al boton de finalizar compra ----
document.getElementById("btnFinalizar").addEventListener("click", async () => {
  if (validarCompra()) {
    await enviarCarritoAlServidor();
    alert("¡Compra exitosa!");
  } else {
    alert("Por favor complete todos los campos obligatorios antes de finalizar.");
  }
});

// ---- Revisamos que cada campo este completo ----
function validarCompra(){
  const camposDireccion = document.querySelectorAll("#shippingForm .form-control");
  for(let campo of camposDireccion){
    if (campo.value.trim() === ""){
      campo.classList.add("is-invalid");
      return false;
    } else {
      campo.classList.remove("is-invalid");
    }
  }
    const envioSeleccionado = document.querySelector('input[name="shippingOption"]:checked');
  if (!envioSeleccionado) {
    alert("⚠️ Seleccioná un tipo de envío.");
    return false;
  }

   const cantidades = document.querySelectorAll(".cantidad-producto");
  for (let cantidad of cantidades) {
    if (parseInt(cantidad.value) <= 0 || isNaN(cantidad.value)) {
      alert("⚠️ La cantidad de cada producto debe ser mayor a 0.");
      return false;
    }
  }

const pagoSeleccionado = document.querySelector('input[name="paymentMethod"]:checked');
  if (!pagoSeleccionado){
    alert("Seleccioná una forma de pago");
    return false;
  }
 
  if (pagoSeleccionado.value === "bank"){
    const cuenta = document.getElementById("numero-cuenta")?.value.trim();
    if (!cuenta){
      alert("ingresá el numero de cuenta bancaria");
      return false;
    }
  }
  return true;
}

async function enviarCarritoAlServidor() {
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];

  const payload = {
    user_id: 1, // por ahora estático
    items: []
  };

  for (const item of cart) {
    const url = `https://japceibal.github.io/emercado-api/products/${item.id}.json`;
    const res = await fetch(url);
    const product = await res.json();

    payload.items.push({
      product_id: product.id,
      product_name: product.name,
      unit_cost: product.cost,
      currency: product.currency,
      quantity: item.quantity
    });
  }

  const resp = await fetch("http://localhost:3000/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await resp.json();
  console.log("📦 Respuesta servidor:", data);
}