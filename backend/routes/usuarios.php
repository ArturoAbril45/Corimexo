<?php
$method = $_SERVER['REQUEST_METHOD'];
$parts  = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$idx    = array_search('usuarios', $parts);
$next   = $parts[$idx + 1] ?? '';
$db     = getDB();

function cxRequireAdmin() {
    $user = requireAuth();
    if ($user['rol'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Solo un administrador puede hacer esto']);
        exit;
    }
    return $user;
}

// GET /usuarios — cualquier usuario logueado puede ver la lista (para transferir chats)
if ($method === 'GET' && !$next) {
    requireAuth();
    $stmt = $db->query("SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY nombre");
    echo json_encode($stmt->fetchAll());

// POST /usuarios — crear agente/admin (solo admin)
} elseif ($method === 'POST' && !$next) {
    cxRequireAdmin();
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $nombre = trim($b['nombre'] ?? '');
    $email  = trim($b['email'] ?? '');
    $pass   = $b['password'] ?? '';
    $rol    = in_array($b['rol'] ?? '', ['admin', 'agente']) ? $b['rol'] : 'agente';

    if (!$nombre || !$email || strlen($pass) < 6) {
        http_response_code(422);
        echo json_encode(['error' => 'Nombre, correo y una contraseña de al menos 6 caracteres son obligatorios']);
        exit;
    }

    $existe = $db->prepare("SELECT id FROM usuarios WHERE email = ?");
    $existe->execute([$email]);
    if ($existe->fetch()) { http_response_code(422); echo json_encode(['error' => 'Ya existe un usuario con ese correo']); exit; }

    $db->prepare("INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?,?,?,?)")
       ->execute([$nombre, $email, password_hash($pass, PASSWORD_DEFAULT), $rol]);

    $id = $db->lastInsertId();
    $stmt = $db->prepare("SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());

// POST /usuarios/{id}?action=editar — editar nombre/rol/(opcional) contraseña (solo admin)
} elseif ($method === 'POST' && $next && ($_GET['action'] ?? '') === 'editar') {
    $admin = cxRequireAdmin();
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)$next;
    $nombre = trim($b['nombre'] ?? '');
    $rol = in_array($b['rol'] ?? '', ['admin', 'agente']) ? $b['rol'] : 'agente';
    if (!$nombre) { http_response_code(422); echo json_encode(['error' => 'El nombre es obligatorio']); exit; }

    if ($admin['id'] === $id && $rol !== 'admin') {
        http_response_code(422);
        echo json_encode(['error' => 'No podés quitarte tu propio rol de administrador']);
        exit;
    }

    if (!empty($b['password'])) {
        if (strlen($b['password']) < 6) { http_response_code(422); echo json_encode(['error' => 'La contraseña debe tener al menos 6 caracteres']); exit; }
        $db->prepare("UPDATE usuarios SET nombre=?, rol=?, password_hash=? WHERE id=?")
           ->execute([$nombre, $rol, password_hash($b['password'], PASSWORD_DEFAULT), $id]);
    } else {
        $db->prepare("UPDATE usuarios SET nombre=?, rol=? WHERE id=?")->execute([$nombre, $rol, $id]);
    }

    $stmt = $db->prepare("SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());

// DELETE /usuarios/{id} — eliminar agente (solo admin, no a sí mismo)
} elseif ($method === 'DELETE' && $next) {
    $admin = cxRequireAdmin();
    $id = (int)$next;
    if ($admin['id'] === $id) { http_response_code(422); echo json_encode(['error' => 'No podés eliminar tu propio usuario']); exit; }
    $db->prepare("UPDATE chat_conversaciones SET agente_id = NULL WHERE agente_id = ?")->execute([$id]);
    $db->prepare("DELETE FROM usuarios WHERE id = ?")->execute([$id]);
    echo json_encode(['ok' => true]);

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Ruta no encontrada']);
}
