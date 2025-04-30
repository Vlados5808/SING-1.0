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

// UPGRADES //


// Отримати список усіх апгрейдів//
app.get('/upgrades', (req, res) => {
  res.status(200).json(upgrades);
});

// Отримати один апгрейд за ID
app.get('/upgrades/:id', (req, res) => {
  const upgrade = upgrades.find((u) => u.id === parseInt(req.params.id));
  if (!upgrade) {
    return res.status(404).json({ message: 'Upgrade not found!' });
  }
  res.status(200).json(upgrade);
});

// Додати новий апгрейд
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

// Оновити апгрейд за ID
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

// Видалити апгрейд за ID
app.delete('/upgrades/:id', (req, res) => {
  const index = upgrades.findIndex((u) => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Upgrade not found!' });
  }
  upgrades.splice(index, 1);
  res.status(204).send();
});

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
    return res.status(409).json({ message: 'User with this email already exists!' }); // 409 Conflict
  }

  users.push({ email, password: encodePassword(password) });
  res.status(201).json({ message: 'Реєстрація успішна!' });
});

// Авторизація користувача
app.post('/sign-in', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required!' });
  }

  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ message: 'User with this email does not exist!' });
  }
  res.status(200).json({ message: 'Авторизація успішна!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
