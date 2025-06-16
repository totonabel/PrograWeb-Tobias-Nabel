document.addEventListener("DOMContentLoaded", () => {
  inicializarApp()
})

async function inicializarApp() {
  await cargarChefs()
  mostrarReservas()
  configurarBotones()
}

// CRUD de reservas en localStorage
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
  mostrarToast("Reserva eliminada")
}

// UI: Chefs y detalle
async function cargarChefs() {
  try {
    const res = await fetch("data/chefs.json")
    const chefs = await res.json()
    const container = document.getElementById("chef-container")
    container.innerHTML = ""
    chefs.forEach((chef) => container.appendChild(crearChefCard(chef)))
  } catch (err) {
    console.error("Error cargando chefs:", err)
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

// Reservar chef y enviar email
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
      document.getElementById("modal-confirmacion").classList.remove("hidden")
      form.reset()
      mostrarToast("✅ Email enviado correctamente")
    } else {
      throw new Error(result.message || "Error al enviar email")
    }
  } catch (error) {
    console.error("Error:", error)
    mostrarToast("⚠️ Reserva guardada, pero error al enviar email")
    document.getElementById("modal-confirmacion").classList.remove("hidden")
  } finally {
    submitBtn.disabled = false
    submitBtn.textContent = originalText
  }
}

// Mostrar reservas en el lateral
function mostrarReservas() {
  const lista = document.getElementById("lista-reservas")
  lista.innerHTML = ""
  obtenerReservas().forEach((r, index) => {
    const li = document.createElement("li")
    const texto = document.createElement("span")
    texto.textContent = `Con ${r.chef} el ${r.fecha} a las ${r.hora}`
    const boton = document.createElement("button")
    boton.textContent = "Eliminar"
    boton.className = "cancelar-btn"
    boton.onclick = () => eliminarReserva(index)
    li.appendChild(texto)
    li.appendChild(boton)
    lista.appendChild(li)
  })
}

// Utilidades UI
function mostrarToast(mensaje) {
  const toast = document.getElementById("toast")
  toast.textContent = mensaje
  toast.classList.remove("hidden")
  toast.classList.add("visible")
  setTimeout(() => {
    toast.classList.remove("visible")
    toast.classList.add("hidden")
  }, 3000)
}

function volverAlCatalogo() {
  document.getElementById("chefs").scrollIntoView({ behavior: "smooth" })
  document.getElementById("detalle-chef").style.display = "none"
}

function cerrarModal() {
  document.getElementById("modal-confirmacion").classList.add("hidden")
  volverAlCatalogo()
}

// Botones y paneles
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





// Mostrar/ocultar botón "Volver arriba"
window.addEventListener("scroll", () => {
  const btn = document.getElementById("btn-top")
  if (window.scrollY > 200) {
    btn.style.display = "block"
  } else {
    btn.style.display = "none"
  }
})
document.getElementById("btn-top").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" })
})
