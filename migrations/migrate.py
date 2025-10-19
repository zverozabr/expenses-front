#!/usr/bin/env python3
"""
Database Migration Script for Telegram Bot Frontend Integration

This script creates the necessary database tables for the Telegram bot
to communicate with the Next.js frontend editor.

Requirements:
- Python 3.8+
- psycopg2-binary (pip install psycopg2-binary)
- POSTGRES_URL environment variable

Usage:
    export POSTGRES_URL="postgresql://..."
    python migrations/migrate.py
"""

import os
import sys
from pathlib import Path

try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("❌ psycopg2-binary not installed")
    print("Install with: pip install psycopg2-binary")
    sys.exit(1)

def get_connection():
    """Get database connection from environment variable."""
    url = os.getenv('POSTGRES_URL')
    if not url:
        print("❌ POSTGRES_URL environment variable not set")
        print("Get it from: Vercel Dashboard → Storage → Postgres → Settings")
        sys.exit(1)
    return psycopg2.connect(url)

def run_migration(migration_file: Path):
    """Execute a single migration file."""
    print(f"📄 Running migration: {migration_file.name}")

    with open(migration_file, 'r', encoding='utf-8') as f:
        migration_sql = f.read()

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(migration_sql)
                conn.commit()
        print(f"✅ Migration completed: {migration_file.name}")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {migration_file.name}")
        print(f"Error: {e}")
        return False

def check_table_exists():
    """Check if sessions table exists."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables
                        WHERE table_name = 'sessions'
                    );
                """)
                exists = cursor.fetchone()[0]
                return exists
    except Exception as e:
        print(f"❌ Cannot check table existence: {e}")
        return False

def main():
    """Main migration execution."""
    print("🚀 Starting Telegram Bot Database Migration")
    print("=" * 50)

    # Check if we're in the right directory
    migrations_dir = Path(__file__).parent
    if not migrations_dir.exists():
        print(f"❌ Migrations directory not found: {migrations_dir}")
        sys.exit(1)

    # Check POSTGRES_URL
    if not os.getenv('POSTGRES_URL'):
        print("❌ POSTGRES_URL not set")
        print("Set it with: export POSTGRES_URL='postgresql://...'")
        sys.exit(1)

    # Test connection
    print("🔌 Testing database connection...")
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        sys.exit(1)

    # Check if table already exists
    if check_table_exists():
        print("⚠️  Sessions table already exists")
        print("Migration may have been run before")
        response = input("Continue anyway? (y/N): ").lower().strip()
        if response not in ('y', 'yes'):
            print("Migration cancelled")
            sys.exit(0)

    # Find migration files
    migration_files = sorted(migrations_dir.glob("*.sql"))
    if not migration_files:
        print("❌ No migration files found")
        sys.exit(1)

    print(f"📂 Found {len(migration_files)} migration(s)")

    # Run migrations
    success_count = 0
    for migration_file in migration_files:
        if run_migration(migration_file):
            success_count += 1
        else:
            print(f"❌ Migration failed: {migration_file.name}")
            sys.exit(1)

    # Final verification
    print("\n🔍 Verifying migration...")
    if check_table_exists():
        print("✅ Sessions table created successfully")

        # Show table info
        try:
            with get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT column_name, data_type, is_nullable, column_default
                        FROM information_schema.columns
                        WHERE table_name = 'sessions' AND table_schema = 'public'
                        ORDER BY ordinal_position;
                    """)
                    columns = cursor.fetchall()

                    print("📊 Table structure:")
                    for col in columns:
                        print(f"  • {col[0]}: {col[1]} {'DEFAULT ' + str(col[3]) if col[3] else ''}")

        except Exception as e:
            print(f"⚠️  Could not verify table structure: {e}")

    else:
        print("❌ Sessions table verification failed")
        sys.exit(1)

    print("\n" + "=" * 50)
    print(f"🎉 Migration completed successfully!")
    print(f"✅ {success_count}/{len(migration_files)} migrations applied")
    print("\n📋 Next steps:")
    print("  1. Test frontend API: https://expenses-front-eight.vercel.app/api/session?session_id=test-uuid")
    print("  2. Expected result: 404 'Session not found' (good!)")
    print("  3. Run your bot integration tests")

if __name__ == "__main__":
    main()
