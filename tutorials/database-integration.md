# Database Integration Tutorial

Connect a database to your agent so it can answer questions using live data. We will use SQLite for simplicity, but the same flow applies to PostgreSQL, MySQL, and MongoDB.

---

## 1. Prepare Sample Data

```python
# db_setup.py
import sqlite3

conn = sqlite3.connect("company.db")
cursor = conn.cursor()

cursor.executescript(
    """
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        signup_date TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        product TEXT,
        amount REAL,
        order_date TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    """
)

cursor.execute("DELETE FROM customers;")
cursor.execute("DELETE FROM orders;")

cursor.executemany(
    "INSERT INTO customers (first_name, last_name, email, signup_date) VALUES (?, ?, ?, ?)",
    [
        ("John", "Doe", "john.doe@example.com", "2024-01-15"),
        ("Jane", "Smith", "jane.smith@example.com", "2024-02-20"),
    ],
)

cursor.executemany(
    "INSERT INTO orders (customer_id, product, amount, order_date) VALUES (?, ?, ?, ?)",
    [
        (1, "Quantum Widget", 99.99, "2024-04-10"),
        (1, "Nano Gear", 45.00, "2024-05-01"),
        (2, "Hyper Sprocket", 149.50, "2024-04-12"),
    ],
)

conn.commit()
conn.close()
print("company.db ready")
```

Run the script once:

```bash
python db_setup.py
```

---

## 2. Register the Connection

```python
from knowrithm_py.knowrithm.client import KnowrithmClient

client = KnowrithmClient(
    api_key="your-api-key",
    api_secret="your-api-secret"
)

agent_id = "your-agent-id"

connection = client.databases.create_connection(
    name="Support Database",
    url="sqlite:///company.db",
    database_type="sqlite",
    agent_id=agent_id
)

connection_id = connection["id"]
print("Connection created:", connection_id)
```

---

## 3. Test and Analyze

```python
client.databases.test_connection(connection_id)
client.databases.analyze_connection(connection_id)
```

Analysis runs asynchronously; the latest metadata is available via:

```python
snapshot = client.databases.get_semantic_snapshot(connection_id)
print(snapshot["tables"][0]["name"])
```

---

## 4. Ask Questions

```python
response = client.analytics.search_database(
    query="How many orders has John Doe placed?",
    connection_id=connection_id
)

print(response["answer"])
print(response.get("sql_query"))
```

For explicit SQL generation:

```python
sql_result = client.databases.text_to_sql(
    connection_id=connection_id,
    question="List total revenue per customer",
    execute=True,
    result_limit=10
)

print(sql_result["generated_sql"])
print(sql_result.get("results"))
```

---

## Best Practices

- Use read-only credentials in production.
- Re-run analysis after schema changes.
- Export database content to documents with `client.databases.export_connection` when you need hybrid retrieval.
- Pair database answers with document responses in a single conversation to provide context plus real-time values.

Next: monitor performance with the [advanced analytics tutorial](advanced-analytics.md).






