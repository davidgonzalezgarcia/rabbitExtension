/*ALMACEBAR CLAVES */
import  dotenv  from "dotenv";
dotenv.config();
console.log(process.env.DATABASE_INSTANCE);

//Express para levabntar el servidor
import express from "express";
import cors from "cors";

const app = express();

app.use(express.json()); // Para manejar solicitudes con JSON
app.use(express.urlencoded({ extended: true })); // Para manejar solicitudes con datos codificados en URL
app.use(cors()); // Para permitir solicitudes de diferentes dominios
app.use(express.json({ limit: '5mb' }));


//Para encriptar la contraseña y funciones de validacion
import bccrypt from "bcrypt";
import { isValidEmail, isValidPassword } from "./syncFunctions.js";

//Servidor SMTP para enviar correos
import nodemailer from "nodemailer";
const transponder = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
})

//Manejar BBDD
import { createConnection } from "mysql2";

const connection = createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: "",
  database: process.env.DATABASE_INSTANCE,
});

connection.connect((error) => {
    if (error) {
        console.error('Error de conexión a la base de datos:', error);
        process.exit(1);  // Detenemos el servidor si no se puede conectar a la BBDD
    } else {
        console.log('Conexión exitosa a la base de datos.');
    }
});

//Instanciamos la IA
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const chat = await ai.chats.create({
    model: "gemini-1.5-flash",
    config: {
      systemInstruction: `
                        You are an advanced assistant using web content as your primary context.

                        Instructions:
                        If asked for a summary, extract key points and provide a concise, accurate summary.
                        If the user is searching for specific information, return the most relevant sections.
                        If asked to generate or transform code, use best practices and provide functional examples.
                        If asked for an explanation, provide a structured, content-based response.
                        
                        Avoid irrelevant information; use only what's necessary from the content.
                        Prioritize clarity, accuracy, and helpfulness.

                        Think step-by-step and act as an expert in the field.
                      `,

    }
  });

//Web Token para autenticar al usuario
import jwt from "jsonwebtoken";


/* 
------------------------
LOGICA DEL SERVIDOR 
------------------------    

*/

//VARIABLES DEL USUARIO


app.post("/webContent", async (req, res)=>{

    if (!req.body.content) {
        return res.status(400).send("Contenido no encontrado");
    } 
        
    const content = req.body.content;
    const url = req.body.url;

    const response = chat.sendMessage({
        message: "El contenido de la pagina web sobre la que vas a trabajar es el siguiente: " +content,
    });

    if (response.error) {
        return res.status(500).send("Error al procesar el contenido");        
    }

    //Si el usuario está logueado, guardamos el contenido en la base de datos
    

    res.status(200).send("Contenido recibido y procesado correctamente");
})

app.post("/", async (req, res)=>{

    res.setHeader('Content-Type', 'text/plain; charset=utf8'); 
    res.setHeader('Transfer-Encoding', 'chunked');

    let input = req.body.input

    const stream = await chat.sendMessageStream({ message: input })
    
    for await (const chunk of stream){
        res.write(chunk.text);
    }

    res.end();
})

app.get("/resume", async (req, res)=>{
 
    res.setHeader('Content-Type', 'text/plain; charset=utf-8'); 
    res.setHeader('Transfer-Encoding', 'chunked');
    
    try {
        const stream = await chat.sendMessageStream({ message: "Resume el contenido de la web" });


        for await (const chunk of stream){
            res.write(chunk.text);
        }
    
        res.end();
        
    } catch (error) {
        console.log("Error al resumir el contenido:", error);
        res.status(500).send("Error al resumir el contenido");
    }

    
})


app.post("/search", async (req, res)=>{

    res.setHeader('Content-Type', 'text/plain; charset=utf-8'); 
    res.setHeader('Transfer-Encoding', 'chunked');

    const searchInput = req.body.searchInput;

    const stream = chat.sendMessageStream({ message: "Dime todo lo que salga en la web acerca de: "+searchInput })

    for await (const chunk of stream){
        res.write(chunk.text);
    }

    res.end();
    
})

