/* * CONTROLADOR DE JUZGADOS
 * Se encarga de la lógica de la interfaz (VISTA)
 * e interactúa con el MODELO (juzgados.js)
 */

// 1. Importamos las funciones del Modelo
import { 
    seleccionarJuzgados, 
    insertarJuzgado, 
    actualizarJuzgado, 
    eliminarJuzgado 
} from '../modelos/juzgados.js';

// 2. Esperamos a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {

    // 3. Obtenemos los elementos del DOM
    const tablaJuzgadosBody = document.getElementById('tablaJuzgadosBody');
    const formJuzgado = document.getElementById('formJuzgado');
    const modalJuzgadoLabel = document.getElementById('modalJuzgadoLabel');
    const btnNuevoJuzgado = document.getElementById('btnNuevoJuzgado');
    
    // Instancia del Modal de Bootstrap
    const modalJuzgado = new bootstrap.Modal(document.getElementById('modalJuzgado'));

    // 4. Variables de estado
    let modo = 'insertar'; // 'insertar' o 'actualizar'
    let idActual = null;   // ID del juzgado que se está editando

    // 5. Función para mostrar Alertas (no bloqueante)
    const mostrarAlerta = (mensaje, tipo = 'success') => {
        const alertaDiv = document.createElement('div');
        // Usamos las clases de Bootstrap y las de nuestro CSS
        alertaDiv.className = `alert alert-${tipo} position-fixed top-0 end-0 m-3 p-3`;
        alertaDiv.setAttribute('role', 'alert');
        alertaDiv.style.zIndex = '1050'; // Aseguramos que esté sobre el modal
        alertaDiv.textContent = mensaje;
        
        document.body.appendChild(alertaDiv);
        
        // Desaparece después de 3 segundos
        setTimeout(() => {
            alertaDiv.remove();
        }, 3000);
    };

    // 6. Función principal para mostrar/refrescar los juzgados (READ)
    const mostrarJuzgados = async () => {
        const juzgados = await seleccionarJuzgados();
        tablaJuzgadosBody.innerHTML = ''; // Limpiamos la tabla

        if (juzgados.length === 0) {
            tablaJuzgadosBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay juzgados registrados.</td></tr>';
            return;
        }

        juzgados.forEach(juzgado => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${juzgado.nroJuzgado}</td>
                <td>${juzgado.nombreJuzgado}</td>
                <td>${juzgado.juezTram}</td>
                <td>${juzgado.secretario}</td>
                <td>${juzgado.telefono}</td>
                <td>
                    <!-- Botón Editar -->
                    <button class="btn btn-warning btn-sm btn-editar btn-accion" 
                            data-id="${juzgado.id}" 
                            data-juzgado='${JSON.stringify(juzgado)}'>
                        Editar
                    </button>
                    <!-- Botón Eliminar -->
                    <button class="btn btn-danger btn-sm btn-eliminar btn-accion" 
                            data-id="${juzgado.id}" 
                            data-nombre="${juzgado.nombreJuzgado}">
                        Eliminar
                    </button>
                </td>
            `;
            tablaJuzgadosBody.appendChild(fila);
        });
    };

    // 7. Event Listener para el botón "Nuevo Juzgado" (CREATE)
    btnNuevoJuzgado.addEventListener('click', () => {
        modo = 'insertar';
        idActual = null;
        formJuzgado.reset(); // Limpiamos el formulario
        modalJuzgadoLabel.textContent = 'Nuevo Juzgado';
        modalJuzgado.show();
    });

    // 8. Event Listener para el envío del formulario (CREATE / UPDATE)
    formJuzgado.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitamos el envío tradicional
        
        const datos = new FormData(formJuzgado);
        let respuesta;

        try {
            if (modo === 'insertar') {
                respuesta = await insertarJuzgado(datos);
            } else { // modo === 'actualizar'
                respuesta = await actualizarJuzgado(datos, idActual);
            }

            if (respuesta.success) {
                mostrarAlerta(respuesta.message, 'success');
                modalJuzgado.hide();
                mostrarJuzgados(); // Refrescamos la tabla
            } else {
                mostrarAlerta(respuesta.message, 'danger');
            }
        } catch (error) {
            mostrarAlerta('Error de conexión con la API.', 'danger');
        }
    });

    // 9. Event Listeners para la tabla (EDITAR / ELIMINAR) - (Event Delegation)
    tablaJuzgadosBody.addEventListener('click', async (e) => {
        
        // --- Clic en "Editar" (UPDATE) ---
        if (e.target.classList.contains('btn-editar')) {
            modo = 'actualizar';
            idActual = e.target.dataset.id;
            
            // Cargamos los datos en el formulario
            const datosJuzgado = JSON.parse(e.target.dataset.juzgado);
            
            formJuzgado.id.value = datosJuzgado.id;
            formJuzgado.nroJuzgado.value = datosJuzgado.nroJuzgado;
            formJuzgado.nombreJuzgado.value = datosJuzgado.nombreJuzgado;
            formJuzgado.juezTram.value = datosJuzgado.juezTram;
            formJuzgado.secretario.value = datosJuzgado.secretario;
            formJuzgado.telefono.value = datosJuzgado.telefono;

            modalJuzgadoLabel.textContent = 'Modificar Juzgado';
            modalJuzgado.show();
        }

        // --- Clic en "Eliminar" (DELETE) ---
        if (e.target.classList.contains('btn-eliminar')) {
            const id = e.target.dataset.id;
            const nombre = e.target.dataset.nombre;

            // Usamos 'confirm' como en el PPT de ABMC (slide 20)
            if (confirm(`¿Está seguro de que desea eliminar el juzgado "${nombre}"?`)) {
                try {
                    const respuesta = await eliminarJuzgado(id);
                    if (respuesta.success) {
                        mostrarAlerta(respuesta.message, 'success');
                        mostrarJuzgados(); // Refrescamos la tabla
                    } else {
                        mostrarAlerta(respuesta.message, 'danger');
                    }
                } catch (error) {
                    mostrarAlerta('Error de conexión con la API.', 'danger');
                }
            }
        }
    });

    // 10. Carga inicial de datos al entrar a la página
    mostrarJuzgados();
});