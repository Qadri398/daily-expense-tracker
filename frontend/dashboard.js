let user_id = localStorage.getItem("user_id");

if (!user_id) {
    window.location.href = "index.html";
}

let chart;

// 🌙 DARK MODE
function toggleMode() {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

// ➕ ADD
async function addExpense() {
    let amount = document.getElementById("amount").value;
    let category = document.getElementById("category").value;

if (category === "Other") {
    category = document.getElementById("otherCategory").value;
}
let date = document.getElementById("date").value;

// 🚫 Prevent future date
let today = new Date().toISOString().split("T")[0];

if (date > today) {
    alert("Future date is not allowed!");
    return;
}
    if (!amount || !category || !date) {
        alert("Fill all fields");
        return;
    }

    await fetch("https://daily-expense-tracker.onrender.com/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id,
            amount,
            category,
            date
        })
    });

    loadExpenses();
}

// 📅 Format Date
function formatDate(dateStr) {
    let d = new Date(dateStr);

    let day = d.getDate();
    let month = d.toLocaleString('default', { month: 'short' });
    let year = d.getFullYear();

    return `${day} ${month} ${year}`;
}

// 📥 LOAD + FILTER
async function loadExpenses() {
    let res = await fetch(`https://daily-expense-tracker.onrender.com/expenses/${user_id}`);
    let expenses = await res.json();

    let monthFilter = document.getElementById("monthFilter").value;
    let yearFilter = document.getElementById("yearFilter").value;

    let list = document.getElementById("expenseList");
    list.innerHTML = "";

    let total = 0;
    let categoryData = {};

    expenses.forEach(e => {
        let d = new Date(e.date);
        let month = d.getMonth();
        let year = d.getFullYear();

        // ✅ FILTER APPLY
        if (
            (monthFilter === "" || month == monthFilter) &&
            (yearFilter === "" || year == yearFilter)
        ) {
            total += e.amount;

            let li = document.createElement("li");

            li.innerHTML = `
                <div>
                    <strong>₹${e.amount}</strong> - ${e.category}<br>
                    <small>${formatDate(e.date)}</small>
                </div>
                <span class="delete" onclick="deleteExpense(${e.id})">❌</span>
            `;

            list.appendChild(li);

            categoryData[e.category] =
                (categoryData[e.category] || 0) + e.amount;
        }
    });

    document.getElementById("totalAmount").innerText = total;

    loadChart(categoryData);
}

// ❌ DELETE
async function deleteExpense(id) {
    await fetch(`https://daily-expense-tracker.onrender.com/delete/${id}`, {
        method: "DELETE"
    });

    loadExpenses();
}

// 📊 CHART
function loadChart(data) {
    let ctx = document.getElementById("chart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data)
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: document.body.classList.contains("dark")
                            ? "#fff"
                            : "#000"
                    }
                }
            }
        }
    });
}

// 🚪 LOGOUT
function logout() {
    localStorage.removeItem("user_id");
    window.location.href = "index.html";
}

function checkOther() {
    let category = document.getElementById("category").value;
    let otherInput = document.getElementById("otherCategory");

    if (category === "Other") {
        otherInput.style.display = "block";
    } else {
        otherInput.style.display = "none";
    }
}

// 📄 GENERATE REPORT
async function generateReport() {

    let type = document.getElementById("reportType").value;

    let res = await fetch(`https://daily-expense-tracker.onrender.com/report/${user_id}/${type}`);

    let data = await res.json();

    let result = document.getElementById("reportResult");

    if (data.length === 0) {
        result.innerHTML = "<p>No data found</p>";
        return;
    }

    let html = `
        <table style="width:100%; margin-top:10px;">
            <tr>
                <th>Category</th>
                <th>Total</th>
            </tr>
    `;

    data.forEach(item => {
        html += `
            <tr>
                <td>${item.category}</td>
                <td>₹${item.total}</td>
            </tr>
        `;
    });

    html += `</table>`;

    result.innerHTML = html;
}


// Initial load
loadExpenses();