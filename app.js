// ================== TRANSLATIONS (EN & BM) ==================
const translations = {
  en: {
    app_title: "Student Study Space",
    login_tab: "Login",
    signup_tab: "Sign Up",
    login_title: "Login",
    signup_title: "Create Account",
    username_label: "Username",
    password_label: "Password",
    full_name_label: "Full Name",
    email_label: "Email",
    preferred_language_label: "Preferred Language",
    login_btn: "Login",
    signup_btn: "Sign Up",
    logout_btn: "Logout",
    today_target_title: "Today's Study Target",
    save_btn: "Save",
    subjects_title: "Subjects",
    add_subject_btn: "Add Subject",
    timer_title: "Study Timer",
    timer_minutes_label: "Minutes",
    start_btn: "Start",
    reset_btn: "Reset",
    stopwatch_title: "Stopwatch",
    stop_btn: "Stop",
    quote_title: "Motivational Quote",
    new_quote_btn: "New Quote",
    calendar_title: "Monthly Planner",
    calculator_title: "Scientific Calculator",
    subject_tasks_title: "Subject Tasks",
    add_tasks_btn: "Add Task"
  },
  ms: {
    app_title: "Ruang Belajar Pelajar",
    login_tab: "Log Masuk",
    signup_tab: "Daftar Akaun",
    login_title: "Log Masuk",
    signup_title: "Daftar Akaun Baru",
    username_label: "Nama Pengguna",
    password_label: "Kata Laluan",
    full_name_label: "Nama Penuh",
    email_label: "Emel",
    preferred_language_label: "Bahasa Pilihan",
    login_btn: "Log Masuk",
    signup_btn: "Daftar",
    logout_btn: "Log Keluar",
    today_target_title: "Target Belajar Hari Ini",
    save_btn: "Simpan",
    subjects_title: "Senarai Subjek",
    add_subject_btn: "Tambah Subjek",
    timer_title: "Timer Belajar",
    timer_minutes_label: "Minit",
    start_btn: "Mula",
    reset_btn: "Reset",
    stopwatch_title: "Stopwatch",
    stop_btn: "Berhenti",
    quote_title: "Kata-kata Semangat",
    new_quote_btn: "Quote Lain",
    calendar_title: "Perancang Bulanan",
    calculator_title: "Kalkulator Saintifik",
    subject_tasks_title: "Tugasan Subjek",
    add_tasks_btn: "Tambah Tugasan"
  }
};

const quotes = {
  en: [
    "Small progress is still progress.",
    "Study smarter, not just harder.",
    "Your future self will thank you.",
    "Consistency beats perfection.",
    "One chapter at a time."
  ],
  ms: [
    "Sedikit-sedikit, lama-lama jadi bukit.",
    "Belajar hari ini untuk masa depan esok.",
    "Yang penting konsisten, bukan perfect.",
    "Rehat sekejap tak apa, tapi jangan berhenti.",
    "Satu bab hari ini lebih baik daripada tiada."
  ]
};

let currentLang = "en";
let timerInterval = null;
let timerRemaining = 0;
let stopwatchInterval = null;
let stopwatchSeconds = 0;

// Calendar
let calendarCurrentDate = new Date();

// Calculator
let calcExpression = "";
let calcLastAnswer = null;

let currentSubject = null;

// Month names
const monthNamesEn = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const monthNamesMs = [
  "Januari","Februari","Mac","April","Mei","Jun",
  "Julai","Ogos","September","Oktober","November","Disember"
];

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "en";
  setLanguage(savedLang);

  const currentUser = getCurrentUser();
  if (currentUser) {
    showDashboard();
  } else {
    showAuth();
  }

  initCalendar();
  initCalculator();
});

// ================== LANGUAGE ==================
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  const t = translations[lang];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  const newSubjectInput = document.getElementById("new-subject-input");
  if (newSubjectInput) {
    newSubjectInput.placeholder =
      lang === "en" ? "Add new subject" : "Tambah subjek baru";
  }

  const targetTextarea = document.getElementById("today-target");
  if (targetTextarea) {
    targetTextarea.placeholder =
      lang === "en"
        ? "Write your study target for today..."
        : "Tulis target belajar anda untuk hari ini...";
  }

  const addTaskBtn = document.querySelector("#subject-tasks-area button.secondary span:last-child");
  if (addTaskBtn) {
    addTaskBtn.textContent =
    lang === "en" ? translations.en.add_task_btn : translations.ms.add_task_btn;
  }

  // Update quote & calendar language bila tukar bahasa
  newQuote();
  renderCalendar();

    // Update quote & calendar language bila tukar bahasa
  newQuote();
  renderCalendar();
  updateSubjectDetailsCard(); // NEW
}

