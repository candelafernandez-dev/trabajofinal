/* * MODELO DE CLIENTES
 * Se encarga de la comunicación con la API (api/datos.php)
 * para la tabla 'clientes'.
 * Exporta funciones para las operaciones CRUD.
 */

// URL base de la API para la tabla 'clientes'
const url = '../api/datos.php?tabla=clientes';

/**
 * Seleccionar (Read)
 * Obtiene todos los registros de clientes.
 * @returns {Promise<Array>} Un array de objetos (clientes)
 */
export const seleccionarClientes = async () => {
    try {
        const res = await fetch(`${url}&accion=seleccionar`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const datos = await res.json();
        return datos;
    } catch (error) {
        console.error('Error al seleccionar clientes:', error);
        return []; // Devuelve array vacío en caso de error
    }
};

/**
 * Insertar (Create)
 * Envía un nuevo registro de cliente a la API.
 * @param {FormData} datos - Los datos del formulario (incluyendo imagen).
 * @returns {Promise<Object>} La respuesta JSON de la API.
 */
export const insertarCliente = async (datos) => {
    try {
        const res = await fetch(`${url}&accion=insertar`, {
            method: 'POST',
            body: datos // FormData manejará el 'multipart/form-data'
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const respuesta = await res.json();
        return respuesta;
    } catch (error) {
        console.error('Error al insertar cliente:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Actualizar (Update)
 * Envía los datos de un cliente para modificarlo, según un ID.
 * @param {FormData} datos - Los datos del formulario (incluyendo imagen).
 * @param {number} id - El ID del cliente a actualizar.
 * @returns {Promise<Object>} La respuesta JSON de la API.
 */
export const actualizarCliente = async (datos, id) => {
    try {
        // El FormData se envía. Si 'imagen' está vacío, 
        // la API PHP simplemente no lo procesará y no actualizará ese campo.
        const res = await fetch(`${url}&accion=actualizar&id=${id}`, {
            method: 'POST',
            body: datos
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const respuesta = await res.json();
        return respuesta;
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Eliminar (Delete)
 * Solicita a la API eliminar un cliente según su ID.
 * @param {number} id - El ID del cliente a eliminar.
 * @returns {Promise<Object>} La respuesta JSON de la API.
 */
export const eliminarCliente = async (id) => {
    try {
        const res = await fetch(`${url}&accion=eliminar&id=${id}`, {
            method: 'POST'
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const respuesta = await res.json();
        return respuesta;
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        return { success: false, message: error.message };
    }
};