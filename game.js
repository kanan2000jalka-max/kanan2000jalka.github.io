/// ========================
// game.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ========================

// Telegram Web App может быть не доступен
let tg = null;
try {
    tg = window.Telegram?.WebApp;
    if (tg) {
        tg.expand();
        tg.enableClosingConfirmation();
    }
} catch (e) {
    console.log("Telegram Web App не доступен, работает в браузере");
}

// Состояние игры - УПРОЩЕННОЕ для мобильных
const gameState = {
    currentScene: "start",
    health: 100,
    inventory: []
};

// УПРОЩЕННЫЕ сцены БЕЗ изображений
const scenes = {
    "start": {
        text: "🏞️ Вы просыпаетесь в древнем лесу. Вокруг густой туман. Перед вами две тропинки.",
        choices: [
            { 
                text: "⬅️ Пойти налево, к свету", 
                nextScene: "light_path"
            },
            { 
                text: "➡️ Пойти направо, в лес", 
                nextScene: "dark_forest"
            }
        ]
    },
    
    "light_path": {
        text: "✨ Вы идете к свету. Вдали виден старый храм. У входа сидит мудрый старец.",
        choices: [
            { 
                text: "💬 Поговорить со старцем", 
                nextScene: "elder_talk"
            },
            { 
                text: "🚶 Пройти мимо", 
                nextScene: "temple_inside"
            }
        ]
    },
    
    "elder_talk": {
        text: "🧙 Старец даёт вам волшебный амулет: 'Это поможет в тёмных местах'.",
        choices: [
            { 
                text: "✅ Принять амулет", 
                nextScene: "temple_inside",
                effect: () => {
                    try {
                        gameState.inventory.push("Амулет");
                        gameState.health += 20;
                    } catch (e) {
                        console.log("Ошибка в эффекте:", e);
                    }
                }
            }
        ]
    },
    
    "dark_forest": {
        text: "🌲 В лесу темно. Вы слышите странные звуки...",
        choices: [
            { 
                text: "👣 Идти дальше", 
                nextScene: "forest_depth"
            }
        ]
    },
    
    "temple_inside": {
        text: "🏛️ Вы в храме. Древние фрески рассказывают историю. Конец пути!",
        choices: [
            { 
                text: "🔄 Начать заново", 
                nextScene: "start",
                effect: () => {
                    try {
                        gameState.health = 100;
                        gameState.inventory = [];
                    } catch (e) {
                        console.log("Ошибка сброса:", e);
                    }
                }
            }
        ]
    },
    
    "forest_depth": {
        text: "🌳 Вы в глубине леса. Здесь очень тихо...",
        choices: [
            { 
                text: "🔙 Вернуться", 
                nextScene: "start"
            }
        ]
    }
};

