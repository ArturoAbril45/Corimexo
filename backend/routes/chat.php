<?php
$method = $_SERVER['REQUEST_METHOD'];
$parts  = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$idx    = array_search('chat', $parts);
$action = $parts[$idx + 1] ?? '';
$sub    = $parts[$idx + 2] ?? '';
$sub2   = $parts[$idx + 3] ?? '';
$db     = getDB();

// Visitante inicia (o reanuda) una conversación con su token guardado en localStorage
if ($method === 'POST' && $action === 'iniciar') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $visitorToken = $b['visitor_token'] ?? null;

    if ($visitorToken) {
        $stmt = $db->prepare("SELECT * FROM chat_conversaciones WHERE visitor_token = ?");
        $stmt->execute([$visitorToken]);
        $conv = $stmt->fetch();
        if ($conv) { echo json_encode($conv); exit; }
    }

    $visitorToken = bin2hex(random_bytes(16));
    $nombre = trim($b['nombre'] ?? '') ?: 'Visitante';
    $email  = trim($b['email'] ?? '') ?: null;

    $db->prepare("INSERT INTO chat_conversaciones (visitor_token, visitor_nombre, visitor_email, estado) VALUES (?,?,?,'abierta')")
       ->execute([$visitorToken, $nombre, $email]);
    $id = $db->lastInsertId();

    $stmt = $db->prepare("SELECT * FROM chat_conversaciones WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());

// Admin: lista de conversaciones con último mensaje y no-leídos
} elseif ($method === 'GET' && $action === 'conversaciones' && !$sub) {
    requireAuth();
    $stmt = $db->query(
        "SELECT c.*, u.nombre AS agente_nombre,
            (SELECT mensaje FROM chat_mensajes m WHERE m.conversacion_id = c.id ORDER BY m.id DESC LIMIT 1) AS ultimo_mensaje,
            (SELECT created_at FROM chat_mensajes m WHERE m.conversacion_id = c.id ORDER BY m.id DESC LIMIT 1) AS ultimo_fecha,
            (SELECT COUNT(*) FROM chat_mensajes m WHERE m.conversacion_id = c.id AND m.remitente='visitante' AND m.leido = 0) AS no_leidos
         FROM chat_conversaciones c
         LEFT JOIN usuarios u ON c.agente_id = u.id
         ORDER BY ultimo_fecha IS NULL, ultimo_fecha DESC, c.created_at DESC"
    );
    echo json_encode($stmt->fetchAll());

// Mensajes de una conversación — visitante (por token) o admin (por token de sesión)
} elseif ($method === 'GET' && $action === 'conversaciones' && $sub && $sub2 === 'mensajes') {
    $convId = (int)$sub;
    $esAdmin = false;
    $headers = getallheaders();
    if (!empty($headers['X-Token'])) {
        $u = $db->prepare("SELECT id FROM usuarios WHERE token = ?");
        $u->execute([$headers['X-Token']]);
        if ($u->fetch()) $esAdmin = true;
    }
    if ($esAdmin) {
        $db->prepare("UPDATE chat_mensajes SET leido = 1 WHERE conversacion_id = ? AND remitente = 'visitante'")->execute([$convId]);
    } else {
        $db->prepare("UPDATE chat_mensajes SET leido = 1 WHERE conversacion_id = ? AND remitente = 'admin'")->execute([$convId]);
    }
    $stmt = $db->prepare("SELECT * FROM chat_mensajes WHERE conversacion_id = ? ORDER BY id ASC");
    $stmt->execute([$convId]);
    echo json_encode($stmt->fetchAll());

// Enviar mensaje — visitante (con visitor_token) o admin (con X-Token)
} elseif ($method === 'POST' && $action === 'mensajes') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $mensaje = trim($b['mensaje'] ?? '');
    if (!$mensaje) { http_response_code(422); echo json_encode(['error' => 'Mensaje vacío']); exit; }

    $headers = getallheaders();
    $adminNombre = null;
    $remitente = 'visitante';
    $convId = (int)($b['conversacion_id'] ?? 0);

    if (!empty($headers['X-Token'])) {
        $u = $db->prepare("SELECT * FROM usuarios WHERE token = ?");
        $u->execute([$headers['X-Token']]);
        $user = $u->fetch();
        if ($user) { $remitente = 'admin'; $adminNombre = $user['nombre']; }
    }

    if (!$convId) { http_response_code(422); echo json_encode(['error' => 'Falta conversacion_id']); exit; }

    $db->prepare("INSERT INTO chat_mensajes (conversacion_id, remitente, nombre_admin, mensaje) VALUES (?,?,?,?)")
       ->execute([$convId, $remitente, $adminNombre, $mensaje]);
    $id = $db->lastInsertId();
    $db->prepare("UPDATE chat_conversaciones SET updated_at = NOW(), estado = 'abierta' WHERE id = ?")->execute([$convId]);

    // El primer agente que responde una conversación sin asignar la toma automáticamente.
    if ($remitente === 'admin') {
        $db->prepare("UPDATE chat_conversaciones SET agente_id = ? WHERE id = ? AND agente_id IS NULL")
           ->execute([$user['id'], $convId]);
    }

    $stmt = $db->prepare("SELECT * FROM chat_mensajes WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());

// Admin cierra una conversación
} elseif ($method === 'POST' && $action === 'conversaciones' && $sub && $sub2 === 'cerrar') {
    requireAuth();
    $db->prepare("UPDATE chat_conversaciones SET estado = 'cerrada' WHERE id = ?")->execute([(int)$sub]);
    echo json_encode(['ok' => true]);

// Transferir una conversación a otro agente
} elseif ($method === 'POST' && $action === 'conversaciones' && $sub && $sub2 === 'transferir') {
    requireAuth();
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $agenteId = !empty($b['agente_id']) ? (int)$b['agente_id'] : null;

    if ($agenteId) {
        $chk = $db->prepare("SELECT id FROM usuarios WHERE id = ?");
        $chk->execute([$agenteId]);
        if (!$chk->fetch()) { http_response_code(422); echo json_encode(['error' => 'Agente no encontrado']); exit; }
    }

    $db->prepare("UPDATE chat_conversaciones SET agente_id = ? WHERE id = ?")->execute([$agenteId, (int)$sub]);
    $stmt = $db->prepare("SELECT c.*, u.nombre AS agente_nombre FROM chat_conversaciones c LEFT JOIN usuarios u ON c.agente_id = u.id WHERE c.id = ?");
    $stmt->execute([(int)$sub]);
    echo json_encode($stmt->fetch());

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Ruta no encontrada']);
}
