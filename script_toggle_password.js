const togglePassword = () => {
    const passwordInput = document.getElementById("password");
    const eyes = document.getElementById("eyes");

    if (passwordInput.type === "text") {
        passwordInput.type = "password";
        eyes.src = "images/eye-closed.png";
    } else {
        passwordInput.type = "text";
        eyes.src = "images/eye-open.png";
    }
};
