let audioContext;
let analyser;
let microphone;
let javascriptNode;
let candleBlownOut = false; // Прапорець, щоб не задувати кілька разів

// 1. ПЕРЕХІД З ПЕРШОГО ЕКРАНУ ДО ТОРТИКА + ЗАПУСК МІКРОФОНА
document.getElementById('screen-welcome').addEventListener('click', function() {
    changeScreen('screen-welcome', 'screen-cake');
    startMicDetection(); // Запускаємо магію мікрофона відразу після першого тапу
});

// 2. АЛГОРИТМ ВИЗНАЧЕННЯ ПОДИХУ
async function startMicDetection() {
    try {
        // Запитуємо доступ до мікрофона
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 512;
        microphone.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function detectBlow() {
            if (candleBlownOut) return; // Якщо свічку вже задули — зупиняємо цикл

            analyser.getByteFrequencyData(dataArray);

            let highFreqSum = 0;
            let lowFreqSum = 0;
            const midpoint = dataArray.length / 2;

            // Ділимо частоти на низькі та високі
            for (let i = 0; i < dataArray.length; i++) {
                if (i < midpoint) {
                    lowFreqSum += dataArray[i];
                } else {
                    highFreqSum += dataArray[i];
                }
            }

            const highAvg = highFreqSum / (dataArray.length / 2);
            const lowAvg = lowFreqSum / (dataArray.length / 2);

            // Вираховуємо коефіцієнт шуму подиху
            const ratio = highAvg / (lowAvg + 1);

            // ПОРІГ ЧУТЛИВОСТІ ПОДИХУ
            const BLOW_RATIO_THRESHOLD = 0.5;

            // Якщо дмухнули — гасимо свічку
            if (ratio > BLOW_RATIO_THRESHOLD) {
                blowOutCandle();
                return; // Виходимо з функції анімації
            }

            // Запускаємо перевірку знову на наступному кадрі
            requestAnimationFrame(detectBlow);
        }

        detectBlow();

    } catch (err) {
        console.error("Помилка доступу до мікрофона:", err);
        // Резервний варіант: якщо мікрофон заблоковано, даємо можливість задути кліком по вогнику
        document.getElementById('flame').addEventListener('click', blowOutCandle);
    }
}

// 3. ФУНКЦІЯ ЗАДУВАННЯ СВІЧКИ ТА ПЕРЕХОДУ
function blowOutCandle() {
    if (candleBlownOut) return;
    candleBlownOut = true;

    // Зупиняємо аудіо-контекст, щоб вимкнути запис мікрофона
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
    }

    // Ховаємо вогник свічки
    document.getElementById('flame').style.display = 'none';
    
    // Змінюємо текст над тортиком
    document.getElementById('cake-instruction').innerText = "Бажання загадано! 🌟";
    
    // Через 1.5 секунди переходимо до подарунків
    setTimeout(function() {
        changeScreen('screen-cake', 'screen-gifts');
    }, 1500);
}

// 4. НАВІГАЦІЯ МІЖ ЕКРАНАМИ
function changeScreen(hideId, showId) {
    document.getElementById(hideId).classList.remove('active');
    document.getElementById(showId).classList.add('active');
}

// Відкриття під-екранів (Лист, Відео, Фото, Баночка)
function openSubScreen(screenId) {
    document.getElementById('screen-gifts').classList.remove('active');
    document.getElementById(screenId).classList.add('active');
}

// Повернення назад до кнопок з подарунками
function backToGifts() {
    const activeSubScreen = document.querySelector('.sub-screen.active');
    if (activeSubScreen) {
        activeSubScreen.classList.remove('active');
    }
    document.getElementById('screen-gifts').classList.add('active');
}

// 5. БАНОЧКА ПОБАЖАНЬ
const wishes = [
    "Ти моє найбільше щастя! ❤️",
    "Нехай кожна твоя посмішка прикрашає цей світ! ✨",
    "Залишайся завжди такою ж ніжною та прекрасною 🤍",
    "Я неймовірно сильно тебе кохаю! 🥰",
    "Ти сонечко, яке зігріває мене щодня ☀️",
    "Нехай усі твої найзаповітніші мрії здійсняться! 🌟",
    "Ти найпрекрасніша дівчина у всесвіті 💫",
    "Я пишаюся тобою, ти робиш все можливе продовжуй ✨",
    "Надсилаю тобі віртуальні обійми 🤗",
    "Я буду поруч з тобою і в добрі й погані дні 😘",
    "Я найщасливіша людина в житті через те що, ти з'явилась в ньому 😇",
    "Кожен мій день стає кращим, просто із за того що ти існуєш 🥰",
    "Я вірю в тебе і для мене все має значення 🤩",
    "Твоя посмішка — мій улюблений пейзаж. 🌿",
    "Кохати тебе — це найприємніше, що зі мною траплялося. 💕",
    "Ти прикрашаєш мій світ просто тим, що ти є. 💞",
    "Мій найкращий день — це день, проведений з тобою. 🤩", 
    "Дивлячись в твої очі я бачу весь всесвіт. 😍",
    "Кожна мить із тобою — особлива. 😘",
    "Дякую тобі за твою ніжність і любов. ❣️",
    "Поруч із тобою я вдома. 👩‍❤️‍👩",
    "Ти неймовірно красива, коли смієшся.😂 ",
    "Ти надихаєш мене ставати краще. 😳", 
    "Твій голос — моя улюблена мелодія. 🎵",
    "Обожнюю твій унікальний стиль та смак. ❤️",
    "Ти надзвичайно талановита й особлива. 💘",
    "Обожнюю твої обійми — вони найтепліші. 💝",
    "Я завжди буду твоєю надійною опорою. 😍",
    "Кожного дня я закохуюсь в тебе все сильніше 🥰",
    "Кожен твій поцілунок як найкраща винагорода 😇"
];

// Створюємо тимчасовий активний масив для уникнення повторів
let activeWishes = [...wishes]; 
let lastShownWish = ""; // Запам'ятовуємо останню показану фразу

function getWish() {
    const jar = document.getElementById('wish-jar');
    const wishOutput = document.getElementById('wish-output');

    // Ефект похитування баночки
    jar.classList.add('shake');
    setTimeout(() => jar.classList.remove('shake'), 400);

    // 1. Якщо всі побажання закінчилися — засипаємо їх у баночку знову
    if (activeWishes.length === 0) {
        activeWishes = [...wishes];
    }

    // 2. Шукаємо випадковий індекс
    let randomIndex = Math.floor(Math.random() * activeWishes.length);
    let chosenWish = activeWishes[randomIndex];

    // 3. ЗАПОБІЖНИК: якщо обрана фраза збігається з тією, що була щойно показана,
    // і в баночці є інші варіанти — вибираємо інший індекс
    if (chosenWish === lastShownWish && activeWishes.length > 1) {
        // Просто беремо наступний елемент (або попередній, якщо це був останній)
        randomIndex = (randomIndex + 1) % activeWishes.length;
        chosenWish = activeWishes[randomIndex];
    }

    // 4. Вирізаємо остаточно обране побажання з масиву
    activeWishes.splice(randomIndex, 1);
    
    // Запам'ятовуємо його як останнє показане перед наступним кліком
    lastShownWish = chosenWish;

    // Плавна зміна тексту на екрані
    wishOutput.style.opacity = 0;
    setTimeout(() => {
        wishOutput.innerText = chosenWish;
        wishOutput.style.opacity = 1;
    }, 200);
}