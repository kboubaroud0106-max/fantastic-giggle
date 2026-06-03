import sqlite3
import os
from datetime import datetime
import shutil
from werkzeug.security import generate_password_hash, check_password_hash
import json

DB_FILE = "survey.db"
BACKUP_DIR = "backups"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create responses table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submission_date TEXT NOT NULL,
        
        -- Section A: Profil
        q1_gender TEXT,
        q2_age_group TEXT,
        q3_neighborhood TEXT,
        q4_residence_duration TEXT,
        q5_education_level TEXT,
        q6_profession TEXT,
        
        -- Section B: Memoire et frequentation
        q7_visited_cinema TEXT,
        q8_periods TEXT, -- JSON array
        q9_frequency TEXT,
        q10_companions TEXT, -- JSON array
        q11_movie_types TEXT, -- JSON array
        q11_other TEXT,
        q12_memory TEXT,
        
        -- Section C: Connaissance
        q13_text TEXT,
        q14_what_became TEXT, -- JSON array
        
        -- Section D: Causes fermeture
        q15_1 TEXT, q15_2 TEXT, q15_3 TEXT, q15_4 TEXT, q15_5 TEXT,
        q15_6 TEXT, q15_7 TEXT, q15_8 TEXT, q15_9 TEXT, q15_10 TEXT,
        q16_main_cause TEXT,
        
        -- Section E: Representations
        q17_1 TEXT, q17_2 TEXT, q17_3 TEXT, q17_4 TEXT, q17_5 TEXT, q17_6 TEXT,
        q18_meaning TEXT,
        
        -- Section F: Patrimoine et avenir
        q19_1 TEXT, q19_2 TEXT, q19_3 TEXT, q19_4 TEXT, q19_5 TEXT, q19_6 TEXT,
        q20_desired_usage TEXT, -- JSON array
        q20_other TEXT,
        q21_support_type TEXT, -- JSON array
        
        -- Section G: Info et medias
        q22_seen_content TEXT,
        q23_channels TEXT, -- JSON array
        q24_follow_pages TEXT,
        q25_1 TEXT, q25_2 TEXT, q25_3 TEXT,
        
        -- Section H: Suggestions et contact
        q26_comments TEXT,
        q27_recontact TEXT,
        q27_contact_details TEXT
    )
    ''')
    
    # Create cinema_mentions table for Q13 table data
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cinema_mentions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        response_id INTEGER NOT NULL,
        name TEXT,
        location TEXT,
        current_state TEXT,
        FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE
    )
    ''')
    
    # Create admins table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admins (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL
    )
    ''')
    
    # Check if default admin exists
    cursor.execute("SELECT * FROM admins WHERE username = 'admin'")
    if not cursor.fetchone():
        # Insert default administrator (admin / adminSafi2026)
        hashed_password = generate_password_hash('adminSafi2026')
        cursor.execute("INSERT INTO admins (username, password_hash) VALUES (?, ?)", ('admin', hashed_password))
        
    conn.commit()
    conn.close()

def save_response(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    submission_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Prepare serializations of array fields
    periods = json.dumps(data.get('q8_periods', []))
    companions = json.dumps(data.get('q10_companions', []))
    movie_types = json.dumps(data.get('q11_movie_types', []))
    what_became = json.dumps(data.get('q14_what_became', []))
    desired_usage = json.dumps(data.get('q20_desired_usage', []))
    support_type = json.dumps(data.get('q21_support_type', []))
    channels = json.dumps(data.get('q23_channels', []))
    
    cursor.execute('''
    INSERT INTO responses (
        submission_date, q1_gender, q2_age_group, q3_neighborhood, q4_residence_duration,
        q5_education_level, q6_profession, q7_visited_cinema, q8_periods, q9_frequency,
        q10_companions, q11_movie_types, q11_other, q12_memory, q13_text, q14_what_became,
        q15_1, q15_2, q15_3, q15_4, q15_5, q15_6, q15_7, q15_8, q15_9, q15_10, q16_main_cause,
        q17_1, q17_2, q17_3, q17_4, q17_5, q17_6, q18_meaning, q19_1, q19_2, q19_3, q19_4,
        q19_5, q19_6, q20_desired_usage, q20_other, q21_support_type, q22_seen_content,
        q23_channels, q24_follow_pages, q25_1, q25_2, q25_3, q26_comments, q27_recontact,
        q27_contact_details
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        submission_date, data.get('q1_gender'), data.get('q2_age_group'), data.get('q3_neighborhood'), data.get('q4_residence_duration'),
        data.get('q5_education_level'), data.get('q6_profession'), data.get('q7_visited_cinema'), periods, data.get('q9_frequency'),
        companions, movie_types, data.get('q11_other'), data.get('q12_memory'), data.get('q13_text'), what_became,
        data.get('q15_1'), data.get('q15_2'), data.get('q15_3'), data.get('q15_4'), data.get('q15_5'),
        data.get('q15_6'), data.get('q15_7'), data.get('q15_8'), data.get('q15_9'), data.get('q15_10'), data.get('q16_main_cause'),
        data.get('q17_1'), data.get('q17_2'), data.get('q17_3'), data.get('q17_4'), data.get('q17_5'), data.get('q17_6'), data.get('q18_meaning'),
        data.get('q19_1'), data.get('q19_2'), data.get('q19_3'), data.get('q19_4'), data.get('q19_5'), data.get('q19_6'),
        desired_usage, data.get('q20_other'), support_type, data.get('q22_seen_content'),
        channels, data.get('q24_follow_pages'), data.get('q25_1'), data.get('q25_2'), data.get('q25_3'),
        data.get('q26_comments'), data.get('q27_recontact'), data.get('q27_contact_details')
    ))
    
    response_id = cursor.lastrowid
    
    # Save cinema mentions (from Q13 table)
    cinemas_list = data.get('q13_table', [])
    for cinema in cinemas_list:
        name = cinema.get('name', '').strip()
        location = cinema.get('location', '').strip()
        current_state = cinema.get('current_state', '').strip()
        if name or location or current_state:
            cursor.execute('''
            INSERT INTO cinema_mentions (response_id, name, location, current_state)
            VALUES (?, ?, ?, ?)
            ''', (response_id, name, location, current_state))
            
    conn.commit()
    conn.close()
    
    # Automatic backup
    auto_backup()
    
    return response_id

