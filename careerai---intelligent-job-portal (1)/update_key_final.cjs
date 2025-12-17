const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const newKey = "AIzaSyAqzXQzu1uSyUnZOu8BUH0h5rH3La8lHG0";
const content = `VITE_GEMINI_API_KEY=${newKey}\n`;

try {
    fs.writeFileSync(envPath, content, 'utf8');
    console.log("✅ Successfully updated .env.local with correct API key.");
    console.log(`New key: ${newKey.substring(0, 10)}...`);
} catch (err) {
    console.error("❌ Failed to update .env.local:", err.message);
    process.exit(1);
}
