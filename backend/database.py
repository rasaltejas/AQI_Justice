import sqlite3
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
import os
import secrets
import uuid

DB_PATH = "air_justice.db"

def init_database():
    """Initialize SQLite database with necessary tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        phone TEXT,
        age INTEGER,
        health_conditions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Complaints table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        user_name TEXT,
        location_lat REAL,
        location_lon REAL,
        location_address TEXT,
        aqi_value REAL,
        health_impact TEXT,
        precautions TEXT,
        description TEXT,
        status TEXT DEFAULT 'filed',
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        authorities_notified TEXT,
        confirmation_email_sent BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_email) REFERENCES users(email)
    )
    """)
    
    # Complaint tracking table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaint_tracking (
        id TEXT PRIMARY KEY,
        complaint_id TEXT NOT NULL,
        status TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id)
    )
    """)
    
    # Email queue table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS email_queue (
        id TEXT PRIMARY KEY,
        complaint_id TEXT,
        recipient_email TEXT,
        recipient_type TEXT,
        subject TEXT,
        body TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id)
    )
    """)
    
    conn.commit()
    conn.close()

def add_user(email: str, name: str, phone: str = None, age: int = None, health_conditions: List[str] = None) -> Dict[str, Any]:
    """Add or update user"""
    user_id = email.replace("@", "_at_").replace(".", "_dot_")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    health_json = json.dumps(health_conditions or [])
    
    try:
        cursor.execute("""
        INSERT INTO users (id, email, name, phone, age, health_conditions)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        phone = excluded.phone,
        age = excluded.age,
        health_conditions = excluded.health_conditions,
        updated_at = CURRENT_TIMESTAMP
        """, (user_id, email, name, phone, age, health_json))
        
        conn.commit()
        return {"success": True, "user_id": user_id}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

def file_complaint(email: str, name: str, location_lat: float, location_lon: float, 
                  location_address: str, aqi_value: float, health_impact: str,
                  precautions: str, description: str = "") -> Dict[str, Any]:
    """File a new complaint"""
    complaint_id = f"AJ-{int(datetime.now().timestamp())}-{secrets.token_hex(4)}"
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
        INSERT INTO complaints 
        (id, user_email, user_name, location_lat, location_lon, location_address, 
         aqi_value, health_impact, precautions, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (complaint_id, email, name, location_lat, location_lon, location_address,
              aqi_value, health_impact, precautions, description))
        
        # Add initial tracking entry
        tracking_id = f"TRACK-{complaint_id}"
        cursor.execute("""
        INSERT INTO complaint_tracking (id, complaint_id, status, notes)
        VALUES (?, ?, ?, ?)
        """, (tracking_id, complaint_id, "filed", "Complaint filed successfully"))
        
        conn.commit()
        return {
            "success": True,
            "complaint_id": complaint_id,
            "message": "Complaint filed successfully!"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

def get_complaint_status(complaint_id: str) -> Dict[str, Any]:
    """Get complaint status"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
        SELECT id, user_email, location_address, aqi_value, status, submission_date
        FROM complaints WHERE id = ?
        """, (complaint_id,))
        
        complaint = cursor.fetchone()
        if not complaint:
            return {"success": False, "error": "Complaint not found"}
        
        cursor.execute("""
        SELECT status, timestamp, notes FROM complaint_tracking 
        WHERE complaint_id = ? ORDER BY timestamp DESC
        """, (complaint_id,))
        
        tracking = cursor.fetchall()
        
        return {
            "success": True,
            "complaint": {
                "id": complaint[0],
                "email": complaint[1],
                "location": complaint[2],
                "aqi": complaint[3],
                "status": complaint[4],
                "filed_date": complaint[5]
            },
            "tracking_history": [
                {"status": t[0], "timestamp": t[1], "notes": t[2]}
                for t in tracking
            ]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

def add_email_to_queue(complaint_id: str, recipient_email: str, recipient_type: str,
                      subject: str, body: str) -> bool:
    """Queue email for sending"""
    email_id = str(uuid.uuid4())
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
        INSERT INTO email_queue (id, complaint_id, recipient_email, recipient_type, subject, body)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (email_id, complaint_id, recipient_email, recipient_type, subject, body))
        
        conn.commit()
        return True
    except Exception as e:
        print(f"Error queueing email: {e}")
        return False
    finally:
        conn.close()

def get_pending_emails() -> List[Dict[str, Any]]:
    """Get all pending emails"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
        SELECT id, complaint_id, recipient_email, subject, body
        FROM email_queue WHERE status = 'pending'
        """)
        
        emails = cursor.fetchall()
        return [
            {
                "id": e[0],
                "complaint_id": e[1],
                "recipient": e[2],
                "subject": e[3],
                "body": e[4]
            }
            for e in emails
        ]
    finally:
        conn.close()

def mark_email_sent(email_id: str) -> bool:
    """Mark email as sent"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
        UPDATE email_queue SET status = 'sent', sent_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (email_id,))
        
        conn.commit()
        return True
    except Exception as e:
        print(f"Error marking email as sent: {e}")
        return False
    finally:
        conn.close()

# Initialize database on import
if not os.path.exists(DB_PATH):
    init_database()
