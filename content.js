// Mejorar limpieza de texto
const texto = document.body.innerText;
let textoLimpio = texto
    .replace(/\s+/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Eliminar caracteres invisibles
    .trim();

chrome.runtime.sendMessage({ 
    action: "sendText", 
    content: textoLimpio 
});