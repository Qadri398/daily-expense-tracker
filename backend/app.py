from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 🔗 DATABASE CONNECTION
db = mysql.connector.connect(
    host="mysql.railway.internal",
    user="root",
    password="qosgOXMwvtDbrOwhkQffcHmsLMdGBKlN",
    database="railway",
    port=int(3306)
)

cursor = db.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(50)
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount INT,
    category VARCHAR(50),
    date DATE
)
""")

db.commit()

# 🔐 LOGIN API
@app.route('/login', methods=['POST'])
def login():
    data = request.json

    username = data.get('username')
    password = data.get('password')

    cursor.execute(
        "SELECT * FROM users WHERE username=%s AND password=%s",
        (username, password)
    )

    user = cursor.fetchone()

    if user:
        return jsonify({
            "status": "success",
            "user_id": user[0]
        })
    else:
        return jsonify({
            "status": "fail"
        })

# ➕ ADD EXPENSE
@app.route('/add', methods=['POST'])
def add_expense():
    data = request.json

    user_id = data.get('user_id')
    amount = data.get('amount')
    category = data.get('category')
    date = data.get('date')

    # 🚫 Prevent future date
    today = datetime.today().date()
    expense_date = datetime.strptime(date, "%Y-%m-%d").date()

    if expense_date > today:
        return jsonify({"status": "error", "message": "Future date not allowed"})

    cursor.execute(
        "INSERT INTO expenses (user_id, amount, category, date) VALUES (%s, %s, %s, %s)",
        (user_id, amount, category, date)
    )

    db.commit()

    return jsonify({"status": "added"})

# 📥 GET ALL EXPENSES
@app.route('/expenses/<int:user_id>', methods=['GET'])
def get_expenses(user_id):
    cursor.execute(
        "SELECT id, amount, category, date FROM expenses WHERE user_id=%s",
        (user_id,)
    )

    rows = cursor.fetchall()

    expenses = []
    for row in rows:
        expenses.append({
            "id": row[0],
            "amount": row[1],
            "category": row[2],
            "date": str(row[3])
        })

    return jsonify(expenses)





# ❌ DELETE EXPENSE
@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_expense(id):
    cursor.execute(
        "DELETE FROM expenses WHERE id=%s",
        (id,)
    )

    db.commit()

    return jsonify({"status": "deleted"})
# sigup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json

    username = data.get('username')
    password = data.get('password')

    try:
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s)",
            (username, password)
        )
        db.commit()

        return jsonify({"status": "success"})

    except:
        return jsonify({"status": "error", "message": "Username already exists"})
    
    # 📄 REPORT API
@app.route('/report/<int:user_id>/<string:type>', methods=['GET'])
def generate_report(user_id, type):

    if type == "week":
        query = """
            SELECT category, SUM(amount)
            FROM expenses
            WHERE user_id=%s
            AND YEARWEEK(date, 1)=YEARWEEK(CURDATE(), 1)
            GROUP BY category
        """

    elif type == "month":
        query = """
            SELECT category, SUM(amount)
            FROM expenses
            WHERE user_id=%s
            AND MONTH(date)=MONTH(CURDATE())
            AND YEAR(date)=YEAR(CURDATE())
            GROUP BY category
        """

    elif type == "year":
        query = """
            SELECT category, SUM(amount)
            FROM expenses
            WHERE user_id=%s
            AND YEAR(date)=YEAR(CURDATE())
            GROUP BY category
        """

    else:
        return jsonify([])

    cursor.execute(query, (user_id,))
    rows = cursor.fetchall()

    report = []

    for row in rows:
        report.append({
            "category": row[0],
            "total": row[1]
        })

    return jsonify(report)
    


# ▶️ RUN SERVER
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
    