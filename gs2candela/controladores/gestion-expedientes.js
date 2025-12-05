/* * CONTROLADOR DE EXPEDIENTES
 * Gestiona la vista de expedientes y carga dependencias como Juzgados
 * Incluye lógica para ABM de Expedientes y Gestión de Partes (Vínculos)
 */

import { 
    seleccionarExpedientes, 
    insertarExpediente, 
    actualizarExpediente, 
    eliminarExpediente 
} from '../MODELOS/expedientes.js';

import { seleccionarJuzgados } from '../modelos/juzgados.js';
import { seleccionarClientes } from '../modelos/clientes.js';
import { obtenerVinculosPorExpediente, agregarVinculo, borrarVinculo } from '../modelos/vinculos.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- REFERENCIAS AL DOM (Vista Principal y Modal Expediente) ---
    const tablaBody = document.getElementById('tablaExpedientesBody');
    const form = document.getElementById('formExpediente');
    const modalEl = document.getElementById('modalExpediente');
    const modal = new bootstrap.Modal(modalEl); // Bootstrap
    const modalLabel = document.getElementById('modalExpedienteLabel');
    const selectJuzgado = document.getElementById('juzgadoSelect'); // ID
    const btnNuevoExpediente = document.getElementById('btnNuevoExpediente');

    // --- REFERENCIAS AL DOM (Modal de Partes/Vínculos) ---
    const modalPartesEl = document.getElementById('modalPartes');
    const modalPartes = new bootstrap.Modal(modalPartesEl); // Bootstrap
    const formParte = document.getElementById('formAgregarParte');
    const selectCliente = document.getElementById('selectClienteParte');
    const tablaPartesBody = document.getElementById('tablaPartesBody');
    const lblNroExpediente = document.getElementById('lblNroExpediente');
    const inputIdExpVinculo = document.getElementById('idExpedienteVinculo');

    // --- VARIABLES DE ESTADO ---
    let modo = 'insertar';
    let idActual = null;
    let mapaJuzgados = {}; // Para mostrar nombres en lugar de IDs en la tabla
    let listaClientesCache = []; // Cache de clientes para no recargar constantemente

    // --- FUNCIÓN UTILITARIA: MOSTRAR ALERTA ---
    const mostrarAlerta = (mensaje, tipo = 'success') => {
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} position-fixed top-0 end-0 m-3 p-3 shadow`;
        alerta.style.zIndex = '2000'; // Por encima de los modales
        alerta.textContent = mensaje;
        document.body.appendChild(alerta);
        
        // Eliminar alerta después de 3 segundos
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    };

    // --- CARGA DE DATOS INICIAL ---
    const inicializar = async () => {
        // 1. Cargar Juzgados (para el Select y el Mapa)
        const juzgados = await seleccionarJuzgados();
        
        // Limpiamos y llenamos el select del formulario principal
        selectJuzgado.innerHTML = '<option value="">Seleccione un juzgado...</option>';
        
        if (Array.isArray(juzgados)) {
            juzgados.forEach(j => {
                mapaJuzgados[j.id] = j.nombreJuzgado; // Guardamos nombre para la tabla
                const option = document.createElement('option');
                option.value = j.id;
                option.textContent = j.nombreJuzgado;
                selectJuzgado.appendChild(option);
            });
        }

        // 2. Cargar Clientes (para el Select del Modal de Partes)
        listaClientesCache = await seleccionarClientes();
        
        // Limpiamos y llenamos el select de clientes
        selectCliente.innerHTML = '<option value="">Seleccione Cliente...</option>';
        
        if (Array.isArray(listaClientesCache)) {
            listaClientesCache.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = `${c.apellidoRsocial}, ${c.nombres} (${c.tipoDni})`;
                selectCliente.appendChild(option);
            });
        }

        // 3. Mostrar la tabla de Expedientes
        mostrarExpedientes();
    };

    // --- FUNCIÓN: MOSTRAR EXPEDIENTES (TABLA PRINCIPAL) ---
    const mostrarExpedientes = async () => {
        const expedientes = await seleccionarExpedientes();
        tablaBody.innerHTML = ''; // Limpiar tabla

        if (!Array.isArray(expedientes) || expedientes.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay expedientes registrados.</td></tr>';
            return;
        }

        expedientes.forEach(exp => {
            const row = document.createElement('tr');
            // Resolvemos el nombre del juzgado usando el mapa
            const nombreJuzgado = mapaJuzgados[exp.juzgado] || 'No asignado/Desconocido';

            row.innerHTML = `
                <td>${exp.nroExpediente}</td>
                <td>${exp.caratura}</td>
                <td>${nombreJuzgado}</td>
                <td><span class="badge bg-${exp.estado === 'Activo' ? 'success' : 'secondary'}">${exp.estado}</span></td>
                <td>${exp.fInicio || '-'}</td>
                <td>
                    <!-- Botón Gestionar Partes (Azul Claro) -->
                    <button class="btn btn-info btn-sm text-white btn-partes me-1" 
                            title="Gestionar Partes" 
                            data-id="${exp.id}" 
                            data-nro="${exp.nroExpediente}">
                        <i class="fas fa-users"></i>
                    </button>
                    <!-- Botón Editar (Amarillo) -->
                    <button class="btn btn-warning btn-sm btn-editar me-1" 
                            data-json='${JSON.stringify(exp)}'>
                        <i class="fas fa-edit"></i>
                    </button>
                    <!-- Botón Eliminar (Rojo) -->
                    <button class="btn btn-danger btn-sm btn-eliminar" 
                            data-id="${exp.id}" 
                            data-nro="${exp.nroExpediente}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tablaBody.appendChild(row);
        });
    };

    // --- FUNCIÓN: CARGAR PARTES (MODAL VÍNCULOS) ---
    const cargarPartes = async (idExpediente) => {
        const vinculos = await obtenerVinculosPorExpediente(idExpediente);
        tablaPartesBody.innerHTML = '';
        
        // Validación de seguridad: si la API devuelve error en vez de array
        if (!Array.isArray(vinculos)) {
            console.error("Error al cargar vínculos:", vinculos);
            if (vinculos && vinculos.message) {
                 tablaPartesBody.innerHTML = `<tr><td colspan="4" class="text-danger text-center">${vinculos.message}</td></tr>`;
            }
            return;
        }

        if (vinculos.length === 0) {
            tablaPartesBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay clientes vinculados a este caso.</td></tr>';
            return;
        }
        
        vinculos.forEach(v => {
            // Buscamos los datos del cliente en nuestro caché local usando el ID
            // Nota: La API de vínculos devuelve { idCliente, idExpediente, demandante }
            const cliente = listaClientesCache.find(c => c.id == v.idCliente);
            
            const nombreCliente = cliente ? `${cliente.apellidoRsocial}, ${cliente.nombres}` : `Cliente ID: ${v.idCliente}`;
            const dniCliente = cliente ? cliente.tipoDni : '-';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${nombreCliente}</td>
                <td>${v.demandante}</td> <!-- Rol en el caso -->
                <td>${dniCliente}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger btn-borrar-parte" 
                            data-cli="${v.idCliente}" 
                            title="Desvincular">
                        &times;
                    </button>
                </td>
            `;
            tablaPartesBody.appendChild(tr);
        });
    };

    // --- EVENTOS: ABM EXPEDIENTES ---

    // Botón Nuevo Expediente
    btnNuevoExpediente.addEventListener('click', () => {
        modo = 'insertar';
        idActual = null;
        form.reset();
        modalLabel.textContent = 'Nuevo Expediente';
        modal.show();
    });

    // Submit Formulario Expediente
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = new FormData(form);
        let res;

        try {
            if (modo === 'insertar') {
                res = await insertarExpediente(datos);
            } else {
                res = await actualizarExpediente(datos, idActual);
            }

            if (res.success) {
                mostrarAlerta(res.message, 'success');
                modal.hide();
                mostrarExpedientes(); // Refrescar tabla
            } else {
                mostrarAlerta(res.message, 'danger');
            }
        } catch (error) {
            mostrarAlerta('Error de conexión.', 'danger');
            console.error(error);
        }
    });

    // Eventos en Tabla Expedientes (Delegación)
    tablaBody.addEventListener('click', (e) => {
        // Detectar clic en botones (incluso si se hace clic en el ícono <i>)
        const btnEditar = e.target.closest('.btn-editar');
        const btnEliminar = e.target.closest('.btn-eliminar');
        const btnPartes = e.target.closest('.btn-partes');

        // --- EDITAR EXPEDIENTE ---
        if (btnEditar) {
            const data = JSON.parse(btnEditar.dataset.json);
            modo = 'actualizar';
            idActual = data.id;
            
            // Llenar formulario
            form.nroExpediente.value = data.nroExpediente;
            form.tipoExpediente.value = data.tipoExpediente;
            form.juzgado.value = data.juzgado; // Selecciona opción correcta si value coincide
            form.tipoJuicio.value = data.tipoJuicio;
            form.caratura.value = data.caratura;
            form.aCargoDe.value = data.aCargoDe;
            form.fInicio.value = data.fInicio;
            form.estado.value = data.estado;
            form.fFin.value = data.fFin;

            modalLabel.textContent = 'Modificar Expediente';
            modal.show();
        }

        // --- ELIMINAR EXPEDIENTE ---
        if (btnEliminar) {
            const id = btnEliminar.dataset.id;
            const nro = btnEliminar.dataset.nro;
            if (confirm(`¿Confirma eliminar el expediente Nro: ${nro}?`)) {
                eliminarExpediente(id).then(res => {
                    if (res.success) {
                        mostrarAlerta(res.message);
                        mostrarExpedientes();
                    } else {
                        mostrarAlerta(res.message, 'danger');
                    }
                });
            }
        }

        // --- GESTIONAR PARTES (ABRIR MODAL VÍNCULOS) ---
        if (btnPartes) {
            const idExp = btnPartes.dataset.id;
            const nroExp = btnPartes.dataset.nro;
            
            lblNroExpediente.textContent = nroExp; // Título del modal
            inputIdExpVinculo.value = idExp;       // Hidden input para el form de agregar
            
            // Guardamos el ID en el elemento del modal para usarlo al refrescar
            modalPartesEl.dataset.idExpActual = idExp; 
            
            cargarPartes(idExp);
            modalPartes.show();
        }
    });

    // --- EVENTOS: GESTIÓN DE PARTES (MODAL SECUNDARIO) ---

    // Submit Agregar Parte
    formParte.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(formParte);
        
        const res = await agregarVinculo(data);
        
        if (res.success) {
            // Limpiar campos visibles pero mantener ID oculto
            const idExp = inputIdExpVinculo.value;
            formParte.reset();
            inputIdExpVinculo.value = idExp; 
            
            mostrarAlerta('Cliente vinculado correctamente.');
            cargarPartes(idExp); // Recargar lista
        } else {
            mostrarAlerta('Error al vincular: ' + (res.message || 'Posible duplicado'), 'danger');
        }
    });

    // Eliminar Parte (Delegación en tabla del modal)
    tablaPartesBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-borrar-parte')) {
            const idCli = e.target.dataset.cli;
            const idExp = modalPartesEl.dataset.idExpActual; // Recuperamos ID guardado
            
            if (confirm('¿Desvincular a este cliente del expediente?')) {
                const res = await borrarVinculo(idExp, idCli);
                if (res.success) {
                    cargarPartes(idExp);
                    mostrarAlerta('Cliente desvinculado.');
                } else {
                    mostrarAlerta('Error al desvincular.', 'danger');
                }
            }
        }
    });

    // --- INICIO ---
    inicializar(); // Arranca todo
});