let questions = [];
let category = "";
let current = 0;
let controller = null;
let totalMaxScore = 0;   // score théorique max
let playerScore = 0;    // score réel du joueur
let reflectionTime = 10;
let voiceIndex = -1;
const LEVELS = ['bpi', 'bp', 'bpc'];
const CATEGORIES = ['pilotage', 'mecavol', 'meteo', 'materiel', 'reglementation', 'facteursH', 'naturel'];


async function start() {
    // get json name
    const levelSelect = document.getElementById('levelSelect');
    const level = levelSelect.value;

    const res = await fetch("qcm.json?_=" + Date.now());
    json = res.json ? await res.json() : []; // get json
    questions = json.data; // get data
    // initialize
    current = -1;
    totalMaxScore = 0;
    playerScore = 0;

    // Temps de réflexion
    reflectionTime = parseInt(document.getElementById('waitTime').value); // fallback à 10s si vide

    document.getElementById('waitTime').classList.add('hidden');
    document.getElementById('waitTimeLabel').classList.add('hidden');

    document.getElementById('startBtn').classList.add('hidden'); // Hide Démarrer
    document.getElementById('stopBtn').classList.remove('hidden'); // Show Stop
    document.getElementById('question').classList.remove('hidden');
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

    questions = shuffle(questions, level, category); // randomize

    controller = new AbortController();
    nextQuestion(controller.signal);
}

function stopCurrent() {
    if (controller) controller.abort();
    // stop TTS
    speechSynthesis.cancel();
}

function stop() {
    stopCurrent();

    // hide Stop and show Démarrer
    document.getElementById('stopBtn').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    document.getElementById('question').classList.add('hidden');
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('correctBtn').classList.add('hidden');

    document.getElementById('waitTime').classList.remove('hidden');
    document.getElementById('waitTimeLabel').classList.remove('hidden');

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
    document.getElementById('explanation').classList.add('hidden');

    document.getElementById('score').innerHTML = 'Score : 0 / 0 (0%)';
}

function next() {
    stopCurrent();
    controller = new AbortController();
    nextQuestion(controller.signal);
}

async function nextQuestion(signal) {
    if (signal.aborted) return;

    const select = document.getElementById('voiceSelect');
    voiceIndex = select.selectedIndex || -1;

    current++;
    if (current >= questions.length) {
        speak("Fin de l'entraînement");
        return;
    }

    const q = questions[current];
    q.answers = shuffle(q.answers); // randomize

    document.getElementById('correctBtn').classList.remove('hidden');
    showQuestion(q);
    await readQuestion(q, signal);
    if (signal.aborted) return;

    if (voiceIndex >= 0) {
        await waitResponse(signal);
        if (signal.aborted) return;

        correctQuestion(signal);
    }

}

function correct() {
    stopCurrent();
    controller = new AbortController();
    correctQuestion(controller.signal);
}

async function correctQuestion(signal) {
    document.getElementById('correctBtn').classList.add('hidden');
    const q = questions[current];
    showCorrection(q);
    await readCorrection(q, signal);

    if (voiceIndex >= 0 && reflectionTime == 0) {
        await wait(1, signal);
        if (signal.aborted) return;
        next();
    }
}



function showQuestion(q) {
    // Reset UI
    document.getElementById('question').textContent = `${(current + 1)}/${questions.length}.  ${q.question}`;
    document.getElementById('answers').innerHTML = '';
    document.getElementById('explanation').classList.add('hidden');
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

async function readQuestion(q, signal) {
    // read TTS question + réponses
    await speak(q.question, signal);
    await wait(1, signal);
    for (let i = 0; i < q.answers.length; i++) {
        await speak(letter(i), signal);
        await wait(0.3, signal); // pause
        await speak(`${q.answers[i].text}`, signal);
        await wait(0.1, signal);
    }
}

async function waitResponse(signal) {
    waitTime = reflectionTime;
    if (reflectionTime == 0) waitTime = 1;
    await wait(waitTime, signal);
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
    if (q.explanation) {
        document.getElementById('explanation').textContent = `Explications : ${q.explanation}`;
        document.getElementById('explanation').classList.remove('hidden');
    }
    document.getElementById('nextBtn').classList.remove('hidden');

    updateScoreDisplay();
}

async function readCorrection(q, signal) {
    // récupérer les bonnes réponses avec leur index
    const goodAnswers = q.answers
        .map((a, i) => ({ ...a, index: i }))
        .filter(a => a.points > 0);

    if (goodAnswers.length > 0) {

        // 1️⃣ dire les lettres ensemble : "A et B"
        const lettersText = goodAnswers
            .map(a => letter(a.index))
            .join('. ');

        await speak(`Réponse :`, signal);
        if (q.explanation || goodAnswers.length > 1) {
            await speak(lettersText, signal);
            await wait(0.3, signal); // 300ms pause
        }

        if (!q.explanation) {
            // 2️⃣ dire le texte de chaque bonne réponse
            for (const a of goodAnswers) {
                await speak(letter(a.index), signal);
                await wait(0.3, signal); // 300ms pause
                await speak(a.text, signal);
                await wait(0.1, signal);
            }
        }
    }

    // Explication
    if (q.explanation) {
        await wait(1, signal);
        await speak("Explications :", signal);
        await wait(0.1, signal);
        await speak(q.explanation, signal);
    }
}

// ---------- Utils ----------

function speak(text, signal) {
    if (voiceIndex < 0) return;

    return new Promise((resolve, reject) => {
        const utter = new SpeechSynthesisUtterance(cleanForTTS(text));
        if (signal?.aborted) {
            reject('aborted');
            return;
        }
        const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('fr'));
        if (voices[voiceIndex]) utter.voice = voices[voiceIndex];


        utter.lang = 'fr-FR';
        utter.onend = resolve;
        utter.onerror = reject;

        signal?.addEventListener('abort', () => {
            speechSynthesis.cancel();
            reject('aborted');
        });

        speechSynthesis.speak(utter);
    });
}

