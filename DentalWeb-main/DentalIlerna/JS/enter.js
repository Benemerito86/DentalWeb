
        // Escuchar el submit y validar con backend
        document.getElementById('loginForm').addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            const errorMsg = document.getElementById('errorMsg');
            errorMsg.style.display = 'none';
            errorMsg.textContent = '';

            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ mail: email, contrasena: password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Guardar userId y rol
                    localStorage.setItem('userId', data.userId); // opcional

                    localStorage.setItem('rol', data.rol); // opcional

                    alert(`✅ Login exitoso ${data.userId}`);

                    // Redirigir al inicio correspondiente por rol
                    window.location.href = `${data.rol}/inicio.html`;
                } else {
                    errorMsg.style.display = 'block';
                    errorMsg.textContent = data.error || 'Error desconocido';
                }

            } catch (error) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Error conectando con el servidor.';
                console.error(error);
            }
        });