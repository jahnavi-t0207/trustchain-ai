
import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).parent / "trustchain.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS audits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                evidence TEXT NOT NULL,
                missing_information TEXT NOT NULL,
                conflicting_evidence TEXT NOT NULL,
                decision TEXT NOT NULL,
                confidence REAL NOT NULL,
                reason TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)


if __name__ == "__main__":
    initialize_database()
    print(f"Database initialized at: {DATABASE_PATH}")

import json
import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).parent / "trustchain.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS audits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                evidence TEXT NOT NULL,
                missing_information TEXT NOT NULL,
                conflicting_evidence TEXT NOT NULL,
                decision TEXT NOT NULL,
                confidence REAL NOT NULL,
                reason TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)


def save_audit(case: dict, result: dict) -> int:
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO audits (
                evidence,
                missing_information,
                conflicting_evidence,
                decision,
                confidence,
                reason
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                json.dumps(case.get("evidence", [])),
                json.dumps(case.get("missing_info", [])),
                json.dumps(case.get("conflicts", [])),
                result["decision"],
                result["confidence"],
                result["reason"],
            ),
        )
        return cursor.lastrowid


def get_audit_history(limit: int = 20) -> list[dict]:
    limit = max(1, min(limit, 100))

    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT *
            FROM audits
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    audits = []

    for row in rows:
        audit = dict(row)
        audit["evidence"] = json.loads(audit["evidence"])
        audit["missing_information"] = json.loads(
            audit["missing_information"]
        )
        audit["conflicting_evidence"] = json.loads(
            audit["conflicting_evidence"]
        )
        audits.append(audit)

    return audits


if __name__ == "__main__":
    initialize_database()
    print(f"Database initialized at: {DATABASE_PATH}")
