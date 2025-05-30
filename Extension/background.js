async function mandarTexto(tabId) {
    try {
        // Inyectar el content script antes de enviar el mensaje
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });

        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });

        const tab = await chrome.tabs.get(tabId);
        const url = new URL(tab.url);

        const response = await chrome.tabs.sendMessage(tabId, { action: "getText" });

        console.log(response.content);
        
        let serverResponse;

        if (response && response.content) {
            serverResponse = await fetch("http://localhost:3000/webContent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: response.content, url: url.href })
            });
        }
        
        let text = await serverResponse.text();

        console.log(text);

    } catch (error) {
        console.error("No se pudo obtener texto del content script:", error);
    }
}

// Cuando se actualiza una pestaña
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        mandarTexto(tabId);
    }
});

// Cuando el usuario cambia de pestaña
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    mandarTexto(activeInfo.tabId);
});
