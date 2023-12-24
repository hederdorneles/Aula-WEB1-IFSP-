document.addEventListener('DOMContentLoaded', function () {
    const images = ['./img/koala.png', './img/bee.png', './img/cow.png', 
                    './img/dog.png', './img/fox.png', './img/frog.png', 
                    './img/turtle.png', './img/whale.png'];

  const shuffledImages = [...images, ...images].sort(() => Math.random() - 0.5);

  const memoryGame = document.getElementById('memoryGame');
  const message = document.getElementById('message');
  const restartBtn = document.getElementById('restartBtn');

  shuffledImages.forEach(image => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.card = image;

    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';

    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    //cardFront.textContent = 'Frente';
    cardFront.style.backgroundSize = 'cover';
    cardFront.style.backgroundImage = `url(./img/memory.png)`;
    

    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    // Definir a imagem como plano de fundo
    cardBack.style.backgroundSize = 'cover';
    cardBack.style.backgroundImage = `url(${image})`; 

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    card.addEventListener('click', flipCard);
    memoryGame.appendChild(card);
  });
  
    let flippedCards = [];
    
    function flipCard() {
      if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        this.classList.add('flipped');
        flippedCards.push(this);
  
        if (flippedCards.length === 2) {
          setTimeout(checkMatch, 500);
        }
      }
    }
  
    function checkMatch() {
      const [card1, card2] = flippedCards;
      const image1 = card1.dataset.card;
      const image2 = card2.dataset.card;
  
      if (image1 === image2) {
        // Matched
        flippedCards = [];
        checkWin();
      } else {
        // Not matched
        flippedCards.forEach(card => card.classList.remove('flipped'));
        flippedCards = [];
      }
    }
  
    function checkWin() {
      const allCards = document.querySelectorAll('.card');
      const flippedCount = document.querySelectorAll('.flipped').length;
  
      if (flippedCount === allCards.length) {
        // All cards are flipped
        message.style.display = 'block';
        restartBtn.style.display = 'block';
      }
    }
  
    restartBtn.addEventListener('click', restartGame);
  
    function restartGame() {
      message.style.display = 'none';
      restartBtn.style.display = 'none';
      
      flippedCards = [];
  
      const allCards = document.querySelectorAll('.card');
      allCards.forEach(card => {
        card.classList.remove('flipped');
      });
  
      // Shuffle and reset the game
      shuffledImages.sort(() => Math.random() - 0.5);
      allCards.forEach((card, index) => {
        card.dataset.card = shuffledImages[index];
        card.querySelector('.card-back').textContent = shuffledImages[index];
      });
    }
  });
  
