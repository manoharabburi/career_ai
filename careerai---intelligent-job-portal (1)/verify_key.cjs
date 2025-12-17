
const fs = require('fs');
const path = require('path');
const https = require('https');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    let apiKey = '';

    for (const line of lines) {
        const match = line.match(/VITE_GEMINI_API_KEY=(.*)/);
        if (match && match[1]) {
            apiKey = match[1].trim();
            break;
        }
    }

    if (!apiKey) {
        console.error("❌ Could not find VITE_GEMINI_API_KEY in .env.local");
        process.exit(1);
    }

    console.log(`Checking API Key: ${apiKey.substring(0, 5)}...`);

    const data = JSON.stringify({
        contents: [{
            parts: [{ text: "Hello" }]
        }]
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log("✅ API Key is VALID and working!");
                console.log("Response:", JSON.parse(body).candidates[0].content.parts[0].text);
            } else {
                console.error(`❌ API Request Failed. Status: ${res.statusCode}`);
                console.error("Error Body:", body);

                if (res.statusCode === 429) {
                    console.log("\n⚠️ DIAGNOSIS: The new key is correctly loaded by this script but is ALSO hitting rate limits.");
                } else if (res.statusCode === 404) {
                    console.log("\n⚠️ DIAGNOSIS: Model not found. Maybe gemini-2.5-flash is not available for this key?");
                }
            }
        });
    });

    req.on('error', (error) => {
        console.error("Request Error:", error);
    });

    req.write(data);
    req.end();

} catch (err) {
    console.error("Error reading .env.local:", err.message);
}
