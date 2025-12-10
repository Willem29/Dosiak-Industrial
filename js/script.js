// ================= MENÚ MÓVIL =================
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');

if (hamburger && menu) {
  hamburger.addEventListener('click', () => menu.classList.toggle('open'));
}

// ================= ANIMACIONES REVEAL =================
window.addEventListener('scroll', () => {
  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect().top;
    if (rect < window.innerHeight - 150) el.classList.add('active');
  });
});

// ================= CONFIG DE PRODUCTOS (JSON) =================
const PRODUCTS_URL = '../Data/products.json'; // ajusta la ruta si es necesario

// Array de productos que se llenará desde el JSON
let products = [];

// por si luego agregas productos con formulario
let nextProductId = 1;

// ================= ESTADO DEL CARRITO =================
let cart = [];
const CART_STORAGE_KEY = 'dosiak_cart';

// ================= HELPER MONEDA =================
function formatCurrency(value) {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  });
}

// ================= CARGA DE PRODUCTOS DESDE JSON =================
async function loadProducts() {
  try {
    const response = await fetch(PRODUCTS_URL);

    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo de productos');
    }

    const data = await response.json();
    products = Array.isArray(data) ? data : [];

    // calcular el siguiente ID por si luego creas productos dinámicamente
    if (products.length > 0) {
      const maxId = Math.max(...products.map(p => Number(p.id) || 0));
      nextProductId = maxId + 1;
    } else {
      nextProductId = 1;
    }
  } catch (error) {
    console.error(error);

    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
      productsGrid.innerHTML = `
        <p class="error">
          No se pudieron cargar los productos en este momento. Intenta de nuevo más tarde.
        </p>
      `;
    }
  }
}

// ================= PERSISTENCIA DEL CARRITO =================
function loadCartFromStorage() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return;

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      cart = parsed;
    }
  } catch (error) {
    console.error('Error al leer el carrito de localStorage', error);
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error al guardar el carrito en localStorage', error);
  }
}

// ================= RENDER DE PRODUCTOS =================
function renderProducts() {
  const productsGrid = document.getElementById('products-grid');
  if (!productsGrid) return;

  productsGrid.innerHTML = '';

  if (!products || products.length === 0) {
    productsGrid.innerHTML = `
      <p class="no-products">
        No hay productos disponibles en este momento.
      </p>
    `;
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');

    // ¿Tiene variantes de color? (objeto con default, verde, rojo, etc.)
    const hasVariants = typeof product.image === 'object' && product.image !== null;

    let initialImage = product.image;

    let colors = [];
    if (hasVariants) {
      colors = Object.keys(product.image);
      // default si existe, si no el primero
      if (product.image.default) {
        initialImage = product.image.default;
      } else {
        initialImage = product.image[colors[0]];
      }
    }

    // Etiquetas bonitas para tooltip / accesibilidad
    const colorLabels = {
      default: 'Negro',
      negro: 'Negro',
      verde: 'Verde',
      rojo: 'Rojo'
    };

    // HTML de las bolitas de color
    const colorSelectorHTML = hasVariants
      ? `
        <div class="product-colors">
          <span class="product-colors-label">Color:</span>
          <div class="product-colors-swatches">
            ${colors.map((colorKey, index) => `
              <button
                type="button"
                class="color-swatch ${index === 0 ? 'is-active' : ''}"
                data-color="${colorKey}"
                aria-label="${colorLabels[colorKey] || colorKey}"
              ></button>
            `).join('')}
          </div>
        </div>
      `
      : '';

    card.innerHTML = `
      <img class="product-img" src="${initialImage}" alt="${product.name}">
      <div class="product-body">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description}</p>

        ${colorSelectorHTML}

        <div class="product-price">${formatCurrency(product.price)}</div>
        <div class="product-actions">
          <button class="btn" data-id="${product.id}">Añadir al carrito</button>
        </div>
      </div>
    `;

    productsGrid.appendChild(card);

    // 🔴 Cambio de imagen al hacer clic en una bolita
    if (hasVariants) {
      const img = card.querySelector('.product-img');
      const swatches = card.querySelectorAll('.color-swatch');

      swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
          const color = swatch.dataset.color;
          img.src = product.image[color];

          // marcar activa
          swatches.forEach(s => s.classList.remove('is-active'));
          swatch.classList.add('is-active');
        });
      });
    }
  });

  // Listeners de "Añadir al carrito"
  productsGrid.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      addToCart(id);
    });
  });
}

// ================= LÓGICA DEL CARRITO =================
function addToCart(productId) {
  const product = products.find(p => Number(p.id) === productId);
  if (!product) return;

  const existingItem = cart.find(item => Number(item.id) === productId);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCartToStorage();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => Number(item.id) !== productId);
  saveCartToStorage();
  updateCartUI();
}

