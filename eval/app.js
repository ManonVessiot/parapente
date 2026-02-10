const EVAL_STORAGE_KEY = "parapente_eval";

// Chargement des données (localStorage > fichier json)
async function loadEvalData() {
    const localData = localStorage.getItem(EVAL_STORAGE_KEY);
    if (localData) {
        return JSON.parse(localData);
    }

    const response = await fetch("eval.json?_=" + Date.now());
    const data = await response.json();
    localStorage.setItem(EVAL_STORAGE_KEY, JSON.stringify(data));
    return data;
}

// Sauvegarde
function saveEvalData(data) {
    localStorage.setItem(EVAL_STORAGE_KEY, JSON.stringify(data));
}

// Construction de la page
function buildEvaluation(data) {
    const list = document.getElementById("evalList");
    list.innerHTML = "";

    data.forEach((level, levelIndex) => {
        const levelLi = document.createElement("li");
        levelLi.className = "level";

        const levelTitle = document.createElement("h2");
        levelTitle.textContent = level.name;
        levelLi.appendChild(levelTitle);

        level.competences.forEach((category, catIndex) => {
            const categoryDiv = document.createElement("div");
            categoryDiv.className = "category";
            console.log("level.color : " + level.color);
            if (level.color) {
                categoryDiv.style.borderLeftColor = level.color;
            }

            const categoryTitle = document.createElement("h3");
            categoryTitle.textContent = category.name;
            categoryDiv.appendChild(categoryTitle);

            category.competences.forEach((comp, compIndex) => {
                const label = document.createElement("label");
                label.className = "competence";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = comp.done;

                checkbox.addEventListener("change", () => {
                    data[levelIndex]
                        .competences[catIndex]
                        .competences[compIndex]
                        .done = checkbox.checked;

                    saveEvalData(data);
                });

                const span = document.createElement("span");
                span.textContent = comp.text;

                label.appendChild(checkbox);
                label.appendChild(span);
                categoryDiv.appendChild(label);
            });

            levelLi.appendChild(categoryDiv);
        });

        list.appendChild(levelLi);
    });
}

// Init
(async function init() {
    const data = await loadEvalData();
    buildEvaluation(data);
})();
