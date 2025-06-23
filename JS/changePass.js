// Obtener parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get("email");
const passcode = urlParams.get("passcode");

const form = document.getElementById("contactForm");
const status = document.getElementById("status");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const userOTP = document.getElementById("otp").value;
  const password = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;

  if (userOTP !== passcode) {
    status.textContent = "❌ Código OTP incorrecto.";
    return;
  }

  if (password !== password2) {
    status.textContent = "❌ Las contraseñas no coinciden.";
    return;
  }

  if (password.length < 6) {
    status.textContent = "❌ La contraseña debe tener al menos 6 caracteres.";
    return;
  }

  // Aquí podrías enviar la nueva contraseña al servidor si tienes backend
  // Por ahora, solo mostramos mensaje de éxito
  status.textContent = "✅ Contraseña actualizada correctamente.";
  form.reset();

  // Opcional: Redirigir al login después de 3 segundos
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1000);
});
