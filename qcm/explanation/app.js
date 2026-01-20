let questions = [];
let category = "";
let level = "";
let current = 0;
let totalMaxScore = 0;   // score théorique max
let playerScore = 0;    // score réel du joueur
const LEVELS = ['bpi', 'bp', 'bpc'];
const CATEGORIES = ['pilotage', 'mecavol', 'meteo', 'materiel', 'reglementation', 'facteursH', 'naturel'];


async function start() {
    // get json name
    const levelSelect = document.getElementById('levelSelect');
    level = levelSelect.value;

    const res = await fetch("qcm.json?_=" + Date.now());
    json = res.json ? await res.json() : []; // get json
    questions = json.data; // get data
    // initialize
    current = -1;
    totalMaxScore = 0;
    playerScore = 0;

    document.getElementById('startBtn').classList.add('hidden'); // Hide Démarrer
    document.getElementById('stopBtn').classList.remove('hidden'); // Show Stop
    document.getElementById('question').classList.remove('hidden');
    document.getElementById('downloadBtn').classList.remove('hidden');
    // hidde dropdown
    document.getElementById('levelSelect').classList.add('hidden');
    document.getElementById('levelLabel').classList.add('hidden');
    // update title with level selected
    const levelText = levelSelect.options[levelSelect.selectedIndex].text;

    // hidde dropdown
    document.getElementById('categorySelect').classList.add('hidden');
    document.getElementById('categoryLabel').classList.add('hidden');

    const categorySelect = document.getElementById('categorySelect');
    category = categorySelect.options[categorySelect.selectedIndex].value;
    categoryText = categorySelect.options[categorySelect.selectedIndex].text;

    if (category && category.trim() !== '') {
        document.getElementById('title').textContent = `Entraînement QCM - ${levelText} (${categoryText})`;
    }
    else document.getElementById('title').textContent = `Entraînement QCM - ${levelText}`;

    nextQuestion();
}

function stop() {
    // hide Stop and show Démarrer
    document.getElementById('stopBtn').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    document.getElementById('question').classList.add('hidden');
    document.getElementById('downloadBtn').classList.add('hidden');
    document.getElementById('startBtn').classList.remove('hidden');

    // show dropdown
    document.getElementById('levelSelect').classList.remove('hidden');
    document.getElementById('levelLabel').classList.remove('hidden');

    document.getElementById('categorySelect').classList.remove('hidden');
    document.getElementById('categoryLabel').classList.remove('hidden');

    // update title
    document.getElementById('title').textContent = 'Entraînement QCM';

    // reset
    document.getElementById('question').textContent = '';
    document.getElementById('answers').innerHTML = '';
    document.getElementById('explanationEdit').classList.add('hidden');

    document.getElementById('score').innerHTML = 'Score : 0 / 0 (0%)';
}

function next() {
    save();
    nextQuestion();
}

function save() {
    if (!questions || current < 0 || current >= questions.length) return;

    const input = document.getElementById("explanationInput");
    if (!input) return;

    // 1. Met à jour l'explication de la question courante
    questions[current].explanation = input.value.trim();
}

function download() {
    save();

    // 2. Reconstruit le JSON final
    const finalJson = {
        data: questions
    };

    // 3. Génère un fichier JSON téléchargeable
    const blob = new Blob(
        [JSON.stringify(finalJson, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qcm.json";
    a.click();

    URL.revokeObjectURL(url);

    console.log("JSON sauvegardé");
}


async function nextQuestion() {
    current++;
    while (current < questions.length && LEVELS.includes(level) && CATEGORIES.includes(category)) {
        current++;
    }

    if (current >= questions.length) {
        return;
    }

    const q = questions[current];

    showQuestion(q);
    showCorrection(q);
}

function showQuestion(q) {
    // Reset UI
    document.getElementById('question').textContent = `${(current + 1)}/${questions.length}.  ${q.question}`;
    document.getElementById('answers').innerHTML = '';
    document.getElementById('explanationEdit').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');

    // show réponses
    q.answers.forEach((a, index) => {
        const label = document.createElement('label');
        label.className = 'answer';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.index = index;
        checkbox.onchange = () => {
            a.selected = checkbox.checked;
            checkbox.closest('.answer').classList.toggle('selected', checkbox.checked);
        };

        const text = document.createElement('span');
        text.className = 'answer-text';
        text.textContent = `${letter(index)}. ${a.text}`;

        label.appendChild(checkbox);
        label.appendChild(text);

        document.getElementById('answers').appendChild(label);
    });
}

function computeScores(q) {
    let questionMax = 0;
    let questionPlayer = 0;

    q.answers.forEach(a => {
        if (a.points > 0) {
            questionMax += a.points;
        }
        if (a.selected) {
            questionPlayer += a.points;
        }
    });
    questionPlayer = Math.max(0, questionPlayer);

    return { questionMax, questionPlayer };
}

function updateScoreDisplay() {
    percent = 0;
    if (totalMaxScore > 0) {
        percent = Math.round((playerScore / totalMaxScore) * 100);
    }
    document.getElementById('score').textContent =
        `Score : ${playerScore} / ${totalMaxScore} (${percent}%)`;
}

function lockAnswers() {
    document.querySelectorAll('#answers input[type="checkbox"]').forEach(cb => {
        cb.disabled = true;
    });
}

function showCorrection(q) {
    lockAnswers();

    const answersDiv = document.getElementById('answers');

    const { questionMax, questionPlayer } = computeScores(q);
    totalMaxScore += questionMax;
    playerScore += questionPlayer;

    // Affichage correction
    [...answersDiv.children].forEach((div, i) => {
        const a = q.answers[i];

        if (a.points > 0) {
            div.classList.add('good');
        } else {
            div.classList.add('bad');
        }

        if (a.selected) {
            div.style.fontWeight = 'bold';
        }
    });
    document.getElementById('explanationInput').textContent = q.explanation;
    document.getElementById('explanationEdit').classList.remove('hidden');
    document.getElementById('nextBtn').classList.remove('hidden');

    updateScoreDisplay();
}

// ---------- Utils ----------

function wait(seconds, signal) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, seconds * 1000);
        signal?.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject('aborted');
        });
    });
}

function letter(index) {
    return String.fromCharCode(65 + index);
}

function savePreferences() {
    const level = document.getElementById('levelSelect').value;
    const categ = document.getElementById('categorySelect').value;

    localStorage.setItem('qcmLevel', level);
    localStorage.setItem('qcmCategory', categ);
}

// ---------- Main ----------

// appeler à chaque changement
document.getElementById('levelSelect').addEventListener('change', savePreferences);
document.getElementById('categorySelect').addEventListener('change', savePreferences);

window.addEventListener('DOMContentLoaded', () => {
    stop();
    // niveau
    const savedLevel = localStorage.getItem('qcmLevel');
    if (savedLevel) document.getElementById('levelSelect').value = savedLevel;

    // category
    const savedCategory = localStorage.getItem('qcmCategory');
    if (savedCategory) document.getElementById('categorySelect').value = savedCategory;
});
