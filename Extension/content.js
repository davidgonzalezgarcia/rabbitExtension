chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getText") {

        let texto= document.body.innerText;

        textoLimpio = texto
            .replace(/\s+/g, " ")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .trim();
            
        sendResponse({ content: textoLimpio });
        return true;
    }
});
    