// ================== AUTH STORAGE HELPERS ==================
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

function setCurrentUser(username) {
  localStorage.setItem("currentUser", username);
}

function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}

// ================== AUTH UI ==================
function showAuth() {
  document.getElementById("auth-section").classList.remove("hidden");
  document.getElementById("dashboard-section").classList.add("hidden");
  const sidebarUser = document.getElementById("sidebar-user");
  if (sidebarUser) sidebarUser.textContent = "Student";

  currentSubject = null;
  updateSubjectDetailsCard();
  updateSubjectTasksCard();
}

function showDashboard() {
  document.getElementById("auth-section").classList.add("hidden");
  document.getElementById("dashboard-section").classList.remove("hidden");

  const user = getUserByUsername(getCurrentUser());
  const welcomeText = document.getElementById("welcome-text");
  const sidebarUser = document.getElementById("sidebar-user");
  if (user) {
    const name = user.fullName || user.username;
    welcomeText.textContent =
      currentLang === "en" ? `Hi, ${name}!` : `Hai, ${name}!`;
    if (sidebarUser) {
      sidebarUser.textContent = name;
    }
  }

  loadTodayTarget();
  loadSubjects();
  newQuote();
  renderCalendar();
  updateSubjectDetailsCard();
  updateSubjectTasksCard();
}

// Switch tab login / signup
function showAuthForm(type) {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");

  if (type === "login") {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    loginTab.classList.remove("active");
    signupTab.classList.add("active");
  }
}

// ================== AUTH LOGIC ==================
function getUserByUsername(username) {
  return getUsers().find((u) => u.username === username);
}

function handleSignup() {
  const fullName = document.getElementById("signup-fullname").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value;
  const language = document.getElementById("signup-language").value;
  const errorEl = document.getElementById("signup-error");

  if (!fullName || !email || !username || !password) {
    errorEl.textContent =
      currentLang === "en"
        ? "Please fill in all fields."
        : "Sila isi semua ruangan.";
    return;
  }

  const users = getUsers();
  if (users.some((u) => u.username === username)) {
    errorEl.textContent =
      currentLang === "en"
        ? "Username already exists."
        : "Nama pengguna sudah digunakan.";
    return;
  }

  const newUser = {
    fullName,
    email,
    username,
    password,
    preferredLanguage: language
  };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(username);
  setLanguage(language);
  errorEl.textContent = "";

  document.getElementById("signup-fullname").value = "";
  document.getElementById("signup-email").value = "";
  document.getElementById("signup-username").value = "";
  document.getElementById("signup-password").value = "";

  showDashboard();
}

function handleLogin() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");

  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    errorEl.textContent =
      currentLang === "en"
        ? "Invalid username or password."
        : "Nama pengguna atau kata laluan salah.";
    return;
  }

  setCurrentUser(user.username);
  errorEl.textContent = "";

  if (user.preferredLanguage) {
    setLanguage(user.preferredLanguage);
  }

  document.getElementById("login-username").value = "";
  document.getElementById("login-password").value = "";

  showDashboard();
}

function handleLogout() {
  clearCurrentUser();
  showAuth();
}

// ================== TODAY TARGET ==================
function todayTargetKey() {
  const user = getCurrentUser();
  return `today_target_${user}`;
}

function saveTodayTarget() {
  const text = document.getElementById("today-target").value;
  localStorage.setItem(todayTargetKey(), text);
  if (currentLang === "en") {
    alert("Target saved!");
  } else {
    alert("Target disimpan!");
  }
}

function loadTodayTarget() {
  const saved = localStorage.getItem(todayTargetKey()) || "";
  const textarea = document.getElementById("today-target");
  if (textarea) textarea.value = saved;
}

// ================== SUBJECTS ==================
function subjectsKey() {
  const user = getCurrentUser();
  return `subjects_${user}`;
}

function loadSubjects() {
  const listEl = document.getElementById("subjects-list");
  if (!listEl) return;

  listEl.innerHTML = "";

  const subjects = JSON.parse(localStorage.getItem(subjectsKey()) || "[]");

  if (subjects.length === 0) {
    const li = document.createElement("li");
    li.textContent =
      currentLang === "en"
        ? "No subjects yet. Add one below."
        : "Belum ada subjek. Tambah di bawah.";
    listEl.appendChild(li);
    return;
  }

  subjects.forEach((subj) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = subj;

    const dot = document.createElement("span");
    dot.className = "dot";

    li.appendChild(label);
    li.appendChild(dot);

    li.addEventListener("click", () => selectSubject(subj));

    if (currentSubject === subj){
        li.classList.add("subject-selected");
    }

    listEl.appendChild(li);
  });
}

