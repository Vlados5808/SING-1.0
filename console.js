document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.querySelector('input[type="email"]').value;
        const password = document.querySelector('#password').value;

        console.log('Email:', email);
        console.log('Password:', password);
        fetch('http://localhost:3000/sign-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        }).then(response => {
            return response.json();
        }).then(data => {
            console.log(data);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userEmail', data.user.email); 
            window.location.href = 'coin/coin.html'; 
        });
    });
});
