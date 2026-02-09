let lexique = [];
let currentlexique = [];
let editIndex = null;

const searchInput = document.getElementById("search");
const list = document.getElementById("lexiqueList");
const popup = document.getElementById("popup");
const popupName = document.getElementById("popupName");
const popupDef = document.getElementById("popupDef");

// ---------- INIT ----------
async function init() {
    const local = localStorage.getItem("lexique");
    if (local) {
        lexique = JSON.parse(local);
    } else {
        const res = await fetch("lexique.json");
        lexique = await res.json();
    }
    render();
}
init();

// ---------- RENDER ----------
function render(filter = "") {
    list.innerHTML = "";
    console.log("filter : " + filter);
    currentlexique = fuzzySearch(filter);
    for (const index of currentlexique) {
        item = lexique[index];
        const li = document.createElement("li");
        li.innerHTML = `<strong>${item.nom}</strong><br>
            ${item.definition}<br>
            <button onclick="edit(${index})">✏ Modifier</button>
            <button onclick="removeDef(${index})">✖ Supprimer</button>`;
        list.appendChild(li);
    }
}

// ---------- SEARCH ----------
function normalize(str) {
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function splitWords(str) {
    return normalize(str)
        .split(/[^a-z0-9]+/)
        .filter(w => w.length > 1);
}


// Calcul de la distance de Levenshtein entre 2 chaînes
function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => []);
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,    // suppression
                    matrix[i][j - 1] + 1,    // insertion
                    matrix[i - 1][j - 1] + 1 // substitution
                );
            }
        }
    }
    return matrix[a.length][b.length];
}

// Recherche fuzzy sur le nom et la définition
function fuzzySearch(query) {
    if (!query || !query.trim()) {
        return lexique
            .map((_, index) => index)
            .sort((a, b) => lexique[a].nom.localeCompare(lexique[b].nom));
    }

    const queryWords = splitWords(query);

    return lexique
        .map((item, index) => {
            const nameWords = splitWords(item.nom);
            const defWords = splitWords(item.definition);

            let score = 0;
            let matchedWords = 0;

            for (const q of queryWords) {
                let best = 0;

                // --- NOM ---
                for (const w of nameWords) {
                    if (w.startsWith(q)) best = Math.max(best, 6);
                    else if (w.includes(q)) best = Math.max(best, 5);
                    else {
                        const d = levenshtein(w, q);
                        if (d <= 2) best = Math.max(best, 4 - d);
                    }
                }

                // --- DÉFINITION ---
                for (const w of defWords) {
                    if (w.startsWith(q)) best = Math.max(best, 3);
                    else if (w.includes(q)) best = Math.max(best, 2);
                    else {
                        const d = levenshtein(w, q);
                        if (d <= 2) best = Math.max(best, 2 - d);
                    }
                }

                if (best > 0) {
                    score += best;
                    matchedWords++;
                }
            }

            // Bonus si tous les mots recherchés sont trouvés
            if (matchedWords === queryWords.length) {
                score += 5;
            }

            return { index, score };
        })
        .filter(r => r.score > 0)
        .sort(
            (a, b) =>
                b.score - a.score ||
                lexique[a.index].nom.localeCompare(lexique[b.index].nom)
        )
        .map(r => r.index);
}


searchInput.addEventListener("input", e => {
    render(e.target.value);
});

// ---------- POPUP ----------
function openPopup() {
    popup.classList.remove("hidden");
}

function closePopup() {
    console.debug("close");
    popup.classList.add("hidden");
    editIndex = null;
}

// ---------- ADD / EDIT ----------
function edit(i) {
    editIndex = i;
    popupName.value = lexique[i].nom;
    popupDef.value = lexique[i].definition;
    openPopup();
}

function savelexique() {
    const nom = popupName.value.trim();
    const def = popupDef.value.trim();

    if (!nom || !def) {
        alert("Nom et définition obligatoires");
        return;
    }

    const existing = lexique.findIndex(d => d.nom === nom);

    if (existing !== -1 && existing !== editIndex) {
        alert("\"" + lexique[existing].nom + "\" existe déjà.");
        return;
    } else if (editIndex !== null) {
        lexique[editIndex] = { nom, definition: def };
    } else {
        lexique.push({ nom, definition: def });
    }

    persist();
    closePopup();
}

// ---------- DELETE ----------
function removeDef(i) {
    if (!confirm("Supprimer le définition de \"" + lexique[i].nom + "\" ?")) return;
    lexique.splice(i, 1);
    persist();
}

// ---------- STORAGE ----------
function persist() {
    localStorage.setItem("lexique", JSON.stringify(lexique));
    render(searchInput.value);
}

// ---------- DOWNLOAD ----------
function downloadJSON() {
    const blob = new Blob(
        [JSON.stringify(lexique, null, 2)],
        { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lexique.json";
    a.click();
}

// ---------- RESET ----------
async function resetToServer() {
    if (!confirm("Revenir à la version serveur ?")) return;
    searchInput.value = "";
    localStorage.removeItem("lexique");
    const res = await fetch("lexique.json");
    lexique = await res.json();
    render();
}

// ---------- EVENTS ----------
document.getElementById("addBtn").onclick = () => {
    popupName.value = "";
    popupDef.value = "";
    openPopup();
};

document.getElementById("cancelBtn").onclick = closePopup;
document.getElementById("saveBtn").onclick = savelexique;
document.getElementById("downloadBtn").onclick = downloadJSON;
document.getElementById("resetBtn").onclick = resetToServer;
