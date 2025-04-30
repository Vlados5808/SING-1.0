document.addEventListener('DOMContentLoaded', () => {
    const roundImage = document.querySelector('.coin');

    roundImage.addEventListener('click', () => {
        roundImage.style.transform = 'scale(0.9)';
        setTimeout(() => {
            roundImage.style.transform = 'scale(1)';
        }, 200);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const clickCoin = document.getElementById('clickCoin');
    const coinsElement = document.getElementById('coins');
    const totalClickCoinsElement = document.getElementById('totalClickCoins');

    let coins = parseInt(coinsElement.textContent.replace(/\s/g, ''));
    let totalClickCoins = parseInt(totalClickCoinsElement.textContent.replace(/\s/g, ''));

    clickCoin.addEventListener('click', () => {
        coins += 1;
        totalClickCoins += 1;

        coinsElement.textContent = coins.toLocaleString();
        totalClickCoinsElement.textContent = totalClickCoins.toLocaleString();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const roundImage = document.querySelector('.coin');
    const coinSound = document.getElementById('coinSound');

    roundImage.addEventListener('click', () => {
        roundImage.style.transform = 'scale(0.9)';
        coinSound.play(); 
        setTimeout(() => {
            roundImage.style.transform = 'scale(1)';
        }, 200);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const roundImage = document.querySelector('.coin');
    const sounds = [
        document.getElementById('coinSound1'),
        document.getElementById('coinSound2'),
        document.getElementById('coinSound3')
    ];

    roundImage.addEventListener('click', () => {
        roundImage.style.transform = 'scale(0.9)';
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        randomSound.play(); 
        setTimeout(() => {
            roundImage.style.transform = 'scale(1)';
        }, 200);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const clickCoin = document.getElementById('clickCoin');
    const coinsElement = document.getElementById('coins');
    const totalClickCoinsElement = document.getElementById('totalClickCoins');
    const sounds = [
        document.getElementById('coinSound1'),
        document.getElementById('coinSound2'),
        document.getElementById('coinSound3')
    ];

    let coins = parseInt(coinsElement.textContent.replace(/\s/g, ''));
    let totalClickCoins = parseInt(totalClickCoinsElement.textContent.replace(/\s/g, ''));

    clickCoin.addEventListener('click', () => {
        coins += 1;
        totalClickCoins += 1;

        coinsElement.textContent = coins.toLocaleString();
        totalClickCoinsElement.textContent = totalClickCoins.toLocaleString();
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        randomSound.play(); // Воспроизведение случайного звука
    });
});