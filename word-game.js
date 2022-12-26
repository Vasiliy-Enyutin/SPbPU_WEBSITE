const clickedColor = "#f6bf6d";
const unclickedColor = "white";
const wrongColor = "red";
const synonymsDictionary = 
{
    "Светило": "Солнце",
    "Лицо": "Морда",
    "Супруга": "Жена",
    "Ходить": "Слоняться",
    "Выговор": "Порицание",
    "Анализ": "Разбор",
    "Габариты": "Размеры",
    "Голкипер": "Вратарь",
    "Дискуссия": "Спор",
    "Имидж": "Образ"
};

const digitsArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

const nounGameDictionary = 
{
    "Тарелка": 1,
    "Корабль": 1,
    "Школа": 1,
    "Бежать": 0,
    "Овощ": 1,
    "Штаны": 1,
    "Вязать": 0,
    "Угрюмый": 0
};

var usersScores = {};

// Таймер
const timeLimitInSeconds = 25;
const timeLimitInSecondsMedium = 20;
const timeLimitInSecondsHard = 20;
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
var resultContainer;
var globalUserPoints = 0;     // сумма очков пользователя за всё время
var currentUserPoints = 0;  // текущее количество очков пользователя за одну игру
const pointsIncreaserEasy = 100;  // прирост/уменьшение очков за правильный/неправильный ответ
const pointsIncreaserMedium = 150;  // прирост/уменьшение очков за правильный/неправильный ответ
const pointsIncreaserHard = 200;  // прирост/уменьшение очков за правильный/неправильный ответ
const losePenalty = 1000;    // штраф за проигрыш
const digitsShowInterval = 2000;
var username;   // Имя пользователя
var digitOnScreen;  // Текущая цифра на экране
var foundNounsNumber = 0;
var totalNounsNumber = 0;
var clickedPhrasesNumber = 0;
var digitIsClicked = false;

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
        document.getElementById("incorrectUsername").innerHTML = "Введите другое имя";
    }
}

async function startNextGame()
{
    currentGameStep++;
    clearInterval(currentTimerId);
    document.getElementById("resultContainer").style.display = "flex";
    resultContainer.innerHTML = "Вы победили и заработали " + currentUserPoints + " очков";
    await wait(2000);
    document.getElementById("resultContainer").style.display = "none";
    
    if (currentGameStep >= 3)
        openRatingTable();
    else
        startGame();
}

function configure() 
{
    let tempUsersScores = JSON.parse(localStorage.getItem('usersScores'));
    if (tempUsersScores != null)
        usersScores = tempUsersScores;

    username = localStorage.getItem('currentUsername');
    dynamicZoneElement = document.getElementById("dynamicZone");
    containerGui = document.getElementById("containerGUI")
    globalPointsContainer = document.getElementById("globalPointsContainer")
    pointsCounterContainer = document.getElementById("pointsCounterContainer")
    gameTaskContainer = document.getElementById("gameTaskContainer")
    resultContainer = document.getElementById("resultContainer");
    createGlobalPoints();
    createPointsCounter();
    createGameTask();
    startGame();
}

function startGame()
{
    clearInterval(currentTimerId);
    if (localStorage.getItem(username + 'globalUserPoints') != null)
        globalUserPoints = +localStorage.getItem(username + 'globalUserPoints')
    else
        globalUserPoints = 0;
    updateGlobalPoints();
    clearFields();

    chooseGame();
    
    updateGameTask();
    updatePointsCounter();
}

function chooseGame()
{
    if (currentGameStep == 0)
    {
        currentGameDictionary = synonymsDictionary;
        spawnPhrases(currentGameDictionary);
        interval("timer", timeLimitInSeconds);
    }
    else if (currentGameStep == 1)
    {
        currentGameDictionary = digitsArray;
        spawnDigits(currentGameDictionary);
        hideShowDigits();
        interval("timer", timeLimitInSecondsMedium);
    }
    else if (currentGameStep == 2)
    {
        currentGameDictionary = nounGameDictionary;
        spawnRotatedPhrases(currentGameDictionary);
        interval("timer", timeLimitInSecondsHard)
    }
}