function getCartTotalItems() {
  return cart.reduce((acc, item) => acc + item.qty, 0);
}

function getCartTotalPrice() {
  return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
}

// ================= UI DEL CARRITO =================
const cartCountEl   = document.getElementById('cartCount');
const cartPanelEl   = document.getElementById('cartPanel');
const cartItemsEl   = document.getElementById('cartItems');
const cartTotalEl   = document.getElementById('cartTotal');
const cartToggleBtn = document.getElementById('cartToggle');
const cartCheckoutBtn = document.querySelector('.cart-checkout');

function updateCartUI() {
  // contador
  if (cartCountEl) {
    cartCountEl.textContent = getCartTotalItems();
  }

  // items
  if (cartItemsEl) {
    cartItemsEl.innerHTML = '';

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
    } else {
      cart.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        const subtotal = item.price * item.qty;

        div.innerHTML = `
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-qty">Cantidad: ${item.qty}</span>
          </div>
          <div>
            <span class="cart-item-price">${formatCurrency(subtotal)}</span>
            <button class="cart-item-remove" data-id="${item.id}">Eliminar</button>
          </div>
        `;

        cartItemsEl.appendChild(div);
      });

      // botones eliminar
      cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.getAttribute('data-id'), 10);
          removeFromCart(id);
        });
      });
    }
  }

  // total
  if (cartTotalEl) {
    cartTotalEl.textContent = formatCurrency(getCartTotalPrice());
  }
}

// ================= TOGGLE DEL CARRITO =================
if (cartToggleBtn && cartPanelEl) {
  cartToggleBtn.addEventListener('click', () => {
    cartPanelEl.classList.toggle('open');
  });
}

// Cerrar carrito al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!cartPanelEl || !cartToggleBtn) return;

  const isClickInsidePanel = cartPanelEl.contains(e.target);
  const isClickOnToggle = cartToggleBtn.contains(e.target);

  if (!isClickInsidePanel && !isClickOnToggle) {
    cartPanelEl.classList.remove('open');
  }
});

// ================= FINALIZAR PEDIDO (WHATSAPP) =================

function handleCheckout() {
  if (cart.length === 0) {
    showModal({
      title: "Carrito vacío",
      message: "No tienes productos en el carrito todavía. Añade productos antes de finalizar el pedido.",
      type: "info"
    });
    return;
  }

  const total = getCartTotalPrice();

  const lines = [];
  lines.push('Hola Dosiak Industrial, quiero finalizar el siguiente pedido:');
  lines.push('');

  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    lines.push(`- ${item.qty} x ${item.name}: ${formatCurrency(subtotal)}`);
  });

  lines.push('');
  lines.push(`Total: ${formatCurrency(total)}`);
  lines.push('');
  lines.push('Por favor confírmame disponibilidad y tiempos de entrega.');

  const message = lines.join('\n');
  const encodedMessage = encodeURIComponent(message);

  const phone = '573008387184'; // tu número de WhatsApp
  const url = `https://wa.me/${phone}?text=${encodedMessage}`;

  window.open(url, '_blank');
}

if (cartCheckoutBtn) {
  cartCheckoutBtn.addEventListener('click', handleCheckout);
}

// ================= INICIALIZACIÓN =================
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Cargar carrito desde localStorage
  loadCartFromStorage();

  // 2. Cargar productos desde JSON
  await loadProducts();

  // 3. Renderizar productos y carrito
  renderProducts();
  updateCartUI();
});

// =============== MODAL GLOBAL ===============

(function () {
  const overlay = document.getElementById("feedbackOverlay");
  const modal = document.getElementById("feedbackModal");
  const titleEl = document.getElementById("feedbackTitle");
  const messageEl = document.getElementById("feedbackMessage");
  const btnClose = document.getElementById("modalClose");
  const btnOk = document.getElementById("modalOk");

  if (!overlay || !modal || !titleEl || !messageEl) {
    // Si esta página no tiene modal en el HTML, salimos
    return;
  }

  function closeModal() {
    overlay.classList.remove("active");
    // quitar callback (si lo llegamos a usar)
    btnOk.onclick = null;
  }

  function openModal({ title, message, type = "info", onOk = null }) {
    titleEl.textContent = title || "Mensaje";
    messageEl.textContent = message || "";

    modal.classList.remove("success", "error", "info");
    modal.classList.add(type);

    overlay.classList.add("active");

    // click en Aceptar
    btnOk.onclick = function () {
      closeModal();
      if (typeof onOk === "function") onOk();
    };
  }

  // Cerrar con X o clic fuera o ESC
  btnClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Hacemos la función global para usar en otros .js
  window.showModal = openModal;
})();