function addSubject() {
  const input = document.getElementById("new-subject-input");
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;

  const subjects = JSON.parse(localStorage.getItem(subjectsKey()) || "[]");
  subjects.push(value);
  localStorage.setItem(subjectsKey(), JSON.stringify(subjects));
  input.value = "";
  loadSubjects();

  currentSubject = value;
  loadSubjectNotes();
  updateSubjectDetailsCard();
  loadSubjectTasks();
  updateSubjectTasksCard();
}

// ================== TIMER ==================
function startTimer() {
  const minutesInput = document.getElementById("timer-minutes");
  const minutes = parseInt(minutesInput.value, 10);
  if (isNaN(minutes) || minutes <= 0) return;

  timerRemaining = minutes * 60;
  updateTimerDisplay();

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerRemaining--;
    updateTimerDisplay();
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      if (currentLang === "en") {
        alert("Time's up! Take a short break.");
      } else {
        alert("Masa tamat! Rehat sekejap.");
      }
    }
  }, 1000);
}

function resetTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  timerRemaining = 0;
  const display = document.getElementById("timer-display");
  if (display) display.textContent = "00:00";
}

function updateTimerDisplay() {
  const display = document.getElementById("timer-display");
  if (!display) return;
  const minutes = Math.floor(timerRemaining / 60);
  const seconds = timerRemaining % 60;
  display.textContent =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

// ================== STOPWATCH ==================
function startStopwatch() {
  if (stopwatchInterval) return;

  stopwatchInterval = setInterval(() => {
    stopwatchSeconds++;
    updateStopwatchDisplay();
  }, 1000);
}

function stopStopwatch() {
  if (stopwatchInterval) {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
  }
}

function resetStopwatch() {
  stopStopwatch();
  stopwatchSeconds = 0;
  updateStopwatchDisplay();
}

function updateStopwatchDisplay() {
  const display = document.getElementById("stopwatch-display");
  if (!display) return;
  const minutes = Math.floor(stopwatchSeconds / 60);
  const seconds = stopwatchSeconds % 60;
  display.textContent =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

// ================== QUOTES ==================
function newQuote() {
  const quoteEl = document.getElementById("quote-text");
  if (!quoteEl) return;
  const list = quotes[currentLang] || quotes["en"];
  const random = list[Math.floor(Math.random() * list.length)];
  quoteEl.textContent = random;
}

// ================== CALENDAR ==================
function initCalendar() {
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const monthLabel = document.getElementById("calendar-current-month");
  if (!grid || !monthLabel) return;

  const year = calendarCurrentDate.getFullYear();
  const month = calendarCurrentDate.getMonth();

  const monthNames = currentLang === "en" ? monthNamesEn : monthNamesMs;
  monthLabel.textContent = `${monthNames[month]} ${year}`;

  grid.innerHTML = "";

  const dayNames = currentLang === "en"
    ? ["S", "M", "T", "W", "T", "F", "S"]
    : ["A", "I", "S", "R", "K", "J", "S"]; // Ahad, Isnin, ...

  dayNames.forEach((d) => {
    const el = document.createElement("div");
    el.className = "calendar-day-name";
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // previous month blanks
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell other-month";
    cell.textContent = prevMonthDays - firstDay + 1 + i;
    grid.appendChild(cell);
  }

  const today = new Date();
  const isThisMonth =
    today.getFullYear() === year && today.getMonth() === month;

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.textContent = d;

    if (isThisMonth && d === today.getDate()) {
      cell.classList.add("today");
    }

    grid.appendChild(cell);
  }

  const totalCells = 7 + firstDay + daysInMonth;
  const remainder = totalCells % 7;
  if (remainder !== 0) {
    const extra = 7 - remainder;
    for (let i = 1; i <= extra; i++) {
      const cell = document.createElement("div");
      cell.className = "calendar-cell other-month";
      cell.textContent = i;
      grid.appendChild(cell);
    }
  }
}

function changeMonth(delta) {
  const year = calendarCurrentDate.getFullYear();
  const month = calendarCurrentDate.getMonth();
  const day = calendarCurrentDate.getDate();
  calendarCurrentDate = new Date(year, month + delta, day);
  renderCalendar();
}

// ================== CALCULATOR ==================
function initCalculator() {
  const buttons = document.querySelectorAll(".calc-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-value");
      handleCalcButton(value);
    });
  });
  updateCalcDisplay();
}

