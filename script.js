// ======= CONFIGURACIÓN =======
// Poné acá el número de WhatsApp del local, con código de país, sin + ni espacios.
// Ejemplo Argentina: 5491122334455
const WHATSAPP_NUMBER = "5491100000000";

// ======= CARRITO =======
let cart = []; // { id, nombre, precio, cantidad }

function formatPrice(n){
  return "$" + n.toLocaleString("es-AR");
}

function addToCart(product){
  const existing = cart.find(i => i.id === product.id);
  if (existing) existing.cantidad += 1;
  else cart.push({ ...product, cantidad: 1 });
  renderCart();
}

function renderCart(){
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const countEl = document.getElementById("cartCount");

  itemsEl.innerHTML = "";
  let total = 0;
  let count = 0;

  cart.forEach(item => {
    total += item.precio * item.cantidad;
    count += item.cantidad;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `<span>${item.nombre} x${item.cantidad}</span><span>${formatPrice(item.precio * item.cantidad)}</span>`;
    itemsEl.appendChild(row);
  });

  totalEl.textContent = formatPrice(total);
  countEl.textContent = count;

  const checkoutLink = document.getElementById("cartCheckout");
  checkoutLink.href = buildWhatsappLink();
}

function buildWhatsappLink(){
  if (cart.length === 0){
    return `https://wa.me/${WHATSAPP_NUMBER}`;
  }
  let msg = "Hola! Quiero hacer este pedido:%0A%0A";
  cart.forEach(item => {
    msg += `- ${item.nombre} x${item.cantidad} (${formatPrice(item.precio * item.cantidad)})%0A`;
  });
  const total = cart.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  msg += `%0ATotal: ${formatPrice(total)}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

// ======= CARGA DE DATOS =======
async function loadProducts(){
  const res = await fetch("products.json");
  const products = await res.json();
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-img">${product.imagen ? `<img src="${product.imagen}" alt="${product.nombre}">` : "sin foto"}</div>
      <span class="product-name">${product.nombre}</span>
      <span class="price">${formatPrice(product.precio)}</span>
      <button class="add-btn">Agregar al pedido</button>
    `;
    card.querySelector(".add-btn").addEventListener("click", () => addToCart(product));
    grid.appendChild(card);
  });
}

async function loadServices(){
  const res = await fetch("services.json");
  const services = await res.json();
  const list = document.getElementById("serviceList");
  list.innerHTML = "";

  services.forEach(s => {
    const item = document.createElement("div");
    item.className = "service-item";
    item.innerHTML = `<h4>${s.nombre}</h4><p>${s.detalle}</p>`;
    list.appendChild(item);
  });
}

// ======= UI: carrito lateral =======
function setupCartDrawer(){
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  const openBtn = document.getElementById("cartBtn");
  const closeBtn = document.getElementById("cartClose");

  const open = () => { drawer.classList.add("open"); overlay.classList.add("open"); };
  const close = () => { drawer.classList.remove("open"); overlay.classList.remove("open"); };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);
}

// ======= Botón principal del hero =======
function setupHeroButton(){
  const heroBtn = document.getElementById("heroWhatsapp");
  heroBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola! Quiero consultar por la reparación de mi equipo.`;
}

// ======= INIT =======
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadServices();
  setupCartDrawer();
  setupHeroButton();
  renderCart();
});