function spawnRotatedPhrases(dictionary)
{
    let positionTop = 0;
    let positionTopIncreaser = 10;
    for (let i = 0; i < Object.keys(dictionary).length; i++)
    {
        let phraseElement = getPhraseElement(positionTop);
        let phrase = new Phrase(phraseElement);
        spawnedPhrases.push(phrase);
        dynamicZoneElement.appendChild(phraseElement);
        positionTop += positionTopIncreaser;
    }

    let counter = 0;
    let phrasesChangePositionInterval = 5;   // сек
    let randomNumbers = generateArrayRandomNumbers(0, spawnedPhrases.length - 1)   // Для выбора рандомной фразы
    for (let key of Object.keys(dictionary))  // Устанавливаю текст фразы
    {
        if (dictionary[key] == 1)
        {
            totalNounsNumber++;
        }
        spawnedPhrases[randomNumbers[counter++]].setText(key);
    }
    // Меняем позицию слов
    let multiplier = 0;
    for (let i = 0; i < timeLimitInSecondsHard / phrasesChangePositionInterval / 2; i++)
    {
        setTimeout(movePhrasesLeft, 1000 * phrasesChangePositionInterval * multiplier);
        multiplier++;
        setTimeout(movePhrasesRight, 1000 * phrasesChangePositionInterval * multiplier);
        multiplier++;
    }
    setTimeout(checkForWinInNounGame, timeLimitInSecondsHard * 1000);
    rotatePhrases();
}

function rotatePhrases()
{
    let randomRotate;
    for (let phrase of spawnedPhrases)
    {
        randomRotate = getRandomInt(360);
        phrase.element.style.transform = 'rotate(' + randomRotate + 'deg)';
    }
}

function movePhrasesRight()
{
    rotatePhrases();
    for (let phrase of spawnedPhrases)
    {
        translate(phrase.element, dynamicZoneElement.getBoundingClientRect().right - 
        dynamicZoneElement.getBoundingClientRect().left - 100, phrase.element.y);
    }
}

function movePhrasesLeft()
{
    rotatePhrases();
    for (let phrase of spawnedPhrases)
    {
        translate(phrase.element, 25, phrase.element.y);
    }
}

function checkForNoun(clickedPhrase)
{
    clickedPhrasesNumber++;
    if (nounGameDictionary[clickedPhrase.element.innerText] == 1)
    {
        foundNounsNumber++;
        addPoints(pointsIncreaserHard);
    }
    else
    {
        clickedPhrase.changeColor(wrongColor);
        addPoints(-pointsIncreaserHard);
    }
}

function checkForWinInNounGame()
{
    if (clickedPhrasesNumber > totalNounsNumber)
    {
        lose();
    }
    else if (foundNounsNumber == totalNounsNumber)
    {
        updateScore();
        clearBord();
        startNextGame();
    }
    else
    {
        lose();
    }
}

function spawnDigits(arr)
{
    let positionTop = 0;
    let positionTopIncreaser = 6;
    for (let i = 0; i < arr.length; i++)
    {
        let phraseElement = getPhraseElement(positionTop);
        let phrase = new Phrase(phraseElement);
        spawnedPhrases.push(phrase);
        dynamicZoneElement.appendChild(phraseElement);
        positionTop += positionTopIncreaser;
    }

    let counter = 0;
    let randomNumbers = generateArrayRandomNumbers(0, spawnedPhrases.length - 1)   // Для выбора рандомной фразы
    for (let digit of arr)  // Устанавливаю текст фразы
    {
        spawnedPhrases[randomNumbers[counter]].element.style.display = "none";
        spawnedPhrases[randomNumbers[counter++]].setText(digit);
    }
}

