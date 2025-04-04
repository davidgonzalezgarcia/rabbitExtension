document.getElementById("btn").addEventListener("click", (ev) => {
    ev.preventDefault();

    chrome.runtime.sendMessage(
        { action: "resume" }, // Cambiar a la acción deseada: "resume", "search" o "generate"
        (response) => {
            if (response.action === "resume") {
                document.getElementById("result").innerText = response.result;
            } else if (response.action === "error") {
                document.getElementById("result").innerText = "Error:"+ response.message;
            }
        }
    );
});

