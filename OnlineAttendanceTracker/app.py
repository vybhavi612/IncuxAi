from flask import jsonify
from datetime import datetime
from flask import session
from flask import Flask, render_template, request, redirect
import mysql.connector

app = Flask(__name__)
app.secret_key = "attendance_secret"

# MySQL Connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="J@swanth06",
    database="attendance_system"
)

cursor = db.cursor()

# ---------------- Routes ----------------

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('registration.html')

@app.route('/student_dashboard')
def student_dashboard():

    if 'student_id' not in session:
        return redirect('/')

    student_id = session['student_id']

    cursor.execute(
        """
        SELECT
        first_name,
        email,
        login_time,
        logout_time,
        idle_duration,
        attendance_status
        FROM students
        WHERE student_id=%s
        """,
        (student_id,)
    )

    student = cursor.fetchone()

    return render_template(
        'student_dashboard.html',
        student=student
    )


@app.route('/admin_login')
def admin_login():
    return render_template('admin_login.html')

@app.route('/admin_dashboard')
def admin_dashboard():

    cursor.execute(
        """
        SELECT
        student_id,
        first_name,
        email,
        login_time,
        logout_time,
        idle_duration,
        attendance_status
        FROM students
        """
    )

    students = cursor.fetchall()

    return render_template(
        'admin_dashboard.html',
        students=students
    )

# Registration

@app.route('/register_user', methods=['POST'])
def register_user():

    first_name = request.form['first_name']
    last_name = request.form['last_name']
    email = request.form['email']
    password = request.form['password']

    sql = """
    INSERT INTO students
    (first_name,last_name,email,password)
    VALUES(%s,%s,%s,%s)
    """

    values = (
        first_name,
        last_name,
        email,
        password
    )

    cursor.execute(sql, values)
    db.commit()

    return redirect('/')


@app.route('/login_user', methods=['POST'])
def login_user():

    email = request.form['email']
    password = request.form['password']

    sql = """
    SELECT * FROM students
    WHERE email=%s AND password=%s
    """

    cursor.execute(sql, (email, password))

    user = cursor.fetchone()

    if user:
        login_time = datetime.now()

        cursor.execute(
            """
            UPDATE students
            SET login_time=%s,
                attendance_status='Active'
            WHERE student_id=%s
            """,
            (login_time, user[0])
        )

        db.commit()
        session['student_id'] = user[0]
        session['student_name'] = user[1]

        return redirect('/student_dashboard')

    return '''
    <h2>Invalid Email or Password</h2>
    <a href="/">Try Again</a>
    '''

@app.route('/logout')
def logout():

    if 'student_id' in session:

        student_id = session['student_id']

        logout_time = datetime.now()

        cursor.execute(
            """
            UPDATE students
            SET logout_time=%s,
                attendance_status='Offline'
            WHERE student_id=%s
            """,
            (logout_time, student_id)
        )

        db.commit()

        session.clear()

    return redirect('/')

@app.route('/update_idle', methods=['POST'])
def update_idle():

    if 'student_id' not in session:
        return jsonify({"status":"error"})

    student_id = session['student_id']

    cursor.execute(
        """
        UPDATE students
        SET idle_duration = idle_duration + 1
        WHERE student_id=%s
        """,
        (student_id,)
    )

    db.commit()

    return jsonify({"status":"success"})

@app.route('/admin_auth', methods=['POST'])
def admin_auth():

    email = request.form['email']
    password = request.form['password']

    cursor.execute(
        """
        SELECT *
        FROM admins
        WHERE email=%s
        AND password=%s
        """,
        (email,password)
    )

    admin = cursor.fetchone()

    if admin:
        return redirect('/admin_dashboard')

    return "Invalid Admin Login"

if __name__ == "__main__":
    app.run(debug=True)