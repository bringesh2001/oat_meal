
import sqlite3

try:
    # Connect to the database
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()

    # List all tables in the database
    print("Tables in the database:")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    if not tables:
        print("No tables found in the database.")
    else:
        for table in tables:
            print(f"- {table[0]}")

    # Query all users from the users_customuser table
    cursor.execute('SELECT * FROM users_customuser LIMIT 10')
    rows = cursor.fetchall()
    print(rows)



except sqlite3.Error as e:
    print(f"Database error: {e}")
finally:
    # Close the connection
    if 'conn' in locals():
        conn.close()
        print("Database connection closed.")