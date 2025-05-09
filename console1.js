function signIn(event) {
    event.preventDefault(); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Invalid email or password');
        }
        return res.json();
    })
    .then(data => {
        console.log(data); 
        if (data.id) {
            localStorage.setItem('userId', data.id); 
            localStorage.setItem('userEmail', data.email); 
            window.location.href = 'coin/coin.html';
        } else {
            alert('Помилка входу');
        }
    });
}
