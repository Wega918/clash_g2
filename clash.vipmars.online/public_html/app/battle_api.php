<?php
session_start();
require_once __DIR__ . '/../system/config.php';
require_once __DIR__ . '/../system/function.php';
require_once __DIR__ . '/../system/game_data_buildings.php';
require_once __DIR__ . '/../system/game_data_entities.php';

header('Content-Type: application/json');
if (!isLoggedIn()) { echo json_encode(['ok' => false, 'error' => 'Not logged in']); exit; }

global $mysqli, $game_data_buildings, $game_data_entities;
$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

if ($action === 'search_opponent') {
    // Ищем врага
    $stmt = $mysqli->prepare("SELECT id, login, level, gold, elixir, dark_elixir, trophies, townhall_level FROM users WHERE id != ? ORDER BY RAND() LIMIT 1");
    $stmt->bind_param("i", $userId); $stmt->execute(); $enemy = $stmt->get_result()->fetch_assoc();
    
    // Если никого нет - подсунем свою базу для тестов
    if (!$enemy) {
        $stmt = $mysqli->prepare("SELECT id, login, level, gold, elixir, dark_elixir, trophies, townhall_level FROM users ORDER BY RAND() LIMIT 1");
        $stmt->execute(); $enemy = $stmt->get_result()->fetch_assoc();
    }
    if (!$enemy) { echo json_encode(['ok' => false, 'error' => 'База пуста.']); exit; }

    // Здания
    $stmt = $mysqli->prepare("SELECT id as instance_id, building_id as id, level FROM user_buildings WHERE user_id = ?");
    $stmt->bind_param("i", $enemy['id']); $stmt->execute(); $buildingsRes = $stmt->get_result();
    $buildings = [];
    while ($row = $buildingsRes->fetch_assoc()) {
        $bData = $game_data_buildings[$row['id']] ?? [];
        $row['name'] = $bData['name'] ?? 'Здание';
        $row['type'] = $bData['type'] ?? 'building';
        $row['icon'] = isset($bData['icon']) ? ltrim($bData['icon'], '/') : 'images/building/Town_Hall/Town_Hall1.png';
        $row['segment'] = $bData['segment'] ?? 0;
        $row['hp'] = $bData['hp'] ?? 1000;
        $buildings[] = $row;
    }
    if (empty($buildings)) { $buildings = [['instance_id' => 1, 'id' => 'th1', 'level' => max(1, $enemy['townhall_level']), 'name' => 'Ратуша', 'type' => 'townhall', 'icon' => 'images/building/Town_Hall/Town_Hall1.png', 'segment' => 3, 'hp' => 1500]]; }

    // Стены
    $stmt = $mysqli->prepare("SELECT COUNT(*) as count, MAX(level) as max_lvl FROM user_buildings WHERE user_id = ? AND building_id LIKE '%wall%'");
    $stmt->bind_param("i", $enemy['id']); $stmt->execute(); $wallData = $stmt->get_result()->fetch_assoc();
    $wallCount = $wallData['count'] > 0 ? $wallData['count'] : 50;
    $wallHpPerPiece = $wallData['max_lvl'] > 0 ? ($wallData['max_lvl'] * 100) : 300; 
    $walls = [['id' => 'wall_group', 'maxHp' => $wallHpPerPiece * $wallCount, 'count' => $wallCount]];

    // Армия
    $stmt = $mysqli->prepare("SELECT troop_id as id, level, count FROM user_troops WHERE user_id = ? AND count > 0");
    $stmt->bind_param("i", $userId); $stmt->execute(); $troopsRes = $stmt->get_result();
    $troops = [];
    while ($row = $troopsRes->fetch_assoc()) { 
        $tData = $game_data_entities[$row['id']] ?? [];
        $row['name'] = $tData['name'] ?? 'Юнит';
        $row['kind'] = 'troop';
        $row['hp'] = $tData['hp'] ?? 100;
        $row['icon'] = isset($tData['avatar']) ? ltrim($tData['avatar'], '/') : 'images/warriors/Barbarian/Avatar_Barbarian.png';
        $troops[] = $row; 
    }
    if (empty($troops)) { $troops = [['id' => 'barbarian', 'level' => 1, 'count' => 30, 'name' => 'Варвар', 'kind' => 'troop', 'icon' => 'images/warriors/Barbarian/Avatar_Barbarian.png', 'hp' => 45, 'dps' => 9]]; }

    echo json_encode([
        'ok' => true,
        'target' => [
            'id' => $enemy['id'], 'login' => $enemy['login'], 'townhall_level' => max(1, $enemy['townhall_level']), 'trophies' => 25,
            'resources' => ['gold' => floor($enemy['gold'] * 0.15), 'elixir' => floor($enemy['elixir'] * 0.15), 'dark_elixir' => floor($enemy['dark_elixir'] * 0.05)],
            'base' => ['buildings' => $buildings, 'walls' => $walls]
        ],
        'army' => ['troops' => $troops]
    ]);
    exit;
}

if ($action === 'save_result') {
    $stars = (int)($_POST['stars'] ?? 0); $percent = (int)($_POST['percent'] ?? 0);
    $gold = (int)($_POST['gold'] ?? 0); $elixir = (int)($_POST['elixir'] ?? 0);
    echo json_encode(['ok' => true, 'redirect_spa' => 'battle_result&s='.$stars.'&p='.$percent.'&g='.$gold.'&e='.$elixir]);
    exit;
}
echo json_encode(['ok' => false, 'error' => 'Unknown action']);