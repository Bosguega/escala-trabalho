// Variáveis globais para controlar o mês atual, ano atual, dias de trabalho, folga, notas e cor selecionada
let currentMonth = new Date().getMonth(); // Mês atual
let currentYear = new Date().getFullYear(); // Ano atual
let workDays = new Set(), offDays = new Set(); // Set para armazenar os dias de trabalho e folga
let notes = {}; // Armazena notas associadas às datas
let selectedColorType = ''; // Tipo de cor selecionada (trabalho, folga ou anotação)

// Carregar dados salvos ao iniciar
document.addEventListener("DOMContentLoaded", () => {
    loadSchedule(); // Carregar a escala de trabalho e folga do localStorage
    loadNotes(); // Carregar as notas associadas aos dias do calendário
    updateCalendar(); // Atualizar o calendário para refletir o estado atual
});

// Função para atualizar o calendário
function updateCalendar() {
    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = ""; // Limpa o conteúdo atual do calendário
    document.getElementById("month-year").textContent = new Date(currentYear, currentMonth).toLocaleString("pt-BR", { month: "long", year: "numeric" });

    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Número de dias no mês
    let firstDay = new Date(currentYear, currentMonth, 1).getDay(); // Dia da semana do primeiro dia do mês
    
    // Adiciona os nomes dos dias da semana
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

        // Verifica se o dia é de trabalho, folga ou se possui nota
        if (workDays.has(dateStr)) div.classList.add("work-day");
        if (offDays.has(dateStr)) div.classList.add("off-day");
        if (notes[dateStr]) div.classList.add("note-day"); // Destaca dias com nota
        
        div.onclick = () => showNotePopup(dateStr); // Exibe popup para adicionar nota ao clicar no dia
        
        grid.appendChild(div);
    }
}

// Função para mudar o mês
function changeMonth(step) {
    currentMonth += step; // Altera o mês (passando de 1 para frente ou para trás)
    if (currentMonth < 0) { // Se o mês for menor que 0 (janeiro), volta para dezembro e subtrai 1 do ano
        currentMonth = 11;
        currentYear--;
    }
    if (currentMonth > 11) { // Se o mês for maior que 11 (dezembro), volta para janeiro e adiciona 1 ao ano
        currentMonth = 0;
        currentYear++;
    }
    updateCalendar(); // Atualiza o calendário após a mudança de mês
}

// Adicionando ouvintes de evento aos botões para mudar o mês
document.getElementById("prev-month").onclick = () => changeMonth(-1); // Mês anterior
document.getElementById("next-month").onclick = () => changeMonth(1); // Próximo mês

// Função para selecionar a escala de trabalho
function selectWorkSchedule() {
    showModal("Digite a data inicial", "DD/MM/YYYY", (userDate) => {
        if (!userDate) return;

        const dateParts = userDate.split("/"); // Divide a data inserida em partes (DD/MM/YYYY)
        if (dateParts.length !== 3) {
            alert("Formato inválido. Use DD/MM/YYYY.");
            return;
        }

        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Formata a data para o padrão ISO
        const selectedDate = new Date(formattedDate);

        if (isNaN(selectedDate.getTime())) { // Verifica se a data é válida
            alert("Data inválida. Tente novamente.");
            return;
        }

        workDays.clear(); // Limpa os dias de trabalho e folga
        offDays.clear();

        let pastDate = new Date(selectedDate);
        pastDate.setDate(pastDate.getDate() + 1); // Inicia a partir do dia seguinte
        for (let i = 0; i < 365; i++) { // Preenche 365 dias (um ano)
            let dateString = pastDate.toISOString().split('T')[0];
            if (i % 4 < 2) {
                workDays.add(dateString); // Adiciona os dias de trabalho
            } else {
                offDays.add(dateString); // Adiciona os dias de folga
            }
            pastDate.setDate(pastDate.getDate() - 1); // Move um dia para trás
        }

        let futureDate = new Date(selectedDate);
        for (let i = 0; i < 365; i++) {
            let dateString = futureDate.toISOString().split('T')[0];
            if (i % 4 < 2) {
                workDays.add(dateString); // Adiciona os dias de trabalho
            } else {
                offDays.add(dateString); // Adiciona os dias de folga
            }
            futureDate.setDate(futureDate.getDate() + 1); // Move um dia para frente
        }

        saveSchedule(); // Salva a escala de trabalho e folga no localStorage
        updateCalendar(); // Atualiza o calendário com as novas configurações
    });
}

