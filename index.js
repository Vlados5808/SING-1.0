const express = require('express');
const cors = require('cors');
const encodePassword = require('./hash').encodePassword;

const app = express();

let users = [];
let upgrades = [
    { id: 1, name: "Click Accelerator", description: "Speed of earning x10", price: 40000 },
    { id: 2, name: "Coin Multiplier", description: "ClickCoins per click x10", price: 40000 },
    { id: 3, name: "Power Tap", description: "ClickCoins per click x2", price: 10000 },
    { id: 4, name: "Golden Touch", description: "Random bonus on click", price: 40000 },
    { id: 5, name: "Coin Stream", description: "Passive income x10", price: 40000 },
    { id: 6, name: "Mining Drone", description: "Automated clicks for 1 min", price: 100000 }
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
        balance: 0,
        coinsPerClick: 1,
        passiveIncomePerSecond: 0
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
        passiveIncomePerSecond: user.passiveIncomePerSecond
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
        passiveIncomePerSecond: user.passiveIncomePerSecond
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

app.post('/upgrades', (req, res) => {
    const { id, name, description, price } = req.body;

    if (!id || !name || !description || !price) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    if (upgrades.find((u) => u.id === id)) {
        return res.status(409).json({ message: 'Upgrade with this ID already exists!' });
    }

    const newUpgrade = { id, name, description, price };
    upgrades.push(newUpgrade);
    res.status(201).json({ message: 'Upgrade added successfully!', upgrade: newUpgrade });
});

app.put('/upgrades/:id', (req, res) => {
    const { name, description, price } = req.body;
    const upgrade = upgrades.find((u) => u.id === parseInt(req.params.id));

    if (!upgrade) {
        return res.status(404).json({ message: 'Upgrade not found!' });
    }

    if (name) upgrade.name = name;
    if (description) upgrade.description = description;
    if (price) upgrade.price = price;

    res.status(200).json({ message: 'Upgrade updated successfully!', upgrade });
});

app.delete('/upgrades/:id', (req, res) => {
    const index = upgrades.findIndex((u) => u.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ message: 'Upgrade not found!' });
    }
    upgrades.splice(index, 1);
    res.status(204).send();
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
