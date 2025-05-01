//Api key para Gemini 1.5 de Google
import { GoogleGenAI } from "@google/genai";
import fs from "node:fs/promises"
import  readline  from "node:readline/promises";


const APIKEY = "AIzaSyA8E1qy-6S3OFCzsUW2x7RzDRD83GagymI"
const ai = new GoogleGenAI({ apiKey: APIKEY });

/**PARA CONF TERMINAL */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});


async function main() {  
  
  let contenido="";

  try {  
    contenido = await fs.readFile("content.txt", { encoding: 'utf8' });
    console.log("IA Inicializada, contenido leido de content.txt");
  
  } catch (err) {
    console.error(err.message, "Error al leer el archivo content.txt");
  }
  
  const chat = await ai.chats.create({
    model: "gemini-1.5-flash",
    config: {
      systemInstruction: `
                        You are an advanced assistant using web content as your primary context.

                        Instructions:
                        - If asked for a summary, extract key points and provide a concise, accurate summary.
                        - If the user is searching for specific information, return the most relevant sections.
                        - If asked to generate or transform code, use best practices and provide functional examples.
                        - If asked for an explanation, provide a structured, content-based response.
                        - Always format your answers clearly (bullet points, markdown, or code blocks when appropriate).
                        - Avoid irrelevant information; use only what's necessary from the content.
                        - Prioritize clarity, accuracy, and helpfulness.

                        Think step-by-step and act as an expert in the field.
                      `,

    }
  });
  
  /* PROMP INICIAL CON EL QUE SE PASA EN CONTENIDO DE LA WEB */
await chat.sendMessage({
  message: "El contenido de la pagina web sobre la que vas a trabajar es el siguiente: " + contenido
  })

  async function ask() {

    const input = await rl.question(">Pregunta: ");

    const stream = await chat.sendMessageStream({ message: input });
  
    process.stdout.write("IA: ");
    
    for await (const chunk of stream) {
      process.stdout.write(chunk.text);
    }
    console.log("\n\n\n");

    ask();
  }

ask();  

}

main()