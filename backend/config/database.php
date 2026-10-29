<?php
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        $host = 'localhost';
        $db   = 'corimexo';
        $user = 'root';
        $pass = '';
        $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}
