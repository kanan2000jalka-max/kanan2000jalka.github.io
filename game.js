// ========================
// 1. ИНИЦИАЛИЗАЦИЯ ИГРЫ
// ========================

// В начале game.js добавьте:
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo);
    return false;
};

// Инициализируем Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Разворачиваем на весь экран
tg.enableClosingConfirmation(); // Подтверждение выхода

// Состояние игры
const gameState = {
    currentScene: "start",
    health: 100,
    inventory: [],
    visitedScenes: new Set()
};

// ========================
// 2. БАЗА ДАННЫХ СЦЕН
// ========================

// Все сцены игры хранятся в объекте
const scenes = {
    // Начальная сцена
    "start": {
        //background: "images/111.png",
        text: "Вы просыпаетесь в древнем лесу. Вокруг густой туман. Перед вами две тропинки.",
        choices: [
            { text: "Пойти налево, к свету", nextScene: "light_path", effect: () => console.log("Выбрал левый путь") },
            { text: "Пойти направо, в глубину леса", nextScene: "dark_forest", effect: () => gameState.health -= 10 }
        ]
    },
    
    // Сцена: Путь к свету
    "light_path": {
        //background: "images/222.png",
        text: "Вы идете к свету. Вдали виден старый храм. У входа сидит мудрый старец.",
        choices: [
            { text: "Поговорить со старцем", nextScene: "elder_talk", effect: () => gameState.inventory.push("Совет старца") },
            { text: "Пройти мимо в храм", nextScene: "temple_inside" },
            { text: "Вернуться назад", nextScene: "start" }
        ]
    },
    
    // Сцена: Разговор со старцем
    "elder_talk": {
        background: "images/333.png",
        text: "Старец даёт вам волшебный амулет и говорит: 'Это поможет в тёмных местах'.",
        choices: [
            { text: "Принять амулет и идти дальше", nextScene: "temple_inside", effect: () => {
                gameState.inventory.push("Волшебный амулет");
                gameState.health += 20;
            }},
            { text: "Отказаться и искать другой путь", nextScene: "forest_crossroads" }
        ]
    },
    
    // Сцена: Тёмный лес
    "dark_forest": {
        background: "images/drk.forest.jpg",
        text: "В лесу становится темнее. Вы слышите странные звуки. Потеряли 10 здоровья.",
        choices: [
            { text: "Идти дальше", nextScene: "forest_crossroads", effect: () => gameState.health -= 15 },
            { text: "Вернуться", nextScene: "start" },
            { text: "Попытаться разжечь огонь", nextScene: "campfire", effect: () => gameState.inventory.push("Факел") }
        ]
    },
    
    // Сцена: Костер
    "campfire": {
        background: "images/fire.jpg",
        text: "Вы разожгли костер. Стало светлее и теплее. +15 к здоровью.",
        choices: [
            { text: "Отдохнуть у костра", nextScene: "rest", effect: () => gameState.health += 30 },
            { text: "Продолжить путь", nextScene: "forest_crossroads" }
        ]
    },
    
    // Сцена: Перекресток
    "forest_crossroads": {
        background: "images/forest.2.jpg",
        text: "Вы на перекрестке. Куда пойдёте?",
        choices: [
            { text: "К реке", nextScene: "river", effect: () => gameState.inventory.push("Чистая вода") },
            { text: "В пещеру", nextScene: "cave_entrance" },
            { text: "На холм", nextScene: "hill_top" }
        ]
    },
    
    // Финал 1: Храм
    "temple_inside": {
        background: "images/fresc.jpg",
        text: "Вы в храме. Древние фрески рассказывают историю этого места. Конец пути.",
        choices: [
            { text: "Начать заново", nextScene: "start", effect: () => resetGame() }
        ]
    },
    
    // Финал 2: Река
    "river": {
        background: "images/river.jpg",
        text: "Вы нашли чистую реку. Утолили жажду и набрали воды. Хороший конец!",
        choices: [
            { text: "Играть снова", nextScene: "start", effect: () => resetGame() }
        ]
    }
};

