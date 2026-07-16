let audioContext;
let analyser;
let microphone;
let meter;
let candleBlownOut = false; // Прапорець, щоб не задувати кілька разів

// 1. ПЕРЕХІД З ПЕРШОГО ЕКРАНУ ДО ТОРТИКА + ЗАПУСК МІКРОФОНА
document.getElementById('screen-welcome').addEventListener('click', function() {
    changeScreen('screen-welcome', 'screen-cake');
    startMicDetection(); // Запускаємо магію мікрофона відразу після першого тапу
});

// Допоміжна функція для створення вимірювача гучності (Audio Meter)
function createAudioMeter(audioContext, clipLevel, averaging, alpha) {
    const processor = audioContext.createScriptProcessor(512);
    processor.onaudioprocess = volumeAudioProcess;
    processor.clipping = false;
    processor.lastClip = 0;
    processor.volume = 0;
    processor.clipLevel = clipLevel || 0.98;
    processor.averaging = averaging || 0.95;
    processor.clipLag = 200;

    processor.connect(audioContext.destination);

    processor.checkClipping = function() {
        if (!this.clipping) return false;
        if ((this.lastClip + this.clipLag) < window.performance.now()) this.clipping = false;
        return this.clipping;
    };

    processor.shutdown = function() {
        this.disconnect();
        this.onaudioprocess = null;
    };

    return processor;
}

function volumeAudioProcess(event) {
    const buf = event.inputBuffer.getChannelData(0);
    const bufLength = buf.length;
    let sum = 0;
    let x;

    for (let i = 0; i < bufLength; i++) {
        x = buf[i];
        if (Math.abs(x) >= this.clipLevel) {
            this.clipping = true;
            this.lastClip = window.performance.now();
        }
        sum += x * x;
    }

    const rms = Math.sqrt(sum / bufLength);
    this.volume = Math.max(rms, this.volume * this.averaging);
}

// 2. АЛГОРИТМ ВИЗНАЧЕННЯ ПОДИХУ
async function startMicDetection() {
    try {
        // Запитуємо доступ до мікрофона
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        microphone = audioContext.createMediaStreamSource(stream);
        meter = createAudioMeter(audioContext);
        
        // Створюємо фільтр низьких частот для відсікання зайвих звуків
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400; // Пропускає тільки частоти подиху
        
        microphone.connect(filter);
        filter.connect(meter);

        let lowpass = 0;
        const ALPHA = 0.5;
        const THRESHOLD = 0.08; // Поріг чутливості (можна трохи зменшити/збільшити)

        function detectBlow() {
            if (candleBlownOut) return; // Якщо свічку вже задули — зупиняємо цикл

            // Розрахунок згладженого рівня гучності через фільтр
            lowpass = ALPHA * meter.volume + (1.0 - ALPHA) * lowpass;

            // Якщо рівень шуму вище порогу — задуваємо свічку!
            if (lowpass > THRESHOLD) {
                blowOutCandle();
                return;
            }

            // Запускаємо перевірку знову на наступному кадрі
            requestAnimationFrame(detectBlow);
        }

        detectBlow();

    } catch (err) {
        console.error("Помилка доступу до мікрофона:", err);
        // Резервний варіант: якщо мікрофон заблоковано або виникла помилка,
        // даємо можливість задути кліком по вогнику
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
    "Кожну мить я закохуюсь в тебе все сильніше 🥰",
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