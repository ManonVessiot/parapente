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

/* ===== INIT ===== */

initSteps();

/* ===== FUNCTIONS ===== */

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
    let text = ``;
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
