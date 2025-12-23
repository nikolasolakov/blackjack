
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const suits = ["C", "D", "H", "S"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const cardsPlayer = [];
const cardsDealer = [];
const deck = [];
let offsetD = 1;
let offsetP = 1;
let started = false;
let playerChips = 1000;
let currBet = 0;
function startGame() {
    offset = 1;
    deck.length = 0;
    for (const suit of suits) {
        for (const value of values) {
            const img = new Image();
            img.src = `cards/${value}-${suit}.png`;
            deck.push({ value, suit, image: img });
        }
    }

    for (const c of cardsPlayer) {
        if (c.element && typeof c.element.remove === "function") c.element.remove();
    }
    for (const c of cardsDealer) {
        if (c.element && typeof c.element.remove === "function") c.element.remove();
    }
    cardsPlayer.length = 0;
    cardsDealer.length = 0;
    startRound();
}

async function endRound(type, win) {
    started=false;
    if(win===1){
        playerChips += currBet*2;
        currBet=0;
        changeChips();
    }else if(win===0){
        currBet=0;
    }else if(win===2){
        playerChips += currBet*1.5;
        changeChips();

    }
    const endText = document.getElementById("end");
    endText.textContent = type;
    document.body.classList.add("ended");
    await sleep(300);
    endText.classList.add("show");
    await sleep(2000);
    endText.classList.remove("show");
    await sleep(2000);
    document.body.classList.remove("ended");
}

function hand(pl) {
    const arr = pl === "d" ? cardsDealer : cardsPlayer;
    let sum = 0;
    let aces = 0;
    for (const cardObj of arr) {
        const v = cardObj.value;
        if (v === "A") {
            sum += 11;
            aces++;
        } else if (v === "J" || v === "Q" || v === "K") {
            sum += 10;
        } else {
            sum += parseInt(v, 10);
        }
    }

    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }
    return sum;
}
async function startRound() {
    if(started) {
        return;
    }
    offsetP=1;
    offsetD=1;
    for (const c of cardsPlayer) {
        if (c.element && typeof c.element.remove === "function") c.element.remove();
    }
    for (const c of cardsDealer) {
        if (c.element && typeof c.element.remove === "function") c.element.remove();
    }
    cardsPlayer.length = 0;
    cardsDealer.length = 0;
    offset = 1;
    started=true;
    for (let i = 0; i < 2; i++) {
        deal("p");
        await sleep(500);
    }
    dealerFirst();
    await sleep(500);
    deal("d");
    await sleep(500);

    const playerSum = hand("p");

    if(playerSum === 21){
        endRound("Blackjack! You win!", 2);
    }
}
async function hit() {
    if (!started) {
        return;
    }
    deal("p");
    await sleep(1500);
    const playerSum = hand("p");
    if (playerSum > 21) {
        endRound("Bust! Dealer wins!", 0);
    }else if(playerSum===21){
        endRound("Blackjack! You win!", 2);
    }
}
async function stand() {
    if (!started) {
        return;
    }
    cardsDealer[0].element.style.backgroundImage = cardsDealer[0].bg;
    await sleep(500);
    let dealerSum = hand("d");
    let playerSum = hand("p");
    while (dealerSum <= 16) {
        deal("d");
        await sleep(1500);
        dealerSum = hand("d")
    }
    if ((dealerSum === 21 || dealerSum >= playerSum) && dealerSum <= 21) {
        endRound("Dealer wins!", 0);
    }else if(playerSum===21){
        endRound("Blackjack, You win!", 2);
    }else{
        endRound("You win!", 1);

    }
}
function deal(pl) {
    const card = drawCard();
    if (!started) return;

    const karta = document.createElement("div");
    karta.classList.add("card");
    karta.classList.remove("slide");
    void karta.offsetWidth;
    karta.classList.add("slide");
    karta.style.position = "absolute";

    if (pl === "d") {
        karta.style.backgroundImage = "url(" + card.image.src + ")";
        karta.style.left = `${offsetD + 45}%`;
        karta.style.top = `5%`;
        cardsDealer.push({ value: card.value, element: karta  , bg: "url(" + card.image.src + ")"});
        document.body.appendChild(karta);
        offsetD+=4;
    }else if(pl === "p") {
        karta.style.backgroundImage = "url(" + card.image.src + ")";
        karta.style.left = `${offsetP + 45}%`;
        karta.style.top = `75%`;
        cardsPlayer.push({ value: card.value, element: karta , bg: "url(" + card.image.src + ")"});
        document.body.appendChild(karta);
        offsetP+=4;

    }

}

function drawCard() {
    if (deck.length === 0) {
        alert("No more cards left!");
        return null;
    }
    changeDeckSize();
    const index = Math.floor(Math.random() * deck.length);
    return deck.splice(index, 1)[0];
}

function changeDeckSize() {
    document.getElementById("deckSize").innerHTML = deck.length-1;
}
function dealerFirst() {
    const card = drawCard();
    const karta = document.createElement("div");
    karta.classList.add("card");
    karta.classList.remove("slide");
    karta.classList.add("flip");

    void karta.offsetWidth;
    karta.classList.add("slide");
    karta.style.position = "absolute";
    karta.style.backgroundImage = "url(cards/BR2.png)";
    karta.style.left = `${offsetD + 45}%`;
    offsetD+=4;
    karta.style.top = `5%`;
    cardsDealer.push({ value: card.value, element: karta  , bg: "url(" + card.image.src + ")"});
    document.body.appendChild(karta);
}
function addBet(bet){
    if(playerChips<bet){
        alert("Not enough chips!");
        return;
    }
    if(!started){
        currBet+=bet;
        playerChips-=bet;
        changeChips();
    }
}
function changeChips(){
    document.getElementById("chips").innerHTML = playerChips.toString();
}