def delete_response(response_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM responses WHERE id = ?", (response_id,))
    cursor.execute("DELETE FROM cinema_mentions WHERE response_id = ?", (response_id,))
    conn.commit()
    conn.close()
    auto_backup()

def get_all_responses(filters=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM responses WHERE 1=1"
    params = []
    
    if filters:
        if filters.get('gender'):
            query += " AND q1_gender = ?"
            params.append(filters.get('gender'))
        if filters.get('age_group'):
            query += " AND q2_age_group = ?"
            params.append(filters.get('age_group'))
        if filters.get('neighborhood'):
            query += " AND q3_neighborhood LIKE ?"
            params.append(f"%{filters.get('neighborhood')}%")
        if filters.get('education_level'):
            query += " AND q5_education_level = ?"
            params.append(filters.get('education_level'))
        if filters.get('profession'):
            query += " AND q6_profession = ?"
            params.append(filters.get('profession'))
            
    query += " ORDER BY id DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    # Get cinema mentions for each response and structure the output
    results = []
    for row in rows:
        row_dict = dict(row)
        # Parse JSON fields
        for field in ['q8_periods', 'q10_companions', 'q11_movie_types', 'q14_what_became', 'q20_desired_usage', 'q21_support_type', 'q23_channels']:
            if row_dict.get(field):
                try:
                    row_dict[field] = json.loads(row_dict[field])
                except Exception:
                    row_dict[field] = []
            else:
                row_dict[field] = []
        
        # Fetch cinema mentions
        cursor.execute("SELECT name, location, current_state FROM cinema_mentions WHERE response_id = ?", (row_dict['id'],))
        row_dict['q13_table'] = [dict(c) for c in cursor.fetchall()]
        results.append(row_dict)
        
    conn.close()
    return results

def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total responses
    cursor.execute("SELECT COUNT(*) FROM responses")
    total = cursor.fetchone()[0]
    
    # Responses today
    today_str = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("SELECT COUNT(*) FROM responses WHERE submission_date LIKE ?", (f"{today_str}%",))
    today = cursor.fetchone()[0]
    
    # Responses this week (last 7 days)
    cursor.execute("SELECT COUNT(*) FROM responses WHERE date(submission_date) >= date('now', '-7 days')")
    week = cursor.fetchone()[0]
    
    # Responses this month (last 30 days)
    cursor.execute("SELECT COUNT(*) FROM responses WHERE date(submission_date) >= date('now', '-30 days')")
    month = cursor.fetchone()[0]
    
    # Completion rate (we define a complete response as Q27 being answered or at least Section H reached)
    cursor.execute("SELECT COUNT(*) FROM responses WHERE q27_recontact IS NOT NULL AND q27_recontact != ''")
    completed = cursor.fetchone()[0]
    completion_rate = round((completed / total * 100), 1) if total > 0 else 0
    
    conn.close()
    return {
        "total": total,
        "today": today,
        "week": week,
        "month": month,
        "completion_rate": completion_rate
    }

def verify_admin_credentials(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM admins WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    if row and check_password_hash(row['password_hash'], password):
        return True
    return False

def update_admin_password(username, new_password):
    conn = get_db_connection()
    cursor = conn.cursor()
    hashed = generate_password_hash(new_password)
    cursor.execute("UPDATE admins SET password_hash = ? WHERE username = ?", (hashed, username))
    conn.commit()
    conn.close()
    return True

def auto_backup():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    
    backup_file = os.path.join(BACKUP_DIR, "survey_autobackup.db")
    try:
        shutil.copy2(DB_FILE, backup_file)
        return True
    except Exception as e:
        print(f"Error making automatic backup: {e}")
        return False

def create_manual_backup():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
        
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"survey_backup_{timestamp}.db")
    try:
        shutil.copy2(DB_FILE, backup_file)
        return f"survey_backup_{timestamp}.db"
    except Exception as e:
        print(f"Error creating backup: {e}")
        return None

def list_backups():
    if not os.path.exists(BACKUP_DIR):
        return []
    files = [f for f in os.listdir(BACKUP_DIR) if f.endswith('.db')]
    files.sort(reverse=True)
    return files

def restore_backup(filename):
    backup_path = os.path.join(BACKUP_DIR, filename)
    if not os.path.exists(backup_path):
        return False
    try:
        # Stop and backup current db in case of failure
        if os.path.exists(DB_FILE):
            shutil.copy2(DB_FILE, DB_FILE + ".bak")
            
        shutil.copy2(backup_path, DB_FILE)
        
        # Verify db connection works
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM responses")
        cursor.fetchone()
        conn.close()
        
        # Remove temporary bak file
        if os.path.exists(DB_FILE + ".bak"):
            os.remove(DB_FILE + ".bak")
            
        return True
    except Exception as e:
        print(f"Restore failed, rolling back: {e}")
        if os.path.exists(DB_FILE + ".bak"):
            shutil.copy2(DB_FILE + ".bak", DB_FILE)
            os.remove(DB_FILE + ".bak")
        return False
