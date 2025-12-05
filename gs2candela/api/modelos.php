<?php 
require_once 'config.php';

class Conexion {
    protected $db;
    public function __construct() {
        $this->db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if( $this->db->connect_errno) {
            die('Fallo al conectar a MySQL: ' . $this->db->connect_error);
        }
        $this->db->set_charset(DB_CHARSET);
        $this->db->query("SET NAMES 'utf8'");
    }
}

class Modelo extends Conexion {
    private $tabla;
    private $criterio = '';
    private $campos = '*';
    private $orden = 'id';
    private $limite = 0;
    
    public function __construct($tabla) {
        parent::__construct();
        $this->tabla = $tabla;
    }

    public function getCriterio() { return $this->criterio; }
    public function setCriterio($criterio) { $this->criterio = $criterio; }
    public function setOrden($orden) { $this->orden = $orden; } // Agregado setter faltante en lógica previa

    public function seleccionar() {
        // CORRECCIÓN: Backticks en el nombre de la tabla para soportar guiones
        $sql = "SELECT $this->campos FROM `$this->tabla`";
        if($this->criterio != '') {
            $sql .= " WHERE $this->criterio";
        }
        // Solo agregamos ORDER BY si se definió un orden
        if ($this->orden) {
            $sql .= " ORDER BY $this->orden";
        }
        if($this->limite > 0) {
            $sql .= " LIMIT $this->limite";
        }

        $resultado = $this->db->query($sql);
        
        // Si hay error en la consulta, lanzamos excepción para que datos.php la capture
        if (!$resultado) {
            throw new Exception("Error SQL: " . $this->db->error);
        }

        $datos = $resultado->fetch_all(MYSQLI_ASSOC);
        return json_encode($datos);
    }

    public function insertar($datos) {
        if (isset($datos['id'])) unset($datos['id']);

        $campos = implode(", ", array_map(function($k){ return "`$k`"; }, array_keys($datos))); // Escapar campos
        $placeholders = implode(", ", array_fill(0, count($datos), "?"));
        
        $sql = "INSERT INTO `$this->tabla` ($campos) VALUES ($placeholders)";
        
        $stmt = $this->db->prepare($sql);
        if (!$stmt) throw new Exception("Error Prepare: " . $this->db->error);

        $types = str_repeat('s', count($datos));
        $valores = array_values($datos);
        $stmt->bind_param($types, ...$valores);

        if ($stmt->execute()) {
            return $this->db->insert_id;
        } else {
            throw new Exception("Error Execute: " . $stmt->error);
        }
    }

    public function actualizar($datos) {
        if (isset($datos['id'])) unset($datos['id']);

        $set_pairs = [];
        foreach ($datos as $key => $value) {
            $set_pairs[] = "`$key` = ?";
        }
        
        $sql = "UPDATE `$this->tabla` SET " . implode(", ", $set_pairs) . " WHERE $this->criterio";

        $stmt = $this->db->prepare($sql);
        if (!$stmt) throw new Exception("Error Prepare: " . $this->db->error);

        $types = str_repeat('s', count($datos));
        $valores = array_values($datos);
        $stmt->bind_param($types, ...$valores);
        $stmt->execute();
    }

    public function eliminar() {
        $sql = "DELETE FROM `$this->tabla` WHERE $this->criterio";
        if (!$this->db->query($sql)) {
             throw new Exception("Error Delete: " . $this->db->error);
        }
    }
}
?>