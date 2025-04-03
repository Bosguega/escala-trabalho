let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let workDays = new Set(), offDays = new Set();
let notes = {}; // Armazena notas associadas às datas

// Carregar dados salvos ao iniciar
document.addEventListener("DOMContentLoaded", () => {
    loadSchedule();
    loadNotes();
    updateCalendar();
});

function updateCalendar() {
    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = "";
    document.getElementById("month-year").textContent = new Date(currentYear, currentMonth).toLocaleString("pt-BR", { month: "long", year: "numeric" });

    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    // Adiciona nomes dos dias da semana
    ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].forEach(day => {
        let div = document.createElement("div");
        div.classList.add("day-name");
        div.textContent = day;
        grid.appendChild(div);
    });

    // Preenche os dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
        let div = document.createElement("div");
        div.classList.add("empty");
        grid.appendChild(div);
    }

    // Preenche os dias do mês
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
    showModal("Digite a data inicial", "DD/MM/YYYY", (userDate) => {
        if (!userDate) return;

        const dateParts = userDate.split("/");
        if (dateParts.length !== 3) {
            alert("Formato inválido. Use DD/MM/YYYY.");
            return;
        }

        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        const selectedDate = new Date(formattedDate);

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

        saveSchedule(); // Salvando os dados
        updateCalendar(); // Atualiza o calendário
    });
}


// Salvar a escala no localStorage
function saveSchedule() {
    localStorage.setItem("workDays", JSON.stringify([...workDays]));
    localStorage.setItem("offDays", JSON.stringify([...offDays]));
}

// Carregar a escala do localStorage
function loadSchedule() {
    const savedWorkDays = localStorage.getItem("workDays");
    const savedOffDays = localStorage.getItem("offDays");

    if (savedWorkDays) workDays = new Set(JSON.parse(savedWorkDays));
    if (savedOffDays) offDays = new Set(JSON.parse(savedOffDays));
}

// ========================
// Adicionar notas ao calendário
// ========================
function showNotePopup(date) {
    let existingNote = notes[date] || "";
    
    showModal("Digite sua nota:", "Sua anotação aqui...", (newNote) => {
        if (newNote.trim() === "") {
            delete notes[date]; // Remover nota se estiver vazia
        } else {
            notes[date] = newNote;
        }
        saveNotes();
        updateCalendar();
    }, existingNote);
}




// Salvar notas no localStorage
function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

// Carregar notas do localStorage
function loadNotes() {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) notes = JSON.parse(savedNotes);
}

function showModal(title, placeholder, callback, initialValue = "") {
    const modal = document.getElementById("custom-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalInput = document.getElementById("modal-input");
    const confirmBtn = document.getElementById("modal-confirm");
    
    modalTitle.textContent = title;
    modalInput.placeholder = placeholder;
    modalInput.value = initialValue; // Agora exibe a nota existente

    modal.style.display = "flex";

    confirmBtn.onclick = () => {
        callback(modalInput.value);
        modal.style.display = "none";
    };

    document.querySelector(".close-btn").onclick = () => {
        modal.style.display = "none";
    };
}



// ========================
// Registrar Service Worker para o PWA
// ========================
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => console.log("Service Worker registrado!"))
      .catch((error) => console.log("Falha ao registrar o Service Worker:", error));
}
