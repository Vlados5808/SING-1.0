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
            // Устанавливаем баланс и totalClickCoins из данных пользователя
            document.querySelector('#coins').textContent = data.balance;
            coins = data.balance;

            totalClickCoins = data.totalClickCoins || 0; // Если totalClickCoins отсутствует, устанавливаем 0
            document.querySelector('#totalClickCoins').textContent = totalClickCoins;

            // Устанавливаем никнейм пользователя
            const usernameElement = document.getElementById('username');
            usernameElement.textContent = data.email; // Используем email как никнейм
        })
        .catch(err => {
            console.error('Error fetching user data:', err);
            alert('Failed to load user data. Please try again.');
        });
});

let coins = 0;
let totalClickCoins = 0;
let coinsPerClick = 1;
let passiveIncomePerSecond = 1;

document.addEventListener('DOMContentLoaded', () => {
    const clickCoin = document.getElementById('clickCoin');
    const coinsElement = document.getElementById('coins');
    const totalClickCoinsElement = document.getElementById('totalClickCoins');
    const sounds = [
        document.getElementById('coinSound1'),
        document.getElementById('coinSound2'),
        document.getElementById('coinSound3')
    ];

    // Функция для обновления баланса на сервере
    const updateBalanceOnServer = () => {
        const userId = localStorage.getItem('userId');
        fetch('http://localhost:3000/update-balance', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, balance: coins, totalClickCoins })
        })
            .then(res => res.json())
            .then(data => {
                console.log('Balance updated on server:', data.balance);
            })
            .catch(err => {
                console.error('Error updating balance on server:', err);
            });
    };

    // Функция для обновления отображения баланса
    const updateBalance = () => {
        coinsElement.textContent = coins.toLocaleString();
        totalClickCoinsElement.textContent = totalClickCoins.toLocaleString();
    };

    // Обработка клика по монете
    clickCoin.addEventListener('click', () => {
        coins += coinsPerClick;
        totalClickCoins += coinsPerClick;

        updateBalance();

        const userId = localStorage.getItem('userId');
        fetch('http://localhost:3000/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, type: 'manual', totalClickCoins })
        });

        updateBalanceOnServer();

        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        randomSound.play();
    });

    // Автоматическое добавление пассивного дохода
    setInterval(() => {
        coins += passiveIncomePerSecond;
        totalClickCoins += passiveIncomePerSecond; // Увеличиваем totalClickCoins для автоматических кликов

        updateBalance();

        const userId = localStorage.getItem('userId');
        fetch('http://localhost:3000/passive-income', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId, totalClickCoins }) // Отправляем totalClickCoins на сервер
        });

        updateBalanceOnServer();
    }, 1000);

    // Обработка покупки апгрейдов
    document.querySelectorAll('.upgrade-card-button').forEach((button, index) => {
        button.addEventListener('click', () => {
            const userId = localStorage.getItem('userId');
            const upgradeId = index + 1;

            fetch('http://localhost:3000/buy-upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, upgradeId }),
            })
                .then((res) => {
                    if (!res.ok) {
                        throw res;
                    }
                    return res.json();
                })
                .then((data) => {
                    alert('Upgrade purchased successfully!');

                    // Обновление данных пользователя
                    localStorage.setItem('coins', data.balance);
                    localStorage.setItem('coinsPerClick', data.coinsPerClick);
                    localStorage.setItem('passiveIncomePerSecond', data.passiveIncomePerSecond);
                    localStorage.setItem('upgrades', JSON.stringify(data.upgrades));

                    // Обновление отображения
                    coins = data.balance;
                    coinsPerClick = data.coinsPerClick;
                    passiveIncomePerSecond = data.passiveIncomePerSecond;

                    updateBalance();
                })
                .catch((err) => {
                    if (err.status === 404) {
                        alert('User or upgrade not found!');
                    } else if (err.status === 400) {
                        alert('Insufficient funds!');
                    } else if (err.status === 409) {
                        alert('Effect not supported!');
                    } else {
                        alert('An error occurred. Please try again.');
                    }
                });
        });
    });
});
