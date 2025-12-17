const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log("Current .env.local content:");
    console.log(content);
} catch (err) {
    console.error("Failed to read .env.local:", err.message);
}
