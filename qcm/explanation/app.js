let questions = [];
let category = "";
let level = "";
let currentIndex = 0;
let currentCount = 0;
let count = 0;
let show_all = true;
const LEVELS = ['bpi', 'bp', 'bpc'];
const CATEGORIES = ['pilotage', 'mecavol', 'meteo', 'materiel', 'reglementation', 'facteursH', 'naturel'];

let dataSource = "server";
let customQuestions = null;
let isCustomJsonValid = false;

let titleText = document.getElementById('subtitle').textContent;

async function start() {
    // get json name
    const levelSelect = document.getElementById('levelSelect');
    level = levelSelect.value;

    if (dataSource === "server") {
        const res = await fetch("./qcm.json?_=" + Date.now());
        const json = res.json ? await res.json() : []; // get json
        questions = json.data; // get data
    }

    if (dataSource === "local") {
        const json = JSON.parse(localStorage.getItem("qcmData"));
        questions = json.data;
    }

    if (dataSource === "custom") {
        if (!isCustomJsonValid || !customQuestions) {
            alert("JSON custom invalide");
            return;
        }
        questions = customQuestions;
        localStorage.setItem("qcmData", JSON.stringify({ data: questions }));
        document.getElementById("customJsonInput").value = "";

        const dataSourceSelect = document.getElementById("dataSourceSelect");
        const newOption = document.createElement("option");
        newOption.value = "local";
        newOption.text = "LocalStorage";

        // Insérer en 2ème position (index 1)
        dataSourceSelect.insertBefore(newOption, dataSourceSelect.options[1]);
        dataSourceSelect.value = "local";
        dataSource = "local";
        alert("JSON sauvegarder localement ✔");
    }

    // initialize
    currentIndex = -1;
    currentCount = 0;

    document.getElementById('dataSourceLabel').classList.add('hidden');
    document.getElementById('dataSourceSelect').classList.add('hidden');
    document.getElementById('customJsonContainer').classList.add('hidden');
    document.getElementById('resetBtn').classList.add('hidden');
    document.getElementById('startBtn').classList.add('hidden'); // Hide Démarrer
    document.getElementById('stopBtn').classList.remove('hidden'); // Show Stop
    document.getElementById('question').classList.remove('hidden');
    document.getElementById('downloadBtn').classList.remove('hidden');
    document.getElementById('saveBtn').classList.remove('hidden');
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
        document.getElementById('subtitle').textContent = titleText + ` - ${levelText} (${categoryText})`;
    }
    else document.getElementById('subtitle').textContent = titleText + ` - ${levelText}`;

    const showModeSelect = document.getElementById('showModeSelect');
    show_all = showModeSelect.options[showModeSelect.selectedIndex].value.length > 0;
    document.getElementById('showModeSelect').classList.add('hidden');
    document.getElementById('showModeLabel').classList.add('hidden');

    count = countQuestions();
    nextQuestion();
}

function countQuestions() {
    number = 0;
    index = 0;
    while (index < questions.length) {
        const q = questions[index];

        const levelMismatch = LEVELS.includes(level) && !q.level.includes(level + "_");
        const categoryMismatch = CATEGORIES.includes(category) && q.category !== category;

        explanationAlreadyDone = true;
        if (!show_all && q.explanation && q.explanation.trim() !== '') {
            explanationAlreadyDone = false;
        }

        if (!levelMismatch && !categoryMismatch && explanationAlreadyDone) {
            number++;
            console.log("question " + number + " : " + q.question);
        }

        index++;
    }
    return number;
}

function stop() {
    const finalJson = localStorage.getItem('qcmData');
    if (finalJson) document.getElementById('resetBtn').classList.remove("hidden");
    else document.getElementById('resetBtn').classList.add("hidden");

    // hide Stop and show Démarrer
    document.getElementById('saveBtn').classList.add('hidden');
    document.getElementById('stopBtn').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    document.getElementById('question').classList.add('hidden');
    document.getElementById('downloadBtn').classList.add('hidden');
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('showModeLabel').classList.remove('hidden');
    document.getElementById('showModeSelect').classList.remove('hidden');
    document.getElementById('dataSourceLabel').classList.remove('hidden');
    document.getElementById('dataSourceSelect').classList.remove('hidden');

    // show dropdown
    document.getElementById('levelSelect').classList.remove('hidden');
    document.getElementById('levelLabel').classList.remove('hidden');

    document.getElementById('categorySelect').classList.remove('hidden');
    document.getElementById('categoryLabel').classList.remove('hidden');

    // update title
    document.getElementById('subtitle').textContent = titleText;

    // reset
    document.getElementById('question').textContent = '';
    document.getElementById('answers').innerHTML = '';
    document.getElementById('explanationEdit').classList.add('hidden');
}

function next() {
    save();
    nextQuestion();
}

