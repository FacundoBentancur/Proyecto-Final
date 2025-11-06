document.addEventListener("DOMContentLoaded", async () => { 
  const container = document.getElementById("cartContent");
  const emptyState = document.getElementById("cartEmpty");

  // --- Tipo de cambio fijo (fallback) ---
  const FX = {
    USD_UYU: 40,         // 1 USD = 40 UYU
    UYU_USD: 1 / 40      // 1 UYU = 0.025 USD
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

  // Lee 'cartItems' (actual) o 'carrito' (compatibilidad)
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

  // Nota: se eliminó el <tfoot> con "Total (sin envío)"
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
      <td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        ${product.currency} ${Number(product.cost).toLocaleString("es-UY")}
      </td>
      <td>
        <input
          type="number"
          min="1"
          value="${item.quantity}"
          class="form-control form-control-sm text-center"
          inputmode="numeric"
          style="max-width:70px;"
        >
      </td>
      <td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
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

  // Inicializar "Costos" con el subtotal calculado desde la tabla
  paintCosts(getCurrentSubtotal());

  // ---- Cambios de cantidad ----
  tbody.addEventListener("input", (e) => {
    if (!(e.target instanceof HTMLInputElement) || e.target.type !== "number") return;
    const row = e.target.closest("tr");
    if (!row) return;

    const id = Number(row.dataset.id);
    const qty = clampInt(Number(e.target.value), 1, 9999);

    // Actualizo LS
    const cart = readCartCompat();
    const prod = cart.find((p) => p.id === id);
    if (prod) {
      prod.quantity = qty;
      writeCartCompat(cart);
    }

    // Recalculo fila
    const unitUSD = Number(row.dataset.unitUsd);
    const unitUYU = Number(row.dataset.unitUyu);
    const subUSD = unitUSD * qty;
    const subUYU = unitUYU * qty;

    row.querySelector(".subtotal-usd").textContent = fmtUSD.format(subUSD);
    row.querySelector(".subtotal-uyu").textContent = fmtUYU.format(subUYU);

    // ---- Actualizar "Costos" en tiempo real ----
    paintCosts(getCurrentSubtotal());

    // ---- Actualizar badge ----
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

    // ---- Actualizar "Costos" tras eliminar ----
    paintCosts(getCurrentSubtotal());

    // ---- Actualizar badge ----
    setTimeout(updateCartBadge, 0);
  });

  // ---- Cambio de tipo de envío: recalcula Costos en tiempo real ----
  shippingRadios().forEach(r =>
    r.addEventListener("change", () => {
      paintCosts(getCurrentSubtotal());
    })
  );

  // ---- Helpers ----
  function getQty(row) {
    const inp = row.querySelector('input[type="number"]');
    return clampInt(Number(inp.value), 1, 9999);
  }

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
    const usd = rows.reduce((acc, r) => acc + Number(r.dataset.unitUsd) * getQty(r), 0);
    const uyu = rows.reduce((acc, r) => acc + Number(r.dataset.unitUyu) * getQty(r), 0);
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
});