// ГЛАВНАЯ ФУНКЦИЯ - полностью переписана с защитой
function loadScene(sceneId) {
    try {
        // 1. Проверяем существование сцены
        const scene = scenes[sceneId];
        if (!scene) {
            console.error("Сцена не найдена, возвращаем в start");
            sceneId = "start";
        }
        
        // 2. Обновляем состояние
        gameState.currentScene = sceneId;
        
        // 3. Обновляем текст - БЕЗОПАСНО
        const textElement = document.getElementById("scene-text");
        if (textElement && scene) {
            textElement.textContent = scene.text || "Текст сцены";
        }
        
        // 4. Очищаем кнопки ПРАВИЛЬНО
        const choicesContainer = document.getElementById("choices");
        if (choicesContainer) {
            // Полностью очищаем
            while (choicesContainer.firstChild) {
                choicesContainer.removeChild(choicesContainer.firstChild);
            }
            
            // Создаем новые кнопки с задержкой
            if (scene && scene.choices) {
                scene.choices.forEach((choice, index) => {
                    setTimeout(() => {
                        try {
                            const button = document.createElement("button");
                            button.className = "choice-btn";
                            button.textContent = choice.text;
                            
                            // УПРОЩЕННЫЙ обработчик
                            button.onclick = () => {
                                try {
                                    // Применяем эффект если есть
                                    if (choice.effect && typeof choice.effect === 'function') {
                                        choice.effect();
                                    }
                                    
                                    // Загружаем следующую сцену
                                    if (choice.nextScene) {
                                        loadScene(choice.nextScene);
                                    }
                                    
                                    // Обновляем статистику
                                    updateStats();
                                } catch (error) {
                                    console.error("Ошибка в обработчике:", error);
                                    loadScene("start"); // Возврат к началу при ошибке
                                }
                            };
                            
                            choicesContainer.appendChild(button);
                        } catch (e) {
                            console.error("Ошибка создания кнопки:", e);
                        }
                    }, index * 50); // Маленькая задержка
                });
            }
        }
        
        // 5. Обновляем статистику
        updateStats();
        
        // 6. Сохраняем состояние (опционально)
        try {
            localStorage.setItem('gameState', JSON.stringify(gameState));
        } catch (e) {
            console.log("Не удалось сохранить в localStorage");
        }
        
    } catch (error) {
        console.error("КРИТИЧЕСКАЯ ОШИБКА в loadScene:", error);
        // Аварийный вывод на экран
        const textElement = document.getElementById("scene-text");
        if (textElement) {
            textElement.textContent = "Произошла ошибка. Игра перезапускается...";
        }
        
        // Сброс и возврат к началу
        setTimeout(() => {
            gameState.currentScene = "start";
            gameState.health = 100;
            gameState.inventory = [];
            loadScene("start");
        }, 1000);
    }
}

// Упрощенная функция обновления статистики
function updateStats() {
    try {
        const healthElement = document.getElementById("health");
        const inventoryElement = document.getElementById("inventory");
        
        if (healthElement) {
            healthElement.textContent = `❤️ ${Math.max(0, gameState.health)} HP`;
        }
        
        if (inventoryElement) {
            inventoryElement.textContent = `🎒 ${gameState.inventory.length > 0 ? gameState.inventory.join(", ") : "пусто"}`;
        }
        
        // Проверка здоровья
        if (gameState.health <= 0) {
            setTimeout(() => loadScene("game_over"), 500);
        }
    } catch (e) {
        console.log("Ошибка обновления статистики:", e);
    }
}

// Добавляем сцену Game Over
scenes["game_over"] = {
    text: "💀 Вы погибли...",
    choices: [
        {
            text: "🔄 Попробовать снова",
            nextScene: "start",
            effect: () => {
                gameState.health = 100;
                gameState.inventory = [];
            }
        }
    ]
};

// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ - УПРОЩЕННАЯ
document.addEventListener("DOMContentLoaded", function() {
    console.log("Документ загружен");
    
    // Даем время на полную загрузку
    setTimeout(() => {
        try {
            // Пробуем загрузить сохранение
            const saved = localStorage.getItem('gameState');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    gameState.currentScene = parsed.currentScene || "start";
                    gameState.health = parsed.health || 100;
                    gameState.inventory = parsed.inventory || [];
                } catch (e) {
                    console.log("Ошибка загрузки сохранения");
                }
            }
            
            // Загружаем сцену
            loadScene(gameState.currentScene);
            
        } catch (error) {
            console.error("Ошибка инициализации:", error);
            // Аварийный запуск
            const textElement = document.getElementById("scene-text");
            if (textElement) {
                textElement.textContent = "Загрузка игры...";
            }
            setTimeout(() => loadScene("start"), 500);
        }
    }, 100);
});

// Отключаем все сложные Telegram функции
if (tg) {
    try {
        // Отключаем кнопку назад если она вызывает проблемы
        if (tg.BackButton) {
            tg.BackButton.hide();
        }
        
        // Отключаем отправку данных если крашит
        // tg.sendData = null;
    } catch (e) {
        console.log("Ошибка инициализации Telegram:", e);
    }
}
