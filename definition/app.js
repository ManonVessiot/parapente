let definitions = [];
let editIndex = null;

const searchInput = document.getElementById("search");
const list = document.getElementById("definitionsList");
const popup = document.getElementById("popup");
const popupName = document.getElementById("popupName");
const popupDef = document.getElementById("popupDef");

// ---------- INIT ----------
async function init() {
    const local = localStorage.getItem("definitions");
    if (local) {
        definitions = JSON.parse(local);
    } else {
        const res = await fetch("definitions.json");
        definitions = await res.json();
    }
    render();
}
init();

// ---------- RENDER ----------
function render(filter = "") {
    list.innerHTML = "";
    definitions = fuzzySearch(filter);
    definitions.forEach((item, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
      <strong>${item.nom}</strong><br>
      ${item.definition}<br>
      <button onclick="edit(${i})">✏ Modifier</button>
      <button onclick="removeDef(${i})">✖ Supprimer</button>
    `;
        list.appendChild(li);
    });
}

// ---------- SEARCH ----------
function normalize(str) {
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
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
    if (!query || !query.trim()) return [...definitions].sort((a, b) => a.nom.localeCompare(b.nom));

    const q = query.trim().toLowerCase();

    return definitions
        .map(item => {
            const name = item.nom.toLowerCase();
            const def = item.definition.toLowerCase();
            let score = Infinity;

            if (name.startsWith(q) || def.startsWith(q)) {
                score = 0; // début de mot exact
            } else if (name.includes(q) || def.includes(q)) {
                score = 0.5; // contient le mot
            } else {
                score = Math.min(levenshtein(name, q), levenshtein(def, q));
            }

            return { item, score };
        })
        .filter(({ score }) => score <= 2) // distance max autorisée
        .sort((a, b) => a.score - b.score)
        .map(({ item }) => item);
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
    popupName.value = definitions[i].nom;
    popupDef.value = definitions[i].definition;
    openPopup();
}

function saveDefinition() {
    const nom = popupName.value.trim();
    const def = popupDef.value.trim();

    if (!nom || !def) {
        alert("Nom et définition obligatoires");
        return;
    }

    const existing = definitions.findIndex(d => d.nom === nom);

    if (existing !== -1 && existing !== editIndex) {
        alert("Ce mot existe déjà.");
        return;
    } else if (editIndex !== null) {
        definitions[editIndex] = { nom, definition: def };
    } else {
        definitions.push({ nom, definition: def });
    }

    persist();
    closePopup();
}

// ---------- DELETE ----------
function removeDef(i) {
    if (!confirm("Supprimer cette définition ?")) return;
    definitions.splice(i, 1);
    persist();
}

// ---------- STORAGE ----------
function persist() {
    localStorage.setItem("definitions", JSON.stringify(definitions));
    render(searchInput.value);
}

// ---------- DOWNLOAD ----------
function downloadJSON() {
    const blob = new Blob(
        [JSON.stringify(definitions, null, 2)],
        { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "definitions.json";
    a.click();
}

// ---------- RESET ----------
async function resetToServer() {
    if (!confirm("Revenir à la version serveur ?")) return;
    localStorage.removeItem("definitions");
    const res = await fetch("definitions.json");
    definitions = await res.json();
    render();
}

// ---------- EVENTS ----------
document.getElementById("addBtn").onclick = () => {
    popupName.value = "";
    popupDef.value = "";
    openPopup();
};

document.getElementById("cancelBtn").onclick = closePopup;
document.getElementById("saveBtn").onclick = saveDefinition;
document.getElementById("downloadBtn").onclick = downloadJSON;
document.getElementById("resetBtn").onclick = resetToServer;
