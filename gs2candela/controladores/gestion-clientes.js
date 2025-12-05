/* * CONTROLADOR DE CLIENTES
 * Se encarga de la lógica de la interfaz (vista/clientes.html)
 * e interactúa con el modelo (clientes.js)
 */

// 1. Importamos las funciones del Modelo
import {
    seleccionarClientes,
    insertarCliente,
    actualizarCliente,
    eliminarCliente
} from '../modelos/clientes.js'; 

// 2. Esperamos a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {

    // 3. Obtenemos los elementos del DOM
    const tablaClientesBody = document.getElementById('tablaClientesBody');
    const formCliente = document.getElementById('formCliente');
    const modalClienteLabel = document.getElementById('modalClienteLabel');
    const btnNuevoCliente = document.getElementById('btnNuevoCliente');
    const imagenPreview = document.getElementById('imagenPreview');
    const inputImagen = document.getElementById('imagen');

    // Instancia del Modal de Bootstrap
    const modalCliente = new bootstrap.Modal(document.getElementById('modalCliente'));

    // 4. Variables de estado
    let modo = 'insertar'; // 'insertar' o 'actualizar'
    let idActual = null;   // ID del cliente que se está editando

    // 5. Función para mostrar Alertas (reutilizada)
    const mostrarAlerta = (mensaje, tipo = 'success') => {
        const alertaDiv = document.createElement('div');
        alertaDiv.className = `alert alert-${tipo} position-fixed top-0 end-0 m-3 p-3`;
        alertaDiv.setAttribute('role', 'alert');
        alertaDiv.style.zIndex = '1050';
        alertaDiv.textContent = mensaje;
        document.body.appendChild(alertaDiv);
        setTimeout(() => {
            alertaDiv.remove();
        }, 3000);
    };

    // 6. Función principal para mostrar/refrescar los clientes (READ)
    const mostrarClientes = async () => {
        const clientes = await seleccionarClientes();
        tablaClientesBody.innerHTML = ''; // Limpiamos la tabla

        if (clientes.length === 0) {
            tablaClientesBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay clientes registrados.</td></tr>';
            return;
        }

        clientes.forEach(cliente => {
            const fila = document.createElement('tr');
            // Path de la imagen
            const imgPath = cliente.imagen ? `../imagenes/clientes/${cliente.imagen}` : '../imagenes/placeholder.png'; // Asumimos un placeholder

            fila.innerHTML = `
                <td><img src="${imgPath}" alt="Cliente" class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;"></td>
                <td>${cliente.apellidoRsocial}</td>
                <td>${cliente.nombres}</td>
                <td>${cliente.tipoDni}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.email}</td>
                <td>
                    <button class="btn btn-warning btn-sm btn-editar btn-accion" 
                            data-id="${cliente.id}" 
                            data-cliente='${JSON.stringify(cliente)}'>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm btn-eliminar btn-accion" 
                            data-id="${cliente.id}" 
                            data-nombre="${cliente.apellidoRsocial}">
                        Eliminar
                    </button>
                </td>
            `;
            tablaClientesBody.appendChild(fila);
        });
    };

    // 7. Event Listener para el botón "Nuevo Cliente" (CREATE)
    btnNuevoCliente.addEventListener('click', () => {
        modo = 'insertar';
        idActual = null;
        formCliente.reset();
        imagenPreview.style.display = 'none'; // Ocultamos la preview
        modalClienteLabel.textContent = 'Nuevo Cliente';
        modalCliente.show();
    });

    // 8. Event Listener para el envío del formulario (CREATE / UPDATE)
    formCliente.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const datos = new FormData(formCliente);
        let respuesta;

        try {
            if (modo === 'insertar') {
                respuesta = await insertarCliente(datos);
            } else { // modo === 'actualizar'
                // Si el campo de imagen está vacío, lo quitamos del FormData
                // para evitar que la API intente procesar un archivo vacío
                // y sobreescriba la imagen existente con 'null' o ''.
                if (inputImagen.files.length === 0) {
                    datos.delete('imagen');
                }
                respuesta = await actualizarCliente(datos, idActual);
            }

            if (respuesta.success) {
                mostrarAlerta(respuesta.message, 'success');
                modalCliente.hide();
                mostrarClientes(); // Refrescamos la tabla
            } else {
                mostrarAlerta(respuesta.message, 'danger');
            }
        } catch (error) {
            mostrarAlerta('Error de conexión con la API.', 'danger');
        }
    });

    // 9. Event Listeners para la tabla (EDITAR / ELIMINAR) - (Event Delegation)
    tablaClientesBody.addEventListener('click', async (e) => {
        
        // --- Clic en "Editar" (UPDATE) ---
        if (e.target.classList.contains('btn-editar')) {
            modo = 'actualizar';
            idActual = e.target.dataset.id;
            
            const datosCliente = JSON.parse(e.target.dataset.cliente);
            
            // Rellenamos el formulario
            formCliente.id.value = datosCliente.id;
            formCliente.tipoPersona.value = datosCliente.tipoPersona;
            formCliente.apellidoRsocial.value = datosCliente.apellidoRsocial;
            formCliente.nombres.value = datosCliente.nombres;
            formCliente.tipoDni.value = datosCliente.tipoDni;
            formCliente.fNacimiento.value = datosCliente.fNacimiento; // Asume formato YYYY-MM-DD
            formCliente.fAlta.value = datosCliente.fAlta; // Asume formato YYYY-MM-DD
            formCliente.domicilio.value = datosCliente.domicilio;
            formCliente.localidad.value = datosCliente.localidad;
            formCliente.cpostal.value = datosCliente.cpostal;
            formCliente.telefono.value = datosCliente.telefono;
            formCliente.email.value = datosCliente.email;
            
            // Manejo de la imagen preview
            if (datosCliente.imagen) {
                imagenPreview.src = `../imagenes/clientes/${datosCliente.imagen}`;
                imagenPreview.style.display = 'block';
            } else {
                imagenPreview.style.display = 'none';
            }
            
            modalClienteLabel.textContent = 'Modificar Cliente';
            modalCliente.show();
        }

        // --- Clic en "Eliminar" (DELETE) ---
        if (e.target.classList.contains('btn-eliminar')) {
            const id = e.target.dataset.id;
            const nombre = e.target.dataset.nombre;

            if (confirm(`¿Está seguro de que desea eliminar al cliente "${nombre}"?`)) {
                try {
                    const respuesta = await eliminarCliente(id);
                    if (respuesta.success) {
                        mostrarAlerta(respuesta.message, 'success');
                        mostrarClientes(); // Refrescamos la tabla
                    } else {
                        mostrarAlerta(respuesta.message, 'danger');
                    }
                } catch (error) {
                    mostrarAlerta('Error de conexión con la API.', 'danger');
                }
            }
        }
    });

    // 10. Listener para la preview de la imagen
    inputImagen.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagenPreview.src = event.target.result;
                imagenPreview.style.display = 'block';
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // 11. Carga inicial de datos al entrar a la página
    mostrarClientes();
});