let chefsData = []
let filtros = {
  precioMin: null,
  precioMax: null,
  tipo: null
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarApp()
  configurarFiltros()
})

async function inicializarApp() {
  await cargarChefs()
  mostrarReservas()
  configurarBotones()
}

function obtenerReservas() {
  return JSON.parse(localStorage.getItem("reservas")) || []
}

function guardarReservas(reservas) {
  localStorage.setItem("reservas", JSON.stringify(reservas))
}

function agregarReserva(reserva) {
  const reservas = obtenerReservas()
  reservas.push(reserva)
  guardarReservas(reservas)
}

function eliminarReserva(index) {
  const reservas = obtenerReservas()
  reservas.splice(index, 1)
  guardarReservas(reservas)
  mostrarReservas()
  alert("Reserva eliminada")
}
function editarReserva(index, reserva) {
  
  const nuevaFecha = prompt("Nueva fecha (AAAA-MM-DD):", reserva.fecha)
  if (!nuevaFecha) return
  const nuevaHora = prompt("Nueva hora (HH:MM):", reserva.hora)
  if (!nuevaHora) return

  const reservas = obtenerReservas()
  reservas[index].fecha = nuevaFecha
  reservas[index].hora = nuevaHora
  guardarReservas(reservas)
  mostrarReservas()
  alert("Reserva editada correctamente")
}
async function cargarChefs() {
  try {
    const res = await fetch("data/chefs.json")
    chefsData = await res.json()
    mostrarChefsFiltrados()
  } catch (err) {
    console.error("Error cargando chefs:", err)
  }
}

function mostrarChefsFiltrados() {
  const container = document.getElementById("chef-container")
  container.innerHTML = ""
  let filtrados = chefsData

  
  if (filtros.precioMin !== null) {
    filtrados = filtrados.filter(chef => chef.precio >= filtros.precioMin)
  }
  if (filtros.precioMax !== null) {
    filtrados = filtrados.filter(chef => chef.precio <= filtros.precioMax)
  }
  
  if (filtros.tipo) {
    filtrados = filtrados.filter(chef => chef.tipo === filtros.tipo)
  }

  if (filtrados.length === 0) {
    container.innerHTML = "<p>No se encontraron chefs con esos filtros.</p>"
    return
  }

  filtrados.forEach(chef => container.appendChild(crearChefCard(chef)))
}

function configurarFiltros() {
  document.getElementById("filtrar-precio").onclick = () => {
    const min = parseInt(document.getElementById("precio-min").value)
    const max = parseInt(document.getElementById("precio-max").value)
    filtros.precioMin = isNaN(min) ? null : min
    filtros.precioMax = isNaN(max) ? null : max
    mostrarChefsFiltrados()
  }
  document.querySelectorAll(".btn-filtro-tipo").forEach(btn => {
    btn.onclick = () => {
      filtros.tipo = btn.dataset.tipo
      document.querySelectorAll(".btn-filtro-tipo").forEach(b => b.classList.remove("active"))
      btn.classList.add("active")
      mostrarChefsFiltrados()
    }
  })
  document.getElementById("limpiar-filtros").onclick = () => {
    filtros = { precioMin: null, precioMax: null, tipo: null }
    document.getElementById("precio-min").value = ""
    document.getElementById("precio-max").value = ""
    document.querySelectorAll(".btn-filtro-tipo").forEach(b => b.classList.remove("active"))
    mostrarChefsFiltrados()
  }
}

function crearChefCard(chef) {
  const card = document.createElement("div")
  card.className = "chef-card"
  card.innerHTML = `
    <img src="img/${chef.imagen}" alt="${chef.nombre}">
    <h3>${chef.nombre}</h3>
    <p>${chef.especialidad}</p>
    <button class="ver-mas">Ver más</button>
  `
  card.querySelector(".ver-mas").addEventListener("click", () => mostrarDetalleChef(chef))
  return card
}

function mostrarDetalleChef(chef) {
  const detalle = document.getElementById("detalle-chef")
  const contenido = document.getElementById("detalle-contenido")
  detalle.style.display = "block"
  contenido.innerHTML = `
    <h3>${chef.nombre}</h3>
    <img src="img/${chef.imagen}" alt="${chef.nombre}" style="max-width: 300px;">
    <p><strong>Especialidad:</strong> ${chef.especialidad}</p>
    <p>${chef.descripcion}</p>
    <p><strong>Precio:</strong> $${chef.precio}</p>
    <h4>Platos destacados</h4>
    <div class="galeria-platos">
      ${chef.platos.map((plato) => `<img src="img/${plato}" alt="Plato de ${chef.nombre}">`).join("")}
    </div>
    <form id="form-reserva">
      <label for="nombre">Tu nombre</label>
      <input type="text" name="nombre" required>
      <label for="email">Tu email</label>
      <input type="email" name="email" required>
      <label for="fecha">Ingrese la fecha</label>
      <input type="date" name="fecha" required>
      <label for="hora">Ingrese la hora</label>
      <input type="time" name="hora" required>
      <label for="mensaje">Mensaje adicional (opcional)</label>
      <textarea name="mensaje"></textarea>
      <button type="submit">Reservar a ${chef.nombre}</button>
    </form>
    <button id="volver-btn" class="volver-btn">⬅ Volver al catálogo</button>
  `
  document.getElementById("volver-btn").onclick = volverAlCatalogo
  document.getElementById("form-reserva").onsubmit = (e) => reservarChef(e, chef)
  detalle.scrollIntoView({ behavior: "smooth" })
}

