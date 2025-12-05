/* MODELO DE VÍNCULOS (Tabla 'cliente-expediente') */

const url = '../api/datos.php?tabla=cliente-expediente';

/**
 * Obtiene los vínculos de un expediente específico.
 */
export const obtenerVinculosPorExpediente = async (idExpediente) => {
    try {
        const res = await fetch(`${url}&accion=seleccionar&idExpediente=${idExpediente}`);
        return await res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

/**
 * Vincula un cliente a un expediente.
 */
export const agregarVinculo = async (datos) => {
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

/**
 * Elimina el vínculo entre un cliente y un expediente.
 */
export const borrarVinculo = async (idExpediente, idCliente) => {
    try {
        const res = await fetch(`${url}&accion=eliminar&idExpediente=${idExpediente}&idCliente=${idCliente}`, {
            method: 'POST'
        });
        return await res.json();
    } catch (error) {
        return { success: false, message: error.message };
    }
};