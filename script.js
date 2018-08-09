var lastId = -1;
var originalColors = ['#27ae60', '#2980b9', /*'#3498db',*/ '#8e44ad', '#e67e22', '#c0392b'];
var colors = originalColors.slice();
var amountOfFixedMessages = 1;
var lastUsedColor;

var pollHappening = false;
var pollTimeStarted;
var pollTimeInMs;

var pollContainer = document.getElementById('pollContainer');
var messagesContainer = document.getElementById('messagesContainer');
var pollQuestionDiv = document.getElementById('pollQuestion');
var pollAnswersDiv = document.getElementById('pollAnswers');
var pollTimeDiv = document.getElementById('pollTime');
var chartCanvas = document.getElementById('chartCanvas');
var pollAnswers = [];

function getPollTimeRemaining() {
    return +pollTimeStarted + (+pollTimeInMs * 1000) - Date.now();
}

function pollForNewMessages() {
    fetch('/messages?from=' + (lastId + 1))
        .then(toJson)
        .then(messages => messages.map(logLastId).forEach(addMessage));
}

function toJson(response) {
    return response.json();
}

function logLastId(message) {
    lastId = message.id;
    return message;
}

function createMessageDOM(message) {

    if (colors.length === 0)
        colors = originalColors.slice();
    var randomColorIndex;
    do {
        randomColorIndex = Math.floor(Math.random() * colors.length);
    } while (colors[randomColorIndex] === lastUsedColor);
    lastUsedColor = colors[randomColorIndex];


    var div = document.createElement('div');
    div.className = 'message';
    div.style['background-color'] = colors[randomColorIndex];
    colors.splice(randomColorIndex, randomColorIndex + 1);

    var img = document.createElement('img');
    img.src = 'lissa.svg';
    div.appendChild(img);

    var paragraph = document.createElement('p');
    paragraph.innerHTML = message.content;
    if (message.content.startsWith('/poll')
        && !pollHappening
        && (+message.timeReceived + (+message.content.split(';')[2] * 1000)) > +Date.now())
        startPoll(message);
    else if (pollHappening)
        chart(message);
    div.appendChild(paragraph);

    return div;
}

function chart(message) {
    if ((+message.content - 1) < pollAnswers.length) {
        pollAnswers[+message.content]++;
        var ctx = chartCanvas.getContext('2d');
        ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
        var bars = pollAnswers.length;
        var spacePerBar = Math.floor(chartCanvas.width / bars);
        console.log(spacePerBar);
        pollAnswers.forEach((amount, index) => {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect((index - 1) * spacePerBar + 20, chartCanvas.height - (10 * +amount), spacePerBar - 20, 10 * +amount);
        });
    }
}

function setPollDOM(question, answers) {
    var questionParagraph = document.createElement('p');
    pollQuestionDiv.style['max-height'] = '1000px';
    pollQuestionDiv.style['margin'] = '15px';
    pollQuestionDiv.style['padding'] = '10px 10px 10px 10px';
    pollQuestionDiv.style['background-color'] = originalColors[1];
    questionParagraph.innerHTML = 'Vraag: ' + question;
    pollQuestionDiv.appendChild(questionParagraph);

    answers.map((answer, index) => {
        var div = document.createElement('div');
        var p = document.createElement('p');
        div.classList.add('message');
        div.style['max-height'] = '1000px';
        div.style['margin'] = '15px';
        div.style['padding'] = '10px 10px 10px 10px';
        div.style['background-color'] = originalColors[2];
        p.innerHTML = (index + 1) + ": " + answer;
        div.appendChild(p);
        return div;
    }).forEach(div => pollAnswersDiv.appendChild(div));


    var timeParagraph = document.createElement('p');
    pollTimeDiv.style['max-height'] = '1000px';
    pollTimeDiv.style['margin'] = '15px';
    pollTimeDiv.style['padding'] = '10px 10px 10px 10px';
    pollTimeDiv.style['background-color'] = originalColors[1];
    timeParagraph.innerHTML = '' + getPollTimeRemaining();
    pollTimeDiv.appendChild(timeParagraph);

    var interval = setInterval(() => {
        if (getPollTimeRemaining() > 0) timeParagraph.innerHTML = '' + Math.ceil(getPollTimeRemaining() / 1000);
        else {
            timeParagraph.innerHTML = 'Gedaan!';
            clearInterval(interval);
        }
    }, 1);
}

function resetPollDOM() {
    pollQuestionDiv.innerHTML = '';
    pollAnswersDiv.innerHTML = '';
    pollTimeDiv.innerHTML = '';
}

function startPoll(message) {

    var question = message.content.split(';')[1];
    pollTimeInMs = message.content.split(';')[2];
    pollTimeStarted = message.timeReceived;
    var answers = message.content.split(';').slice(3);
    answers.forEach(a => pollAnswers.push(0));

    pollHappening = true;

    pollContainer.style['max-width'] = '60%';
    messagesContainer.style['max-width'] = '40%';

    setPollDOM(question, answers);

    setTimeout(() => {
        setTimeout(() => {
            pollContainer.style['max-width'] = '0';
            messagesContainer.style['max-width'] = '100%';
            setTimeout(() => {
                pollHappening = false;
                resetPollDOM();
            }, 1000);
        }, 2500);
    }, getPollTimeRemaining());
}

function addMessage(message) {

    var div = createMessageDOM(message);
    messagesContainer.insertBefore(div, messagesContainer.children[amountOfFixedMessages]);

    var animate = function (div, message) {
        setTimeout(() => {
            div.style['max-height'] = '1000px';
            div.style['margin'] = '15px';
            div.style['padding'] = '10px 10px 10px 0';

            if (lastId === message.id) {
                div.classList.add('new1');
                messagesContainer.children[2].classList.remove('new1');
                messagesContainer.children[2].classList.add('new2');
                messagesContainer.children[3].classList.remove('new2');
                messagesContainer.children[3].classList.add('new3');
                messagesContainer.children[4].classList.remove('new4');
            }
        }, 100);
    };

    animate(div, message);
}

pollForNewMessages(true);

setInterval(() => pollForNewMessages(false), 1000);

doStuff();
