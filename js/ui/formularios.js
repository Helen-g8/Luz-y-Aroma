// Ayudas para mostrar errores de validación con las clases de Bootstrap.
// Los errores llegan como objeto { nombreDelCampo: "mensaje" }.

export function marcarError(input, mensaje) {
  input.classList.add("is-invalid");
  input.setAttribute("aria-invalid", "true");

  let feedback = input.parentElement.querySelector(".invalid-feedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    input.insertAdjacentElement("afterend", feedback);
  }
  feedback.id = `${input.id}-error`;
  feedback.textContent = mensaje;
  input.setAttribute("aria-describedby", feedback.id);
}

export function limpiarErrores(form) {
  form.querySelectorAll(".is-invalid").forEach((input) => {
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  });
}

// Marca todos los errores y devuelve true si el formulario está bien.
export function mostrarErrores(form, errores) {
  limpiarErrores(form);
  let primero = null;

  for (const [campo, mensaje] of Object.entries(errores)) {
    const input = form.elements[campo];
    if (!input) continue;
    marcarError(input, mensaje);
    primero ??= input;
  }

  primero?.focus();
  return Object.keys(errores).length === 0;
}
