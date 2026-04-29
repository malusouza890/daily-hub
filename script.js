// ===== ESTADO =====
let state = {
    tasks: { pessoal: [], trabalho: [], faculdade: [] },
    currentTab: 'pessoal',
    city: 'São Paulo',
    event: null,
    focus: '',
    theme: 'light'
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initTheme();
    updateGreeting();
    updateDate();
    loadQuote();
    loadWeather();
    loadMusic();
    loadFood();
    loadMovie();
    renderTasks();
    renderCountdown();
    setupEventListeners();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }
});

// ===== TEMA =====
function initTheme() {
    const savedTheme = localStorage.getItem('dailyhub-theme') || 'light';
    state.theme = savedTheme;
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    state.theme = theme;
    localStorage.setItem('dailyhub-theme', theme);
}

function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

// ===== SAUDAÇÃO =====
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting;
    if (hour >= 5 && hour < 12) greeting = 'Bom dia, Malu';
    else if (hour >= 12 && hour < 18) greeting = 'Boa tarde, Malu';
    else greeting = 'Boa noite, Malu';
    document.getElementById('greeting').textContent = greeting;
}

function updateDate() {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const now = new Date();
    document.getElementById('date-display').textContent = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`;
}

// ===== FRASE =====
function loadQuote() {
    const day = new Date().getDate();
    const quote = quotes[day % quotes.length];
    document.getElementById('quote-text').textContent = quote.text;
    const authorEl = document.getElementById('quote-author');
    if (quote.author) {
        authorEl.textContent = `— ${quote.author}`;
        authorEl.style.display = '';
    } else {
        authorEl.textContent = '';
        authorEl.style.display = 'none';
    }
}

// ===== CLIMA + LOOK DO DIA =====
async function loadWeather() {
    try {
        const coords = await getCoordinates(state.city);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();
        
        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        const weather = getWeatherInfo(code);
        
        document.getElementById('weather-temp').textContent = `${temp}°`;
        document.getElementById('weather-city').textContent = state.city;
        document.getElementById('weather-desc').textContent = weather.desc;
        document.getElementById('weather-emoji').textContent = weather.emoji;
        document.getElementById('weather-tip').textContent = getLookRecommendation(temp, code);
    } catch (error) {
        document.getElementById('weather-temp').textContent = '--°';
        document.getElementById('weather-city').textContent = 'Erro ao carregar';
    }
}

async function getCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
        return { lat: data.results[0].latitude, lon: data.results[0].longitude };
    }
    return { lat: -23.5505, lon: -46.6333 };
}

function getWeatherInfo(code) {
    if (code === 0) return { emoji: '☀️', desc: 'Céu limpo' };
    if (code <= 3) return { emoji: '⛅', desc: 'Parcialmente nublado' };
    if (code <= 48) return { emoji: '🌫️', desc: 'Neblina' };
    if (code <= 67) return { emoji: '🌧️', desc: 'Chuva' };
    if (code <= 77) return { emoji: '❄️', desc: 'Neve' };
    if (code <= 82) return { emoji: '🌦️', desc: 'Pancadas de chuva' };
    return { emoji: '⛈️', desc: 'Tempestade' };
}

// 👗 Recomenda LOOK baseado no clima!
function getLookRecommendation(temp, code) {
    let category;
    
    if (code >= 51 && code <= 82) {
        category = 'chuva';
    } else if (temp >= 28) {
        category = 'muitoQuente';
    } else if (temp >= 23) {
        category = 'quente';
    } else if (temp >= 18) {
        category = 'agradavel';
    } else if (temp >= 12) {
        category = 'frio';
    } else {
        category = 'muitoFrio';
    }
    
    const looks = lookRecommendations[category];
    const day = new Date().getDate();
    return `👗 ${looks[day % looks.length]}`;
}

// ===== MÚSICA =====
function loadMusic() {
    const day = new Date().getDate();
    const music = musics[day % musics.length];
    showMusic(music);
}

function showMusic(music) {
    document.getElementById('music-title').textContent = music.title;
    document.getElementById('music-artist').textContent = music.artist;
    const genreEl = document.getElementById('music-genre');
    if (genreEl) genreEl.textContent = music.genre;
}

function changeMusic() {
    const random = musics[Math.floor(Math.random() * musics.length)];
    showMusic(random);
}

// ===== COMIDA =====
function loadFood() {
    const day = new Date().getDate();
    const food = foods[day % foods.length];
    showFood(food);
}

function showFood(food) {
    document.getElementById('food-name').textContent = food.name;
    document.getElementById('food-desc').textContent = food.description;
}

function changeFood() {
    const random = foods[Math.floor(Math.random() * foods.length)];
    showFood(random);
}

// ===== FILMES com STREAMING =====
function loadMovie() {
    const day = new Date().getDate();
    showMovie(movies[day % movies.length]);
}

function showMovie(movie) {
    document.getElementById('movie-title').textContent = movie.title;
    document.getElementById('movie-info').textContent = `${movie.type} • ${movie.year}`;
    const genreEl = document.getElementById('movie-genre');
    if (genreEl) genreEl.textContent = `📺 ${movie.streaming} • ${movie.genre}`;
}

function surpriseMovie() {
    showMovie(movies[Math.floor(Math.random() * movies.length)]);
}

// ===== TAREFAS =====
function renderTasks() {
    const list = document.getElementById('task-list');
    const tasks = state.tasks[state.currentTab] || [];
    list.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-index="${index}">
                ${task.completed ? '✓' : ''}
            </div>
            <span class="task-text">${task.text}</span>
            <button class="task-delete" data-index="${index}">✕</button>
        `;
        list.appendChild(li);
    });
    updateTasksCount();
    list.querySelectorAll('.task-checkbox').forEach(cb => {
        cb.addEventListener('click', (e) => toggleTask(parseInt(e.currentTarget.dataset.index)));
    });
    list.querySelectorAll('.task-delete').forEach(btn => {
        btn.addEventListener('click', (e) => deleteTask(parseInt(e.currentTarget.dataset.index)));
    });
}

