#!/bin/bash

echo "🔍 Checking .env.local configuration..."
echo "======================================"

if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found"
    exit 1
fi

echo "✅ .env.local file exists"

# Check for required database variables
echo ""
echo "📋 Database Configuration Check:"

# Check each required variable
required_vars=("DB_HOST" "DB_PORT" "DB_NAME" "DB_USER" "DB_PASSWORD")

for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env.local; then
        value=$(grep "^${var}=" .env.local | cut -d'=' -f2-)
        if [ "$var" = "DB_PASSWORD" ]; then
            echo "  ✅ $var: [HIDDEN]"
        else
            echo "  ✅ $var: $value"
        fi
    else
        echo "  ❌ $var: NOT FOUND"
    fi
done

echo ""
echo "🔧 To update your database credentials:"
echo "1. Edit .env.local file"
echo "2. Update the database connection details"
echo "3. Run ./quick-start.sh again"
echo ""
echo "💡 Make sure your RDS instance is accessible and the credentials are correct."
