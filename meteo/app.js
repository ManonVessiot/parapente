/* ===== DATA ===== */

const STEPS = [
    {
        title: "1. Analyse isobarique",
        desc: "Dépression = Pression plus faible au centre/vent anti-horaire.",
        site: "Météoblue: carte synoptique, pression et prévision 3h",
        url: "https://www.meteoblue.com/fr/meteo/cartes#coords=7.16/43.461/5.586&map=pressure~hourly~auto~MSL~none"
    },
    {
        title: "2. Vent en altitude",
        desc: "Connaitre le vent météo",
        site: "Météociel: prévision haute altitude",
        url: "https://www.meteociel.fr/previsions-haute-altitude/3501/cuges_les_pins.htm"
    },
    {
        title: "3. Vent régional/local",
        desc: "Model général",
        site: "Météoblue",
        url: "https://www.meteoblue.com/fr/meteo/semaine/cuges-les-pins_france_3022152"
    },
    {
        title: "4. Vent au sol",
        desc: "Multimodel",
        site: "Météoblue: Multimodel",
        url: "https://www.meteoblue.com/fr/meteo/prevision/multimodel/cuges-les-pins_france_3022152"
    },
    {
        title: "5. Nébulosité",
        desc: "Instabilité / couverture",
        site: "Météoblue: Météogram",
        url: "https://www.meteoblue.com/fr/meteo/prevision/meteogramweb/cuges-les-pins_france_3022152"
    },
    {
        title: "6. Volabilité",
        desc: "Synthèse parapente",
        site: "Météo parapente",
        url: "https://meteo-parapente.com/#/Bouches-du-Rh%C3%B4ne/Cuges-les-Pins/43.2748,5.7015,11"
    }
];

/* ===== PRESETS ===== */

let presets = JSON.parse(localStorage.getItem("meteo_presets") || "{}");
let currentPreset = null;
document.getElementById("deletePresetBtn").disabled = true;


/* ===== INIT ===== */

initPresets();
initSteps();

/* ===== FUNCTIONS ===== */

function initPresets() {
    const select = document.getElementById("presetSelect");
    select.innerHTML = `<option value="">Nouveau site</option>`;

    Object.keys(presets).forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });

    select.onchange = () => loadPreset(select.value);
}

function loadPreset(name) {
    currentPreset = name || null;
    document.getElementById("deletePresetBtn").disabled = !currentPreset;

    if (!name) {
        clearStaticFields();
        return;
    }

    const p = presets[name];
    siteName.value = name;
    orientations.value = p.orientations;
    altitude.value = p.altitude;
    typeVol.value = p.typeVol;
    atteros.value = p.atteros;
    pieges.value = p.pieges;
}

function savePreset() {
    const newName = siteName.value.trim();
    if (!newName) {
        alert("Nom du site obligatoire");
        return;
    }

    const data = {
        orientations: orientations.value,
        altitude: altitude.value,
        typeVol: typeVol.value,
        atteros: atteros.value,
        pieges: pieges.value
    };

    // Cas 1 : renommage
    if (currentPreset && currentPreset !== newName) {
        // Le nouveau nom existe déjà → confirmation
        if (presets[newName]) {
            const ok = confirm(
                `Le preset "${newName}" existe déjà.\nVoulez-vous le remplacer ?`
            );
            if (!ok) return;
        }

        // Supprimer l'ancien nom
        delete presets[currentPreset];
    }

    // Cas 2 : même nom ou nouveau preset
    if (!currentPreset && presets[newName]) {
        const ok = confirm(
            `Le preset "${newName}" existe déjà.\nVoulez-vous le remplacer ?`
        );
        if (!ok) return;
    }

    presets[newName] = data;
    localStorage.setItem("meteo_presets", JSON.stringify(presets));

    currentPreset = newName;
    initPresets();
    presetSelect.value = newName;
}

function deletePreset() {
    if (!currentPreset) {
        alert("Aucun preset sélectionné");
        return;
    }

    const ok = confirm(`Supprimer définitivement le preset "${currentPreset}" ?`);
    if (!ok) return;

    delete presets[currentPreset];
    localStorage.setItem("meteo_presets", JSON.stringify(presets));

    currentPreset = null;
    presetSelect.value = "";
    initPresets();
    clearStaticFields();
}

function clearStaticFields() {
    document.getElementById("siteName").value = "";
    document.getElementById("orientations").value = "";
    document.getElementById("altitude").value = "";
    document.getElementById("typeVol").value = "";
    document.getElementById("atteros").value = "";
    document.getElementById("pieges").value = "";

    currentPreset = null;
}



function initSteps() {
    const container = document.getElementById("steps");
    STEPS.forEach((s, i) => {
        const div = document.createElement("div");
        div.className = "step";
        div.innerHTML = `
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
            <a href="${s.url}" target='_blank' class='link'>${s.site}</a>
            <textarea id="step_${i}" placeholder="Notes..."></textarea>
        `;
        container.appendChild(div);
    });
}

function resetDynamic() {
    document.querySelectorAll("#steps textarea, #conclusion").forEach(t => t.value = "");
}

function buildAnalysisText() {
    let text = `SITE : ${siteName.value}\n`;
    text += `Orientation : ${orientations.value}\n`;
    text += `Altitude : ${altitude.value}\n`;
    text += `Type : ${typeVol.value}\n`;
    text += `Attero : ${atteros.value}\n`;
    text += `Pièges : ${pieges.value}\n`;
    text += `\n`;

    STEPS.forEach((s, i) => {
        const val = document.getElementById(`step_${i}`).value;
        text += `${s.title}\n${val}\n\n`;
    });

    text += `BILAN\n${conclusion.value}`;

    return text;
}

function showAnalysis() {
    const text = buildAnalysisText(); // ta fonction existante
    document.getElementById("analysisText").value = text;
    document.getElementById("analysisModal").classList.remove("hidden");
}

function closeAnalysis() {
    document.getElementById("analysisModal").classList.add("hidden");
}

function copyAnalysis() {
    const textarea = document.getElementById("analysisText");
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(textarea.value);
    alert("Analyse copiée dans le presse-papier");
}