// ========================
// 3. ФУНКЦИИ ИГРЫ
// ========================

// Функция загрузки сцены
function loadScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) {
        console.error("Сцена не найдена:", sceneId);
        return;
    }
    
    // Обновляем состояние
    gameState.currentScene = sceneId;
    gameState.visitedScenes.add(sceneId);
    
    // Обновляем фон
    document.getElementById("background").style.backgroundImage = 
        `url("${scene.background}?auto=compress&cs=tinysrgb&w=800")`;
    
    // Обновляем текст
    document.getElementById("scene-text").textContent = scene.text;
    
    // Очищаем предыдущие варианты
    const choicesContainer = document.getElementById("choices");
    choicesContainer.innerHTML = "";
    
    // Создаем новые кнопки выбора
    scene.choices.forEach((choice, index) => {
        const button = document.createElement("button");
        button.className = "choice-btn";
        button.textContent = `${index + 1}. ${choice.text}`;
        
        // Добавляем обработчик клика
        button.onclick = () => {
            // Применяем эффект выбора, если он есть
            if (choice.effect) {
                choice.effect();
            }
            
            // Загружаем следующую сцену
            loadScene(choice.nextScene);
            
            // Обновляем статистику
            updateStats();
            
            // Отправляем данные в Telegram (опционально)
            if (tg && tg.sendData) {
                tg.sendData(JSON.stringify({
                    action: "choice_made",
                    scene: sceneId,
                    choice: choice.text
                }));
            }
        };
        
        // Добавляем кнопку с задержкой для анимации
        setTimeout(() => {
            choicesContainer.appendChild(button);
        }, index * 100);
    });
    
    // Обновляем статистику
    updateStats();
}

// Функция обновления статистики
function updateStats() {
    document.getElementById("health").textContent = 
        `❤️ Здоровье: ${Math.max(0, gameState.health)}`;
    
    document.getElementById("inventory").textContent = 
        `🎒 Инвентарь: ${gameState.inventory.join(", ") || "пусто"}`;
    
    // Проверка на смерть
    if (gameState.health <= 0) {
        loadScene("game_over");
    }
}

// Функция сброса игры
function resetGame() {
    gameState.health = 100;
    gameState.inventory = [];
    gameState.visitedScenes.clear();
    updateStats();
}

// ========================
// 4. СПЕЦИАЛЬНЫЕ СЦЕНЫ
// ========================

// Сцена Game Over (добавляем динамически)
scenes["game_over"] = {
    background: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800",
    text: "Вы погибли. Но каждая смерть - это новый урок.",
    choices: [
        { 
            text: "Возродиться и начать заново", 
            nextScene: "start", 
            effect: () => resetGame() 
        }
    ]
};

// ========================
// 5. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ========================

// Когда страница загружена
document.addEventListener("DOMContentLoaded", () => {
    // Начинаем игру с начальной сцены
    loadScene("start");
    
    // Настройка Telegram Web App
    if (tg) {
        // Меняем цвет фона Telegram под нашу игру
        tg.setBackgroundColor("#1a1a1a");
        tg.setHeaderColor("#6a11cb");
        
        // Кнопка назад в Telegram
        tg.BackButton.onClick(() => {
            // Можно добавить логику возврата
            tg.showConfirm("Выйти из игры?", () => {
                tg.close();
            });
        });
        
        // Показываем кнопку назад
        tg.BackButton.show();
    }
});

// ========================
// 6. ФУНКЦИЯ СОХРАНЕНИЯ (опционально)
// ========================

function saveGame() {
    // Сохраняем в localStorage браузера
    localStorage.setItem("text_game_save", JSON.stringify(gameState));
    
    // Или отправляем в Telegram Cloud Storage
    if (tg && tg.CloudStorage) {
        tg.CloudStorage.setItem("save", JSON.stringify(gameState));
    }
}

function loadGame() {
    // Загружаем из localStorage
    const save = localStorage.getItem("text_game_save");
    if (save) {
        Object.assign(gameState, JSON.parse(save));
        loadScene(gameState.currentScene);
    }
}
