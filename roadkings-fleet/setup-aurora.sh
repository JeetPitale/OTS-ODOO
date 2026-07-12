#!/bin/bash

# Define RDS details
RDSHOST="routeflow-db.cx00iimiyfuo.ap-southeast-2.rds.amazonaws.com"
PORT=5432
USER="Nxt_Shadow07"
REGION="ap-southeast-2"
DBNAME="postgres"

echo "Generating AWS RDS IAM Auth token..."

# Generate the IAM auth token
TOKEN=$(aws rds generate-db-auth-token --hostname $RDSHOST --port $PORT --username $USER --region $REGION)

if [ -z "$TOKEN" ]; then
    echo "Error: Failed to generate token. Please check your AWS credentials."
    exit 1
fi

echo "Successfully generated token."

# URL encode the token (required for Prisma connection string)
# We use node.js to reliably url-encode the string since bash is tricky for special characters
ENCODED_TOKEN=$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$TOKEN")

# Download the global bundle if it doesn't exist
if [ ! -f "global-bundle.pem" ]; then
    echo "Downloading RDS global certificate bundle..."
    curl -sS -o global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
fi

# Get the absolute path for the certificate
CERT_PATH=$(pwd)/global-bundle.pem

# Construct the Prisma DATABASE_URL
DB_URL="postgresql://$USER:$ENCODED_TOKEN@$RDSHOST:$PORT/$DBNAME?schema=public&sslmode=verify-full&sslcert=$CERT_PATH"

echo "Updating .env file with new DATABASE_URL..."
# Replace or append DATABASE_URL in .env
if grep -q "^DATABASE_URL=" .env; then
    # Escape ampersands for sed
    ESCAPED_DB_URL=$(echo "$DB_URL" | sed 's/&/\\&/g')
    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$ESCAPED_DB_URL\"|" .env
else
    echo "DATABASE_URL=\"$DB_URL\"" >> .env
fi

echo "Done! The .env file has been updated with the Aurora database connection."
echo "Pushing the database schema..."

# Push the schema and seed
npx prisma db push
npm run prisma:seed

echo "All set! You can now start the server and log in."
