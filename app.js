let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let workDays = new Set(), offDays = new Set();
let notes = JSON.parse(localStorage.getItem("notes")) || {}; // Carregar notas salvas

document.addEventListener("DOMContentLoaded", updateCalendar);

function updateCalendar() {
    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = "";
    document.getElementById("month-year").textContent = new Date(currentYear, currentMonth).toLocaleString("pt-BR", { month: "long", year: "numeric" });

    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].forEach(day => {
        let div = document.createElement("div");
        div.classList.add("day-name");
        div.textContent = day;
        grid.appendChild(div);
    });

    for (let i = 0; i < firstDay; i++) {
        let div = document.createElement("div");
        div.classList.add("empty");
        grid.appendChild(div);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        let div = document.createElement("div");
        div.classList.add("day");
        div.textContent = day;

        let dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];

        if (workDays.has(dateStr)) div.classList.add("work-day");
        if (offDays.has(dateStr)) div.classList.add("off-day");
        if (notes[dateStr]) div.classList.add("note-day"); // Destacar dias com nota

        div.onclick = () => showNotePopup(dateStr);

        grid.appendChild(div);
    }
}

function changeMonth(step) {
    currentMonth += step;
    if (currentMonth < 0) (currentMonth = 11, currentYear--);
    if (currentMonth > 11) (currentMonth = 0, currentYear++);
    updateCalendar();
}

function selectWorkSchedule() {
    const userDate = prompt("Digite a data inicial (DD/MM/YYYY):");
    if (!userDate) return;

    const [day, month, year] = userDate.split("/").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    if (isNaN(selectedDate.getTime())) {
        alert("Data inválida. Tente novamente.");
        return;
    }

    workDays.clear();
    offDays.clear();

    let pastDate = new Date(selectedDate);
    pastDate.setDate(pastDate.getDate() + 1);
    for (let i = 0; i < 365; i++) {
        let dateString = pastDate.toISOString().split('T')[0];
        if (i % 4 < 2) {
            workDays.add(dateString);
        } else {
            offDays.add(dateString);
        }
        pastDate.setDate(pastDate.getDate() - 1);
    }

    let futureDate = new Date(selectedDate);
    for (let i = 0; i < 365; i++) {
        let dateString = futureDate.toISOString().split('T')[0];
        if (i % 4 < 2) {
            workDays.add(dateString);
        } else {
            offDays.add(dateString);
        }
        futureDate.setDate(futureDate.getDate() + 1);
    }
    updateCalendar();
}

// Exibir popup para adicionar nota
function showNotePopup(dateStr) {
    let note = prompt("Digite sua nota:", notes[dateStr] || "");
    if (note === null) return; // Cancelar

    if (note.trim() === "") {
        delete notes[dateStr]; // Apagar nota
    } else {
        notes[dateStr] = note; // Salvar nota
    }

    localStorage.setItem("notes", JSON.stringify(notes));
    updateCalendar();
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => console.log("Service Worker registrado!"))
      .catch((error) => console.log("Falha ao registrar o Service Worker:", error));
}
