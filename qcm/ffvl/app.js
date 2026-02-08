let allQuestions = [];
let allQuestionsServer = [];
let currentQuestions = [];
let corrected = false;

let hasLocalOpt = true;

const container = document.getElementById("questionsContainer");
const menuOptions = document.getElementById("menuOptions");
const jsonInput = document.getElementById("jsonInput");

document.getElementById("menuToggle").onclick = () => {
    document.body.classList.toggle("menu-open");
    menuOptions.classList.toggle("open");
};

document.addEventListener("click", () => {
    menuOptions.classList.remove("open");
    document.body.classList.remove("menu-open");
});

// empêche la fermeture quand on clique dans le menu
document.getElementById("menu").addEventListener("click", (e) => {
    e.stopPropagation();
});

document.getElementById("resetBtn").onclick = () => {
    if (confirm("Réinitialiser le QCM ?")) {
        corrected = true;
        buildQCM();
    }
};

document.getElementById("correctBtn").onclick = () => {
    if (!corrected) correctQCM();
};

document.querySelectorAll("select").forEach(s => s.onchange = changeOptions);
document.getElementById("sourceSelect").onchange = handleSource;

async function loadServer() {
    console.log("loadServer");
    if (allQuestionsServer && allQuestionsServer.length > 0) {
        allQuestions = [...allQuestionsServer];
        return;
    }
    const res = await fetch("/parapente/qcm/qcm.json?_=" + Date.now());
    console.log("loadServer res " + res);
    const json = res.json ? await res.json() : []; // get json
    console.log("loadServer json " + JSON.stringify(json));
    allQuestions = json.data;
    allQuestionsServer = [...allQuestions];
    console.log("loadServer allQuestions " + JSON.stringify(allQuestions));
    console.log("loadServer allQuestions.lenght " + allQuestions.length);
}

function loadLocal() {
    console.log("loadLocal");
    const json = localStorage.getItem("qcmData");
    const data = JSON.parse(json);
    allQuestions = data.data;
    console.log("loadLocal allQuestions.lenght " + allQuestions.length);
}

async function handleSource(e) {
    if (e.target.value === "upload") {
        console.log("jsonInput.click()");
        jsonInput.click();
    } else if (e.target.value === "local") {
        document.getElementById("questionsContainer").classList.add("hidden");
        console.log("loadLocal()");
        loadLocal();
        if (allQuestions == null || allQuestions.length == 0) await loadServer();
        setTimeout(() => {
            corrected = true;
            buildQCM();
        }, 0);

    } else if (e.target.value === "server") {
        document.getElementById("questionsContainer").classList.add("hidden");
        console.log("loadServer()");
        await loadServer();
        setTimeout(() => {
            corrected = true;
            buildQCM();
        }, 0);
    }
    savePreferences();
}

jsonInput.onchange = () => {
    document.getElementById("questionsContainer").classList.add("hidden");
    console.log("jsonInput");
    const file = jsonInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        jsonFile(reader);
    };
    reader.readAsText(file);
};

async function jsonFile(reader) {
    try {
        const json = JSON.parse(reader.result);
        if (!Array.isArray(json.data)) throw "invalid";
        localStorage.setItem("qcmData", JSON.stringify(json));
        addLocalOption();
        document.getElementById("sourceSelect").value = "local";
        jsonInput.value = "";
        loadLocal();
        corrected = true;
        buildQCM();
    } catch {
        alert("JSON invalide");
        document.getElementById("sourceSelect").value = "server";
        jsonInput.value = "";
        console.log("catch loadServer()");
        await loadServer();
        corrected = true;
        buildQCM();
    }
}

function addLocalOption() {
    if (hasLocalOpt) return;
    const dataSourceSelect = document.getElementById("sourceSelect");
    const newOption = document.createElement("option");
    newOption.value = "local";
    newOption.text = "Local";

    // Insérer en 2ème position (index 1)
    dataSourceSelect.insertBefore(newOption, dataSourceSelect.options[1]);
    dataSourceSelect.value = "local";
}

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}
function changeOptions() {
    document.getElementById("questionsContainer").classList.add("hidden");
    savePreferences();
    buildQCM();
}

