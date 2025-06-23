function togglePassword() {
            const passwordInput = document.getElementById('password');
            const showBtn = document.querySelector('.show-password-btn');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                showBtn.textContent = 'Ocultar';
            } else {
                passwordInput.type = 'password';
                showBtn.textContent = 'Mostrar';
            }
        }

        