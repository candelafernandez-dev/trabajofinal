<?php
ob_start();
require_once 'config.php';

// Conexión simple (reutilizando constantes de config)
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$mysqli->set_charset(DB_CHARSET);

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'Credenciales inválidas'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recibir JSON o POST normal
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? $_POST['email'] ?? '';
    $password = $input['password'] ?? $_POST['password'] ?? '';

    if (!empty($email) && !empty($password)) {
        
        // CONSULTA SIN HASH: Comparamos texto plano
        $stmt = $mysqli->prepare("SELECT id, nombre, email, rol FROM usuarios WHERE email = ? AND password = ?");
        $stmt->bind_param("ss", $email, $password);
        
        $stmt->execute();
        $result = $stmt->get_result();

        if ($user = $result->fetch_assoc()) {
            // Login Exitoso
            $response = [
                'success' => true,
                'message' => 'Bienvenido',
                'user' => $user // Devolvemos datos del usuario
            ];
        }
    }
}

ob_clean();
echo json_encode($response);
?>