const formulario = document.getElementById("formReserva");

formulario.addEventListener("submit", async (e)=>{

e.preventDefault();


const data = {

nombre: document.getElementById("nombre").value,

correo: document.getElementById("correo").value,

telefono: document.getElementById("telefono").value,

checkin: document.getElementById("checkin").value,

checkout: document.getElementById("checkout").value,

adultos: document.getElementById("adultos").value,

ninos: document.getElementById("ninos").value,

habitacion: document.getElementById("habitacion").value,

solicitudes: document.getElementById("solicitudes").value

};



console.log("ENVIANDO:", data);



const respuesta = await fetch("/reservas",{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(data)

});



const resultado = await respuesta.json();


console.log(resultado);



document.getElementById("mensaje").textContent = resultado.ok

? "Reserva creada: " + resultado.numero

: resultado.error;



});
