document.addEventListener("DOMContentLoaded", async () => {

    const SERVER_URL = "http://localhost:3000";

    window.document.getElementById("resume").addEventListener("click", async (ev) => {
        ev.preventDefault()
       
         const outputMsg = document.createElement("div");
            outputMsg.className = "output";
            outputMsg.innerText = "Cargando...";
            
            chat.appendChild(outputMsg);

            chat.scrollTop = chat.scrollHeight;
        
        const response = await fetch(SERVER_URL + "/resume", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        outputMsg.innerText = " ";

        if (!response.ok) {
            outputMsg.innerText = "Error al cargar el resumen";
            return;
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            outputMsg.innerText += chunk;
        }

    });


    /* -----------------ENVIAR MENSAJE --------------------- */
    async function preguntarPrompt(ev) {
        ev.preventDefault();
    
        const promptValue = document.getElementById("prompt").value.trim();
        
        if (promptValue==null || promptValue===""){
            return;
        }
        
        // Añadir mensaje del usuario
            const chat = document.getElementById("chat");
            
            const userMsg = document.createElement("div");
            userMsg.className = "userInput";
            userMsg.innerText = promptValue;
            
            chat.appendChild(userMsg);
    
        // Limpiar el input
            document.getElementById("prompt").value = "";
    
        // Añadir mensaje de espera
            const outputMsg = document.createElement("div");
            outputMsg.className = "output";
            outputMsg.innerText = "Cargando...";
            
            chat.appendChild(outputMsg);
    
            chat.scrollTop = chat.scrollHeight;
        
        // Enviar petición al servidor
            const response = await fetch(SERVER_URL + "/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input: promptValue })
            });
    
            if (!response.ok) {
                outputMsg.innerText = "Error al cargar la respuesta.";
                return;
            }
    
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
    
            outputMsg.innerText = "";
    
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                outputMsg.innerText += chunk;
                chat.scrollTop = chat.scrollHeight;
            }
        
    }


    window.document.getElementById("send").addEventListener("click", preguntarPrompt);
    window.document.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault(); // Evitar el salto de línea
            preguntarPrompt(ev);
        }
    });

        /* ---------- BUSCAR --------*/
        document.getElementById("search").addEventListener("click", async (ev) => {
            ev.preventDefault();

            const searchInput = document.getElementById("prompt").value.trim();
            
            const chat = document.getElementById("chat");
            const outputMsg = document.createElement("div");
            outputMsg.className = "output";
            outputMsg.innerText = "Buscando...";
            chat.appendChild(outputMsg);
            
            chat.scrollTop = chat.scrollHeight;

            const response = await fetch(SERVER_URL + "/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ searchInput: searchInput })
            });

            if (!response.ok) {
                outputMsg.innerText = "Error al buscar.";
                return;
            }

            outputMsg.innerText = "";

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                outputMsg.innerText += chunk;
                chat.scrollTop = chat.scrollHeight;
            }
        });

        /**ANIMACIONES */
        const menuIcon = document.getElementById('menu');
        const dropdown = document.getElementById('dropdownMenu');

        menuIcon.addEventListener('click', () => {
            dropdown.classList.toggle('show');
        });

        //Cerrar el menú al hacer clic en una opción
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                dropdown.classList.remove('show');
            });
        });

        //Informar del resumen
        document.getElementById("resume").addEventListener("mouseenter", (ev) => {
            document.getElementById("prompt").placeholder = "Click para resumir el contenido";
        });

        document.getElementById("resume").addEventListener("mouseleave", (ev) => {
            document.getElementById("prompt").placeholder = "Pregunta algo...";
        });


        //PEDIR LA BUSQUEDA
        document.getElementById("search").addEventListener("mouseenter", (ev) => {
            document.getElementById("prompt").placeholder = "Introduce que quieres buscar";
        });

        document.getElementById("search").addEventListener("mouseleave", (ev) => {
            document.getElementById("prompt").placeholder = "Pregunta algo...";
        });

        /* FIN DE ANIMACIONES */
        document.getElementById("web").addEventListener("click", (ev) => {
            window.open("https://github.com/davidgonzalezgarcia/rabbitExtension");
        });

    });
    
    
    /* JS DE LA PAGINA Y FUNCIONES QUE NO REQUIEREN LLAMADAS  */
    //Perfil
    document.getElementById("login").addEventListener("click", async (event)=>{
        
        event.preventDefault();
        
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        const response = await fetch(SERVER_URL+"/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password })
        })
        
        if(response.status!=200){
            
            const responseText = await response.text();
            
            document.getElementById("output").innerText = "Ha ocurrido un problema al Iniciar Sesión: "+responseText;
        } else {
            
        //Acceder al login y cargar historico de chats
        const data = await response.json();
        const token = data.token;
        
        localStorage.setItem("token", token);
    }
    
});

document.getElementById("register").addEventListener("click", async (ev)=>{
    
    ev.preventDefault();
    
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    const response = await fetch(SERVER_URL+"/register",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({email: email, password: password})
        
    })
    
    if (response.status!=200) {
        const responseText = await response.text();
        document.getElementById("output").innerText = "Ha ocurrido un problema al Iniciar Sesión: "+responseText;
    } else {
        
        //Acceder al login y cargar historico de chats
        const data = await response.json();
        const token = data.token;
        
        localStorage.setItem("token", token);
        
    }
    
})

