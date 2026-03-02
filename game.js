// ========================
// game.js - КАРКАС ДЛЯ ВАШЕЙ ИСТОРИИ
// ========================

// Telegram (опционально)
try {
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
    }
} catch (e) {}

// ========================
// 1. СОСТОЯНИЕ ИГРЫ (сохраняется автоматически)
// ========================
let gameState = {
    currentScene: "start",  // ID текущей сцены
    gameStarted: false
    // Добавляйте сюда свои переменные:
    // hasKey: false,
    // listenedToElder: false,
    // timeOfDay: "day"
};

// ========================
// 2. ЗАГРУЗКА СОХРАНЕНИЯ
// ========================
function loadGame() {
    try {
        const saved = localStorage.getItem('storySave');
        if (saved) {
            const parsed = JSON.parse(saved);
            gameState = { ...gameState, ...parsed };
            console.log('Сохранение загружено');
        }
    } catch (e) {
        console.log('Не удалось загрузить сохранение');
    }
}

// ========================
// 3. СОХРАНЕНИЕ ПРОГРЕССА
// ========================
function saveGame() {
    try {
        localStorage.setItem('storySave', JSON.stringify(gameState));
        console.log('Игра сохранена');
    } catch (e) {
        console.log('Не удалось сохранить игру');
    }
}

// ========================
// 4. БАЗА ДАННЫХ ВАШЕЙ ИСТОРИИ
// ========================
// ========================
// 4. ПЕРВАЯ СЦЕНА (ОБНОВЛЕННАЯ)
// ========================
function showFirstScene() {
    const gameContainer = document.querySelector('.game-container');
    const bgElement = document.getElementById('background');
    const textContainer = document.querySelector('.text-container');
    const wrapper = document.querySelector('.scrolling-text-wrapper');
    const choicesContainer = document.getElementById('choices');
    
    // Устанавливаем фон
    if (bgElement) {
        bgElement.style.backgroundImage = "url('images/111.png')";
    }
    
    // Скрываем текстовые элементы (они не нужны на первой сцене)
    if (textContainer) textContainer.style.display = 'none';
    if (choicesContainer) choicesContainer.style.display = 'none';
    
    gameContainer.classList.add('first-scene');
    
    // Удаляем старую кнопку если есть
    let existingButton = document.querySelector('.light-button-container');
    if (existingButton) existingButton.remove();
    
    // Создаем кнопку "СВЕТ"
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'centered-button-container light-button-container';
    
    const lightButton = document.createElement('button');
    lightButton.className = 'light-button';
    lightButton.textContent = 'СВЕТ';
    
    lightButton.onclick = () => {
        gameState.gameStarted = true;
        saveGame();
        
        buttonContainer.remove();
        
        // Показываем текстовый контейнер
        if (textContainer) textContainer.style.display = 'flex';
        if (choicesContainer) choicesContainer.style.display = 'flex';
        gameContainer.classList.remove('first-scene');
        
        // Сбрасываем позицию прокрутки
        if (wrapper) {
            wrapper.scrollTop = wrapper.scrollHeight;
        }
        
        loadScene('after_light');
    };
    
    buttonContainer.appendChild(lightButton);
    gameContainer.appendChild(buttonContainer);
}

const scenes = {
    // СЦЕНА 1 - НАЧАЛО
    "after_light": {
        text: "Свет.",
        background: "url('images/111.png')",
        choices: [
            { 
                text: "Пойти в лес", 
                nextScene: "forest",
                style: "mysterious"  // можно использовать mysterious, important, quiet, danger
            },
            { 
                text: "Пойти к замку", 
                nextScene: "castle",
                style: "important"
            },
            { 
                text: "Пойти к морю", 
                nextScene: "sea",
                style: "quiet"
            }
        ]
    },
    
    // СЦЕНА 2 - ЛЕС
    "forest": {
        text: "Вы входите в лес. Здесь царит полумрак и таинственная тишина. Ветви деревьев сплетаются над головой.",
        background: "url('images/forest.jpg')",
        choices: [
            { 
                text: "Вернуться на перепутье", 
                nextScene: "start",
                style: "quiet"
            }
        ]
    },
    
    // СЦЕНА 3 - ЗАМОК
    "castle": {
        text: "Перед вами величественный замок. Его стены помнят сотни лет истории.",
        background: "url('images/castle.jpg')",
        choices: [
            { 
                text: "Войти в замок", 
                nextScene: "castle_inside",
                style: "important"
            },
            { 
                text: "Вернуться на перепутье", 
                nextScene: "start",
                style: "quiet"
            }
        ]
    },
    
    "castle_inside": {
        text: "Внутри замка темно и сыро. Слышны шаги призраков прошлого.",
        background: "url('images/castle_inside.jpg')",
        choices: [
            { 
                text: "Исследовать подземелье", 
                nextScene: "dungeon",
                style: "danger"
            },
            { 
                text: "Выйти из замка", 
                nextScene: "castle",
                style: "quiet"
            }
        ]
    },
    
    // СЦЕНА 4 - МОРЕ
    "sea": {
        text: "Море спокойно. Волны ласково набегают на берег. Вдалеке виден корабль.",
        background: "url('images/sea.jpg')",
        choices: [
            { 
                text: "Ждать корабль", 
                nextScene: "ship",
                style: "important"
            },
            { 
                text: "Вернуться на перепутье", 
                nextScene: "start",
                style: "quiet"
            }
        ]
    },
    
    "ship": {
        text: "Корабль причаливает к берегу. Капитан предлагает вам присоединиться к путешествию.",
        background: "url('images/ship.jpg')",
        choices: [
            { 
                text: "Согласиться", 
                nextScene: "journey",
                style: "important"
            },
            { 
                text: "Отказаться и вернуться", 
                nextScene: "sea",
                style: "quiet"
            }
        ]
    },
    
    "dungeon": {
        text: "Вы спускаетесь в темное подземелье...",
        background: "url('images/dungeon.jpg')",
        choices: [
            { 
                text: "Идти дальше", 
                nextScene: "start",
                style: "danger"
            }
        ]
    },
    
    "journey": {
        text: "Вы отправляетесь в далекое путешествие...",
        background: "url('images/journey.jpg')",
        choices: [
            { 
                text: "Начать новую историю", 
                nextScene: "start",
                style: "important",
                effect: () => {
                    gameState = { currentScene: "start" };
                    saveGame();
                }
            }
        ]
    }
};

