/* =========================================================
   SOPLO DE VIDA — V3
   ========================================================= */

// ===== Scroll suave =====
(function () {
  const navbar = document.getElementById('navbar');
  const getOffset = () => (navbar ? navbar.offsetHeight + 8 : 80);

  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const smoothScrollTo = (targetY, duration = 400) => {
    const startY = window.pageYOffset;
    const diff = targetY - startY;
    let startTime;

    const step = (timestamp) => {
      if (startTime === undefined) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + diff * eased);
      if (elapsed < duration) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      const targetY = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
      smoothScrollTo(targetY);
    });
  });
})();

// ===== Lucide =====
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});

// ===== Navbar =====
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ===== Menú móvil =====
(function () {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuBtn || !mobileMenu) return;

  const iconMenu = document.getElementById('icon-menu');
  const iconClose = document.getElementById('icon-close');

  const setState = (open) => {
    mobileMenu.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (iconMenu) iconMenu.classList.toggle('hidden', open);
    if (iconClose) iconClose.classList.toggle('hidden', !open);
  };

  menuBtn.addEventListener('click', () => {
    setState(menuBtn.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', () => setState(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      setState(false);
      menuBtn.focus();
    }
  });
})();

// ===== Reveal =====
(function () {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((el) => observer.observe(el));
})();

// ===== Modal de imágenes =====
(function () {
  const modal = document.getElementById('modal-img');
  const modalImg = document.getElementById('img-ampliada');
  const closeBtn = modal ? modal.querySelector('.modal-cerrar') : null;
  const triggers = document.querySelectorAll('.img-beneficio');

  if (!modal || !modalImg || !closeBtn || !triggers.length) return;

  const openModal = (src, alt) => {
    modalImg.src = src;
    modalImg.alt = alt || 'Imagen ampliada';
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      modal.hidden = true;
      modalImg.src = '';
    }, 300);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const img = trigger.querySelector('img');
      if (img) openModal(img.src, img.alt);
    });
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();