async function reservarChef(event, chef) {
  event.preventDefault()
  const form = event.target
  const submitBtn = form.querySelector('button[type="submit"]')
  const originalText = submitBtn.textContent
  submitBtn.disabled = true
  submitBtn.textContent = "Enviando..."

  const formData = new FormData(form)
  const reserva = {
    id: Date.now(),
    chef: chef.nombre,
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    fecha: formData.get("fecha"),
    hora: formData.get("hora"),
    mensaje: formData.get("mensaje") || "",
    precio: chef.precio,
    fechaCreacion: new Date().toISOString(),
  }

  try {
    agregarReserva(reserva)
    mostrarReservas()
    document.getElementById("reserva-lateral").classList.remove("cerrado")

    const emailData = {
      access_key: "9934d107-d809-40ff-8b71-3f1c4a641693",
      name: reserva.nombre,
      email: reserva.email,
      subject: `Nueva Reserva de Chef - ${chef.nombre}`,
      message: `
NUEVA RESERVA DE CHEF

Chef: ${chef.nombre}
Especialidad: ${chef.especialidad}
Precio: $${chef.precio}

DATOS DEL CLIENTE:
• Nombre: ${reserva.nombre}
• Email: ${reserva.email}
• Fecha: ${reserva.fecha}
• Hora: ${reserva.hora}

Mensaje adicional:
${reserva.mensaje || "Sin mensaje adicional"}

---
Reserva realizada el: ${new Date().toLocaleString()}
      `,
      from_name: "Chef en Casa - Sistema de Reservas",
      to: "tobinabel@gmail.com",
    }

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    })
    const result = await response.json()

    if (result.success) {
      alert("Reserva guardada correctamente")
      form.reset()
    } else {
      throw new Error(result.message || "Error al enviar email")
    }
  } catch (error) {
  console.error("Error:", error)
  alert("Error al guardar la reserva")
} finally {
    submitBtn.disabled = false
    submitBtn.textContent = originalText
  }
}

function mostrarReservas() {
  const lista = document.getElementById("lista-reservas")
  lista.innerHTML = ""
  obtenerReservas().forEach((r, index) => {
    const li = document.createElement("li")
    const texto = document.createElement("span")
    texto.textContent = `Con ${r.chef} el ${r.fecha} a las ${r.hora}`

    const contenedorBotones = document.createElement("div")
    contenedorBotones.className = "botones-reserva"
    contenedorBotones.style.display = "flex"
    contenedorBotones.style.gap = "6px"

    const botonEditar = document.createElement("button")
    botonEditar.textContent = "Editar"
    botonEditar.className = "editar-btn"
    botonEditar.onclick = () => editarReserva(index, r)

    const botonEliminar = document.createElement("button")
    botonEliminar.textContent = "Eliminar"
    botonEliminar.className = "cancelar-btn"
    botonEliminar.onclick = () => eliminarReserva(index)

    contenedorBotones.appendChild(botonEditar)
    contenedorBotones.appendChild(botonEliminar)

    li.appendChild(texto)
    li.appendChild(contenedorBotones)
    lista.appendChild(li)
  })
}


function volverAlCatalogo() {
  document.getElementById("chefs").scrollIntoView({ behavior: "smooth" })
  document.getElementById("detalle-chef").style.display = "none"
}


function configurarBotones() {
  document.getElementById("toggle-reservas").addEventListener("click", () => {
    document.getElementById("reserva-lateral").classList.toggle("cerrado")
  })
  const faqBtn = document.getElementById("faq-btn")
  if (faqBtn) {
    faqBtn.addEventListener("click", () => {
      document.getElementById("faq-panel").classList.toggle("hidden")
    })
  }
}

document.getElementById("cerrar-reservas").addEventListener("click", () => {
  document.getElementById("reserva-lateral").classList.add("cerrado")
})

window.addEventListener("scroll", () => {
  const btn = document.getElementById("btn-top")
  if (btn) {
    if (window.scrollY > 200) {
      btn.style.display = "block"
    } else {
      btn.style.display = "none"
    }
  }
})
const btnTop = document.getElementById("btn-top")
if (btnTop) {
  btnTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  })
}