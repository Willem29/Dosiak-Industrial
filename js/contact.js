 
  // Inicializar EmailJS con tu PUBLIC KEY
  (function() {
    emailjs.init("Bq3LHly4uHlOQhqNE"); 
  })();

  const form = document.getElementById("contactForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Deshabilitar el botón mientras se envía (opcional)
    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Enviando...";

    emailjs.sendForm("service_bcqsk0p", "template_f6xc2hv", "#contactForm")
      .then(function () {
        alert("✅ Tu mensaje fue enviado correctamente. Pronto nos pondremos en contacto.");
        form.reset();
        button.disabled = false;
        button.textContent = "Enviar mensaje";
      }, function (error) {
        console.error("Error:", error);
        alert("❌ Hubo un problema enviando el mensaje. Intenta nuevamente.");
        button.disabled = false;
        button.textContent = "Enviar mensaje";
      });
  });
