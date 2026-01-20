<?php

function cleanText(string $text): string {
    return trim(
        preg_replace('/\s+/u', ' ', $text)
    );
}

function removeQuestionNumber(string $text): string {
    return preg_replace('/^\d+\.\s*/u', '', $text);
}


libxml_use_internal_errors(true);

// Charger le HTML
$html = file_get_contents('qcm.html');

$dom = new DOMDocument('1.0', 'UTF-8');
$dom->loadHTML($html);
$xpath = new DOMXPath($dom);

$result = [];

// Chaque bloc question
$questions = $xpath->query("//div[contains(@class,'panel') and contains(@class,'panel-default')]");

foreach ($questions as $panel) {

    // ---- Question ----
    $questionNode = $xpath->query(
        ".//div[contains(@class,'panel-heading')]//span[contains(@class,'ng-binding')]",
        $panel
    )->item(0);

    if (!$questionNode) {
        continue;
    }

    $questionText = removeQuestionNumber(
    cleanText($questionNode->textContent)
);



    // ---- Réponses ----
    $answers = [];
    $answerNodes = $xpath->query(
        ".//div[contains(@class,'row') and contains(@class,'answer')]",
        $panel
    );

    foreach ($answerNodes as $answerNode) {

        $textNode = $xpath->query(
            ".//span[contains(@class,'answer-text')]",
            $answerNode
        )->item(0);

        $pointsNode = $xpath->query(
            ".//span[contains(@class,'points')]",
            $answerNode
        )->item(0);

        if (!$textNode || !$pointsNode) {
            continue;
        }

        $answers[] = [
            'text'   => cleanText(trim($textNode->textContent)),
            'points' => (int) trim($pointsNode->textContent)
        ];
    }

    $result[] = [
        'category' => 'naturel',
        'question' => $questionText,
        'answers'  => $answers,
        'explanation' => ''
    ];
}

// Sortie JSON
header('Content-Type: application/json; charset=utf-8');
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
