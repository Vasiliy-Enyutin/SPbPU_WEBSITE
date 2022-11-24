var rusPhrases  = 
[
    "Привычка - вторая натура",
    "Заметьте хорошо!",
    "Беда не приходит одна",
    "Через тернии к звёздам"
];
var italPhrases = 
[
    "Consuetudo est altera natura",
    "Nota bene",
    "Nulla calamitas sola",
    "Per aspera ad astra"
]
var content;

var unmovedPhrases = [];
var movedPhrases = [];
var italPhrasesOrder = [];

var phrasesCounter = 0;

function initial() 
{
    content = document.getElementById("content");
}

function onPhraseClick(phrase) 
{
    let clickedPhrase;
    let indexNumber;
    for (var i = 0; i < unmovedPhrases.length; i++) 
    {
        if (unmovedPhrases[i] == phrase)
        {
            indexNumber = i;
            clickedPhrase = unmovedPhrases[i];
            clickedPhrase.innerText = italPhrases[italPhrasesOrder[i]];
        }
    }

    movePhrase(clickedPhrase, indexNumber);
}

function spawnPhrase() 
{
    if (phrasesCounter >= rusPhrases.length)
    {
        document.getElementById("phrasesEnded").style.display = "block";
        return;
    }

    let phrase = getPhrase();

    let phraseRandomIndex;
    let rusPhrase;
    while (rusPhrase == null)
    {
        phraseRandomIndex = Math.floor(Math.random() * rusPhrases.length);

        let equal = false;
        for (var i = 0; i < italPhrasesOrder.length; i++) 
        {
            if (italPhrasesOrder[i] == phraseRandomIndex)
            {
                equal = true;
                break;
            }
        }
        if (equal == true)
            continue;

        rusPhrase = rusPhrases[phraseRandomIndex];
        italPhrasesOrder.push(phraseRandomIndex);
    }
    phrase.innerText = rusPhrase;
    phrasesCounter++;
    unmovedPhrases.push(phrase);
    content.appendChild(phrase);
}

function movePhrase(phrase, indexNumber) 
{
    if (indexNumber % 2 == 0) 
        translate(phrase, 50, phrase.y);
    else 
        translate(phrase, content.getBoundingClientRect().right - content.getBoundingClientRect().left - 50, phrase.y);

    movedPhrases.push(phrase);
}

function colorUnmovedPhrases() 
{
    let phrasesForColor = [];
    for (var i = 0; i < unmovedPhrases.length; i++)
    {
        if (movedPhrases.length == 0)
        {
            phrasesForColor.push(unmovedPhrases[i])
            continue;
        }
        let needToColor = true;
        for (var j = 0; j < movedPhrases.length; j++)
        {
            if (unmovedPhrases[i] == movedPhrases[j])
                needToColor = false;
        } 
        if (needToColor)
            phrasesForColor.push(unmovedPhrases[i])
    } 
    phrasesForColor.forEach(element => { element.style.backgroundColor = "yellow"; });
}

function getPhrase() 
{
    let phrase = document.createElement("div");
    phrase.setAttribute("class", "phrase");
    phrase.style.top = `${Math.random() * 100}%`;
    phrase.style.left = `${Math.random() * 100}%`;
    phrase.style.backgroundColor = "#f6bf6d";
    phrase.setAttribute("onClick", "onPhraseClick(this)");
    return phrase;
}

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