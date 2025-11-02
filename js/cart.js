document.addEventListener("DOMContentLoaded", async () => { 
  const container = document.getElementById("cartContent");
  const emptyState = document.getElementById("cartEmpty");

  // --- Tipo de cambio fijo (fallback) ---
  const FX = {
    USD_UYU: 40,         // 1 USD = 40 UYU
    UYU_USD: 1 / 40      // 1 UYU = 0.025 USD
  };

  // Lee 'cartItems' (actual) o 'carrito' (compatibilidad)
  const stored =
    JSON.parse(localStorage.getItem("cartItems")) ||
    JSON.parse(localStorage.getItem("carrito")) ||
    [];

  if (!stored.length) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  // ---- Tabla (envuelta para responsive) ----
  const wrapper = document.createElement("div");
  wrapper.className = "table-responsive-md cart-table-responsive";

  const table = document.createElement("table");
  table.className = "table align-middle";
  // Fijar layout y ancho para evitar “saltos” por textos largos
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
    <tfoot>
      <tr style="border-top:0 !important; border-bottom:0 !important;">
        <td colspan="3"
            class="text-end fw-bold"
            style="border-top:0 !important; border-bottom:0 !important;">
          Total:
        </td>
        <td colspan="2" class="fw-bold text-start">
          <div>USD <span id="totalUSD">0</span></div>
          <div>UYU <span id="totalUYU">0</span></div>
        </td>
        <td style="border-top:0 !important; border-bottom:0 !important;"></td>
      </tr>
    </tfoot>
  `;

  wrapper.appendChild(table);
  container.appendChild(wrapper);

  const tbody = document.getElementById("cartTableBody");
  const totalUSDSpan = document.getElementById("totalUSD");
  const totalUYUSpan = document.getElementById("totalUYU");

  const fmtUSD = new Intl.NumberFormat("es-UY", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const fmtUYU = new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU", maximumFractionDigits: 2 });

  let totalUSD = 0;
  let totalUYU = 0;

  for (const item of stored) {
    const url = `https://japceibal.github.io/emercado-api/products/${item.id}.json`;
    const res = await fetch(url);
    const product = await res.json();

    const unit = normalizeToUSDandUYU(product.currency, Number(product.cost), FX);
    const subtotalUSD = unit.usd * item.quantity;
    const subtotalUYU = unit.uyu * item.quantity;

    totalUSD += subtotalUSD;
    totalUYU += subtotalUYU;

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

  totalUSDSpan.textContent = fmtUSD.format(totalUSD);
  totalUYUSpan.textContent = fmtUYU.format(totalUYU);

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

    // Totales
    const allRows = [...tbody.querySelectorAll("tr")];
    const sumUSD = allRows.reduce((acc, r) => acc + Number(r.dataset.unitUsd) * getQty(r), 0);
    const sumUYU = allRows.reduce((acc, r) => acc + Number(r.dataset.unitUyu) * getQty(r), 0);
    totalUSDSpan.textContent = fmtUSD.format(sumUSD);
    totalUYUSpan.textContent = fmtUYU.format(sumUYU);

    // ---- Actualizar badge al cambiar cantidad ----
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

    const allRows = [...tbody.querySelectorAll("tr")];
    const sumUSD = allRows.reduce((acc, r) => acc + Number(r.dataset.unitUsd) * getQty(r), 0);
    const sumUYU = allRows.reduce((acc, r) => acc + Number(r.dataset.unitUyu) * getQty(r), 0);
    totalUSDSpan.textContent = fmtUSD.format(sumUSD);
    totalUYUSpan.textContent = fmtUYU.format(sumUYU);

    // ---- Actualizar badge al eliminar producto ----
    setTimeout(updateCartBadge, 0);
  });

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
    // Notificar a cualquier listener (navbar, product-info, etc.)
    window.dispatchEvent(new Event("carrito:actualizado"));
  }

  function normalizeToUSDandUYU(currency, amount, r) {
    if (currency === "USD") return { usd: amount, uyu: amount * r.USD_UYU };
    if (currency === "UYU" || currency === "UYU$" || currency === "$U") return { usd: amount * r.UYU_USD, uyu: amount };
    return { usd: amount, uyu: amount * r.USD_UYU };
  }

  // ---- Badge del carrito ----
  function updateCartBadge() {
    const badge = document.getElementById("cartBadge");
    const cart = readCartCompat();
    const totalItems = cart.reduce((acc, p) => acc + p.quantity, 0);
    if (!badge) return;

    badge.textContent = totalItems;
    badge.style.display = "inline-block"; // siempre visible
  }

  // Inicializa badge al cargar
  updateCartBadge();
});
