/* * MODELO DE JUZGADOS
 * Se encarga de la comunicación con la API (api/datos.php)
 * para la tabla 'juzgado'.
 * Exporta funciones para las operaciones CRUD.
 */

// URL base de la API para la tabla 'juzgado'
const url = '../api/datos.php?tabla=juzgado';

/**
 * Seleccionar (Read)
 * Obtiene todos los registros de juzgados.
 * @returns {Promise<Array>} Un array de objetos (juzgados)
 */
export const seleccionarJuzgados = async () => {
    try {
        const res = await fetch(`${url}&accion=seleccionar`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const datos = await res.json();
        return datos;
    } catch (error) {
        console.error('Error al seleccionar juzgados:', error);
        return []; // Devuelve array vacío en caso de error
    }
};

/**
 * Insertar (Create)
 * Envía un nuevo registro de juzgado a la API.
 * @param {FormData} datos - Los datos del formulario.
 * @returns {Promise<Object>} La respuesta JSON de la API.
 */
export const insertarJuzgado = async (datos) => {
    try {
        const res = await fetch(`${url}&accion=insertar`, {
            method: 'POST',
            body: datos
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const respuesta = await res.json();
        return respuesta;
    } catch (error) {
        console.error('Error al insertar juzgado:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Actualizar (Update)
 * Envía los datos de un juzgado para modificarlo, según un ID.
 * @param {FormData} datos - Los datos del formulario.
 * @param {number} id - El ID del juzgado a actualizar.
 * @returns {Promise<Object>} La respuesta JSON de la API.
 */
export const actualizarJuzgado = async (datos, id) => {
    try {
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
        console.error('Error al actualizar juzgado:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Eliminar (Delete)
 * Solicita a la API eliminar un juzgado según su ID.
 * @param {number} id - El ID del juzgado a eliminar.
 * @returns {Promise<Object>} La respuesta JSON de la API.
 */
export const eliminarJuzgado = async (id) => {
    try {
        const res = await fetch(`${url}&accion=eliminar&id=${id}`, {
            method: 'POST' // Usamos POST para eliminar por coherencia, aunque DELETE es otra opción
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const respuesta = await res.json();
        return respuesta;
    } catch (error) {
        console.error('Error al eliminar juzgado:', error);
        return { success: false, message: error.message };
    }
};