function updateTasksCount() {
    const tasks = state.tasks[state.currentTab] || [];
    const pending = tasks.filter(t => !t.completed).length;
    document.getElementById('tasks-count').textContent = pending;
}

function addTask() {
    const input = document.getElementById('task-input');
    const text = input.value.trim();
    if (!text) return;
    state.tasks[state.currentTab].push({ text, completed: false });
    input.value = '';
    saveState();
    renderTasks();
}

function toggleTask(index) {
    state.tasks[state.currentTab][index].completed = !state.tasks[state.currentTab][index].completed;
    saveState();
    renderTasks();
}

function deleteTask(index) {
    state.tasks[state.currentTab].splice(index, 1);
    saveState();
    renderTasks();
}

function switchTab(tab) {
    state.currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    renderTasks();
}

// ===== CONTAGEM REGRESSIVA =====
function renderCountdown() {
    const display = document.getElementById('countdown-display');
    if (!state.event) {
        display.innerHTML = '<p class="countdown-empty">Nenhum evento ainda</p>';
        return;
    }
    const now = new Date();
    const eventDate = new Date(state.event.date);
    const diff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    let label = 'dias restantes';
    let value = diff;
    if (diff < 0) { label = 'dias atrás'; value = Math.abs(diff); }
    else if (diff === 0) { label = 'é hoje! ✨'; value = '🎉'; }
    else if (diff === 1) { label = 'dia restante'; }
    display.innerHTML = `
        <div class="countdown-event">
            <div class="countdown-days">${value}</div>
            <div class="countdown-label">${label}</div>
            <div class="countdown-name">${state.event.name}</div>
        </div>
    `;
}

// ===== MODAIS =====
function openCityModal() {
    document.getElementById('city-input').value = state.city;
    document.getElementById('city-modal').classList.add('active');
}

function closeCityModal() {
    document.getElementById('city-modal').classList.remove('active');
}

function saveCity() {
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        state.city = city;
        saveState();
        loadWeather();
    }
    closeCityModal();
}

function openEventModal() {
    document.getElementById('event-modal').classList.add('active');
}

function closeEventModal() {
    document.getElementById('event-modal').classList.remove('active');
}

function saveEvent() {
    const name = document.getElementById('event-name-input').value.trim();
    const date = document.getElementById('event-date-input').value;
    if (name && date) {
        state.event = { name, date };
        saveState();
        renderCountdown();
        document.getElementById('event-name-input').value = '';
        document.getElementById('event-date-input').value = '';
    }
    closeEventModal();
}

// ===== PERSISTÊNCIA =====
function saveState() {
    localStorage.setItem('dailyhub-data', JSON.stringify({
        tasks: state.tasks,
        city: state.city,
        event: state.event,
        focus: state.focus
    }));
}

function loadState() {
    const saved = localStorage.getItem('dailyhub-data');
    if (saved) {
        const data = JSON.parse(saved);
        state.tasks = data.tasks || state.tasks;
        state.city = data.city || state.city;
        state.event = data.event || null;
        state.focus = data.focus || '';
        const focusInput = document.getElementById('focus-input');
        if (focusInput) focusInput.value = state.focus;
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    document.getElementById('add-task-btn').addEventListener('click', addTask);
    document.getElementById('task-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    const focusInput = document.getElementById('focus-input');
    if (focusInput) {
        focusInput.addEventListener('input', (e) => {
            state.focus = e.target.value;
            saveState();
        });
    }
    
    const musicBtn = document.getElementById('change-music-btn');
    if (musicBtn) musicBtn.addEventListener('click', changeMusic);
    
    const foodBtn = document.getElementById('change-food-btn');
    if (foodBtn) foodBtn.addEventListener('click', changeFood);
    
    const movieBtn = document.getElementById('surprise-movie-btn');
    if (movieBtn) movieBtn.addEventListener('click', surpriseMovie);
    
    document.getElementById('change-city-btn').addEventListener('click', openCityModal);
    document.getElementById('save-city-btn').addEventListener('click', saveCity);
    document.getElementById('cancel-city-btn').addEventListener('click', closeCityModal);
    
    document.getElementById('add-event-btn').addEventListener('click', openEventModal);
    document.getElementById('save-event-btn').addEventListener('click', saveEvent);
    document.getElementById('cancel-event-btn').addEventListener('click', closeEventModal);
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });
}
