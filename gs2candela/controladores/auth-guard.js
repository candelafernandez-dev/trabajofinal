/* * AUTH GUARD 
 * - Gestiona sesión y redirecciones.
 * - Oculta elementos de Admin.
 * - Inyecta botón Salir en Navbar (Vistas) O en UserBar (Index).
 */

(function() {
    const sesion = localStorage.getItem('usuario_myc');
    const path = window.location.pathname;
    
    const enVistas = path.includes('/VISTAS/');
    const rutaLogin = enVistas ? '../login.html' : 'login.html';
    const rutaIndex = enVistas ? '../index.html' : 'index.html';

    // 1. VERIFICAR SESIÓN
    if (!sesion) {
        if (!path.includes('login.html')) {
            window.location.href = rutaLogin;
        }
        return; 
    }

    const usuario = JSON.parse(sesion);

    // 2. CONTROL DE ACCESO POR ROL (Redirección)
    if (usuario.rol === 'abogado') {
        if (path.includes('juzgados.html') || path.includes('usuarios.html')) {
            alert('Acceso denegado: Requiere permisos de administrador.');
            window.location.href = rutaIndex;
            return;
        }
    }

    // 3. UI y PERMISOS
    document.addEventListener('DOMContentLoaded', () => {
        
        // A. Ocultar elementos exclusivos de Admin
        if (usuario.rol !== 'admin') {
            const elementosAdmin = document.querySelectorAll('.solo-admin');
            elementosAdmin.forEach(el => el.remove());

            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                if (link.textContent.trim().toLowerCase().includes('juzgados')) {
                    if (link.parentElement.tagName === 'LI') link.parentElement.remove();
                    else link.remove();
                }
            });
        }

        // B. Inyectar Info Usuario y Botón Salir
        // Buscamos dónde ponerlo: Navbar (Vistas) o UserBar (Index)
        const navbarCollapse = document.querySelector('.navbar-collapse');
        const userBarIndex = document.getElementById('user-bar');
        
        const contenedorInfo = navbarCollapse || userBarIndex;

        if (contenedorInfo) {
            // Si estamos en el navbar, aplicamos clases de alineación bootstrap
            // Si estamos en user-bar, ya tiene text-end
            const clasesExtra = navbarCollapse ? 'd-flex align-items-center ms-auto text-white mt-2 mt-lg-0' : 'd-inline-block';
            const colorTexto = navbarCollapse ? 'text-white' : 'text-muted';
            const btnClass = navbarCollapse ? 'btn-outline-light' : 'btn-outline-danger';

            const userInfo = document.createElement('div');
            userInfo.className = clasesExtra;
            
            userInfo.innerHTML = `
                <span class="me-3 small fw-bold ${colorTexto}">
                    <i class="fas fa-user-circle me-1"></i> ${usuario.nombre} 
                    <span class="badge bg-secondary ms-1 text-uppercase" style="font-size: 0.7em;">${usuario.rol}</span>
                </span>
                <button id="btnLogout" class="btn btn-sm ${btnClass}">
                    <i class="fas fa-sign-out-alt"></i> Salir
                </button>
            `;
            
            contenedorInfo.appendChild(userInfo);

            document.getElementById('btnLogout').addEventListener('click', () => {
                if(confirm('¿Desea cerrar sesión?')) {
                    localStorage.removeItem('usuario_myc');
                    window.location.href = rutaLogin;
                }
            });
        }
    });

})();