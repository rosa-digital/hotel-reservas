const path = require("path");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");

const app = express();


app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));



// CONEXION NEON

const pool = new Pool({

    connectionString: process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false
    }

});



// PRUEBA BD

pool.query("SELECT NOW()", (error, result)=>{

    if(error){

        console.log("ERROR BASE DE DATOS:");
        console.log(error);

    }else{

        console.log("BASE DE DATOS CONECTADA");
        console.log(result.rows);

    }

});





// CORREO

const transporter = nodemailer.createTransport({

    service:"gmail",

    auth:{

        user:process.env.EMAIL_USER,

        pass:process.env.EMAIL_PASS

    }

});




transporter.verify((error)=>{

    if(error){

        console.log("ERROR CORREO:");
        console.log(error);

    }else{

        console.log("Correo listo");

    }

});





// PAGINA

app.get("/",(req,res)=>{

    res.sendFile(
        path.join(__dirname,"public","index.html")
    );

});







// RESERVAS

app.post("/reservas", async(req,res)=>{


console.log("DATOS RECIBIDOS:");
console.log(req.body);



try{


const {

nombre,
correo,
telefono,
checkin,
checkout,
adultos,
ninos,
habitacion,
solicitudes

}=req.body;





if(
!nombre ||
!correo ||
!telefono ||
!checkin ||
!checkout ||
!habitacion
){

return res.status(400).json({

error:"Completa todos los campos"

});

}






const entrada = new Date(checkin + "T00:00:00");

const salida = new Date(checkout + "T00:00:00");



if(salida <= entrada){

return res.status(400).json({

error:"Fecha inválida"

});

}





const noches = Math.round(

(salida - entrada) /
(1000 * 60 * 60 * 24)

);





const numero = "RES-" + Date.now();






console.log("Guardando en Neon...");



await pool.query(

"INSERT INTO reservas (numero,nombre,correo,telefono,checkin,checkout,adultos,ninos,habitacion,solicitudes,noches) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",


[

numero,
nombre,
correo,
telefono,
checkin,
checkout,
adultos || 1,
ninos || 0,
habitacion,
solicitudes || "",
noches

]

);




console.log("Reserva guardada");






// ENVIO CORREO


try{


await transporter.sendMail({

from:process.env.EMAIL_USER,

to:correo,

subject:"Confirmación de reserva",


text:

"Hola " + nombre +

"\n\nTu reserva fue registrada correctamente." +

"\n\nNúmero: " + numero +

"\n\nHabitación: " + habitacion +

"\n\nCheck-in: " + checkin +

"\n\nCheck-out: " + checkout +

"\n\nNoches: " + noches +

"\n\nGracias por hospedarte con nosotros."


});



console.log("Correo enviado a:",correo);



}catch(errorCorreo){


console.log("ERROR EN CORREO:");

console.log(errorCorreo);


}






res.json({

ok:true,

numero:numero,

noches:noches

});





}catch(error){


console.log("ERROR SERVIDOR:");

console.log(error);



res.status(500).json({

error:"Error servidor"

});


}



});







const PORT = process.env.PORT || 3000;



app.listen(PORT,()=>{


console.log(

"Servidor funcionando en http://localhost:" + PORT

);


});