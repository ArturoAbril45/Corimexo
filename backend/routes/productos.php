<?php
$method = $_SERVER['REQUEST_METHOD'];
$parts  = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$idx    = array_search('productos', $parts);
$next   = $parts[$idx + 1] ?? '';
$db     = getDB();

function cxSlugify($texto) {
    $texto = strtolower(trim($texto));
    $texto = str_replace(['á','é','í','ó','ú','ñ','Á','É','Í','Ó','Ú','Ñ'], ['a','e','i','o','u','n','a','e','i','o','u','n'], $texto);
    $texto = preg_replace('/[^a-z0-9]+/', '-', $texto);
    return trim($texto, '-');
}

function cxSlugUnico($db, $base, $excludeId = null) {
    $slug = $base ?: 'producto';
    $i = 2;
    while (true) {
        $stmt = $db->prepare("SELECT id FROM productos WHERE slug = ?" . ($excludeId ? " AND id != ?" : ""));
        $excludeId ? $stmt->execute([$slug, $excludeId]) : $stmt->execute([$slug]);
        if (!$stmt->fetch()) return $slug;
        $slug = $base . '-' . $i;
        $i++;
    }
}

function cxGuardarImagen($campo) {
    if (empty($_FILES[$campo]['tmp_name'])) return null;
    $dir = __DIR__ . '/../uploads/';
    if (!is_dir($dir)) mkdir($dir, 0777, true);
    $ext = strtolower(pathinfo($_FILES[$campo]['name'], PATHINFO_EXTENSION));
    $fname = uniqid('prod_') . '.' . $ext;
    move_uploaded_file($_FILES[$campo]['tmp_name'], $dir . $fname);
    return '/backend/uploads/' . $fname;
}

// GET /productos — listado público (o admin con ?todos=1 para incluir ocultos)
if ($method === 'GET' && !$next) {
    $incluirOcultos = !empty($_GET['todos']);
    $sql = "SELECT * FROM productos" . ($incluirOcultos ? "" : " WHERE visible = 1") . " ORDER BY categoria, id";
    echo json_encode($db->query($sql)->fetchAll());

// GET /productos/{slug} — detalle público por slug
} elseif ($method === 'GET' && $next && !is_numeric($next)) {
    $stmt = $db->prepare("SELECT * FROM productos WHERE slug = ? AND visible = 1");
    $stmt->execute([$next]);
    $p = $stmt->fetch();
    if (!$p) { http_response_code(404); echo json_encode(['error' => 'No encontrado']); exit; }
    echo json_encode($p);

// POST /productos — crear (admin)
} elseif ($method === 'POST' && !$next) {
    requireAuth();
    $b = $_POST;
    $nombre = trim($b['nombre'] ?? '');
    $categoria = trim($b['categoria'] ?? '');
    if (!$nombre || !$categoria) { http_response_code(422); echo json_encode(['error' => 'Nombre y categoría son obligatorios']); exit; }

    $slug = cxSlugUnico($db, cxSlugify($nombre));
    $imagen = cxGuardarImagen('imagen');
    $imagen2 = cxGuardarImagen('imagen2');
    $precio = ($b['precio'] ?? '') !== '' ? (float)$b['precio'] : null;

    $db->prepare("INSERT INTO productos (nombre, slug, categoria, precio, material, descripcion, imagen, imagen2, visible, destacado) VALUES (?,?,?,?,?,?,?,?,?,?)")
       ->execute([$nombre, $slug, $categoria, $precio, trim($b['material'] ?? '') ?: null, $b['descripcion'] ?? null, $imagen, $imagen2, isset($b['visible']) ? (int)$b['visible'] : 1, !empty($b['destacado']) ? 1 : 0]);

    $id = $db->lastInsertId();
    $stmt = $db->prepare("SELECT * FROM productos WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());

// POST /productos/{id}?action=editar — editar (admin)
} elseif ($method === 'POST' && $next && is_numeric($next) && ($_GET['action'] ?? '') === 'editar') {
    requireAuth();
    $b = $_POST;
    $nombre = trim($b['nombre'] ?? '');
    $categoria = trim($b['categoria'] ?? '');
    if (!$nombre || !$categoria) { http_response_code(422); echo json_encode(['error' => 'Nombre y categoría son obligatorios']); exit; }

    $imagen = cxGuardarImagen('imagen');
    $imagen2 = cxGuardarImagen('imagen2');
    $precio = ($b['precio'] ?? '') !== '' ? (float)$b['precio'] : null;
    $params = [$nombre, $categoria, $precio, trim($b['material'] ?? '') ?: null, $b['descripcion'] ?? null, isset($b['visible']) ? (int)$b['visible'] : 1, !empty($b['destacado']) ? 1 : 0];
    $sql = "UPDATE productos SET nombre=?, categoria=?, precio=?, material=?, descripcion=?, visible=?, destacado=?";
    if ($imagen) { $sql .= ", imagen=?"; $params[] = $imagen; }
    if ($imagen2) { $sql .= ", imagen2=?"; $params[] = $imagen2; }
    $sql .= " WHERE id=?";
    $params[] = (int)$next;
    $db->prepare($sql)->execute($params);

    $stmt = $db->prepare("SELECT * FROM productos WHERE id = ?");
    $stmt->execute([(int)$next]);
    echo json_encode($stmt->fetch());

// DELETE /productos/{id} — eliminar (admin)
} elseif ($method === 'DELETE' && $next && is_numeric($next)) {
    requireAuth();
    $db->prepare("DELETE FROM productos WHERE id = ?")->execute([(int)$next]);
    echo json_encode(['ok' => true]);

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Ruta no encontrada']);
}
