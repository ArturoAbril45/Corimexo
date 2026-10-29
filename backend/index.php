<?php
$path  = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts = explode('/', $path);
// Soporta que el backend cuelgue de /backend/... o directo en la raíz
$idx = array_search('backend', $parts);
$segment = $idx !== false ? ($parts[$idx + 1] ?? '') : ($parts[0] ?? '');

// El servidor embebido de PHP no sirve archivos estáticos solo (a diferencia de Apache),
// así que las imágenes subidas por el admin se sirven manualmente acá.
if ($segment === 'uploads') {
    $rest = array_slice($parts, ($idx !== false ? $idx : -1) + 2);
    $file = __DIR__ . '/uploads/' . implode('/', $rest);
    if (is_file($file)) {
        $mime = ['jpg'=>'image/jpeg','jpeg'=>'image/jpeg','png'=>'image/png','webp'=>'image/webp','gif'=>'image/gif']
            [strtolower(pathinfo($file, PATHINFO_EXTENSION))] ?? 'application/octet-stream';
        header('Content-Type: ' . $mime);
        header('Cache-Control: public, max-age=86400');
        readfile($file);
        exit;
    }
    http_response_code(404);
    exit;
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Token');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require __DIR__ . '/config/database.php';
require __DIR__ . '/middleware/auth.php';

$routes = [
    'auth'          => 'routes/auth.php',
    'chat'          => 'routes/chat.php',
    'productos'     => 'routes/productos.php',
    'usuarios'      => 'routes/usuarios.php',
];

if (isset($routes[$segment])) {
    require __DIR__ . '/' . $routes[$segment];
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Ruta no encontrada']);
}