function wait(seconds, signal) {
    if (voiceIndex < 0) return;

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, seconds * 1000);
        signal?.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject('aborted');
        });
    });
}


function shuffle(array, level = null, category = null) {
    let filtered = array.filter(q => {
        const levelMismatch =
            LEVELS.includes(level) && !q.level.includes(level + "_");

        const categoryMismatch =
            CATEGORIES.includes(category) && q.category !== category;

        return !levelMismatch && !categoryMismatch;
    });
    for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    return filtered;
}

function letter(index) {
    return String.fromCharCode(65 + index);
}

function cleanForTTS(text) {
    if (!text) return '';
    return text
        // remplacer les guillemets typographiques par simples
        .replace(/[“”«»„‟]/g, '"')
        // remplacer les apostrophes courbes par simple quote
        .replace(/[‘’‚‛]/g, "'")
        // supprimer symboles copyright/trademark/etc.
        .replace(/[©®™]/g, '')
        // remplacer multiples espaces et retours à la ligne
        .replace(/\s+/g, ' ')
        .trim();
}

function getFrenchVoice() {
    const voices = speechSynthesis.getVoices();

    // chercher une voix française naturelle
    const frVoices = voices.filter(v => v.lang.startsWith('fr'));

    // exemple : prendre la première
    return frVoices.length ? frVoices[0] : null;
}


function populateVoices() {
    const select = document.getElementById('voiceSelect');
    const voices = speechSynthesis.getVoices();

    // ne garder que les voix françaises
    const frVoices = voices.filter(v => v.lang.startsWith('fr'));

    select.innerHTML = ''; // vider le dropdown

    const optionEmpty = document.createElement('option');
    optionEmpty.value = -1;
    optionEmpty.textContent = `None`;
    select.appendChild(optionEmpty);

    frVoices.forEach((v, i) => {
        const option = document.createElement('option');
        option.value = i; // index dans frVoices
        option.textContent = `${v.name} (${v.lang})`;
        select.appendChild(option);
    });

    // Pré-selection : Google français si disponible
    const googleIndex = frVoices.findIndex(v => v.name.includes('Google'));
    if (googleIndex >= 0) {
        select.value = googleIndex;
    } else {
        select.value = 0; // fallback à la première voix française
    }
}

function savePreferences() {
    const level = document.getElementById('levelSelect').value;
    const categ = document.getElementById('categorySelect').value;
    const voice = document.getElementById('voiceSelect').value;
    const delay = document.getElementById('waitTime').value;

    localStorage.setItem('qcmLevel', level);
    localStorage.setItem('qcmCategory', categ);
    localStorage.setItem('ttsVoice', voice);
    localStorage.setItem('thinkingTime', delay);
}

// ---------- Main ----------

// appel initial et écoute du changement de voix
speechSynthesis.onvoiceschanged = populateVoices;
populateVoices();

// appeler à chaque changement
document.getElementById('levelSelect').addEventListener('change', savePreferences);
document.getElementById('categorySelect').addEventListener('change', savePreferences);
document.getElementById('voiceSelect').addEventListener('change', savePreferences);
document.getElementById('waitTime').addEventListener('change', savePreferences);

window.addEventListener('DOMContentLoaded', () => {
    stop();
    // niveau
    const savedLevel = localStorage.getItem('qcmLevel');
    if (savedLevel) document.getElementById('levelSelect').value = savedLevel;

    // category
    const savedCategory = localStorage.getItem('qcmCategory');
    if (savedCategory) document.getElementById('categorySelect').value = savedCategory;

    // temps de réflexion
    const savedDelay = localStorage.getItem('thinkingTime');
    if (savedDelay) document.getElementById('waitTime').value = savedDelay;

    // voix TTS (après avoir rempli le dropdown)
    const savedVoice = localStorage.getItem('ttsVoice');
    speechSynthesis.onvoiceschanged = () => {
        populateVoices();
        if (savedVoice) document.getElementById('voiceSelect').value = savedVoice;
    };
});