function buildQCM() {
    container.innerHTML = "";
    if (corrected) {
        console.log("buildQCM corrected : " + corrected);
        allQuestions = shuffle(allQuestions);
        corrected = false;
        document.getElementById("correctBtn").textContent = `Corriger`;
    }

    let filtered = [...allQuestions];

    const level = levelSelect.value;
    const cat = categorySelect.value;
    const count = countSelect.value;

    if (level) filtered = filtered.filter(q => q.level?.includes(level + "_"));
    if (cat) filtered = filtered.filter(q => q.category === cat);

    if (count !== "all") filtered = filtered.slice(0, Number(count));

    currentQuestions = filtered;

    for (let i = 0; i < filtered.length; i++) {
        q = filtered[i];
        const div = document.createElement("div");
        div.className = "question";
        div.innerHTML = `
        <table>
            <tr class="question-header">
                <th>${i + 1}. ${q.question}</th>
                <th class="points"></th>
            </tr>
            ${q.answers.map(a => `
                <tr class="answer-row">
                    <td class="answers">
                        <label>
                            <input type="checkbox" data-points="${a.points}">
                            ${a.text}
                        </label>
                    </td>
                    <td class="answer-points"></td>
                </tr>
            `).join("")}
        </table>
        <div class="explanation hidden">${q.explanation || ""}</div>
        `;
        console.log(`explanation : ${q.explanation || ""}`);
        container.appendChild(div);
    }
    document.getElementById("questionsContainer").classList.remove("hidden");
}

function correctQCM() {
    let total = 0;
    let maxTotal = 0;

    document.querySelectorAll(".question").forEach(qDiv => {
        let score = 0;
        let maxScore = 0;

        const answerRows = qDiv.querySelectorAll(".answer-row");

        answerRows.forEach(row => {
            const cb = row.querySelector("input");
            const pts = Number(cb.dataset.points);
            const ptsCell = row.querySelector(".answer-points");
            const label = row.querySelector(".answers");

            if (pts > 0) maxScore += pts;
            if (cb.checked) score += pts;

            // afficher points par réponse
            ptsCell.textContent = pts;

            // coloration réponses
            if (cb.checked && pts >= 0) {
                row.classList.add("good");
            } else if (cb.checked && pts < 0) {
                row.classList.add("bad");
            }
            if (pts < 0) {
                label.classList.add("badQ");
            }
        });

        if (score < 0) score = 0;

        total += score;
        maxTotal += maxScore;

        // score question
        const scoreCell = qDiv.querySelector(".points");
        scoreCell.textContent = score;

        // couleur du tableau
        if (score === maxScore) {
            qDiv.classList.add("q-good");
        } else if (score > 0) {
            qDiv.classList.add("q-partial");
        } else {
            qDiv.classList.add("q-bad");
        }

        qDiv.querySelector(".explanation").classList.remove("hidden");
    });

    const percent = maxTotal > 0
        ? Math.round((total / maxTotal) * 100)
        : 0;

    const btn = document.getElementById("correctBtn");
    btn.textContent = `Score : ${total} / ${maxTotal} (${percent}%)`;

    corrected = true;
}


function savePreferences() {
    const level = document.getElementById('levelSelect').value;
    const count = document.getElementById('countSelect').value;
    const categ = document.getElementById('categorySelect').value;
    source = document.getElementById('sourceSelect').value;
    if (source === "upload") {
        source = "local";
    }
    console.log("savePreferences : " + level + ", " + count + ", " + categ + ", " + source + ", ");

    localStorage.setItem('qcmLevel', level);
    localStorage.setItem('qcmCount', count);
    localStorage.setItem('qcmCategory', categ);
    localStorage.setItem('qcmSource', source);
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

// Init
(async function init() {
    const level = localStorage.getItem('qcmLevel');
    if (level) document.getElementById('levelSelect').value = level;
    const count = localStorage.getItem('qcmCount');
    if (count) document.getElementById('countSelect').value = count;
    const categ = localStorage.getItem('qcmCategory');
    if (categ) document.getElementById('categorySelect').value = categ;
    const source = localStorage.getItem('qcmSource');
    if (source) document.getElementById('sourceSelect').value = source;

    if (!hasLocalQuestions()) {
        hasLocalOpt = false;
        [...document.getElementById("sourceSelect").options].forEach(o => {
            if (o.value === "local") o.remove();
        });
    }

    if (source === "local") loadLocal();
    else await loadServer();
    corrected = true;
    buildQCM();
})();