app.get("/generate", async (req, res)=>{
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const prompt = req.query.prompt;
    const lang = req.query.lang;

    const stream = chat.sendMessageStream({ message: "Genera codigo en base al contenido,especificamente,"+ prompt +" en lenguaje "+lang })
    
    for await (const chunk of stream){
        res.write(chunk.text);
    }

    res.end();
})

app.post("/login",(req, res)=>{

    const email = req.body.email
    const password = req.body.password

    //Verificamos si el usuario existe
    connection.query("SELECT * FROM users WHERE email = ?", [email], (error, resultados) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Ha ocurrido un error al verificar el usuario");
        }

        if (resultados.length === 0) {
            return res.status(404).send("El usuario no existe");
        }

        const user = resultados[0];

        // Comparamos la contraseña si es matematicamente correcta
        const isPasswordValid = bccrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send("Contraseña incorrecta");
        }

        //Generamos el jwt
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_PASS,
            { expiresIn: '60d' } 
        )

        res.status(200).json({
            mensaje: "Usuario logueado correctamente",
            token: token,
            user: {
                id: user.id,
                email: user.email,
            },
        })
    });

})

app.post("/register",(req, res)=>{
        
        const email = req.body.email
        const password = req.body.password        

        //Comprobamos minimamente el email y la contraseña
        if (!isValidEmail(email)){
            return res.status(500).send("El email no es valido")
        }
        if (!isValidPassword(password)){
            return res.status(500).send("La contraseña no es valida")
        }

        //Comprobamos si el usuario ya existe
        connection.query("SELECT * FROM users WHERE email = ?", [email], (error, resultados)=>{
            
            if(error){
                console.error(error);
                return res.status(500).send("Ha ocurrido un error al comprobar el usuario");
            }

            if (resultados.length > 0){
                return res.status(500).send("El usuario ya existe");                
            } else {

                //Encriptamos la contraseña
                let salt = bccrypt.genSaltSync(6);
                let passwordHash = bccrypt.hashSync(password, salt)
                
                //Insertamos el usuario en la base de datos
                connection.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, passwordHash], (error, resultados)=>{
                    if (error){
                        console.error(error);
                        return res.status(500).send("Ha ocurrido un error al registrar el usuario");
                    } else {
                        
                        //Metemos el JWT
                        const token = jwt.sign(
                            { id: resultados.insertId, email: email },
                            process.env.JWT_PASS,
                            { expiresIn: '60d' } 
                        )
                        
                        transponder.sendMail({
                            from: "david10alhama@gmail.com",
                            to: email,
                            subject: "Bienvenido a Rabbit AI",
                            html: `
                            <html>
                                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                                <h1 style="color:rgb(117, 56, 204);">¡Bienvenido a Rabbit AI!</h1>
                                <p>Hola,${email}</p>
                                <p>Gracias por registrarte en Rabbit AI. Estamos emocionados de tenerte a bordo.</p>
                                <p>Con Rabbit AI, tendrás acceso a herramientas avanzadas que te ayudarán a aprovechar al máximo la inteligencia artificial.
                                Si tienes duda o quieres conocer como funciona Rabbit AI en profundidad visita <a href="rabbit.com">Nuestra web </a></p>
                                <p>¡Esperamos que disfrutes de la experiencia!</p>
                                <br>
                                <p>Saludos</p>
                                <p>El equipo de Rabbit AI :)</p>
                                </body>
                            </html>
                            `
                        })
                        
                        res.status(200).json({
                            mensaje: "Usuario registrado correctamente",
                            token: token,
                            user: {
                                id: resultados.insertId,
                                email: email,
                            },
                        })
                    }
                    
                })
            }

        })

})

const PORT = process.env.PORT ?? 3000

app.listen(3000, ()=>{
    console.log(`Servidor escuchando por el puerto http://localhost:${PORT}`);
    
})