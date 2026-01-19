let questions = [];
let current = 0;
let stopFlag = false; // global

async function start() {

    const levelSelect = document.getElementById('levelSelect');
    const jsonFile = levelSelect.value; // bpi.json, bp.json ou bpc.json
    try {
        const res = await fetch(jsonFile);
        json = res.json ? await res.json() : [];
        questions = json.data;
        shuffle(questions);
        current = 0;
        stopFlag = false;

        document.getElementById('startBtn').classList.add('hidden'); // cache Démarrer
        document.getElementById('stopBtn').classList.remove('hidden'); // affiche Stop
        // cacher dropdown
        document.getElementById('levelSelect').classList.add('hidden');
        document.getElementById('levelLabel').classList.add('hidden');
        // mettre à jour le titre avec le niveau
        const select = document.getElementById('levelSelect');
        const levelText = select.options[select.selectedIndex].text;
        document.getElementById('title').textContent = `Entraînement QCM - ${levelText}`;

        nextQuestion();
    } catch (err) {
        console.error("Erreur lors du chargement du JSON :", err);
        alert("Impossible de charger le QCM. Vérifie que le fichier existe.");
    }
}

function stop() {
    stopFlag = true;

    // arrêter le TTS en cours
    speechSynthesis.cancel();

    // cacher Stop et réafficher Démarrer
    document.getElementById('stopBtn').classList.add('hidden');
    document.getElementById('startBtn').classList.remove('hidden');

    // réafficher dropdown
    document.getElementById('levelSelect').classList.remove('hidden');
    document.getElementById('levelLabel').classList.remove('hidden');

    // remettre le titre générique
    document.getElementById('title').textContent = 'Entraînement QCM';

    // tu peux aussi reset l'affichage si tu veux
    document.getElementById('question').textContent = '';
    document.getElementById('answers').innerHTML = '';
    document.getElementById('explanation').classList.add('hidden');
}

async function nextQuestion() {
    if (stopFlag) return;
    if (current >= questions.length) {
        speak("Fin de l'entraînement");
        return;
    }

    const q = questions[current];
    shuffle(q.answers);

    // Reset UI
    document.getElementById('question').textContent = q.question;
    document.getElementById('answers').innerHTML = '';
    document.getElementById('explanation').classList.add('hidden');

    // Affichage réponses
    q.answers.forEach((a, i) => {
        const div = document.createElement('div');
        div.className = 'answer';
        div.textContent = `${letter(i)}. ${a.text}`;
        document.getElementById('answers').appendChild(div);
    });

    // TTS question + réponses
    await speak(q.question);
    if (stopFlag) return;
    await speak(
        q.answers
            .map((a, i) => `${letter(i)}. ${a.text}`)
            .join('. ')
    );
    if (stopFlag) return;

    // Temps de réflexion
    const waitInput = document.getElementById('waitTime');
    const reflectionTime = parseInt(waitInput.value) || 10; // fallback à 10s si vide
    await wait(reflectionTime);

    if (stopFlag) return;

    // Affichage correction
    document.querySelectorAll('.answer').forEach((el, i) => {
        el.classList.add(
            q.answers[i].points > 0 ? 'good' : 'bad'
        );
    });
    // Explication
    if (q.explanation) {
        document.getElementById('explanation').textContent = q.explanation;
        document.getElementById('explanation').classList.remove('hidden');
    }

    // récupérer les bonnes réponses avec leur index
    const goodAnswers = q.answers
        .map((a, i) => ({ ...a, index: i }))
        .filter(a => a.points > 0);

    if (goodAnswers.length > 0) {

        // 1️⃣ dire les lettres ensemble : "A et B"
        const lettersText = goodAnswers
            .map(a => letter(a.index))
            .join(' et ');

        await speak(`Bonne réponse : ${lettersText}`);
        if (stopFlag) return;

        // 2️⃣ dire le texte de chaque bonne réponse
        for (const a of goodAnswers) {
            await speak(`${letter(a.index)}. ${a.text}`);
            if (stopFlag) return;
        }
    }


    // Explication
    if (q.explanation) {
        await wait(1);
        await speak(q.explanation);
        if (stopFlag) return;
    }

    current++;
    await wait(1);
    if (stopFlag) return;
    nextQuestion();
}

// ---------- Utils ----------

function speak(text) {
    return new Promise(resolve => {
        const utter = new SpeechSynthesisUtterance(cleanForTTS(text));

        const select = document.getElementById('voiceSelect');
        const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('fr'));
        const voiceIndex = select.selectedIndex || 0;
        if (voices[voiceIndex]) utter.voice = voices[voiceIndex];


        utter.lang = 'fr-FR';
        utter.onend = resolve;
        speechSynthesis.speak(utter);
    });
}

function wait(seconds) {
    return new Promise(r => setTimeout(r, seconds * 1000));
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
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

// appel initial et écoute du changement de voix
speechSynthesis.onvoiceschanged = populateVoices;
populateVoices();

function savePreferences() {
    const level = document.getElementById('levelSelect').value;
    const voice = document.getElementById('voiceSelect').value;
    const delay = document.getElementById('waitTime').value;

    localStorage.setItem('qcmLevel', level);
    localStorage.setItem('ttsVoice', voice);
    localStorage.setItem('thinkingTime', delay);
}

// appeler à chaque changement
document.getElementById('levelSelect').addEventListener('change', savePreferences);
document.getElementById('voiceSelect').addEventListener('change', savePreferences);
document.getElementById('waitTime').addEventListener('change', savePreferences);


window.addEventListener('DOMContentLoaded', () => {
    // niveau
    const savedLevel = localStorage.getItem('qcmLevel');
    if (savedLevel) document.getElementById('levelSelect').value = savedLevel;

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
