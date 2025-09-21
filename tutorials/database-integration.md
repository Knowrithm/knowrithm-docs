# Tutorial: Database Integration 🗄️

This tutorial will guide you through connecting a live database to your Knowrithm agent, enabling it to answer questions with real-time data.

---

## 🎯 What You'll Learn

- How to create a sample local database using SQLite.
- How to connect your database to the Knowrithm platform.
- How to test the connection and analyze the database schema.
- How to ask your agent natural language questions that query the database.

---

## 📋 Prerequisites

- A Knowrithm account and API credentials.
- Python 3.8+ and the Knowrithm SDK installed.
- An Agent ID to associate the database with.

---

## 🛠️ Step 1: Create a Sample Database

For this tutorial, we'll use Python's built-in `sqlite3` library to create a simple local database. This simulates connecting to a real production database.

Create a new Python file named `db_setup.py`:

```python
# db_setup.py
import sqlite3

def setup_database():
    db_file = "company.db"
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    # Create a 'customers' table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        signup_date DATE
    );
    """)

    # Create an 'orders' table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        product_name TEXT NOT NULL,
        amount REAL NOT NULL,
        order_date DATE,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
    );
    """)

    # Insert some sample data (if table is empty)
    cursor.execute("SELECT COUNT(*) FROM customers")
    if cursor.fetchone()[0] == 0:
        customers = [
            ('John', 'Doe', 'john.doe@example.com', '2023-01-15'),
            ('Jane', 'Smith', 'jane.smith@example.com', '2023-02-20')
        ]
        cursor.executemany("INSERT INTO customers (first_name, last_name, email, signup_date) VALUES (?, ?, ?, ?)", customers)

        orders = [
            (1, 'Quantum Widget', 99.99, '2024-04-10'),
            (2, 'Hyper-Sprocket', 149.50, '2024-04-12'),
            (1, 'Nano-Gear', 45.00, '2024-05-01')
        ]
        cursor.executemany("INSERT INTO orders (customer_id, product_name, amount, order_date) VALUES (?, ?, ?, ?)", orders)

    conn.commit()
    conn.close()
    print(f"✅ Database '{db_file}' created and populated.")

if __name__ == "__main__":
    setup_database()
```

Run this script once to create your database file: `python db_setup.py`.

---

## 🐍 Step 2: Connect to the Database

Now, let's write a new script, `db_agent_tutorial.py`, to connect this database to Knowrithm.

```python
# db_agent_tutorial.py
import os
from dotenv import load_dotenv
from knowrithm_py.knowrithm.client import KnowrithmClient
from knowrithm_py.services.database import DatabaseService
from knowrithm_py.services.agent import AgentService

# Setup client
load_dotenv()
client = KnowrithmClient(
    api_key=os.getenv("KNOWRITHM_API_KEY"),
    api_secret=os.getenv("KNOWRITHM_API_SECRET"),
)

# Create a new agent for this tutorial
agent_service = AgentService(client)
agent = agent_service.create({"name": "Database Query Agent"})
agent_id = agent['id']
print(f"✅ Using Agent ID: {agent_id}")

db_service = DatabaseService(client)

print("\nConnecting to the local SQLite database...")
try:
    db_connection = db_service.create_connection({
        "name": "Local Customer Database",
        "type": "sqlite",
        "database": "company.db" # Path to the SQLite file
    })
    connection_id = db_connection['id']
    print(f"✅ Database connection created with ID: {connection_id}")
except Exception as e:
    print(f"❌ Error creating connection: {e}")
    exit()
```

---

## ⚙️ Step 3: Test and Analyze the Connection

Before the agent can use the database, we need to test the connection and ask Knowrithm to analyze its schema.

```python
print("\nTesting and analyzing the database connection...")

# Test the connection
test_result = db_service.test_connection(connection_id)
if test_result.get('status') != 'connected':
    print(f"❌ Connection test failed: {test_result.get('message')}")
    exit()
print("✅ Connection test successful.")

# Analyze the schema (this is an async process)
analyze_result = db_service.analyze(connection_id)
print("⏳ Database schema analysis has started.")
# In a real application, you would poll for completion status.
```

---

## 💬 Step 4: Query the Database with Natural Language

Once the schema is analyzed, your agent can translate natural language questions into SQL queries.

```python
print("\nQuerying the database using natural language...")

# Note: The agent doesn't need to be explicitly trained on the DB.
# The connection analysis makes the schema available.

query = "How many orders has John Doe placed?"

print(f"❓ Query: {query}")

try:
    # Use the database search endpoint
    search_results = db_service.search(
        query=query,
        connection_ids=[connection_id]
    )
    
    # The result contains the natural language answer and the generated SQL
    print(f"🤖 Answer: {search_results['answer']}")
    print(f"🔍 Generated SQL: {search_results['sql_query']}")

except Exception as e:
    print(f"❌ Error during search: {e}")
```

### Expected Output

> **Answer**: John Doe has placed 2 orders.
>
> **Generated SQL**: `SELECT count(t1.order_id) FROM orders AS t1 JOIN customers AS t2 ON t1.customer_id = t2.id WHERE t2.first_name = 'John' AND t2.last_name = 'Doe'`

---

## 🎉 Congratulations!

You've successfully connected a live database to your AI agent! It can now answer questions using up-to-the-minute data, making it incredibly powerful for internal tools, real-time reporting, and dynamic customer support.

## Next Steps

-   **Try More Complex Queries**: Ask questions that require joins, aggregations, and filtering, like "What is the total order amount for Jane Smith?" or "List all customers who signed up in 2023."
-   **Connect Your Production Database**: Follow the same steps to connect a PostgreSQL or MySQL database. Just be sure to use read-only credentials for security!
-   **Combine with Documents**: An agent can use both its document knowledge base and database connections to answer questions, providing the best of both worlds.