function hideShowDigits()
{
    let randomNumbers = generateArrayRandomNumbers(0, spawnedPhrases.length - 1);
    for (let i=0; i<randomNumbers.length; i++)
    {
        setTimeout(showDigit, digitsShowInterval*i, spawnedPhrases[randomNumbers[i]])
        setTimeout(hideDigit, digitsShowInterval*i+digitsShowInterval, spawnedPhrases[randomNumbers[i]])
    }
    setTimeout(checkForWinInDigitGame, digitsShowInterval*randomNumbers.length, spawnedPhrases.length);
}

function showDigit(phrase)
{
    digitIsClicked = false;
    digitOnScreen = phrase.element.innerText;
    phrase.element.style.display = "flex";
}

function hideDigit(phrase)
{
    phrase.element.style.display = "none";
}

function checkForWinInDigitGame(startSpawnedPhrasesNumber)
{
    if (spawnedPhrases.length == startSpawnedPhrasesNumber || currentUserPoints <= 0)
    {
        lose();
    }
    else
    {
        updateScore();
        clearBord();
        startNextGame();
    }
}

// Нажатие клавиши для игры с исчезающими цифрами
document.addEventListener('keydown', function(event) 
{
    if (currentGameStep == 1 && digitIsClicked == false)
    {
        if 
        (
            (event.code == 'Digit0' && digitOnScreen == 0) || (event.code == 'Digit1' && digitOnScreen == 1) ||
            (event.code == 'Digit2' && digitOnScreen == 2) || (event.code == 'Digit3' && digitOnScreen == 3) ||
            (event.code == 'Digit4' && digitOnScreen == 4) || (event.code == 'Digit5' && digitOnScreen == 5) ||
            (event.code == 'Digit6' && digitOnScreen == 6) || (event.code == 'Digit7' && digitOnScreen == 7) ||
            (event.code == 'Digit8' && digitOnScreen == 8) || (event.code == 'Digit9' && digitOnScreen == 9)
        )
        {
            for (let i = 0; i < spawnedPhrases.length; i++)
            {
                if (spawnedPhrases[i].element.innerText == digitOnScreen)
                {
                    digitIsClicked = true;
                    spawnedPhrases[i].changeColor(clickedColor);
                    setTimeout(deletePhrase, 1000, spawnedPhrases[i]);
                    addPoints(pointsIncreaserMedium);
                }
            }
        }
        else
        {
            addPoints(-pointsIncreaserMedium);
        }
    }
});

function spawnPhrases(dictionary) // Игра 0
{
    let positionTop = 0;
    let positionTopIncreaser = 6;
    for (let i = 0; i < Object.keys(dictionary).length; i++)
    {
        let phraseElement = getPhraseElement(positionTop);
        let phrase = new Phrase(phraseElement);
        spawnedPhrases.push(phrase);
        dynamicZoneElement.appendChild(phraseElement);
        positionTop += positionTopIncreaser;
    }

    let counter = 0;
    let phraseLimit = 10;
    let randomNumbers = generateArrayRandomNumbers(0, spawnedPhrases.length - 1)   // Для выбора рандомной фразы
    // for (const [key, value] of Object.entries(dictionary))  // Устанавливаю текст фразы
    // {
    //     if (counter >= phraseLimit)
    //         break;
    //     spawnedPhrases[randomNumbers[counter++]].setText(key);
    //     spawnedPhrases[randomNumbers[counter++]].setText(value);
    // }
    let phrase;
    for(let i = 0; i < Object.keys(dictionary).length; i++)
    {
        if (counter >= phraseLimit)
            break;
        phrase = Object.keys(dictionary)[randomNumbers[counter]];
        spawnedPhrases[randomNumbers[counter]].setText(phrase);
        counter++;
        spawnedPhrases[randomNumbers[counter]].setText(dictionary[phrase]);
        counter++;
    }
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
        addPoints(pointsIncreaserEasy);
        deletePhrase(firstClickedPhrase);
        deletePhrase(secondClickedPhrase);
        clearClickedPhrases();
        if (spawnedPhrases.length == 0)
        {
            updateScore();
            startNextGame();
        }
    }
    else
    {
        addPoints(-pointsIncreaserEasy);
        clearClickedPhrases();
    }
}

