var container = document.getElementById('container');
var lastId = -1;
var originalColors = ['#27ae60', '#2980b9', /*'#3498db',*/ '#8e44ad', '#e67e22', '#c0392b'];
var colors = originalColors.slice();
var amountOfFixedMessages = 1;
var lastUsedColor;

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
    div.appendChild(paragraph);

    return div;
}

function addMessage(message) {

    var div = createMessageDOM(message);
    container.insertBefore(div, container.children[amountOfFixedMessages]);

    var animate = function (div, message) {
        setTimeout(() => {
            div.style['max-height'] = '1000px';
            div.style['margin'] = '5px';
            div.style['padding'] = '5px 5px 5px 0';

            if (lastId === message.id) {
                div.classList.add('new1');
                container.children[2].classList.remove('new1');
                container.children[2].classList.add('new2');
                container.children[3].classList.remove('new2');
                container.children[3].classList.add('new3');
                container.children[4].classList.remove('new4');
            }
        }, 100);
    };

    animate(div, message);
}

pollForNewMessages(true);

setInterval(() => pollForNewMessages(false), 1000);

doStuff();
