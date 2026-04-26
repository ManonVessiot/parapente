/* ===== DATA ===== */

const STEPS = [
    {
        title: "1. Situation générale : Analyse isobarique & Fronts",
        desc: "1013 < anticyclonaire<br>1013 > dépressionnaire<br>Dépression = Pression plus faible au centre/vent anti-horaire.",
        sites: [
            {
                site: "Météoblue: carte synoptique, pression et prévision 3h",
                url: "https://www.meteoblue.com/fr/meteo/cartes#coords=7.16/43.461/5.586&map=pressure~hourly~auto~MSL~none"
            },
            {
                site: "Met Office: carte des fronts",
                url: "https://weather.metoffice.gov.uk/maps-and-charts/surface-pressure"
            }
        ]
    },
    {
        title: "2. Vent",
        desc: "Connaitre le vent<br>Vent nord = froid<br>Vent sud = chaud humide",
        sites: [
            {
                site: "Météociel: prévision haute altitude",
                url: "https://www.meteociel.fr/previsions-haute-altitude-arpege-1h/3501/cuges_les_pins.htm"
            },
            {
                site: "Météoblue: Model général (régional/local)",
                url: "https://www.meteoblue.com/fr/meteo/semaine/cuges-les-pins_france_3022152"
            },
            {
                site: "Météoblue: Multimodel (au sol)",
                url: "https://www.meteoblue.com/fr/meteo/prevision/multimodel/cuges-les-pins_france_3022152"
            }
        ]
    },
    {
        title: "3. Nébulosité",
        desc: "Couverture nuageuse",
        sites: [
            {
                site: "Météoblue: Météogram",
                url: "https://www.meteoblue.com/fr/meteo/prevision/meteogramweb/cuges-les-pins_france_3022152"
            },
            {
                site: "Météo parapente",
                url: "https://meteo-parapente.com/#/Bouches-du-Rh%C3%B4ne/Cuges-les-Pins/43.2748,5.7015,11"
            }
        ]
    },
    {
        title: "4. Instabilité",
        desc: "Thermique ?<br>1° pour 100m = trés instable<br>0.6° pour 100m début d'instabilité",
        sites: [
            {
                site: "Météo parapente",
                url: "https://meteo-parapente.com/#/Bouches-du-Rh%C3%B4ne/Cuges-les-Pins/43.2748,5.7015,11"
            },
            {
                site: "Météociel: Emagramme - Sondage GFS",
                url: "https://www.meteociel.fr/modeles/sondage_gfs.php"
            },
            {
                site: "Météociel: prévision températures haute altitude",
                url: "https://www.meteociel.fr/previsions-haute-altitude-arpege-1h/3501/cuges_les_pins.htm"
            }
        ]
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
        `;
        (s.sites).forEach((w, j) => {
            div.innerHTML += `
                <a href="${w.url}" target='_blank' class='link'>${w.site}</a><br>
            `;
        });
        div.innerHTML += `
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
