const EVAL_STORAGE_KEY = "parapente_eval";
const VERSION_STORAGE_KEY = "parapente_eval_version";

// Chargement des données (localStorage > fichier json)
async function loadEvalData() {
    const response = await fetch("eval.json?_=" + Date.now());
    const json = await response.json();

    const versionData = localStorage.getItem(VERSION_STORAGE_KEY);
    if (versionData) {
        const localData = localStorage.getItem(EVAL_STORAGE_KEY);
        if (localData) {
            oldData = JSON.parse(localData);
            if (versionData == json.version) {
                console.log("same version : " + json.version);
                return oldData;
            }
            // check if element in new json are same in old and set done value
            json.data = checkNewWithOld(json.data, oldData);
            console.log("new version : " + json.version);
            console.log("old version : " + versionData);
        }
    }
    localStorage.setItem(EVAL_STORAGE_KEY, JSON.stringify(json.data));
    localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(json.version));
    return json.data;
}

function checkNewWithOld(newData, oldData) {
    oldData.forEach(oldItem => {
        newData.forEach(newItem => {
            if (oldItem.name == newItem.name) {
                oldItem.competences.forEach(oldComp => {
                    newItem.competences.forEach(newComp => {
                        if (oldComp.name == newComp.name) {
                            oldComp.competences.forEach(oldC => {
                                newComp.competences.forEach(newC => {
                                    if (oldC.text == newC.text) {
                                        newC.done = oldC.done;
                                    }
                                });
                            });
                        }
                    });
                });
            }
        });
    });
    return newData;
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
