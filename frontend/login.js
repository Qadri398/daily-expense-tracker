async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (!username || !password) {
        document.getElementById("error").innerText = "Enter all fields!";
        return;
    }

    try {
        let res = await fetch("https://daily-expense-tracker.onrender.com/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        let data = await res.json();

        if (data.status === "success") {
            localStorage.setItem("user_id", data.user_id);
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("error").innerText = "Wrong login!";
        }

    } catch (error) {
        document.getElementById("error").innerText = "Server error!";
        console.error(error);
    }
}
async function signup() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (!username || !password) {
        document.getElementById("error").innerText = "Enter all fields!";
        return;
    }

    let res = await fetch("https://daily-expense-tracker.onrender.com/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    let data = await res.json();

    if (data.status === "success") {
        alert("Account created! Now login");
    } else {
        document.getElementById("error").innerText = data.message;
    }
}