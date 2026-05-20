let gonflages = [];
let editIndex = null;

const list = document.getElementById("gonflagesList");
const popup = document.getElementById("popup");
const popupDate = document.getElementById("popupDate");
const popupEquip = document.getElementById("popupEquip");
const popupTime = document.getElementById("popupTime");
const popupCom = document.getElementById("popupCom");

// ---------- INIT ----------
async function init() {
    const local = localStorage.getItem("gonflages");
    if (local) {
        gonflages = JSON.parse(local);
    } else {
        const res = await fetch("gonflages.json");
        gonflages = await res.json();
    }
    render();
}
init();

// ---------- RENDER ----------
function render() {
    list.innerHTML = "";
    for (let index = gonflages.length - 1; index >= 0; index--) {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${index + 1}. ${gonflages[index].date}<br></strong>`
        if (gonflages[index].equipement) li.innerHTML += `<span>Equipement :</span> ${gonflages[index].equipement}<br>`
        if (gonflages[index].duree) li.innerHTML += `<span>Durée :</span> ${gonflages[index].duree}<br><br>`
        li.innerHTML += `${gonflages[index].commentaire}<br>`
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
    popupDate.value = gonflages[i].date;
    popupEquip.value = gonflages[i].equipement;
    popupTime.value = gonflages[i].duree;
    popupCom.value = gonflages[i].commentaire;
    openPopup();
}

function saveGonflage() {
    const date = popupDate.value.trim();
    equipement = popupEquip.value.trim();
    const duree = popupTime.value.trim();
    const commentaire = popupCom.value.trim();

    if (!date || !commentaire) {
        alert("Date et commentaire obligatoires");
        return;
    }

    if (editIndex !== null) {
        gonflages[editIndex] = { date: date, equipement: equipement, duree: duree, commentaire: commentaire };
    } else {
        gonflages.push({ date: date, equipement: equipement, duree: duree, commentaire: commentaire });
    }

    persist();
    closePopup();
}

// ---------- DELETE ----------
function removeDef(i) {
    if (!confirm("Supprimer le définition de \"" + gonflages[i].nom + "\" ?")) return;
    gonflages.splice(i, 1);
    persist();
}

// ---------- STORAGE ----------
function persist() {
    localStorage.setItem("gonflages", JSON.stringify(gonflages));
    render();
}

// ---------- DOWNLOAD ----------
function downloadJSON() {
    const blob = new Blob(
        [JSON.stringify(gonflages, null, 2)],
        { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gonflages.json";
    a.click();
}

// ---------- RESET ----------
async function resetToServer() {
    if (!confirm("Revenir à la version serveur ?")) return;
    localStorage.removeItem("gonflages");
    const res = await fetch("gonflages.json");
    console.log("res : " + res);
    gonflages = await res.json();
    render();
}

// ---------- EVENTS ----------
document.getElementById("addBtn").onclick = () => {
    popupDate.value = "";
    popupEquip.value = "Niviuk Hook 5 / Exence Woody Valley";
    popupTime.value = "";
    popupCom.value = "";
    openPopup();
};

document.getElementById("cancelBtn").onclick = closePopup;
document.getElementById("saveBtn").onclick = saveGonflage;
document.getElementById("downloadBtn").onclick = downloadJSON;
document.getElementById("resetBtn").onclick = resetToServer;