// Função para salvar a escala no localStorage
function saveSchedule() {
    localStorage.setItem("workDays", JSON.stringify([...workDays])); // Salva os dias de trabalho
    localStorage.setItem("offDays", JSON.stringify([...offDays])); // Salva os dias de folga
}

// Função para carregar a escala do localStorage
function loadSchedule() {
    const savedWorkDays = localStorage.getItem("workDays");
    const savedOffDays = localStorage.getItem("offDays");

    if (savedWorkDays) workDays = new Set(JSON.parse(savedWorkDays)); // Carrega os dias de trabalho
    if (savedOffDays) offDays = new Set(JSON.parse(savedOffDays)); // Carrega os dias de folga
}

// Funções para adicionar e salvar notas ao calendário
function showNotePopup(date) {
    let existingNote = notes[date] || ""; // Pega a nota existente para a data ou define como string vazia
    
    showModal("Digite sua nota:", "Sua anotação aqui...", (newNote) => {
        if (newNote.trim() === "") { // Se a nota estiver vazia, remove a nota
            delete notes[date];
        } else {
            notes[date] = newNote; // Salva a nova nota
        }
        saveNotes(); // Salva as notas no localStorage
        updateCalendar(); // Atualiza o calendário para refletir as novas notas
    }, existingNote);
}

// Função para salvar as notas no localStorage
function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes)); // Salva as notas associadas às datas
}

// Função para carregar as notas do localStorage
function loadNotes() {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) notes = JSON.parse(savedNotes); // Carrega as notas salvas
}

// Função para mostrar o modal de notas
function showModal(title, placeholder, callback, initialValue = "") {
    const modal = document.getElementById("custom-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalInput = document.getElementById("modal-input");
    const confirmBtn = document.getElementById("modal-confirm");

    modalTitle.textContent = title;
    modalInput.placeholder = placeholder;
    modalInput.value = initialValue; // Preenche o campo com o valor da nota existente, se houver

    modal.style.display = "flex"; // Exibe o modal

    confirmBtn.onclick = () => {
        callback(modalInput.value); // Chama a função de callback ao confirmar
        modal.style.display = "none"; // Fecha o modal
    };

    document.querySelector(".close-btn").onclick = () => {
        modal.style.display = "none"; // Fecha o modal ao clicar no botão de fechar
    };
}

// Função para abrir o seletor de cor para definir as cores de trabalho, folga ou anotação
function openColorPicker(type) {
    selectedColorType = type; // Define o tipo de cor (trabalho, folga ou anotação)
    document.getElementById('color-picker').click(); // Abre o seletor de cor
}

// Função para alterar a cor de acordo com a escolha do usuário
function changeColor(event) {
    const newColor = event.target.value;
    
    // Altera a cor do quadradinho correspondente ao tipo de cor selecionado
    if (selectedColorType === 'work') {
        document.querySelector('.work-color').style.backgroundColor = newColor;
    } else if (selectedColorType === 'off') {
        document.querySelector('.off-color').style.backgroundColor = newColor;
    } else if (selectedColorType === 'note') {
        document.querySelector('.note-color').style.backgroundColor = newColor;
    }
}

// ========================
// Registrar Service Worker para o PWA
// ========================
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => console.log("Service Worker registrado!"))
      .catch((error) => console.log("Falha ao registrar o Service Worker:", error));
}
