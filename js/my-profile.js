(function () {
  const $ = (s) => document.querySelector(s);

  const form = $('#perfilForm');
  const alertBox = $('#alertPlaceholder');

  const nombre = $('#nombre');
  const apellido = $('#apellido');
  const email = $('#email');
  const telefono = $('#telefono');

  const avatarInput = $('#avatarInput');
  const avatarPreview = $('#avatarPreview');
  const btnQuitarFoto = $('#btnQuitarFoto');

  const PERFIL_KEY = 'perfil';
  const USER_EMAIL_KEY = 'userEmail';
  const USUARIO_KEY = 'usuario';
  const EMAIL_PROMPT_KEY = 'profileEmailPromptedOnce';

  let currentPlaceholder = ""; // para comparar

  // --- Alerta persistente ---
  function showPersistentAlert(msg, type = 'info') {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = msg;
    alertBox.classList.remove('d-none');
  }

  function hideAlert() {
    alertBox.classList.add('d-none');
  }

  function showAlert(msg, type = 'success', timeoutMs = 2600) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = msg;
    alertBox.classList.remove('d-none');
    clearTimeout(showAlert._t);
    showAlert._t = setTimeout(() => alertBox.classList.add('d-none'), timeoutMs);
  }

  function isEmailLike(str) {
    return typeof str === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function readAsDataURL(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  function cargarPerfil() {
    const saved = localStorage.getItem(PERFIL_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        nombre.value = data.nombre || '';
        apellido.value = data.apellido || '';
        email.value = data.email || '';
        telefono.value = data.telefono || '';
      } catch {
        localStorage.removeItem(PERFIL_KEY);
        precargarPrimeraVez();
      }
    } else {
      precargarPrimeraVez();
    }

    const localAvatar = localStorage.getItem('avatarLocal');
    avatarPreview.src = localAvatar || 'img/user_placeholder.png';
    if (avatarInput) avatarInput.value = '';
  }

  // --- Primera vez: placeholder con nombre de usuario + alerta persistente ---
  function precargarPrimeraVez() {
    const fromUserEmail = localStorage.getItem(USER_EMAIL_KEY);
    const fromUsuario = localStorage.getItem(USUARIO_KEY);

    if (fromUserEmail) {
      email.value = fromUserEmail;
    } else {
      email.value = '';
      if (fromUsuario && !isEmailLike(fromUsuario)) {
        email.placeholder = fromUsuario;
        currentPlaceholder = fromUsuario;

        // Mostrar aviso hasta que se cambie
        showPersistentAlert("Ingresá tu correo real en lugar del nombre de usuario.");

        // Escuchar cambios hasta que se cambie o guarde un correo válido
        email.addEventListener("input", () => {
          if (email.value.trim() && email.value.trim() !== currentPlaceholder) {
            hideAlert();
          } else {
            showPersistentAlert("Ingresá tu correo real en lugar del nombre de usuario.");
          }
        });
      } else if (fromUsuario && isEmailLike(fromUsuario)) {
        email.value = fromUsuario;
      }
    }

    nombre.value = '';
    apellido.value = '';
    telefono.value = '';
  }

  function validar() {
    let ok = true;
    [nombre, apellido, email].forEach((el) => {
      if (!el.value.trim()) {
        el.classList.add('is-invalid');
        ok = false;
      } else {
        el.classList.remove('is-invalid');
      }
    });

    if (email.value && !isEmailLike(email.value)) {
      email.classList.add('is-invalid');
      ok = false;
    }

    return ok;
  }

  function guardarPerfil() {
    const data = {
      nombre: nombre.value.trim(),
      apellido: apellido.value.trim(),
      email: email.value.trim(),
      telefono: telefono.value.trim()
    };
    localStorage.setItem(PERFIL_KEY, JSON.stringify(data));
    localStorage.setItem(USER_EMAIL_KEY, data.email);
    showAlert('Perfil guardado.');

    /* const dropdownTrigger = document.getElementById('usuarioDropdown');
    const nameSpan = dropdownTrigger?.querySelector('span');
    if (nameSpan && (data.nombre || data.apellido)) {                             Al modificar Nombre y Usuario se 
      nameSpan.textContent = `${data.nombre} ${data.apellido}`.trim();            modifica también el nombre de usuario en NavBar
      localStorage.setItem(USUARIO_KEY, nameSpan.textContent);
    }*/
  }

  document.addEventListener('DOMContentLoaded', cargarPerfil);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validar()) {
      showAlert('Revisá los campos marcados.', 'danger', 3200);
      return;
    }
    guardarPerfil();
  });

  $('#btnLimpiar')?.addEventListener('click', () => {
    form.reset();
    precargarPrimeraVez();
    avatarPreview.src = 'img/user_placeholder.png';
    localStorage.removeItem('avatarLocal');
    window.dispatchEvent(new CustomEvent('profile:avatar-updated', { detail: { src: 'img/user_placeholder.png' } }));
    showAlert('Formulario limpio.', 'secondary', 1500);
  });

  avatarInput?.addEventListener('change', async () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showAlert('El archivo debe ser una imagen.', 'danger');
      avatarInput.value = '';
      return;
    }
    try {
      const dataUrl = await readAsDataURL(file);
      avatarPreview.src = dataUrl;
      localStorage.setItem('avatarLocal', dataUrl);
      window.dispatchEvent(new CustomEvent('profile:avatar-updated', { detail: { src: dataUrl } }));
    } catch {
      showAlert('No se pudo leer la imagen.', 'danger');
    }
  });

  btnQuitarFoto?.addEventListener('click', () => {
    const placeholder = 'img/user_placeholder.png';
    avatarPreview.src = placeholder;
    localStorage.removeItem('avatarLocal');
    window.dispatchEvent(new CustomEvent('profile:avatar-updated', { detail: { src: placeholder } }));
  });

  form?.addEventListener('input', (e) => {
    const t = e.target;
    if (t?.classList.contains('is-invalid') && t.value.trim()) {
      t.classList.remove('is-invalid');
    }
  });
})();