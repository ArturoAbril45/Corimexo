<?php
function requireAuth() {
    $headers = getallheaders();
    $token = $headers['X-Token'] ?? $headers['x-token'] ?? '';
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Token requerido']);
        exit;
    }
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM usuarios WHERE token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Token inválido']);
        exit;
    }
    return $user;
}
