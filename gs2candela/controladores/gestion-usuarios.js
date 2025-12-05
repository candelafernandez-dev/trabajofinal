import { seleccionarUsuarios, insertarUsuario, actualizarUsuario, eliminarUsuario } from '../modelos/usuarios.js';

document.addEventListener('DOMContentLoaded', () => {
    const tablaBody = document.getElementById('tablaUsuariosBody');
    const form = document.getElementById('formUsuario');
    const modal = new bootstrap.Modal(document.getElementById('modalUsuario'));
    const modalLabel = document.getElementById('modalUsuarioLabel');
    let modo = 'insertar';
    let idActual = null;

    const mostrarUsuarios = async () => {
        const usuarios = await seleccionarUsuarios();
        tablaBody.innerHTML = '';
        usuarios.forEach(u => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td><span class="badge bg-${u.rol === 'admin' ? 'warning text-dark' : 'info'}">${u.rol}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning btn-editar" data-json='${JSON.stringify(u)}'><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${u.id}" data-nombre="${u.nombre}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tablaBody.appendChild(row);
        });
    };

    document.getElementById('btnNuevoUsuario').addEventListener('click', () => {
        modo = 'insertar';
        idActual = null;
        form.reset();
        modalLabel.textContent = 'Nuevo Usuario';
        modal.show();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        
        // Validación básica de contraseña al crear
        if (modo === 'insertar' && !data.get('password')) {
            alert("La contraseña es obligatoria para nuevos usuarios.");
            return;
        }
        // Si al editar la pass está vacía, la quitamos para no sobreescribirla
        if (modo === 'actualizar' && !data.get('password')) {
            data.delete('password');
        }

        const res = modo === 'insertar' ? await insertarUsuario(data) : await actualizarUsuario(data, idActual);
        
        if (res.success) {
            modal.hide();
            mostrarUsuarios();
        } else {
            alert(res.message);
        }
    });

    tablaBody.addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.btn-editar');
        const btnEliminar = e.target.closest('.btn-eliminar');

        if (btnEditar) {
            const data = JSON.parse(btnEditar.dataset.json);
            modo = 'actualizar';
            idActual = data.id;
            form.elements['nombre'].value = data.nombre;
            form.elements['email'].value = data.email;
            form.elements['rol'].value = data.rol;
            form.elements['password'].value = ''; // Limpiar pass por seguridad
            modalLabel.textContent = 'Editar Usuario';
            modal.show();
        }

        if (btnEliminar) {
            if(confirm(`¿Eliminar usuario ${btnEliminar.dataset.nombre}?`)) {
                await eliminarUsuario(btnEliminar.dataset.id);
                mostrarUsuarios();
            }
        }
    });

    mostrarUsuarios();
});