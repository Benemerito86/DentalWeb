const abrirPDF = document.getElementById('abrirPDF');
const modalPDF = document.getElementById('modalPDF');
const cerrarPDF = document.getElementById('cerrarPDF');

abrirPDF.addEventListener('click', function(e) {
  e.preventDefault();
  modalPDF.style.display = 'flex';
  document.body.classList.add('modal-open');
});

cerrarPDF.addEventListener('click', function() {
  modalPDF.style.display = 'none';
  document.body.classList.remove('modal-open');
});

    // Evita cerrar el modal al hacer clic fuera (opcional)
modalPDF.addEventListener('click', function(e) {
  if (e.target === modalPDF) {
        // No cerramos el modal si el usuario hace clic fuera del contenido
        // (Descomenta para permitirlo)
        // modalPDF.style.display = 'none';
        // document.body.classList.remove('modal-open');
  }
});