const fs = require('fs');
const token = process.argv[2];
const encodedToken = encodeURIComponent(token);
const user = 'Nxt_Shadow07';
const host = 'routeflow-db.cx00iimiyfuo.ap-southeast-2.rds.amazonaws.com';
const port = 5432;
const dbname = 'postgres';

const dbUrl = `postgresql://${user}:${encodedToken}@${host}:${port}/${dbname}?schema=public&sslmode=require`;

let envContent = fs.readFileSync('.env', 'utf8');
envContent = envContent.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${dbUrl}"`);
fs.writeFileSync('.env', envContent);