// ===== RESEÑAS: Modal, estrellas y envío =====
(function () {
  const modal = document.getElementById('modal-resena');
  const btnAbrir = document.getElementById('btn-abrir-form-resena');
  const closeBtn = modal ? modal.querySelector('.modal-cerrar') : null;
  const form = document.getElementById('form-resena');
  const errorEl = document.getElementById('resena-error');

  if (!modal || !btnAbrir || !closeBtn || !form) return;

  const estrellasBtns = modal.querySelectorAll('.estrella-btn');
  const inputEstrellas = document.getElementById('resena-estrellas');

  // ===== Cargar y dibujar reseñas desde Supabase =====
// Variables globales para paginación
  let todasLasResenas = [];
  let resenasMostradas = 0;
  const RESENAS_POR_PAGINA = 6;

  window.cargarResenasPublicas =  async function cargarResenas() {
    const grid = document.getElementById('resenas-grid');
    const btnVerMas = document.getElementById('btn-ver-mas');
    if (!grid) return;

    const { data: resenas, error } = await window.supabaseClient
      .from('resenas')
      .select('*')
      .eq('aprobada', true)
      .order('creado_en', { ascending: false });

    if (error) { console.error(error); return; }

    todasLasResenas = resenas;
    
    // Calcular promedio (todas)
    if (resenas.length > 0) {
      const suma = resenas.reduce((acc, r) => acc + r.estrellas, 0);
      const promedio = (suma / resenas.length).toFixed(1);
      document.getElementById('promedio-numero').textContent = promedio;
      document.getElementById('promedio-texto').textContent = `/ 5 · ${resenas.length} reseña${resenas.length === 1 ? '' : 's'}`;
    } else {
      document.getElementById('promedio-numero').textContent = '0.0';
      document.getElementById('promedio-texto').textContent = '/ 5 · 0 reseñas';
    }

    // Renderizar la primera página
    grid.innerHTML = '';
    resenasMostradas = 0;
    if (btnVerMas) btnVerMas.style.display = 'none';
    
    renderizarPaginaResenas();
  }

  function renderizarPaginaResenas() {
    const grid = document.getElementById('resenas-grid');
    const btnVerMas = document.getElementById('btn-ver-mas');
    
    if (todasLasResenas.length === 0) {
      grid.innerHTML = '<p style="text-align:center; color:#78716c; grid-column: 1/-1;">Aún no hay reseñas. ¡Sé el primero en dejar una!</p>';
      if (btnVerMas) btnVerMas.style.display = 'none';
      return;
    }

    // Si es la primera carga, vaciamos el grid
    if (resenasMostradas === 0) grid.innerHTML = '';

    const siguientes = todasLasResenas.slice(resenasMostradas, resenasMostradas + RESENAS_POR_PAGINA);
    
    siguientes.forEach((resena) => {
      let estrellasHTML = '';
      for (let i = 1; i <= 5; i++) {
        const clase = i <= resena.estrellas ? 'estrella-llena' : 'estrella-vacia';
        estrellasHTML += `<i data-lucide="star" class="${clase}"></i>`;
      }
      const inicial = resena.nombre.charAt(0).toUpperCase();
      const fecha = new Date(resena.creado_en).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });

      const card = document.createElement('article');
      card.className = 'resena-card reveal visible'; // 'visible' para que no se oculte al inyectar
      card.innerHTML = `
        <div class="resena-estrellas">${estrellasHTML}</div>
        <p class="resena-texto">"${resena.comentario}"</p>
        <div class="resena-footer">
          <span class="resena-avatar">${inicial}</span>
          <div>
            <h4 class="resena-nombre">${resena.nombre}</h4>
            <p class="resena-fecha">${fecha}</p>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
    
    resenasMostradas += siguientes.length;

    // Mostrar u ocultar botón "Ver más"
    if (btnVerMas) {
      btnVerMas.style.display = (resenasMostradas < todasLasResenas.length) ? 'inline-block' : 'none';
    }
  }

  // Evento del botón Ver más
  const btnVerMas = document.getElementById('btn-ver-mas');
  if (btnVerMas) {
    btnVerMas.addEventListener('click', renderizarPaginaResenas);
  }
  
  // cargarResenas
  window.cargarResenasPublicas();;

  // Pintar estrellitas del promedio
  const promedioEl = document.getElementById('promedio-estrellas');
  if (promedioEl) {
    promedioEl.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'star');
      icon.className = 'estrella-llena'; // Por defecto llenas, luego podríamos hacerlo dinámico
      promedioEl.appendChild(icon);
    }
    if (window.lucide) lucide.createIcons();
  }

  // Lógica de las estrellas del formulario
  const pintarEstrellas = (hasta) => {
    estrellasBtns.forEach((btn, idx) => {
      btn.classList.toggle('activa', idx < hasta);
    });
  };

  const resetEstrellas = () => {
    inputEstrellas.value = '0';
    pintarEstrellas(0);
  };

  // Abrir / Cerrar Modal
  const abrirModal = () => {
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const primerInput = modal.querySelector('input[type="text"]');
      if (primerInput) primerInput.focus();
    }, 100);
  };

  const cerrarModal = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      modal.hidden = true;
      form.reset();
      resetEstrellas();
      errorEl.hidden = true;
    }, 300);
  };

  btnAbrir.addEventListener('click', abrirModal);
  closeBtn.addEventListener('click', cerrarModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) cerrarModal();
  });

  estrellasBtns.forEach((btn, idx) => {
    btn.addEventListener('mouseenter', () => pintarEstrellas(idx + 1));
    btn.addEventListener('mouseleave', () => {
      pintarEstrellas(parseInt(inputEstrellas.value, 10) || 0);
    });
    btn.addEventListener('click', () => {
      const valor = parseInt(btn.dataset.valor, 10);
      inputEstrellas.value = String(valor);
      pintarEstrellas(valor);

      // Efecto pop
      btn.classList.remove('pop');
      void btn.offsetWidth;
      btn.classList.add('pop');
      setTimeout(() => btn.classList.remove('pop'), 250);
    });
  });

  // Enviar Reseña a Supabase
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    const estrellas = parseInt(inputEstrellas.value, 10);
    const comentario = form.comentario.value.trim();

    if (!nombre || !estrellas || !comentario) {
      errorEl.textContent = 'Por favor completa todos los campos y selecciona una calificación.';
      errorEl.hidden = false;
      return;
    }

    errorEl.hidden = true;

    const submitBtn = form.querySelector('button[type="submit"]');
    const textoOriginal = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Enviando...';

    try {
      const { data, error } = await window.supabaseClient
        .from('resenas')
        .insert([{
          nombre: nombre,
          estrellas: estrellas,
          comentario: comentario
        }]);

      if (error) throw error;

      console.log('Reseña guardada exitosamente');
      alert('¡Gracias por tu reseña! Será revisada antes de publicarse.');
      cerrarModal();
      window.cargarResenasPublicas();;

    } catch (err) {
      console.error('Error al guardar la reseña:', err);
      errorEl.textContent = 'Hubo un error al enviar tu reseña. Intenta de nuevo.';
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = textoOriginal;
      if (window.lucide) lucide.createIcons();
    }
  });

})(); // <---

// ===== Formulario de valoración → WhatsApp + Guardar Lead =====
(function () {
  const form = document.getElementById('form-valoracion');
  if (!form) return;

  const errorEl = document.getElementById('form-error');
  const WHATSAPP_DEFAULT = '573155029193';

  const WHATSAPP_POR_SEDE = {
    'Ricaurte (Cundinamarca)': '573239300864',
    'Girardot (Cundinamarca)': '573239300864',
    'Ibagué (Tolima)':         '573155029193',
    'Virtual (en línea)':      '573155029193'
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    const telefono = form.telefono.value.trim();
    const sede = form.sede.value;
    const tecnica = form.tecnica.value;
    const mensaje = form.mensaje.value.trim();

    if (!nombre || !telefono || !sede || !tecnica) {
      errorEl.textContent = 'Por favor completa todos los campos obligatorios.';
      errorEl.classList.remove('hidden');
      return;
    }

    errorEl.classList.add('hidden');
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const textoOriginal = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Preparando WhatsApp...';

    //Se guarda en supabase (sin bloquear si falla)
    try {
      await window.supabaseClient.from('leads').insert([{
        nombre: nombre,
        telefono: telefono,
        sede: sede,
        tecnica: tecnica,
        mensaje: mensaje || null
      }]);
      console.log('Lead guardado en Supabase');
    } catch (err) {
      console.error('Error guardando lead (pero continuamos a WhatsApp):', err);
    }

    // Redirigir whatsApp (pase lo que pase)
    const numeroDestino = WHATSAPP_POR_SEDE[sede] || WHATSAPP_DEFAULT;
    const texto = [
      'Hola, soy ' + nombre + '.',
      'Quiero solicitar una valoración inicial.',
      '',
      'Sede: ' + sede,
      'Técnica de interés: ' + tecnica,
      'Mi teléfono: ' + telefono,
      mensaje ? 'Mensaje: ' + mensaje : ''
    ].filter(Boolean).join('\n');

    const url = 'https://wa.me/' + numeroDestino + '?text=' + encodeURIComponent(texto);
    
    // restaurar boton y abrir el WhatsApp
    submitBtn.disabled = false;
    submitBtn.innerHTML = textoOriginal;
    if (window.lucide) lucide.createIcons();
    
    window.open(url, '_blank', 'noopener');
    form.reset();
  });
})();

// ===== PANEL DE ADMINISTRACIÓN =====
(function () {
  const modal = document.getElementById('modal-admin');
  const btnCerrar = document.getElementById('cerrar-admin');
  const loginView = document.getElementById('admin-login-view');
  const panelView = document.getElementById('admin-panel-view');
  const formLogin = document.getElementById('form-admin-login');
  const errorEl = document.getElementById('admin-error');
  const btnLogout = document.getElementById('btn-logout');
  const listaResenas = document.getElementById('admin-lista-resenas');

  if (!modal) return;

  // --- Abrir el modal de admin ---
  // Truco: Si la URL tiene ?admin=true, abrimos el modal automáticamente
  if (window.location.search.includes('admin=true')) {
    setTimeout(() => {
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
    }, 500);
  }

  const cerrarModal = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 300);
  };

  btnCerrar.addEventListener('click', cerrarModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });

  // --- Lógica de Login ---
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    const btn = formLogin.querySelector('button');
    btn.innerHTML = 'Verificando...'; btn.disabled = true;
    errorEl.hidden = true;

    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      errorEl.textContent = 'Credenciales incorrectas. Intenta de nuevo.';
      errorEl.hidden = false;
      btn.innerHTML = 'Entrar'; btn.disabled = false;
      return;
    }

    // Login exitoso
    loginView.style.display = 'none';
    panelView.style.display = 'block';
    btn.innerHTML = 'Entrar'; btn.disabled = false;
    cargarResenasAdmin();
  });

  // --- Logout ---
  btnLogout.addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    panelView.style.display = 'none';
    loginView.style.display = 'block';
    formLogin.reset();
  });

  // --- Cargar reseñas pendientes ---
  async function cargarResenasAdmin() {
    listaResenas.innerHTML = '<p style="text-align:center; color:#78716c;">Cargando...</p>';

    const { data: resenas, error } = await window.supabaseClient
      .from('resenas')
      .select('*')
      .order('creado_en', { ascending: false });

    if (error) {
      listaResenas.innerHTML = '<p style="color:#dc2626;">Error cargando reseñas.</p>';
      return;
    }

    listaResenas.innerHTML = '';
    if (resenas.length === 0) {
      listaResenas.innerHTML = '<p style="text-align:center; color:#78716c;">No hay reseñas.</p>';
      return;
    }

    resenas.forEach(r => {
      const item = document.createElement('div');
      item.className = 'admin-resena-item';
      
      const estadoColor = r.aprobada ? '#166534' : '#991b1b';
      const estadoTexto = r.aprobada ? 'Aprobada' : 'Pendiente';

      item.innerHTML = `
        <div class="admin-resena-header">
          <div>
            <strong>${r.nombre}</strong> - ${r.estrellas} ⭐
            <span style="color:${estadoColor}; font-size:0.8rem; margin-left:10px;">(${estadoTexto})</span>
          </div>
          <div class="admin-resena-actions">
            ${!r.aprobada ? `<button class="btn-aprobar" onclick="cambiarEstadoResena(${r.id}, true)">Aprobar</button>` : ''}
            ${r.aprobada ? `<button class="btn-rechazar" onclick="cambiarEstadoResena(${r.id}, false)">Ocultar</button>` : ''}
            <button class="btn-rechazar" onclick="eliminarResena(${r.id})">Eliminar</button>
          </div>
        </div>
        <p style="font-size:0.9rem; color:#44403c;">"${r.comentario}"</p>
      `;
      listaResenas.appendChild(item);
    });
  }

  // --- Funciones globales para los botones (onclick) ---
  window.cambiarEstadoResena = async (id, estado) => {
    await window.supabaseClient.from('resenas').update({ aprobada: estado }).eq('id', id);
    cargarResenasAdmin();
    if (window.cargarResenasPublicas) window.cargarResenasPublicas(); // Refrescar la web principal
  };

  window.eliminarResena = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar esta reseña para siempre?')) return;
    await window.supabaseClient.from('resenas').delete().eq('id', id);
    cargarResenasAdmin();
    if (window.cargarResenasPublicas) window.cargarResenasPublicas();
  };
})();