function onPhraseClick(phraseElement) 
{
    let clickedPhrase = spawnedPhrases.find(phrase => phrase.element == phraseElement);
    clickedPhrase.changeColor(clickedColor);
    if (currentGameStep == 0)
    {
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
    else if (currentGameStep == 2)
    {
        checkForNoun(clickedPhrase);
    }
}

function addPoints(points)
{
    currentUserPoints += points;
    updatePointsCounter();
}

function deletePhrase(phrase)
{
    // Удаление совпадающих фраз из spawnedPhrases
    let index = spawnedPhrases.indexOf(phrase);
    spawnedPhrases.splice(index, 1);

    // Удаление div элемента фраз (заметно пользователю)
    phrase.element.remove();
}

function updateScore()
{
    globalUserPoints += currentUserPoints;
    username = localStorage.getItem('currentUsername');
    localStorage.setItem(username + 'globalUserPoints', globalUserPoints)

    usersScores[username] = globalUserPoints;
    localStorage.setItem('usersScores', JSON.stringify(usersScores));
}

function clearClickedPhrases()
{
    firstClickedPhrase.changeColor(unclickedColor);
    secondClickedPhrase.changeColor(unclickedColor);
    firstClickedPhrase = null;
    secondClickedPhrase = null;
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
    if (currentGameStep == 0)
        gameTaskContainer.innerText = "Задание: выбрать синонимы"
    else if (currentGameStep == 1)
        gameTaskContainer.innerText = "Задание: нажимать кнопки на клавиатуре в соответствии с показанными на экране символами"
    else if (currentGameStep == 2)
        gameTaskContainer.innerText = "Задание: выбрать ТОЛЬКО СУЩЕСТВИТЕЛЬНЫЕ"
}

function clearFields()
{
    foundNounsNumber = 0;
    totalNounsNumber = 0;
    clickedPhrasesNumber = 0;
    currentUserPoints = 0;
    digitIsClicked = false;
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

function toGame()
{
    document.location.href = "word-game.html";
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

function clearBord()
{
    spawnedPhrases.find(phrase => phrase.element.remove());
    spawnedPhrases.splice(0, spawnedPhrases.length);
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

async function lose()
{
    document.getElementById("resultContainer").style.display = "flex";
    resultContainer.innerHTML = "Вы проиграли и теряете " + losePenalty + " очков";
    await wait(2000);
    document.getElementById("resultContainer").style.display = "none";
    currentUserPoints = 0;
    addPoints(-losePenalty);
    updateScore();
    clearBord();
    startGame();
}

// Таймер
function times(numb, int_id) 
{
  var _ = numb;
  if (_ <= 0) 
  {
    if (currentGameStep == 0)
    {
        clearInterval(int_id);
        lose();
    }
  }
  return "Оставшееся время: " + _ + " секунд";
}

function interval(int_id, numb) 
{
  var span = document.getElementById(int_id);
  span.innerHTML = "Оставшееся время: " + numb + " секунд";
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

function getRandomInt(max) 
{
    return Math.floor(Math.random() * max);
}

// Движение
function translate( elem, x, y ) 
{
    var left = parseInt( css( elem, 'left' ), 10 ),
        top = parseInt( css( elem, 'top' ), 10 ),
        dx = left - x,
        dy = top - y,
        i = 1,
        count = 20,
        delay = 20;

    function loop() 
    {
        if ( i >= count ) { return; }
        i += 1;
        elem.style.left = ( left - ( dx * i / count ) ).toFixed( 0 ) + 'px';
        elem.style.top = ( top - ( dy * i / count ) ).toFixed( 0 ) + 'px';
        setTimeout( loop, delay );
    }

    loop();
}

function css( element, property ) 
{
    return window.getComputedStyle( element, null ).getPropertyValue( property );
}