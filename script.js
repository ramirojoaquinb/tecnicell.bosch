// ======= CONFIGURACIÓN =======
// Poné acá el número de WhatsApp del local, con código de país, sin + ni espacios.
// Ejemplo Argentina: 5491122334455
const WHATSAPP_NUMBER = "5491128509990";

// Pegá acá el link "Publicar en la web" en formato CSV que te da Google Sheets.
// Ver instrucciones abajo de todo en este mismo archivo.
const PRODUCTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRhiTbo2hSZnGrrHHRfXuGkSRNrHCcZd_fQBTWdFX7aTCFKnoFlV0aF7Thz5JLuI-g8eo5Vn30-ZPUE/pub?gid=0&single=true&output=csv";

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

// Convierte el texto CSV en una lista de productos.
// Espera columnas en este orden: nombre, precio, imagen, categoria (encabezado en la fila 1).
// La columna categoria es opcional.
function parseProductsCSV(csvText){
  const lines = csvText.trim().split("\n");
  const rows = lines.slice(1); // saltea el encabezado
  return rows
    .filter(line => line.trim() !== "")
    .map(line => {
      const cols = line.split(",");
      const nombre = (cols[0] || "").trim();
      const precio = parseInt((cols[1] || "0").replace(/[^\d]/g, ""), 10) || 0;
      const imagen = (cols[2] || "").trim();
      const categoria = (cols[3] || "").trim();
      return { id: nombre.toLowerCase().replace(/\s+/g, "-"), nombre, precio, imagen, categoria };
    });
}

let allProducts = [];

async function loadProducts(){
  const grid = document.getElementById("productGrid");

  try {
    const res = await fetch(PRODUCTS_CSV_URL);
    const csvText = await res.text();
    allProducts = parseProductsCSV(csvText);
  } catch (err) {
    grid.innerHTML = "<p style='opacity:0.6'>No se pudieron cargar los productos. Revisá el link de Google Sheets en script.js.</p>";
    return;
  }

  fillCategoryFilter(allProducts);
  renderProducts(allProducts);
}

function fillCategoryFilter(products){
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(products.map(p => p.categoria).filter(c => c))];
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

function getFilteredProducts(){
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const sort = document.getElementById("sortSelect").value;

  let list = allProducts.filter(p => {
    const matchesSearch = !search || p.nombre.toLowerCase().includes(search);
    const matchesCategory = !category || p.categoria === category;
    return matchesSearch && matchesCategory;
  });

  if (sort === "precio-asc") list = [...list].sort((a, b) => a.precio - b.precio);
  if (sort === "precio-desc") list = [...list].sort((a, b) => b.precio - a.precio);
  if (sort === "nombre-asc") list = [...list].sort((a, b) => a.nombre.localeCompare(b.nombre));

  return list;
}

function setupCatalogControls(){
  const rerender = () => renderProducts(getFilteredProducts());
  document.getElementById("searchInput").addEventListener("input", rerender);
  document.getElementById("categoryFilter").addEventListener("change", rerender);
  document.getElementById("sortSelect").addEventListener("change", rerender);
}

function renderProducts(products){
  const grid = document.getElementById("productGrid");
  const noResults = document.getElementById("noResults");
  grid.innerHTML = "";

  if (products.length === 0){
    noResults.style.display = "block";
    return;
  }
  noResults.style.display = "none";

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
  setupCatalogControls();
  renderCart();
});

/*
 ======= CÓMO CONFIGURAR EL GOOGLE SHEET =======

 1. Creá una planilla nueva en Google Sheets.
 2. En la fila 1 poné los encabezados: nombre | precio | imagen | categoria
    (categoria es opcional, la podés dejar vacía si no querés usar el filtro)
 3. Desde la fila 2 para abajo, un producto por fila. Ejemplo:
      nombre                 precio    imagen    categoria
      Funda negra iPhone     8500                Fundas
      Vidrio templado        4000                Protectores
    (la columna imagen podés dejarla vacía por ahora)
 4. Archivo > Compartir > Publicar en la web.
 5. En "Vincular" elegí la hoja correcta, y en el tipo de archivo
    elegí "Valores separados por comas (.csv)".
 6. Apretá "Publicar" y copiá el link que te da.
 7. Pegá ese link en PRODUCTS_CSV_URL arriba de este archivo,
    entre las comillas.

 Cada vez que el dueño edite un precio o agregue una fila en esa
 planilla, la web se va a actualizar sola (puede tardar unos
 minutos en reflejarse por el cacheo de Google).
*/
