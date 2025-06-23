emailjs.init("hJe5jMqLkM47TiuTC"); // Tu PUBLIC KEY (User ID)

const form = document.getElementById("contactForm");
const status = document.getElementById("status");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  status.textContent = "Enviando...";

const email = document.getElementById("email").value;
const passcode = Math.floor(100000 + Math.random() * 900000);

const now = new Date();
now.setMinutes(now.getMinutes() + 15);

const hours = now.getHours().toString().padStart(2, '0');
const minutes = now.getMinutes().toString().padStart(2, '0');

const time = `${hours}:${minutes}`;

const params = {
  email: email,
  passcode: passcode,
  time: time
};

  emailjs
    .send("service_tuh33i1", "template_dc6fh3b", params)
    .then(() => {
      status.textContent = "¡Correo enviado!";
      form.reset();
      window.open(`recordarContrasena2.html?email=${encodeURIComponent(email)}&passcode=${passcode}`);

    })
    .catch((err) => {
      status.textContent = "Error: " + JSON.stringify(err);
      console.error(err);
    });
});
