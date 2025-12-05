<?php
ob_start();
require_once 'modelos.php';
ini_set('display_errors', 0); // En producción, 0 para no romper JSON
error_reporting(E_ALL);

$response = ['success' => false, 'message' => 'Error desconocido'];

function enviarJSON($data) {
    ob_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

try {
    if (!isset($_GET['tabla'])) {
        $response['message'] = 'Falta parametro tabla';
        enviarJSON($response);
    }

    $tabla = $_GET['tabla'];
    $modelo = new Modelo($tabla);

    // --- CONFIGURACIÓN ESPECÍFICA ---
    // Si es la tabla de vínculos, cambiamos el orden por defecto porque NO tiene columna 'id'
    if ($tabla === 'cliente-expediente') {
        $modelo->setOrden('idCliente'); 
    }

    // Saneamiento de ID genérico
    if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        $modelo->setCriterio("id=$id");
    }

    if (isset($_GET['accion'])) {
        $accion = $_GET['accion'];
        $valores = $_POST;

        // Lógica Imágenes (Clientes)
        if ($tabla === 'clientes' && isset($_FILES['imagen']) && $_FILES['imagen']['error'] === 0) {
            $dir = __DIR__ . '/../imagenes/clientes/';
            if (!is_dir($dir)) mkdir($dir, 0777, true);
            $ext = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
            $nombre = uniqid('cli_') . '.' . $ext;
            if (move_uploaded_file($_FILES['imagen']['tmp_name'], $dir . $nombre)) {
                $valores['imagen'] = $nombre;
            }
        }

        // --- VINCULOS (Lógica especial) ---
        if ($tabla === 'cliente-expediente') {
            if ($accion === 'seleccionar' && isset($_GET['idExpediente'])) {
                $idExp = (int)$_GET['idExpediente'];
                $modelo->setCriterio("idExpediente = $idExp");
                $datos = $modelo->seleccionar();
                ob_clean();
                echo $datos;
                exit;
            }
            if ($accion === 'eliminar' && isset($_GET['idCliente'], $_GET['idExpediente'])) {
                $cli = (int)$_GET['idCliente'];
                $exp = (int)$_GET['idExpediente'];
                $modelo->setCriterio("idCliente=$cli AND idExpediente=$exp");
                $modelo->eliminar();
                enviarJSON(['success' => true]);
            }
        }

        // --- CRUD GENÉRICO ---
        switch ($accion) {
            case 'seleccionar':
                echo $modelo->seleccionar();
                exit;
            case 'insertar':
                $id = $modelo->insertar($valores);
                enviarJSON(['success' => true, 'id' => $id, 'message' => 'Guardado']);
                break;
            case 'actualizar':
                $modelo->actualizar($valores);
                enviarJSON(['success' => true, 'message' => 'Actualizado']);
                break;
            case 'eliminar':
                $modelo->eliminar();
                enviarJSON(['success' => true, 'message' => 'Eliminado']);
                break;
        }
    }
} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
}
enviarJSON($response);
?>