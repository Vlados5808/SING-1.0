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

            totalClickCoins = data.totalClickCoins || 0; 
            document.querySelector('#totalClickCoins').textContent = totalClickCoins;

            // Устанавливаем никнейм пользователя
            const usernameElement = document.getElementById('username');
            usernameElement.textContent = data.email; 

            // Применяем сохраненные апгрейды
            if (data.upgrades && Array.isArray(data.upgrades)) {
                data.upgrades.forEach((upgradeId) => {
                    const upgrade = getUpgradeById(upgradeId);
                    if (upgrade) {
                        applyUpgradeEffect(upgrade);
                    }
                });
            }
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
let passiveIncomeInterval;

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

    // Функция для запуска пассивного дохода
    const startPassiveIncome = () => {

        passiveIncomeInterval = setInterval(() => {
            coins += passiveIncomePerSecond;
            totalClickCoins += passiveIncomePerSecond; 

            updateBalance();

            const userId = localStorage.getItem('userId');
            fetch('http://localhost:3000/passive-income', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, totalClickCoins }) 
            });

            updateBalanceOnServer();
        }, 1000);
    };


    startPassiveIncome();

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
                    console.log('Upgrade purchased successfully!');

                    // Обновление данных пользователя
                    localStorage.setItem('coins', data.balance);
                    localStorage.setItem('coinsPerClick', data.coinsPerClick);
                    localStorage.setItem('passiveIncomePerSecond', data.passiveIncomePerSecond);
                    localStorage.setItem('upgrades', JSON.stringify(data.upgrades)); // Сохраняем апгрейды

                    // Обновление отображения
                    coins = data.balance;
                    coinsPerClick = data.coinsPerClick;
                    passiveIncomePerSecond = data.passiveIncomePerSecond;

                    updateBalance();

                    // Перезапускаем пассивный доход
                    startPassiveIncome();
                })
                .catch((err) => {
                    console.error('Error purchasing upgrade:', err);
                });
        });
    });
});

// Функция для получения апгрейда по ID
const getUpgradeById = (id) => {
    const upgrades = [
        { id: 1, effect: { type: "multiplyClick", value: 10 } },
        { id: 2, effect: { type: "multiplyClick", value: 10 } },
        { id: 3, effect: { type: "addClick", value: 2 } },
        { id: 4, effect: { type: "addClick", value: 5 } },
        { id: 5, effect: { type: "multiplyPassive", value: 10 } },
        { id: 6, effect: { type: "addPassive", value: 5 } }
    ];
    return upgrades.find(upgrade => upgrade.id === id);
};

const applyUpgradeEffect = (upgrade) => {
    switch (upgrade.effect.type) {
        case 'multiplyClick':
            coinsPerClick *= upgrade.effect.value;
            break;
        case 'addClick':
            coinsPerClick += upgrade.effect.value;
            break;
        case 'multiplyPassive':
            passiveIncomePerSecond *= upgrade.effect.value;
            break;
        case 'addPassive':
            passiveIncomePerSecond += upgrade.effect.value;
            break;
        default:
            console.warn('Unknown upgrade effect:', upgrade.effect.type);
    }
};
