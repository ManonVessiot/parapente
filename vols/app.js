let vols = [];
let editIndex = null;

const list = document.getElementById("volsList");
const popup = document.getElementById("popup");
const popupDate = document.getElementById("popupDate");
const popupSite = document.getElementById("popupSite");
const popupType = document.getElementById("popupType");
const popupEquip = document.getElementById("popupEquip");
const popupTime = document.getElementById("popupTime");
const popupCom = document.getElementById("popupCom");

// ---------- INIT ----------
async function init() {
    const local = localStorage.getItem("vols");
    if (local) {
        vols = JSON.parse(local);
    } else {
        const res = await fetch("vols.json");
        vols = await res.json();
    }
    render();
}
init();

// ---------- RENDER ----------
function render() {
    list.innerHTML = "";
    for (let index = vols.length - 1; index >= 0; index--) {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${index + 1}. ${vols[index].date}<br></strong>`
        if (vols[index].site) li.innerHTML += `<span>Site :</span> ${vols[index].site}<br>`
        if (vols[index].type_vol) li.innerHTML += `<span>Type :</span> ${vols[index].type_vol}<br>`
        if (vols[index].equipement) li.innerHTML += `<span>Equipement :</span> ${vols[index].equipement}<br>`
        if (vols[index].duree_minutes) li.innerHTML += `<span>Durée :</span> ${vols[index].duree_minutes}<br><br>`
        li.innerHTML += `${vols[index].commentaire}<br>`
        li.innerHTML += `<button onclick="edit(${index})">✏ Modifier</button>
            <button onclick="removeDef(${index})">✖ Supprimer</button>`;
        list.appendChild(li);
    }
}

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
    popupDate.value = vols[i].date;
    popupSite.value = vols[i].site;
    popupType.value = vols[i].type_vol;
    popupEquip.value = vols[i].equipement;
    popupTime.value = vols[i].duree_minutes;
    popupCom.value = vols[i].commentaire;
    openPopup();
}

function saveVol() {
    const date = popupDate.value.trim();
    site = popupSite.value.trim();
    type_vol = popupType.value.trim();
    equipement = popupEquip.value.trim();
    const duree_minutes = popupTime.value.trim();
    const commentaire = popupCom.value.trim();

    if (!date || !commentaire) {
        alert("Date et commentaire obligatoires");
        return;
    }

    if (editIndex !== null) {
        vols[editIndex] = { date: date, site: site, type_vol: type_vol, equipement: equipement, duree_minutes: duree_minutes, commentaire: commentaire };
    } else {
        vols.push({ date: date, site: site, type_vol: type_vol, equipement: equipement, duree_minutes: duree_minutes, commentaire: commentaire });
    }

    persist();
    closePopup();
}

// ---------- DELETE ----------
function removeDef(i) {
    if (!confirm("Supprimer le définition de \"" + vols[i].nom + "\" ?")) return;
    vols.splice(i, 1);
    persist();
}

// ---------- STORAGE ----------
function persist() {
    localStorage.setItem("vols", JSON.stringify(vols));
    render();
}

// ---------- DOWNLOAD ----------
function downloadJSON() {
    const blob = new Blob(
        [JSON.stringify(vols, null, 2)],
        { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vols.json";
    a.click();
}

// ---------- RESET ----------
async function resetToServer() {
    if (!confirm("Revenir à la version serveur ?")) return;
    localStorage.removeItem("vols");
    const res = await fetch("vols.json");
    console.log("res : " + res);
    vols = await res.json();
    render();
}

// ---------- EVENTS ----------
document.getElementById("addBtn").onclick = () => {
    popupDate.value = "";
    popupSite.value = "";
    popupType.value = "Autonome";
    popupEquip.value = "Niviuk Hook 5 / Exence Woody Valley";
    popupTime.value = "";
    popupCom.value = "";
    openPopup();
};

document.getElementById("cancelBtn").onclick = closePopup;
document.getElementById("saveBtn").onclick = saveVol;
document.getElementById("downloadBtn").onclick = downloadJSON;
document.getElementById("resetBtn").onclick = resetToServer;