function updateCalcDisplay() {
  const main = document.getElementById("calc-display-main");
  const secondary = document.getElementById("calc-display-secondary");
  if (!main || !secondary) return;

  main.textContent = calcExpression || "0";
  if (calcLastAnswer !== null) {
    secondary.textContent =
      (currentLang === "en" ? "Ans = " : "Jawapan = ") + calcLastAnswer;
  } else {
    secondary.textContent = "";
  }
}

function handleCalcButton(value) {
  if (value === "AC") {
    calcExpression = "";
    updateCalcDisplay();
    return;
  }

  if (value === "DEL") {
    calcExpression = calcExpression.slice(0, -1);
    updateCalcDisplay();
    return;
  }

  if (value === "Ans") {
    if (calcLastAnswer !== null) {
      calcExpression += String(calcLastAnswer);
      updateCalcDisplay();
    }
    return;
  }

  if (value === "=") {
    evaluateCalcExpression();
    return;
  }

  // normal token
  calcExpression += value;
  updateCalcDisplay();
}

function degToRad(x) {
  return (x * Math.PI) / 180;
}

function evaluateCalcExpression() {
  if (!calcExpression) return;

  let expr = calcExpression;

  // Replace display symbols with JS-compatible
  expr = expr.replace(/π/g, "Math.PI");
  expr = expr.replace(/√\(/g, "Math.sqrt(");
  expr = expr.replace(/sin\(/g, "Math.sin(degToRad(");
  expr = expr.replace(/cos\(/g, "Math.cos(degToRad(");
  expr = expr.replace(/tan\(/g, "Math.tan(degToRad(");
  expr = expr.replace(/log\(/g, "Math.log10(");
  expr = expr.replace(/ln\(/g, "Math.log(");
  expr = expr.replace(/×/g, "*");
  expr = expr.replace(/÷/g, "/");
  expr = expr.replace(/\^/g, "**");

  try {
    // Evaluate in a controlled way
    const result = Function("degToRad", "return " + expr)(degToRad);
    if (result === undefined || Number.isNaN(result)) {
      throw new Error("Invalid");
    }
    const rounded =
      Math.abs(result) < 1e-9 ? 0 : Math.round(result * 1e9) / 1e9;

    calcLastAnswer = rounded;
    calcExpression = String(rounded);
    updateCalcDisplay();
  } catch (e) {
    const main = document.getElementById("calc-display-main");
    if (main) {
      main.textContent = currentLang === "en" ? "Error" : "Ralat";
    }
    // keep old expression so user boleh betulkan sendiri
  }
}

// ================== SUBJECT NOTES ==================
function subjectNotesKey(subject) {
  const user = getCurrentUser();
  return `subject_notes_${user}_${subject}`;
}

function subjectTasksKey(subject) {
    const user = getCurrentUser();
    return `subject_tasks_${user}_${subject}`;
}

function selectSubject(subject) {
  currentSubject = subject;
  loadSubjects();          // refresh highlight
  loadSubjectNotes();
  updateSubjectDetailsCard();
  loadSubjectTasks();
  updateSubjectTasksCard();
}

function loadSubjectNotes() {
  const textarea = document.getElementById("subject-notes");
  const placeholder = document.getElementById("subject-details-placeholder");
  if (!textarea || !placeholder) return;

  if (!currentSubject) {
    textarea.classList.add("hidden");
    placeholder.textContent =
      currentLang === "en"
        ? "Select a subject to write notes."
        : "Pilih subjek untuk tulis nota.";
    return;
  }

  const saved =
    localStorage.getItem(subjectNotesKey(currentSubject)) || "";
  textarea.value = saved;
}

function saveSubjectNotes() {
  if (!currentSubject) return;
  const textarea = document.getElementById("subject-notes");
  if (!textarea) return;

  localStorage.setItem(subjectNotesKey(currentSubject), textarea.value);

  if (currentLang === "en") {
    alert("Notes saved!");
  } else {
    alert("Nota disimpan!");
  }
}

function updateSubjectDetailsCard() {
  const titleSpan = document.getElementById("subject-details-title");
  const placeholder = document.getElementById("subject-details-placeholder");
  const textarea = document.getElementById("subject-notes");
  const saveBtn = document.getElementById("subject-notes-save");
  if (!titleSpan || !placeholder || !textarea || !saveBtn) return;

  if (!currentSubject) {
    titleSpan.textContent =
      currentLang === "en" ? "Subject Notes" : "Nota Subjek";
    placeholder.textContent =
      currentLang === "en"
        ? "Select a subject from the list to start writing notes."
        : "Pilih subjek dari senarai untuk mula tulis nota.";
    textarea.classList.add("hidden");
    saveBtn.classList.add("hidden");
  } else {
    titleSpan.textContent = currentSubject;
    placeholder.textContent = "";
    textarea.classList.remove("hidden");
    saveBtn.classList.remove("hidden");

    // update teks button ikut bahasa
    const labelSpan = saveBtn.querySelector("span:last-child");
    if (labelSpan) {
      labelSpan.textContent =
        currentLang === "en" ? "Save Notes" : "Simpan Nota";
    }
  }
}

// ================== SUBJECT TASKS LOGIC ==================
function loadSubjectTasks() {
  const listEl = document.getElementById("subject-tasks-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  if (!currentSubject) return;

  const tasks = JSON.parse(
    localStorage.getItem(subjectTasksKey(currentSubject)) || "[]"
  );

  if (tasks.length === 0) {
    const li = document.createElement("li");
    li.textContent =
      currentLang === "en"
        ? "No tasks yet. Add one below."
        : "Belum ada tugasan. Tambah di bawah.";
    listEl.appendChild(li);
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");

    const main = document.createElement("div");
    main.className = "task-main";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!task.done;
    checkbox.addEventListener("change", () => toggleSubjectTask(task.id));

    const textSpan = document.createElement("span");
    textSpan.className = "text";
    textSpan.textContent = task.text;
    if (task.done) {
      textSpan.classList.add("done");
    }

    main.appendChild(checkbox);
    main.appendChild(textSpan);

    const delBtn = document.createElement("button");
    delBtn.className = "task-delete";
    delBtn.innerHTML = "✖";
    delBtn.addEventListener("click", () => deleteSubjectTask(task.id));

    li.appendChild(main);
    li.appendChild(delBtn);
    listEl.appendChild(li);
  });
}

function addSubjectTask() {
  if (!currentSubject) return;

  const input = document.getElementById("new-task-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const key = subjectTasksKey(currentSubject);
  const tasks = JSON.parse(localStorage.getItem(key) || "[]");

  const newTask = {
    id: Date.now(),
    text,
    done: false
  };

  tasks.push(newTask);
  localStorage.setItem(key, JSON.stringify(tasks));
  input.value = "";
  loadSubjectTasks();
}

function toggleSubjectTask(id) {
  if (!currentSubject) return;
  const key = subjectTasksKey(currentSubject);
  const tasks = JSON.parse(localStorage.getItem(key) || "[]");

  const updated = tasks.map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );

  localStorage.setItem(key, JSON.stringify(updated));
  loadSubjectTasks();
}

function deleteSubjectTask(id) {
  if (!currentSubject) return;
  const key = subjectTasksKey(currentSubject);
  const tasks = JSON.parse(localStorage.getItem(key) || "[]");
  const updated = tasks.filter((t) => t.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
  loadSubjectTasks();
}

function updateSubjectTasksCard() {
  const placeholder = document.getElementById("subject-tasks-placeholder");
  const area = document.getElementById("subject-tasks-area");
  const titleSpan = document.getElementById("subject-tasks-title");
  if (!placeholder || !area || !titleSpan) return;

  if (!currentSubject) {
    titleSpan.textContent =
      currentLang === "en"
        ? translations.en.subject_tasks_title
        : translations.ms.subject_tasks_title;

    placeholder.textContent =
      currentLang === "en"
        ? "Select a subject to add tasks."
        : "Pilih subjek untuk tambah tugasan.";
    area.classList.add("hidden");
  } else {
    titleSpan.textContent =
      currentSubject +
      (currentLang === "en" ? " – tasks" : " – tugasan");

    placeholder.textContent = "";
    area.classList.remove("hidden");
    loadSubjectTasks();
  }

  // update placeholder input ikut bahasa
  const input = document.getElementById("new-task-input");
  if (input) {
    input.placeholder =
      currentLang === "en"
        ? "Add new task..."
        : "Tambah tugasan baru...";
  }

  const btnLabel = document.querySelector(
    "#subject-tasks-area button.secondary span:last-child"
  );
  if (btnLabel) {
    btnLabel.textContent =
      currentLang === "en"
        ? translations.en.add_task_btn
        : translations.ms.add_task_btn;
  }
}
