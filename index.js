const express = require('express');
const cors = require('cors');
const encodePassword = require('./hash').encodePassword;

const app = express();

let users = [];
let upgrades = [
    { id: 1, name: "Click Accelerator", description: "Speed of earning x10", price: 40000, effect: { type: "multiplyClick", value: 10 } },
    { id: 2, name: "Coin Multiplier", description: "ClickCoins per click x10", price: 40000, effect: { type: "multiplyClick", value: 10 } },
    { id: 3, name: "Power Tap", description: "ClickCoins per click +2", price: 10000, effect: { type: "addClick", value: 2 } },
    { id: 4, name: "Golden Touch", description: "Random bonus on click", price: 40000, effect: { type: "addClick", value: 5 } },
    { id: 5, name: "Coin Stream", description: "Passive income x10", price: 40000, effect: { type: "multiplyPassive", value: 10 } },
    { id: 6, name: "Mining Drone", description: "Automated clicks for 1 min", price: 100000, effect: { type: "addPassive", value: 5 } }
];

app.use(cors());
app.use(express.json());

function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}

// Реєстрація користувача
app.post('/sign-up', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required!' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password length should be minimum 8 symbols!' });
    }
    if (users.find((user) => user.email === email)) {
        return res.status(409).json({ message: 'User with this email already exists!' });
    }

    const newUser = {
        id: generateUniqueId(),
        email,
        password: encodePassword(password),
        balance: 10000000,
        coinsPerClick: 1,
        passiveIncomePerSecond: 0,
        upgrades: [] // Зберігаємо апгрейди для кожного користувача
    };

    users.push(newUser);
    res.status(201).json({ message: 'User registered successfully!', user: { id: newUser.id, email: newUser.email } });
});

// Авторизація
app.post('/sign-in', (req, res) => {
    const { email, password } = req.body;
    const user = users.find((user) => user.email === email && user.password === encodePassword(password));
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.status(200).json({
        message: 'Sign in successful!',
        id: user.id,
        email: user.email,
        balance: user.balance,
        coinsPerClick: user.coinsPerClick,
        passiveIncomePerSecond: user.passiveIncomePerSecond,
        upgrades: user.upgrades
    });
});

// Отримати користувача
app.get('/user/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found!' });
    }
    res.status(200).json({
        id: user.id,
        email: user.email,
        balance: user.balance,
        coinsPerClick: user.coinsPerClick,
        passiveIncomePerSecond: user.passiveIncomePerSecond,
        upgrades: user.upgrades
    });
});

// Додати монети за клік
app.post('/click', (req, res) => {
    const { id, type } = req.body;
    const user = users.find((user) => user.id === id);
    if (!user) {
        return res.status(404).json({ message: 'User not found!' });
    }
    user.balance += user.coinsPerClick;
    res.status(200).json({ message: 'Coins added!', balance: user.balance, type });
});

// Пасивний дохід
app.post('/passive-income', (req, res) => {
    const { id } = req.body;

    const user = users.find((user) => user.id === id);
    if (!user) {
        return res.status(404).json({ message: 'User not found!' });
    }

    user.balance += user.passiveIncomePerSecond;
    res.status(200).json({ message: 'Passive income added!', balance: user.balance });
});

// Оновити баланс
app.put('/update-balance', (req, res) => {
    const { id, balance } = req.body;

    const user = users.find((user) => user.id === id);
    if (!user) {
        return res.status(404).json({ message: 'User not found!' });
    }

    user.balance = balance;
    res.status(200).json({ message: 'Balance updated successfully!', balance: user.balance });
});

// Покупка апгрейда
app.post('/buy-upgrade', (req, res) => {
    const { userId, upgradeId } = req.body;

    // Знайти користувача
    const user = users.find((u) => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found!' });
    }

    // Знайти апгрейд
    const upgrade = upgrades.find((u) => u.id === upgradeId);
    if (!upgrade) {
        return res.status(404).json({ message: 'Upgrade not found!' });
    }

    // Перевірити баланс користувача
    if (user.balance < upgrade.price) {
        return res.status(400).json({ message: 'Insufficient funds!' });
    }

    // Застосувати ефект апгрейду
    try {
        switch (upgrade.effect.type) {
            case 'multiplyClick':
                user.coinsPerClick *= upgrade.effect.value;
                break;
            case 'addClick':
                user.coinsPerClick += upgrade.effect.value;
                break;
            case 'multiplyPassive':
                user.passiveIncomePerSecond *= upgrade.effect.value;
                break;
            case 'addPassive':
                user.passiveIncomePerSecond += upgrade.effect.value;
                break;
            default:
                return res.status(409).json({ message: 'Effect not supported!' });
        }

        // Зняти монети з балансу
        user.balance -= upgrade.price;
        if (!user.upgrades.includes(upgradeId)) {
            user.upgrades.push(upgradeId);
        }

        res.status(200).json({
            message: 'Upgrade purchased successfully!',
            balance: user.balance,
            coinsPerClick: user.coinsPerClick,
            passiveIncomePerSecond: user.passiveIncomePerSecond,
            upgrades: user.upgrades
        });
    } catch (error) {
        console.error('Error applying upgrade effect:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
});

// Отримати апгрейди
app.get('/upgrades', (req, res) => {
    res.status(200).json(upgrades);
});

app.get('/upgrades/:id', (req, res) => {
    const upgrade = upgrades.find((u) => u.id === parseInt(req.params.id));
    if (!upgrade) {
        return res.status(404).json({ message: 'Upgrade not found!' });
    }
    res.status(200).json(upgrade);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
