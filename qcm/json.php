<?php
$files = [
    'bpi' => 'bpi.json',
    'bp'  => 'bp.json',
    'bpc' => 'bpc.json'
];

$allQuestions = [];
$questionMap = []; // clé = hash de question + réponses, valeur = info de la question et niveaux

foreach ($files as $level => $file) {
    if (!file_exists($file)) continue;

    $json = json_decode(file_get_contents($file), true);
    if (!isset($json['data'])) continue;

    foreach ($json['data'] as $q) {
        // Générer un hash unique pour la question + options
        $hashData = $q['question'];
        foreach ($q['answers'] as $a) {
            $hashData .= '||' . $a['text'] . '::' . $a['points'];
        }
        $hash = md5($hashData);

        // Ajouter le niveau
        $q['level'] = $level;

        if (!isset($questionMap[$hash])) {
            $questionMap[$hash] = [
                'question' => $q['question'],
                'answers'  => $q['answers'],
                'levels'   => []
            ];
        }
        $questionMap[$hash]['levels'][] = $level;
    }
}

// Extraire les questions présentes dans plusieurs niveaux
$duplicates = [];
foreach ($questionMap as $hash => $info) {
    if (count($info['levels']) > 1) {
        $duplicates[] = $info;
    }
}

// Affichage simple
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Questions exactes en plusieurs niveaux</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 20px auto; padding: 0 15px; }
        h1 { color: #333; }
        .question { margin-bottom: 20px; padding: 12px 15px; background: #f0f0f0; border-radius: 6px; }
        .levels { font-size: 0.9em; color: #555; margin-top: 5px; }
        .answer { margin-left: 20px; font-size: 0.95em; }
    </style>
</head>
<body>
    <h1>Questions exactes présentes dans plusieurs niveaux</h1>

    <?php if (empty($duplicates)): ?>
        <p>Aucune question identique trouvée.</p>
    <?php else: ?>
        <?php foreach ($duplicates as $dup): ?>
            <div class="question">
                <?= htmlspecialchars($dup['question']) ?>
                <div class="levels">Niveaux : <?= implode(', ', $dup['levels']) ?></div>
                <?php foreach ($dup['answers'] as $a): ?>
                    <div class="answer"><?= htmlspecialchars($a['text']) ?> (<?= $a['points'] ?> pts)</div>
                <?php endforeach; ?>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</body>
</html>
