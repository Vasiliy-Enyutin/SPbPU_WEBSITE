const clickedColor = "#f6bf6d";
const unclickedColor = "white";
const synonymsDictionary = 
{
    "Светило": "Солнце",
    "Лицо": "Морда",
    "Супруга": "Жена",
    "Ходить": "Слоняться",
    "Выговор": "Порицание"
};

const associationsDictionary = 
{
    "Тарелка": "Посуда",
    "Корабль": "Море",
    "Школа": "Урок",
    "Подсолнух": "Жёлтый",
    "Овощ": "Морковка"
};

const antonymsDictionary = 
{
    "Мир": "Война",
    "Тепло": "Холодно",
    "Свет": "Тьма",
    "Громкий": "Тихий",
    "Мало": "Много"
};

var usersScores = {};

// Таймер
const timeLimitInSeconds = 25;
var currentTimerId;

var currentGameStep = 0;    // какая по счёту сейчас игра заупщена (0, 1 или 2)
var gameOrderArray = [];    // случайный порядок цифр 0-2, чтобы игра рандомилась
var currentGameDictionary = [];     // текущий словарь слов (зависит от игры)
var spawnedPhrases = [];    // созданные фразы
var containerGui;   // хранятся кнопки
var dynamicZoneElement;     // игровая зона
var firstClickedPhrase;     // первая нажатая фраза
var secondClickedPhrase;    // вторая нажатая фраза
var globalPointsContainer;           // контейнер для общего количества очков
var pointsCounterContainer;          // контейнер для счётчика очков
var gameTaskContainer;               // контейнер для хранения задания
var globalUserPoints = 0;     // сумма очков пользователя за всё время
var currentUserPoints = 0;  // текущее количество очков пользователя за одну игру
const pointsIncreaser = 100;  // прирост/уменьшение очков за правильный/неправильный ответ
const losePenalty = 500;    // штраф за проигрыш
var username;   // Имя пользователя

function checkName()
{
    let tempUsername = document.getElementById("username").value;
    if(tempUsername != "")
    {
        localStorage.setItem('currentUsername', tempUsername);
        document.location.href = "word-game.html";
    }
    else
    {
        alert("Введите другое имя");
    }
}

function configure() 
{
    let tempUsersScores = JSON.parse(localStorage.getItem('usersScores'));
    if (tempUsersScores != null)
        usersScores = tempUsersScores;

    username = localStorage.getItem('currentUsername');
    gameOrderArray = generateArrayRandomNumbers(0, 2);
    dynamicZoneElement = document.getElementById("dynamicZone");
    containerGui = document.getElementById("containerGUI")
    globalPointsContainer = document.getElementById("globalPointsContainer")
    pointsCounterContainer = document.getElementById("pointsCounterContainer")
    gameTaskContainer = document.getElementById("gameTaskContainer")
    createGlobalPoints();
    createPointsCounter();
    createGameTask();
    startGame();
}

function startGame()
{
    if (localStorage.getItem(username + 'globalUserPoints') != null)
        globalUserPoints = +localStorage.getItem(username + 'globalUserPoints')
    else
        globalUserPoints = 0;
    updateGlobalPoints();
    currentGameDictionary = chooseGameDictionary();
    spawnPhrases(currentGameDictionary);
    updateGameTask();
    currentUserPoints = 0;
    updatePointsCounter();
    interval("timer", timeLimitInSeconds);
}

function chooseGameDictionary()
{
    if (gameOrderArray[currentGameStep] == 0)
        return synonymsDictionary;
    else if (gameOrderArray[currentGameStep] == 1)
        return associationsDictionary;
    else if (gameOrderArray[currentGameStep] == 2)
        return antonymsDictionary;

    return 0;
}

function onPhraseClick(phraseElement) 
{
    let clickedPhrase = spawnedPhrases.find(phrase => phrase.element == phraseElement);
    clickedPhrase.changeColor(clickedColor);
    if (firstClickedPhrase == null)
    {
        firstClickedPhrase = clickedPhrase;
    }
    else
    {
        secondClickedPhrase = clickedPhrase;
        compareClickedPhrases();
    }
}

