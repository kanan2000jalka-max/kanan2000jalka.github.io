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
    gameStarted: false,
    // Добавляйте сюда свои переменные:
    // hasKey: false,
    // listenedToElder: false,
    // timeOfDay: "day"
};

localStorage.removeItem('storySave');

// ========================
// 2. ЗАГРУЗКА СОХРАНЕНИЯ
// ========================
function loadGame() {
    try {
        const saved = localStorage.getItem('storySave');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.currentScene && scenes[parsed.currentScene]) {
                gameState = { ...gameState, ...parsed };
                console.log('Сохранение загружено:', parsed.currentScene);
            } else {
                console.log('Сохраненная сцена не существует, начинаем заново');
                localStorage.removeItem('storySave');  // Удаляем битое сохранение
                gameState.gameStarted = false;
                gameState.currentScene = "after_light";
            }
        }
    } catch (e) {
        console.log('Не удалось загрузить сохранение');
        localStorage.removeItem('storySave');
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
// 4. ПЕРВАЯ СЦЕНА (ОБНОВЛЕННАЯ)
// ========================
function showFirstScene() {
    console.log('showFirstScene вызвана');  // ДЛЯ ОТЛАДКИ
    console.log('gameState.gameStarted =', gameState.gameStarted);
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
        type: "multi-page",
        background: "url('images/111.png')",
        pages: [
            "Свет...",
            "Его здесь нет",
            "Даже стекло на каком то моменте заканчивается - само понятие стеклянности исчезает, оставляя за смысловой вакуум",
            "Я бы сказал, даже категорический вакуум! ",
            "Основопологающий вакуум",
            "Стекло, за которым нет ничего и присутствует все одновременно. За которым все прибывает в пермонентной суперпозиции прибывания во всех смыслах и пониманиях, во всех пространственных и временных положениях, в любой логической последовательности и с любой точки зрения.",
            "Вот вся эта энтропийная каша находится здесь, перед твоим носом, ограниченная и замкнутая с четырех сторон. Все это бытие находится в рамочке, в окошке. А то что перед этим окном, ему абсолютно ничего не понятно. Перед ним лишь его блеклое отражение общего освещения, покрывающее черное стекло.",
        ],
        onComplete: {
            nextScene: "exprmnt"  // перейти к сцене выбора
        }
    },
    
    "exprmnt": {
        type: "choice",  // можно явно указать тип
        background: "url('images/111.png')",
        text: "Но давай с тобой устроим мысленный эксперимент? ",
        choices: [
            { 
                text: "1. Что за эксперемент?", 
                nextScene: "non",
                style: "mysterious"  // можно использовать mysterious, important, quiet, danger
            },
            { 
                text: "2. Давай", 
                nextScene: "non",
                style: "mysterious"  // можно использовать mysterious, important, quiet, danger
            },
            { 
                text: "3. ненадо", 
                nextScene: "non",
                style: "mysterious"  // можно использовать mysterious, important, quiet, danger
            },
        ]
    },

    "non":{
        type: "choice",
        background: "url('images/11.png')",
        text: "Эта страница пока что еще не готова. Прошу вас вернуться в самое начало) ",
        choices: [
            { 
                text: "В начало", 
                nextScene: "after_light",
                style: "mysterious"  // можно использовать mysterious, important, quiet, danger
            },
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
// ОБНОВЛЕННАЯ ЗАГРУЗКА СЦЕНЫ
// ========================
function loadScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) return;
    
    // Удаляем старый слушатель кликов
    removeFullscreenClickListener();
    
    // Проверяем тип сцены
    if (scene.type === "multi-page") {
        // Многостраничная сцена - начинаем с первой страницы
        loadMultiPageScene(sceneId, 0);
    } else {
        // Обычная сцена с выбором - ваш существующий код
        // (весь код из вашей текущей loadScene)
        
        // Обновляем фон
        const bgElement = document.getElementById('background');
        if (bgElement) {
            bgElement.style.backgroundImage = scene.background || '';
        }
        
        // Выводим текст
        const textElement = document.getElementById('scene-text');
        if (textElement) {
            const wrapper = document.querySelector('.scrolling-text-wrapper');
            typeTextVertical(scene.text, textElement, wrapper, 25);
        }
        
        // Создаем кнопки выбора
        const choicesContainer = document.getElementById('choices');
        if (choicesContainer) {
            while (choicesContainer.firstChild) {
                choicesContainer.removeChild(choicesContainer.firstChild);
            }
            
            if (scene.choices) {
                scene.choices.forEach(choice => {
                    const button = document.createElement('button');
                    button.className = `choice-btn ${choice.style || ''}`;
                    button.textContent = choice.text;
                    
                    button.onclick = () => {
                        if (choice.effect) choice.effect();
                        saveGame();
                        if (choice.nextScene) loadScene(choice.nextScene);
                    };
                    
                    choicesContainer.appendChild(button);
                });
            }
        }
    }
    
    saveGame();
}

// ========================
// ЗАГРУЗКА МНОГОСТРАНИЧНОЙ СЦЕНЫ
// ========================
function loadMultiPageScene(sceneId, pageIndex = 0) {
    try {
        const scene = scenes[sceneId];
        if (!scene || scene.type !== "multi-page") {
            console.error('Многостраничная сцена не найдена');
            return;
        }
        
        // Обновляем состояние
        gameState.currentScene = sceneId;
        gameState.currentPage = pageIndex;  // запоминаем текущую страницу
        
        // Меняем фон
        const bgElement = document.getElementById('background');
        if (bgElement) {
            bgElement.style.backgroundImage = scene.background || '';
        }
        
        // Выводим текущую страницу
        const textElement = document.getElementById('scene-text');
        if (textElement) {
            // Обычный вывод или побуквенный - на ваш выбор
            const wrapper = document.querySelector('.scrolling-text-wrapper');
            typeTextVertical(scene.pages[pageIndex], textElement, wrapper, 25);
        }
        
        // ОЧИЩАЕМ КОНТЕЙНЕР С КНОПКАМИ
        const choicesContainer = document.getElementById('choices');
        if (choicesContainer) {
            while (choicesContainer.firstChild) {
                choicesContainer.removeChild(choicesContainer.firstChild);
            }
            
            // Если это не последняя страница - показываем подсказку
            if (pageIndex < scene.pages.length - 1) {
                // Создаем "невидимую" кнопку на весь экран
                createFullscreenClickListener(sceneId, pageIndex);
                
                // Можно добавить маленькую подсказку
                const hint = document.createElement('div');
                hint.className = 'tap-hint';
                hint.textContent = '👆 нажмите в любом месте';
                choicesContainer.appendChild(hint);
            } 
            // Если это последняя страница - показываем кнопку перехода
            else {
                // Удаляем слушатель с экрана
                removeFullscreenClickListener();
                
                // Создаем кнопку продолжения
                const continueBtn = document.createElement('button');
                continueBtn.className = 'choice-btn important';
                continueBtn.textContent = 'Продолжить →';
                
                continueBtn.onclick = () => {
                    // Применяем эффект если есть
                    if (scene.onComplete?.effect) {
                        scene.onComplete.effect();
                    }
                    // Переходим к следующей сцене
                    if (scene.onComplete?.nextScene) {
                        loadScene(scene.onComplete.nextScene);
                    }
                };
                
                choicesContainer.appendChild(continueBtn);
            }
        }
        
    } catch (error) {
        console.error('Ошибка загрузки многостраничной сцены:', error);
    }
}

// ========================
// СЛУШАТЕЛЬ КЛИКА ПО ЭКРАНУ
// ========================
let fullscreenClickListener = null;

function createFullscreenClickListener(sceneId, currentPage) {
    // Удаляем старый слушатель если есть
    removeFullscreenClickListener();
    
    // Создаем новый слушатель
    fullscreenClickListener = () => {
        // Переходим к следующей странице
        const nextPage = currentPage + 1;
        loadMultiPageScene(sceneId, nextPage);
    };
    
    // Добавляем слушатель на весь документ
    document.addEventListener('click', fullscreenClickListener);
}

function removeFullscreenClickListener() {
    if (fullscreenClickListener) {
        document.removeEventListener('click', fullscreenClickListener);
        fullscreenClickListener = null;
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
            console.log('after_light');
            showFirstScene();  // ← ВЫЗЫВАЕМ ФУНКЦИЮ
        } else {
            if (gameState.currentScene && scenes[gameState.currentScene]) {
                console.log('Загрузка сцены:', gameState.currentScene);
            loadScene(gameState.currentScene);
                } else {
                console.log('Сцена не найдена, запуск первой сцены');
                gameState.gameStarted = false;
                showFirstScene();
            }
        }
    }, 100);
});







