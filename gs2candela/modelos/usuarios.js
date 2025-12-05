const url = '../api/datos.php?tabla=usuarios';

export const seleccionarUsuarios = async () => {
    try {
        const res = await fetch(`${url}&accion=seleccionar`);
        return await res.json();
    } catch (error) { return []; }
};

export const insertarUsuario = async (datos) => {
    try {
        const res = await fetch(`${url}&accion=insertar`, { method: 'POST', body: datos });
        return await res.json();
    } catch (error) { return { success: false, message: error.message }; }
};

export const actualizarUsuario = async (datos, id) => {
    try {
        const res = await fetch(`${url}&accion=actualizar&id=${id}`, { method: 'POST', body: datos });
        return await res.json();
    } catch (error) { return { success: false, message: error.message }; }
};

export const eliminarUsuario = async (id) => {
    try {
        const res = await fetch(`${url}&accion=eliminar&id=${id}`, { method: 'POST' });
        return await res.json();
    } catch (error) { return { success: false, message: error.message }; }
};