function spawnPhrases(dictionary) // принимает массив со словами из-за разных игр
{
    let positionTop = 0;
    let positionTopIncreaser = 8;
    for (let i = 0; i < Object.keys(dictionary).length * 2; i++)
    {
        let phraseElement = getPhraseElement(positionTop);
        let phrase = new Phrase(phraseElement);
        spawnedPhrases.push(phrase);
        dynamicZoneElement.appendChild(phraseElement);
        positionTop += positionTopIncreaser;
    }

    let counter = 0;
    let randomNumbers = generateArrayRandomNumbers(0, spawnedPhrases.length - 1)   // Для выбора рандомной фразы
    for (const [key, value] of Object.entries(dictionary))  // Устанавливаю текст фразы
    {
        spawnedPhrases[randomNumbers[counter++]].setText(key);
        spawnedPhrases[randomNumbers[counter++]].setText(value);
    }
}

function compareClickedPhrases() 
{
    let firstPhraseText = firstClickedPhrase.element.innerText;
    let secondPhraseText = secondClickedPhrase.element.innerText;
    let matched = false;
    if (firstPhraseText in currentGameDictionary && currentGameDictionary[firstPhraseText] == secondPhraseText)
    {
        matched = true;
    }
    else if (secondPhraseText in currentGameDictionary && currentGameDictionary[secondPhraseText] == firstPhraseText)
    {
        matched = true;
    }

    if (matched == true)
    {
        currentUserPoints += pointsIncreaser;
        updatePointsCounter();
        deleteMatchedPhrases();
    }
    else
    {
        currentUserPoints -= pointsIncreaser;
        updatePointsCounter();
        clearClickedPhrases();
    }
}

function deleteMatchedPhrases()
{
    // Удаление совпадающих фраз из spawnedPhrases
    let index = spawnedPhrases.indexOf(firstClickedPhrase);
    spawnedPhrases.splice(index, 1);
    index = spawnedPhrases.indexOf(secondClickedPhrase);
    spawnedPhrases.splice(index, 1);

    // Удаление div элемента фраз (заметно пользователю)
    spawnedPhrases.find(phrase => phrase.element == firstClickedPhrase);
    firstClickedPhrase.element.remove();
    secondClickedPhrase.element.remove();

    clearClickedPhrases();

    if (spawnedPhrases.length == 0)
    {
        updateScore();
        startNextGame();
    }
}

function updateScore()
{
    username = localStorage.getItem('currentUsername');
    globalUserPoints += currentUserPoints;
    localStorage.setItem(username + 'globalUserPoints', globalUserPoints)

    usersScores[username] = globalUserPoints;
    localStorage.setItem('usersScores', JSON.stringify(usersScores));
}

async function startNextGame()
{
    clearInterval(currentTimerId);
    currentGameStep++;
    if (currentGameStep > 2)    // Зацикливаю игру
        currentGameStep = 0;

    await wait(100);
    alert("Вы победили и заработали " + currentUserPoints + " очков!");
    startGame();
}

function clearClickedPhrases()
{
    firstClickedPhrase.changeColor(unclickedColor);
    secondClickedPhrase.changeColor(unclickedColor);
    firstClickedPhrase = null;
    secondClickedPhrase = null;
}

function getPhraseElement(positionTop) 
{
    let phraseElement = document.createElement("div");
    phraseElement.setAttribute("class", "phrase");
    phraseElement.style.top = `${positionTop}%`;
    phraseElement.style.left = `${Math.random() * 85}%`;
    phraseElement.style.backgroundColor = unclickedColor;
    phraseElement.setAttribute("onClick", "onPhraseClick(this)");
    return phraseElement;
}

class Phrase 
{
    constructor(element) 
    {
        this.element = element;
    }

    changeColor(newColor) 
    {
        this.element.style.backgroundColor = newColor;
    }

    setText(newContent) 
    {
        this.element.innerText = newContent;
    }
}

