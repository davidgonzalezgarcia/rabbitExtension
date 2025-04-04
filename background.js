//DOM DE PESTAÑA Y  Maneja eventos, lógica de la extensión y peticiones a servidores

const SERVER_URL = "http://localhost:3000/api";

let contenidoWeb = "";

//recibimos contenido del content.js
chrome.runtime.onMessage.addListener((request) => {
    if (request.action == "sendText") {
        contenidoWeb = request.content;
    }
});

//procesamos las peticiones de la página de extensión
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  if (message.action == "resume") {
    // Realizar una solicitud al servidor para obtener un resumen del contenido
    fetch(`${SERVER_URL}/resume`, {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: contenidoWeb }) // Enviamos el contenido web como texto
    })
    .then(response => response.json())
    .then(data => {
        // Enviar la respuesta del servidor de vuelta a la extensión
        sendResponse({ action: "resume", result: data });
    })
    .catch(error => {
        console.log("Error al obtener el resumen:", error);
        sendResponse({ action: "error", message: "Hubo un error al obtener el resumen." });
    });

    // Asegúrate de retornar `true` para que el `sendResponse` funcione asincrónicamente
    return true;
  }

  if (message.action == "search") {
    // Realizar una búsqueda en el servidor
    fetch(`${SERVER_URL}/search`, {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: contenidoWeb,
                             prompt: content })
    })
    .then(response => response.json())
    .then(data => {
        // Enviar los resultados de la búsqueda
        sendResponse({ action: "search", result: data });
    })
    .catch(error => {
        console.log("Error al realizar la búsqueda:", error);
        sendResponse({ action: "error", message: "Hubo un error al realizar la búsqueda." });
    });

    // Asegúrate de retornar `true` para que el `sendResponse` funcione asincrónicamente
    return true;
  }

  if (message.action == "generate") {
    // Realizar una solicitud para generar contenido o realizar alguna acción
    fetch(`${SERVER_URL}/generate`, {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: contenidoWeb }) // Enviamos el contenido web para generar algo
    })
    .then(response => response.json())
    .then(data => {
        // Enviar la respuesta de la generación al front-end de la extensión
        sendResponse({ action: "generate", result: data });
    })
    .catch(error => {
        console.log("Error al generar contenido:", error);
        sendResponse({ action: "error", message: "Hubo un error al generar contenido." });
    });

    // Asegúrate de retornar `true` para que el `sendResponse` funcione asincrónicamente
    return true;
  }

});
