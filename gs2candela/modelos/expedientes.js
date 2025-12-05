/* * MODELO DE EXPEDIENTES
 * Comunicación con la API para la tabla 'expedientes'
 */

const url = '../api/datos.php?tabla=expedientes';

export const seleccionarExpedientes = async () => {
    try {
        const res = await fetch(`${url}&accion=seleccionar`);
        return await res.json();
    } catch (error) {
        console.error('Error al obtener expedientes:', error);
        return [];
    }
};

export const insertarExpediente = async (datos) => {
    try {
        const res = await fetch(`${url}&accion=insertar`, {
            method: 'POST',
            body: datos
        });
        return await res.json();
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const actualizarExpediente = async (datos, id) => {
    try {
        const res = await fetch(`${url}&accion=actualizar&id=${id}`, {
            method: 'POST',
            body: datos
        });
        return await res.json();
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const eliminarExpediente = async (id) => {
    try {
        const res = await fetch(`${url}&accion=eliminar&id=${id}`, {
            method: 'POST'
        });
        return await res.json();
    } catch (error) {
        return { success: false, message: error.message };
    }
};