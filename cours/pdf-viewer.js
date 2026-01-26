const pdfs = [
    { id: "Pres", title: "Présentation", file: "./outils peda.pdf" },
    { id: "Init", title: "Livrets pédagogiques - Initiation", file: "./livrets/livret-init.pdf" },
    { id: "BPI", title: "Livrets pédagogiques - BPI", file: "./livrets/livret-bpi.pdf" },
    { id: "BP", title: "Livrets pédagogiques - BP", file: "./livrets/livret-bp.pdf" },
    { id: "A1", title: "Affiche - 01 Déséquilibre du vol", file: "./Affiches pédagogiques A3/01-Desequilibre-du-vol2021.pdf" },
    { id: "A2", title: "Affiche - 02 Facteurs humains", file: "./Affiches pédagogiques A3/02-Facteurs-humains2019.pdf" },
    { id: "A3", title: "Affiche - 03 La dynamique du vol", file: "./Affiches pédagogiques A3/03-La-dynamique-du-vol2019.pdf" },
    { id: "A4", title: "Affiche - 04 Perturbation atmosphérique - Les «fronts»", file: "./Affiches pédagogiques A3/04-Les-fronts2019.pdf" },
    { id: "A5", title: "Affiche - 05 Les pièges aérologiques", file: "./Affiches pédagogiques A3/05-Les-pieges-aerologiques2019.pdf" },
    { id: "A6", title: "Affiche - 06 Mécanique du vol et angles", file: "./Affiches pédagogiques A3/06-Mecanique-du-vol2021.pdf" },
    { id: "A7", title: "Affiche - 07 Le parachute de secours", file: "./Affiches pédagogiques A3/07-Parachute-de-secours2019.pdf" },
    { id: "A8", title: "Affiche - 08 Le parachutes de secours - Procédure d’affalement", file: "./Affiches pédagogiques A3/08-Parachute-de-secours-affallement2021.pdf" },
    { id: "A9", title: "Affiche - 09 Parachute de secours- Description", file: "./Affiches pédagogiques A3/09-Parachute-descriptif-chaine2019.pdf" },
    { id: "A10", title: "Affiche - 10 Les parachutes de secours", file: "./Affiches pédagogiques A3/10-Parachutes-types2019.pdf" },
    { id: "A11", title: "Affiche - 11 Rafales - Effets instantanés des rafales sur l’incidence et la vitesse de vol", file: "./Affiches pédagogiques A3/11-Rafales2019.pdf" },
    { id: "A12", title: "Affiche - 12 Réglementation «La division de l’espace aérien»", file: "./Affiches pédagogiques A3/12-Reglementation2025.pdf" },
    { id: "A13", title: "Affiche - 13 Produire du roulis, de petite amplitude «à la sellette»", file: "./Affiches pédagogiques A3/13-Roulis-sellette2025.pdf" },
    { id: "A14", title: "Affiche - 14 Tangage - Travail d’amortissement en tangage", file: "./Affiches pédagogiques A3/14-Tangage2025.pdf" },
    { id: "A15", title: "Affiche - 15 Les brises", file: "./Affiches pédagogiques A3/15-Les-brises2021.pdf" },
    { id: "A16", title: "Affiche - 16 La SIGR", file: "./Affiches pédagogiques A3/16-SIGR2019.pdf" },
    { id: "A17", title: "Affiche - 17 Facteurs humains", file: "./Affiches pédagogiques A3/17-Facteurs-Humains2023.pdf" },
    { id: "A18", title: "Affiche - 18 Vol Libre et Milieux Naturels", file: "./Affiches pédagogiques A3/18-Milieux-naturels2022.pdf" },
    { id: "A19", title: "Affiche - 19 Secours Vol libre", file: "./Affiches pédagogiques A3/19-Secours2022.pdf" },
    { id: "A20", title: "Affiche - 20 Vol libre et milieux naturels", file: "./Affiches pédagogiques A3/20-Milieux-naturels-rapaces2023.pdf" },
    { id: "A21", title: "Affiche - 21 Le virage en parapente", file: "./Affiches pédagogiques A3/21-Mecavol-Virage2024.pdf" },
    { id: "PrepaEcrit", title: "Prepa BPC - Préparation à l’écrit", file: "./Preparation BPC/BPC  PP _ Delta  V-2025 may .pdf" },
    { id: "PrepaRayon", title: "Prepa BPC - Quel rayon dans un virage à plat ?", file: "./Preparation BPC/appui sellette rayon du virage.pdf" },
    { id: "PrepaRafale", title: "Prepa BPC - Poids d'une rafale dans le risque de fermeture ou de décrochage", file: "./Preparation BPC/poids d'une rafale en fermeture ou décrochage.pdf" },
    { id: "Eval1", title: "Fiche éval - Pratique du Brevet Initial et Brevet Pilote", file: "./Pratique/Pratique BI_BP_maitrise aile vol_exercices spécifiques_1.pdf" },
    { id: "Eval2", title: "Fiche éval - Brevet de pilote", file: "./Pratique/2025 - Fiche éval_Modules BP.pdf" },
    { id: "Eval3", title: "Fiche éval - BPC", file: "./Pratique/2025 - Fiche éval BPC_4 modules.pdf" },
    { id: "FH1", title: "Facteurs Humains - CHECK-LIST", file: "./Facteurs_humains/1 - FH CHECK LIST.pdf" },
    { id: "FH2", title: "Facteurs Humains - Le vol de Didier", file: "./Facteurs_humains/2 - FH Le vol de Didier.pdf" },
    { id: "FH4", title: "Facteurs Humains - Intro", file: "./Facteurs_humains/4 - FH Fiche Synthèse Intro VL.pdf" },
    { id: "FH5", title: "Facteurs Humains - Ressources", file: "./Facteurs_humains/5 - FH Fiche Synthèse Ressources VL.pdf" },
    { id: "FH3", title: "Facteurs Humains - L’attitude", file: "./Facteurs_humains/3 - FH Fiche Synthèse Attitude VL.pdf" },
    { id: "FH6", title: "Facteurs Humains - Affiche", file: "./Facteurs_humains/Facteurs Humains2022.pdf" },
    { id: "Dev1", title: "Vol Libre et Milieux Naturels - Schéma", file: "./Developpement durable/Milieux naturels2022.pdf" },
    { id: "Dev2", title: "Vol Libre et Milieux Naturels - Référentiel de connaissances vert", file: "./Developpement durable/Référentiel niveau vert - brevet initial -.pdf" },
    { id: "Dev3", title: "Vol Libre et Milieux Naturels - Référentiel de connaissances bleu", file: "./Developpement durable/Référentiel niveau bleu - brevet de pilote -.pdf" },
    { id: "Autre1", title: "Autre - Espaces Aériens", file: "./Autre/20240409_FFVL-Formation-EspacesAeriens.pdf" },
    { id: "Autre2", title: "Autre - Le Fascicule Parachute de secours", file: "./Autre/Livret_parachute_secours_Secours 2023.pdf" },
    { id: "Autre3", title: "Autre - Ouvrage numérique Parapente 360", file: "./Autre/Parapente-360-T1-V1.01.01.pdf" },
    { id: "Autre4", title: "Autre - Livret Mentalpilote", file: "./Autre/2014_Livret_FFVL_9BD.pdf" }
];

const params = new URLSearchParams(window.location.search);
const pdfId = params.get("pdf");

let index = 0;

if (pdfId) {
    const foundIndex = pdfs.findIndex(p => p.id === pdfId);
    if (foundIndex !== -1) index = foundIndex;
}

loadPdf();

function loadPdf() {
    document.getElementById('pdfFrame').src = pdfs[index].file;
    document.getElementById('pdfTitle').textContent = pdfs[index].title;
    document.getElementById('counter').textContent = `${index + 1} / ${pdfs.length}`;
}

function nextPdf() {
    if (index < pdfs.length - 1) {
        index++;
        loadPdf();
    }
}

function prevPdf() {
    if (index > 0) {
        index--;
        loadPdf();
    }
}