function createGlobalPoints()
{
    text = document.createTextNode("Общее количество очков: " + globalUserPoints);
    globalPointsContainer.appendChild(text);
}

function updateGlobalPoints()
{
    globalPointsContainer.innerText = "Общее количество очков: " + globalUserPoints;
}

function createPointsCounter() 
{
    text = document.createTextNode("Очки: " + currentUserPoints);
    pointsCounterContainer.appendChild(text);
}

function updatePointsCounter()
{
    pointsCounterContainer.innerText = "Очки: " + currentUserPoints;
}

function createGameTask()
{
    text = document.createTextNode("Задание: ");
    gameTaskContainer.appendChild(text);
}

function updateGameTask()
{
    if (gameOrderArray[currentGameStep] == 0)
        gameTaskContainer.innerText = "Задание: выбрать синонимы"
    if (gameOrderArray[currentGameStep] == 1)
        gameTaskContainer.innerText = "Задание: выбрать ассоциации"
    if (gameOrderArray[currentGameStep] == 2)
        gameTaskContainer.innerText = "Задание: выбрать антонимы"
}

function exit()
{
    updateScore();
    document.location.href = "login.html";
}

function openRatingTable()
{
    document.location.href = "rating.html";
}

function showRatingTable()
{
    firstSpan = document.getElementById("first");
    secondSpan = document.getElementById("second");
    thirdSpan = document.getElementById("third");

    usersScores = JSON.parse(localStorage.getItem('usersScores'));
    
    let max1 = -99999; let max2 = -99999; let max3 = -99999;
    let username1; let username2; let username3;
    for (let key in usersScores)
    {
        if (usersScores[key] >= max1)
        {
            max3 = max2;
            username3 = username2;
            max2 = max1;
            username2 = username1;
            max1 = usersScores[key];
            username1 = key;
        }
        else if (usersScores[key] >= max2)
        {
            max3 = max2;
            username3 = username2;
            max2 = usersScores[key];
            username2 = key;
        }
        else if (usersScores[key] >= max3)
        {
            max3 = usersScores[key];
            username3 = key;
        }
    }
    if (max3 != -99999)
        thirdSpan.innerHTML = username3 + " имеет " + max3 + " очков";
    else
        thirdSpan.innerHTML = '-';
    if (max2 != -99999)
        secondSpan.innerHTML = username2 + " имеет " + max2 + " очков";
    else
        secondSpan.innerHTML = '-';
    if (max1 != -99999)
        firstSpan.innerHTML = username1 + " имеет " + max1 + " очков";
    else
        firstSpan.innerHTML = '-';
}

// Генерация случайных неповторяющихся чисел в заданном промежутке
function generateArrayRandomNumbers(min, max)
{
    var totalNumbers = max - min + 1,
        arrayTotalNumbers = [],
        arrayRandomNumbers = [],
        tempRandomNumber;
    while (totalNumbers--) {
        arrayTotalNumbers.push(totalNumbers + min);
    }
    
    while (arrayTotalNumbers.length) {
        tempRandomNumber = Math.round(Math.random() * (arrayTotalNumbers.length - 1));
        arrayRandomNumbers.push(arrayTotalNumbers[tempRandomNumber]);
        arrayTotalNumbers.splice(tempRandomNumber, 1);
    }
    return arrayRandomNumbers;
}

// Таймер
function times(numb, int_id) 
{
  var _ = numb;
  if (_ <= 0) 
  {
    clearInterval(int_id);
    alert("Ты проиграл. -500 очков. Нажми 'ОК', чтобы начать заново");
    currentUserPoints -= losePenalty;
    updateScore();
    document.location.href = "word-game.html";
  }
  return "Оставшееся время: " + _ + " секунд";
}

function interval(int_id, numb) 
{
  var span = document.getElementById(int_id);
  currentTimerId = setInterval(function() 
  {
    span.innerHTML = times(numb--, currentTimerId);
  }, 1000);
}

function wait(milliseconds) 
{
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function getKeyByValue(object, value) 
{
    return Object.keys(object).find(key => object[key] === value);
}