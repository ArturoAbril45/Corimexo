<?php
$method = $_SERVER['REQUEST_METHOD'];
$parts  = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$idx    = array_search('auth', $parts);
$action = $parts[$idx + 1] ?? '';
$db     = getDB();

if ($method === 'POST' && $action === 'login') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = trim($b['email'] ?? '');
    $pass  = $b['password'] ?? '';

    $stmt = $db->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($pass, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Correo o contraseña incorrectos']);
        exit;
    }

    $token = bin2hex(random_bytes(32));
    $db->prepare("UPDATE usuarios SET token = ? WHERE id = ?")->execute([$token, $user['id']]);

    echo json_encode([
        'token' => $token,
        'user'  => ['id' => $user['id'], 'nombre' => $user['nombre'], 'email' => $user['email'], 'rol' => $user['rol']],
    ]);

} elseif ($method === 'GET' && $action === 'me') {
    $user = requireAuth();
    echo json_encode(['id' => $user['id'], 'nombre' => $user['nombre'], 'email' => $user['email'], 'rol' => $user['rol']]);

} elseif ($method === 'POST' && $action === 'logout') {
    $user = requireAuth();
    $db->prepare("UPDATE usuarios SET token = NULL WHERE id = ?")->execute([$user['id']]);
    echo json_encode(['ok' => true]);

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Ruta no encontrada']);
}
