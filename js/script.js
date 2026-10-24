/* 
  Aura Hub - JavaScript
  Fully implemented MVP features + all 5 challenges with LocalStorage persistence.
*/

document.addEventListener('DOMContentLoaded', () => {
    const KEYS = {
        NAME: 'aura_user_name',
        THEME: 'aura_theme',
        TASKS: 'aura_tasks',
        LINKS: 'aura_links',
        TIMER: 'aura_timer'
    };

    let userName = localStorage.getItem(KEYS.NAME) || 'Sobat Aura';
    let currentTheme = localStorage.getItem(KEYS.THEME) || 'warm';
    let tasks = JSON.parse(localStorage.getItem(KEYS.TASKS)) || [
        { id: 1, text: 'Pelajari Software Engineering', completed: true },
        { id: 2, text: 'Selesaikan proyek Life Dashboard', completed: false }
    ];
    let links = JSON.parse(localStorage.getItem(KEYS.LINKS)) || [
        { name: 'GitHub', url: 'https://github.com' },
        { name: 'Google', url: 'https://google.com' }
    ];
    let timerConfig = JSON.parse(localStorage.getItem(KEYS.TIMER)) || { focus: 25, break: 5 };

    let timerSeconds = timerConfig.focus * 60;
    let timerInterval = null;
    let isRunning = false;
    let isFocusMode = true;

    let filterMode = 'all';
    let sortMode = 'default';

    // DOM Elements
    const liveClock = document.getElementById('liveClock');
    const liveDate = document.getElementById('liveDate');
    const greetingText = document.getElementById('greetingText');
    const displayName = document.getElementById('displayName');
    const editNameBtn = document.getElementById('editNameBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');

    const timerDigits = document.getElementById('timerDigits');
    const timerModeLabel = document.getElementById('timerModeLabel');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const stopTimerBtn = document.getElementById('stopTimerBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    const settingsTimerBtn = document.getElementById('settingsTimerBtn');
    const timerSettingsPanel = document.getElementById('timerSettingsPanel');
    const focusTimeInput = document.getElementById('focusTimeInput');
    const breakTimeInput = document.getElementById('breakTimeInput');
    const saveTimerSettings = document.getElementById('saveTimerSettings');

    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const tasksContainer = document.getElementById('tasksContainer');
    const taskStats = document.getElementById('taskStats');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortTasksSelect = document.getElementById('sortTasksSelect');

    const linkForm = document.getElementById('linkForm');
    const linkNameInput = document.getElementById('linkNameInput');
    const linkUrlInput = document.getElementById('linkUrlInput');
    const linksContainer = document.getElementById('linksContainer');

    const nameModal = document.getElementById('nameModal');
    const modalNameInput = document.getElementById('modalNameInput');
    const saveNameBtn = document.getElementById('saveNameBtn');
    const cancelNameBtn = document.getElementById('cancelNameBtn');

    function init() {
        setTheme(currentTheme);
        updateName();
        startClock();
        renderTimer();
        renderTasks();
        renderLinks();
        focusTimeInput.value = timerConfig.focus;
        breakTimeInput.value = timerConfig.break;
    }

    // Theme (Challenge 1)
    function setTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(KEYS.THEME, theme);
        themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    themeToggleBtn.addEventListener('click', () => {
        setTheme(currentTheme === 'warm' ? 'dark' : 'warm');
    });

    // Clock & Greeting
    function startClock() {
        tick();
        setInterval(tick, 1000);
    }

    function tick() {
        const now = new Date();
        liveClock.textContent = now.toTimeString().split(' ')[0];
        liveDate.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        const h = now.getHours();
        let greet = 'Selamat Datang';
        if (h >= 3 && h < 11) greet = 'Selamat Pagi';
        else if (h >= 11 && h < 15) greet = 'Selamat Siang';
        else if (h >= 15 && h < 18) greet = 'Selamat Sore';
        else greet = 'Selamat Malam';
        greetingText.textContent = greet;
    }

    // Custom Name (Challenge 2)
    function updateName() {
        displayName.textContent = userName;
    }

    editNameBtn.addEventListener('click', () => {
        modalNameInput.value = userName;
        nameModal.classList.remove('hidden');
        modalNameInput.focus();
    });

    displayName.addEventListener('click', () => editNameBtn.click());

    saveNameBtn.addEventListener('click', () => {
        const val = modalNameInput.value.trim();
        if (val) {
            userName = val;
            localStorage.setItem(KEYS.NAME, userName);
            updateName();
        }
        nameModal.classList.add('hidden');
    });

    cancelNameBtn.addEventListener('click', () => nameModal.classList.add('hidden'));

    // Timer & Settings (Challenge 3)
    settingsTimerBtn.addEventListener('click', () => {
        timerSettingsPanel.classList.toggle('hidden');
    });

    saveTimerSettings.addEventListener('click', () => {
        const f = parseInt(focusTimeInput.value);
        const b = parseInt(breakTimeInput.value);
        if (f > 0 && b > 0) {
            timerConfig = { focus: f, break: b };
            localStorage.setItem(KEYS.TIMER, JSON.stringify(timerConfig));
            resetTimer();
            timerSettingsPanel.classList.add('hidden');
        }
    });

    function renderTimer() {
        const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
        const s = String(timerSeconds % 60).padStart(2, '0');
        timerDigits.textContent = `${m}:${s}`;
        timerModeLabel.textContent = isFocusMode ? 'Sesi Fokus' : 'Sesi Istirahat';
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startTimerBtn.textContent = 'Berjalan...';
        startTimerBtn.disabled = true;

        timerInterval = setInterval(() => {
            if (timerSeconds > 0) {
                timerSeconds--;
                renderTimer();
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                startTimerBtn.textContent = 'Mulai';
                startTimerBtn.disabled = false;
                isFocusMode = !isFocusMode;
                timerSeconds = (isFocusMode ? timerConfig.focus : timerConfig.break) * 60;
                renderTimer();
                alert(isFocusMode ? 'Waktu istirahat selesai! Kembali fokus.' : 'Sesi fokus selesai! Waktunya istirahat.');
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        startTimerBtn.textContent = 'Mulai';
        startTimerBtn.disabled = false;
    }

    function resetTimer() {
        stopTimer();
        timerSeconds = (isFocusMode ? timerConfig.focus : timerConfig.break) * 60;
        renderTimer();
    }

    startTimerBtn.addEventListener('click', startTimer);
    stopTimerBtn.addEventListener('click', stopTimer);
    resetTimerBtn.addEventListener('click', resetTimer);

    // Tasks (Duplicates: Challenge 4, Sorting: Challenge 5)
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (!text) return;

        // Prevent Duplicate Tasks (Challenge 4)
        const isDuplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
        if (isDuplicate) {
            alert('Tugas tersebut sudah ada di dalam daftar!');
            return;
        }

        tasks.push({ id: Date.now(), text, completed: false });
        saveAndRenderTasks();
        taskInput.value = '';
    });

    function saveAndRenderTasks() {
        localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        let list = tasks.filter(t => {
            if (filterMode === 'active') return !t.completed;
            if (filterMode === 'completed') return t.completed;
            return true;
        });

        // Sorting (Challenge 5)
        if (sortMode === 'az') list.sort((a, b) => a.text.localeCompare(b.text));
        else if (sortMode === 'za') list.sort((a, b) => b.text.localeCompare(a.text));
        else if (sortMode === 'status') list.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);

        tasksContainer.innerHTML = '';
        if (list.length === 0) {
            tasksContainer.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:20px; font-size:0.85rem;">Tidak ada tugas.</div>';
        } else {
            list.forEach(t => {
                const row = document.createElement('div');
                row.className = `task-row ${t.completed ? 'completed' : ''}`;
                row.innerHTML = `
                    <div class="task-left-part">
                        <input type="checkbox" class="task-checkbox" ${t.completed ? 'checked' : ''} data-id="${t.id}">
                        <span class="task-desc">${escapeHtml(t.text)}</span>
                    </div>
                    <div class="task-action-btns">
                        <button class="t-btn edit" data-id="${t.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="t-btn del" data-id="${t.id}" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                tasksContainer.appendChild(row);
            });
        }

        const compCount = tasks.filter(t => t.completed).length;
        taskStats.textContent = `${compCount}/${tasks.length} selesai`;
    }

    tasksContainer.addEventListener('click', (e) => {
        const chk = e.target.closest('.task-checkbox');
        const btn = e.target.closest('button');

        if (chk) {
            const id = Number(chk.dataset.id);
            const t = tasks.find(x => x.id === id);
            if (t) {
                t.completed = chk.checked;
                saveAndRenderTasks();
            }
        }

        if (btn) {
            const id = Number(btn.dataset.id);
            if (btn.classList.contains('del')) {
                tasks = tasks.filter(x => x.id !== id);
                saveAndRenderTasks();
            } else if (btn.classList.contains('edit')) {
                const t = tasks.find(x => x.id === id);
                if (t) {
                    const newT = prompt('Edit tugas:', t.text);
                    if (newT !== null && newT.trim() !== '') {
                        const trimmed = newT.trim();
                        const isDup = tasks.some(x => x.id !== id && x.text.toLowerCase() === trimmed.toLowerCase());
                        if (isDup) {
                            alert('Tugas serupa sudah ada!');
                            return;
                        }
                        t.text = trimmed;
                        saveAndRenderTasks();
                    }
                }
            }
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterMode = btn.dataset.filter;
            renderTasks();
        });
    });

    sortTasksSelect.addEventListener('change', (e) => {
        sortMode = e.target.value;
        renderTasks();
    });

    // Quick Links
    linkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = linkNameInput.value.trim();
        let url = linkUrlInput.value.trim();
        if (!name || !url) return;
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;

        links.push({ name, url });
        localStorage.setItem(KEYS.LINKS, JSON.stringify(links));
        renderLinks();
        linkNameInput.value = '';
        linkUrlInput.value = '';
    });

    function renderLinks() {
        linksContainer.innerHTML = '';
        links.forEach((l, idx) => {
            const item = document.createElement('a');
            item.className = 'link-chip-item';
            item.href = l.url;
            item.target = '_blank';
            item.rel = 'noopener noreferrer';
            item.innerHTML = `
                <i class="fa-solid fa-globe"></i>
                <span>${escapeHtml(l.name)}</span>
                <button class="del-link-x" data-index="${idx}" title="Hapus"><i class="fa-solid fa-xmark"></i></button>
            `;
            linksContainer.appendChild(item);
        });
    }

    linksContainer.addEventListener('click', (e) => {
        const delX = e.target.closest('.del-link-x');
        if (delX) {
            e.preventDefault();
            const idx = Number(delX.dataset.index);
            links.splice(idx, 1);
            localStorage.setItem(KEYS.LINKS, JSON.stringify(links));
            renderLinks();
        }
    });

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    init();
});
