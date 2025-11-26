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

// ================= PRODUCTOS QUEMADOS =================
const products = [
  {
    id: 1,
    name: 'Bridas de sujeción industrial',
    description: 'Bridas en acero al carbono para montaje de estructuras y tuberías en ambientes industriales exigentes.',
    price: 85000,
    image: 'assets/img productos/bridas.jpg' 
  },
  {
    id: 2,
    name: 'Ejes mecanizados de precisión',
    description: 'Ejes torneados y fresados en CNC, balanceados y listos para integrar a sistemas de transmisión.',
    price: 195000,
    image: 'assets/img productos/ejes.png'
  },
  {
    id: 3,
    name: 'Soportes y bases metálicas',
    description: 'Soportes fabricados a medida para maquinaria, bandas transportadoras y equipos especiales.',
    price: 120000,
    image: 'assets/img productos/soportes.png '
  }
];

// por si luego agregas con formulario
let nextProductId = products.length + 1;

// ================= ESTADO DEL CARRITO =================
let cart = [];

// ================= HELPER MONEDA =================
function formatCurrency(value) {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  });
}

// ================= RENDER DE PRODUCTOS =================
function renderProducts() {
  const productsGrid = document.getElementById('products-grid');
  if (!productsGrid) return; // si no existe el contenedor, salimos

  productsGrid.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="product-body">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-price">${formatCurrency(product.price)}</div>
        <div class="product-actions">
          <button class="btn" data-id="${product.id}">Añadir al carrito</button>
        </div>
      </div>
    `;

    productsGrid.appendChild(card);
  });

  // listeners de "Añadir al carrito"
  productsGrid.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      addToCart(id);
    });
  });
}

// ================= LÓGICA DEL CARRITO =================
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
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
    alert('Tu carrito está vacío. Añade productos antes de finalizar el pedido.');
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
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();  // <- AQUÍ se pintan las tarjetas
  updateCartUI();
});