function save() {
    if (!questions || currentIndex < 0 || currentIndex >= questions.length) return;

    const input = document.getElementById("explanationInput");
    if (!input) return;

    // 1. Met à jour l'explication de la question courante
    questions[currentIndex].explanation = input.value.trim();
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
    currentIndex++;

    while (currentIndex < questions.length) {
        const q = questions[currentIndex];

        const levelMismatch = LEVELS.includes(level) && !q.level.includes(level + "_");
        const categoryMismatch = CATEGORIES.includes(category) && q.category !== category;

        explanationAlreadyDone = true;
        if (!show_all && q.explanation && q.explanation.trim() !== '') {
            explanationAlreadyDone = false;
        }

        if (!levelMismatch && !categoryMismatch && explanationAlreadyDone) {
            break;
        }

        currentIndex++;
    }

    // reset
    document.getElementById('question').textContent = '';
    document.getElementById('answers').innerHTML = '';
    document.getElementById('explanationEdit').classList.add('hidden');
    document.getElementById("explanationInput").value = '';

    if (currentIndex >= questions.length) {
        document.getElementById('nextBtn').classList.add('hidden');
        document.getElementById('question').classList.add('hidden');
        return;
    }
    currentCount++;
    const q = questions[currentIndex];

    showQuestion(q);
    showCorrection(q);
}

function showQuestion(q) {
    // Reset UI
    document.getElementById('question').textContent = `${(currentCount)}/${count}.  ${q.question}`;
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

function lockAnswers() {
    document.querySelectorAll('#answers input[type="checkbox"]').forEach(cb => {
        cb.disabled = true;
    });
}

function showCorrection(q) {
    lockAnswers();

    const answersDiv = document.getElementById('answers');

    // Affichage correction
    [...answersDiv.children].forEach((div, i) => {
        const a = q.answers[i];

        if (a.points > 0) {
            div.classList.add('good');
        } else if (a.points == 0) {
            div.classList.add('ok');
        } else {
            div.classList.add('bad');
        }

        if (a.selected) {
            div.style.fontWeight = 'bold';
        }
    });
    document.getElementById('explanationInput').value = q.explanation;
    document.getElementById('explanationEdit').classList.remove('hidden');
    document.getElementById('nextBtn').classList.remove('hidden');
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

function saveJSON() {
    save();
    const finalJson = {
        data: questions
    };
    localStorage.setItem('qcmData', JSON.stringify(finalJson));

    alert("Sauvegarde effectuée ✅");
}

function resetLocalJson() {
    localStorage.removeItem('qcmData');
    document.getElementById('resetBtn').classList.add('hidden');
    const dataSourceSelect = document.getElementById("dataSourceSelect");
    [...dataSourceSelect.options].forEach(o => {
        if (o.value === "local") o.remove();
    });
    document.getElementById("dataSourceSelect").value = "server";
    dataSource = "server";
}

function hasLocalQuestions() {
    const data = localStorage.getItem("qcmData");
    if (!data) return false;
    try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed.data);
    } catch {
        return false;
    }
}

// ---------- Main ----------

// appeler à chaque changement
document.getElementById('levelSelect').addEventListener('change', savePreferences);
document.getElementById('categorySelect').addEventListener('change', savePreferences);

window.addEventListener('DOMContentLoaded', () => {
    stop();

    const dataSourceSelect = document.getElementById("dataSourceSelect");
    const customContainer = document.getElementById("customJsonContainer");
    const startBtn = document.getElementById("startBtn");

    // Supprimer option local si vide
    if (!hasLocalQuestions()) {
        [...dataSourceSelect.options].forEach(o => {
            if (o.value === "local") o.remove();
        });
    }

    dataSourceSelect.addEventListener("change", () => {
        dataSource = dataSourceSelect.value;

        if (dataSource === "custom") {
            customContainer.classList.remove("hidden");
            startBtn.disabled = !isCustomJsonValid;
        } else {
            customContainer.classList.add("hidden");
            startBtn.disabled = false;
        }
    });

    // niveau
    const savedLevel = localStorage.getItem('qcmLevel');
    if (savedLevel) document.getElementById('levelSelect').value = savedLevel;

    // category
    const savedCategory = localStorage.getItem('qcmCategory');
    if (savedCategory) document.getElementById('categorySelect').value = savedCategory;
});

document.getElementById("customJsonInput").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const json = JSON.parse(reader.result);

            if (!json.data || !Array.isArray(json.data)) {
                throw new Error("Format invalide : data manquant");
            }

            customQuestions = json.data;
            isCustomJsonValid = true;
        } catch (err) {
            isCustomJsonValid = false;
            customQuestions = null;
            alert("JSON invalide ❌");
            e.target.value = "";
        }

        startBtn.disabled = !isCustomJsonValid;
    };

    reader.readAsText(file);
});