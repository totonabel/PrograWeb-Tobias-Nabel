fetch("data/chefs.json")
  .then((res) => res.json())
  .then((chefs) => {
    const container = document.getElementById("chef-container")
    const detalle = document.getElementById("detalle-chef")
    const contenido = document.getElementById("detalle-contenido")

    chefs.forEach((chef) => {
      const card = document.createElement("div")
      card.className = "chef-card"
      card.innerHTML = `
        <img src="img/${chef.imagen}" alt="${chef.nombre}">
        <h3>${chef.nombre}</h3>
        <p>${chef.especialidad}</p>
        <button class="ver-mas">Ver más</button>
      `

      card.querySelector(".ver-mas").addEventListener("click", () => {
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

          <!-- FORMULARIO SIMPLIFICADO -->
          <form method="POST" action="https://formsubmit.co/tobinabel@gmail.com" id="form-reserva">
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

            <input type="hidden" name="chef" value="${chef.nombre}">
            <input type="hidden" name="_captcha" value="false">
            <input type="hidden" name="_next" value="gracias.html">
            <input type="hidden" name="_subject" value="Nueva Reserva de Chef - ${chef.nombre}">

            <button type="submit">Reservar a ${chef.nombre}</button>
          </form>

          <button onclick="volverAlCatalogo()" class="volver-btn">⬅ Volver al catálogo</button>
        `

       
        const form = document.getElementById("form-reserva")
        form.addEventListener("submit", (event) => {
         

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

          const reservas = JSON.parse(localStorage.getItem("reservas")) || []
          reservas.push(reserva)
          localStorage.setItem("reservas", JSON.stringify(reservas))

          mostrarReservas()
          mostrarToast("✅ Reserva guardada")
          document.getElementById("reserva-lateral").classList.remove("cerrado")

          
        })

        detalle.scrollIntoView({ behavior: "smooth" })
      })

      container.appendChild(card)
    })
  })
  .catch((err) => console.error("Error cargando chefs:", err))

function mostrarReservas() {
  const lista = document.getElementById("lista-reservas")
  lista.innerHTML = ""
  const reservas = JSON.parse(localStorage.getItem("reservas")) || []

  reservas.forEach((r, index) => {
    const li = document.createElement("li")
    const texto = document.createElement("span")
    texto.textContent = `Con ${r.chef} el ${r.fecha} a las ${r.hora}`
    const boton = document.createElement("button")
    boton.textContent = "Eliminar"
    boton.className = "cancelar-btn"
    boton.onclick = () => cancelarReserva(index)
    li.appendChild(texto)
    li.appendChild(boton)
    lista.appendChild(li)
  })
}

function cancelarReserva(index) {
  const reservas = JSON.parse(localStorage.getItem("reservas")) || []
  reservas.splice(index, 1)
  localStorage.setItem("reservas", JSON.stringify(reservas))
  mostrarReservas()
  mostrarToast("Reserva eliminada")
}

document.addEventListener("DOMContentLoaded", mostrarReservas)

document.getElementById("toggle-reservas").addEventListener("click", () => {
  const panel = document.getElementById("reserva-lateral")
  panel.classList.toggle("cerrado")
})

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
}


if (document.getElementById("faq-btn")) {
  document.getElementById("faq-btn").addEventListener("click", () => {
    document.getElementById("faq-panel").classList.toggle("hidden")
  })
}
