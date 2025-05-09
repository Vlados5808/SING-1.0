document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('User not logged in!');
        window.location.href = '/Sing_up.html';
        return;
    }

    fetch(`http://localhost:3000/user/${userId}`)
        .then(res => res.json())
        .then(data => {
            document.querySelector('#coins').textContent = data.balance;
            coins = data.balance;
        })
        .catch(err => {
            console.error('Error fetching user data:', err);
            alert('Failed to load user data. Please try again.');
        });
});

let coins = 0;
let totalClickCoins = 0;
const coinsPerClick = 1;
const passiveIncomePerSecond = 1;

document.addEventListener('DOMContentLoaded', () => {
    const clickCoin = document.getElementById('clickCoin');
    const coinsElement = document.getElementById('coins');
    const totalClickCoinsElement = document.getElementById('totalClickCoins');
    const usernameElement = document.getElementById('username');
    const sounds = [
        document.getElementById('coinSound1'),
        document.getElementById('coinSound2'),
        document.getElementById('coinSound3')
    ];

    const email = localStorage.getItem('userEmail');
    if (email) {
        usernameElement.textContent = email;
    }

    const updateBalanceOnServer = () => {
        const userId = localStorage.getItem('userId');
        fetch('http://localhost:3000/update-balance', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, balance: coins })
        })
            .then(res => res.json())
            .then(data => {
                console.log('Balance updated on server:', data.balance);
            })
            .catch(err => {
                console.error('Error updating balance on server:', err);
            });
    };

    const updateBalance = () => {
        coinsElement.textContent = coins.toLocaleString();
        totalClickCoinsElement.textContent = totalClickCoins.toLocaleString();
    };

    clickCoin.addEventListener('click', () => {
        coins += coinsPerClick;
        totalClickCoins += coinsPerClick;

        updateBalance();

        const userId = localStorage.getItem('userId');
        fetch('http://localhost:3000/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, type: 'manual' })
        });

        updateBalanceOnServer();

        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        randomSound.play();
    });

    setInterval(() => {
        coins += passiveIncomePerSecond;
        totalClickCoins += passiveIncomePerSecond;

        updateBalance();

        const userId = localStorage.getItem('userId');
        fetch('http://localhost:3000/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, type: 'auto' })
        });

        updateBalanceOnServer();
    }, 1000);
});
