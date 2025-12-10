 
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
        showModal({
            title: "Mensaje Enviado con éxito",
            message: "Pronto nos pondremos en contacto",
            type: "success"
        });
        form.reset();
        button.disabled = false;
        button.textContent = "Enviar mensaje";
      }, function (error) {
        console.error("Error:", error);        
        showModal({
            title: "Problema enviando Mensaje",
            message: "Hubo un problema enviando el mensaje. Intenta nuevamente.",
            type: "failure"
        });
        button.disabled = false;
        button.textContent = "Enviar mensaje";
      });
  });
