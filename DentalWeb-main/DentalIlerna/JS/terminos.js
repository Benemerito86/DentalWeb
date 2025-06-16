    const verPdf = document.getElementById("verPdf");
    const modal = document.getElementById("modalPdf");
    const cerrarModal = document.getElementById("cerrarModal");
    const checkbox = document.getElementById("aceptar");
    const boton = document.getElementById("continuar");

    verPdf.addEventListener("click", function(e) {
      e.preventDefault();
      modal.style.display = "block";
    });

    cerrarModal.addEventListener("click", function() {
      modal.style.display = "none";
      checkbox.disabled = false; // Habilita el checkbox al cerrar el modal
    });

    window.addEventListener("click", function(e) {
      if (e.target == modal) {
        modal.style.display = "none";
        checkbox.disabled = false;
      }
    });

    checkbox.addEventListener("change", function () {
      boton.disabled = !this.checked;
    });
     function togglePassword() {
            const passwordInput = document.getElementById('contrasena');
            const showBtn = document.querySelector('.show-password-btn');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                showBtn.textContent = 'Ocultar';
            } else {
                passwordInput.type = 'password';
                showBtn.textContent = 'Mostrar';
            }
        }