// ========================
// 5. ВЕРТИКАЛЬНАЯ АНИМАЦИЯ ТЕКСТА
// ========================
function typeTextVertical(text, element, wrapper, speed = 30) {
    let index = 0;
    let html = '';
    element.textContent = '';
    
    // Разбиваем текст на абзацы (если есть \n\n)
    const paragraphs = text.split('\n\n');
    
    function addChar() {
        if (index < text.length) {
            html += text[index];
            
            // Преобразуем переносы строк в <br>
            let displayHtml = html
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>');
            
            // Оборачиваем в параграфы для лучшей читаемости
            if (!displayHtml.startsWith('<p>')) {
                displayHtml = '<p>' + displayHtml + '</p>';
            }
            
            element.innerHTML = displayHtml;
            index++;
            
            // АВТОПРОКРУТКА ВВЕРХ (самая важная часть)
            // Каждый новый символ прокручивает контейнер вверх
            wrapper.scrollTop = 0;  // 0 = самый верх
            
            setTimeout(addChar, speed);
        } else {
            // Финальная автопрокрутка к началу
            wrapper.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
    
    addChar();
}

// ========================
// 6. ЗАГРУЗКА СЦЕНЫ
// ========================
function loadScene(sceneId) {
    try {
        const scene = scenes[sceneId];
        if (!scene) {
            console.error('Сцена не найдена');
            return;
        }
        
        // Обновляем состояние
        gameState.currentScene = sceneId;
        
        // Меняем фон
        const bgElement = document.getElementById('background');
        if (bgElement) {
            bgElement.style.backgroundImage = scene.background || '';
        }
        
        // ВЫВОДИМ ТЕКСТ С ВЕРТИКАЛЬНОЙ АНИМАЦИЕЙ
        const textElement = document.getElementById('scene-text');
        const wrapper = document.querySelector('.scrolling-text-wrapper');
        
        if (textElement && wrapper) {
            // Сбрасываем прокрутку в самый низ перед началом
            wrapper.scrollTop = wrapper.scrollHeight;
            
            // Запускаем вертикальную анимацию
            typeTextVertical(scene.text, textElement, wrapper, 25);
        }
        
        // Создаем кнопки
        const choicesContainer = document.getElementById('choices');
        if (choicesContainer) {
            // Очищаем контейнер
            while (choicesContainer.firstChild) {
                choicesContainer.removeChild(choicesContainer.firstChild);
            }
            
            // Создаем новые кнопки
            if (scene.choices) {
                scene.choices.forEach(choice => {
                    const button = document.createElement('button');
                    button.className = `choice-btn ${choice.style || ''}`;
                    button.textContent = choice.text;
                    
                    button.onclick = () => {
                        // Применяем эффект, если есть
                        if (choice.effect) {
                            choice.effect();
                        }
                        
                        // Сохраняем игру перед переходом
                        saveGame();
                        
                        // Загружаем следующую сцену
                        if (choice.nextScene) {
                            loadScene(choice.nextScene);
                        }
                    };
                    
                    choicesContainer.appendChild(button);
                });
            }
        }
        
    } catch (error) {
        console.error('Ошибка загрузки сцены:', error);
    }
}

// ========================
// 7. ЗАПУСК ИГРЫ
// ========================
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем сохранение
    loadGame();
    
    // Запускаем с сохраненной сцены или с начала
    setTimeout(() => {
        // ✅ ПРОВЕРЯЕМ, НУЖНО ЛИ ПОКАЗАТЬ ПЕРВУЮ СЦЕНУ
        if (!gameState.gameStarted) {
            showFirstScene();  // ← ВЫЗЫВАЕМ ФУНКЦИЮ
        } else {
            loadScene(gameState.currentScene || 'start');
        }
    }, 100);
});
