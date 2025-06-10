const inputBuscar = document.getElementById('buscar');
        const filas = document.querySelectorAll('#tableSearch tbody tr');

        inputBuscar.addEventListener('keyup', () => {
            const textoBusqueda = inputBuscar.value.toLowerCase();

            filas.forEach(fila => {
                const textoFila = fila.textContent.toLowerCase();
                fila.style.display = textoFila.includes(textoBusqueda) ? '' : 'none';
            });
        });