"""
EduBridge AI - Database Initialization Script
"""

import os
import re
import sys
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('SUPABASE_DB_URL')

# Clean up the URL
if DATABASE_URL:
    DATABASE_URL = re.sub(r'&?channel_binding=[^&]*', '', DATABASE_URL)
    if 'sslmode' not in DATABASE_URL:
        DATABASE_URL += '&sslmode=require' if '?' in DATABASE_URL else '?sslmode=require'

CREATE_TABLES_SQL = """
-- Users Table (using UUID to match other tables)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    username VARCHAR(100),
    major VARCHAR(255),
    student_type VARCHAR(50) DEFAULT 'public',
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255),
    thumbnail_url TEXT,
    duration VARCHAR(50),
    level VARCHAR(50) DEFAULT 'beginner',
    category VARCHAR(100),
    price DECIMAL(10, 2) DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed_lessons TEXT[] DEFAULT '{}',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    max_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    submission_text TEXT,
    score INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(assignment_id, user_id)
);

-- Roadmaps Table
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal TEXT,
    current_level VARCHAR(100),
    timeframe VARCHAR(100),
    roadmap_data JSONB,
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roadmap Steps Table
CREATE TABLE IF NOT EXISTS roadmap_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_weeks INTEGER,
    resources JSONB,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    agent_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(20) DEFAULT 'dark',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"""

SAMPLE_DATA_SQL = """
INSERT INTO courses (title, description, instructor, duration, level, category, price, is_published)
SELECT 'Introduction to Python Programming', 'Learn Python from scratch', 'Dr. John Smith', '20 hours', 'beginner', 'Programming', 0, true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Introduction to Python Programming');

INSERT INTO courses (title, description, instructor, duration, level, category, price, is_published)
SELECT 'Web Development Fundamentals', 'HTML, CSS, JavaScript', 'Jane Doe', '25 hours', 'beginner', 'Web Development', 0, true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Web Development Fundamentals');
"""


def create_postgres_tables():
    """Create tables in PostgreSQL"""
    try:
        import psycopg2
        from urllib.parse import urlparse
        
        print("Connecting to PostgreSQL...")
        
        if not DATABASE_URL:
            return False
        
        try:
            conn = psycopg2.connect(DATABASE_URL)
        except Exception:
            parsed = urlparse(DATABASE_URL)
            conn = psycopg2.connect(
                host=parsed.hostname,
                port=parsed.port or 5432,
                database=parsed.path[1:] if parsed.path else 'postgres',
                user=parsed.username,
                password=parsed.password,
                sslmode='require'
            )
        
        print("Connected! Creating tables...")
        cursor = conn.cursor()
        cursor.execute(CREATE_TABLES_SQL)
        conn.commit()
        
        cursor.execute(SAMPLE_DATA_SQL)
        conn.commit()
        
        cursor.close()
        conn.close()
        print("✓ PostgreSQL tables created!")
        return True
        
    except ImportError:
        print("psycopg2 not installed")
        return False
    except Exception as e:
        print(f"PostgreSQL error: {e}")
        return False


def create_sqlite_tables():
    """Create SQLite tables"""
    try:
        import sqlite3
        
        print("Creating SQLite database...")
        conn = sqlite3.connect('edubridge.db')
        cursor = conn.cursor()
        
        sql = CREATE_TABLES_SQL
        sql = sql.replace('UUID PRIMARY KEY DEFAULT gen_random_uuid()', 'TEXT PRIMARY KEY')
        sql = sql.replace('SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY')
        sql = sql.replace('TIMESTAMP WITH TIME ZONE DEFAULT NOW()', 'TEXT DEFAULT CURRENT_TIMESTAMP')
        sql = sql.replace('JSONB', 'TEXT')
        sql = sql.replace("TEXT[] DEFAULT '{}'", "TEXT DEFAULT '[]'")
        sql = sql.replace('BOOLEAN DEFAULT false', 'INTEGER DEFAULT 0')
        sql = sql.replace('BOOLEAN DEFAULT true', 'INTEGER DEFAULT 1')
        
        statements = sql.split(';')
        for stmt in statements:
            stmt = stmt.strip()
            if stmt and not stmt.startswith('--'):
                try:
                    cursor.execute(stmt)
                except:
                    pass
        
        conn.commit()
        conn.close()
        print("✓ SQLite database created: edubridge.db")
        return True
        
    except Exception as e:
        print(f"SQLite error: {e}")
        return False


def main():
    print("=" * 50)
    print("EduBridge AI - Database Setup")
    print("=" * 50)
    
    if DATABASE_URL:
        print("\nTrying PostgreSQL...")
        pg_success = create_postgres_tables()
        if pg_success:
            print("\n✅ Done!")
            return True
    
    print("\nUsing SQLite fallback...")
    sqlite_success = create_sqlite_tables()
    
    if sqlite_success:
        print("\n✅ Database ready!")
        return True
    else:
        print("\n❌ Failed")
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
