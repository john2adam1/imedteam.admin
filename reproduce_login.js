const https = require('https');

const data = JSON.stringify({
    name: "imed",
    password: "1234",
    phone_number: ""
});

function postRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'dev.axadjonovsardorbek.uz',
            path: '/api' + path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                console.log(`Endpoint: ${path}`);
                console.log(`Status: ${res.statusCode}`);
                console.log(`Body: ${responseBody}`);
                console.log('---');
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error(`Error for ${path}: ${error}`);
            resolve(); // resolve anyway to continue
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    console.log("Testing endpoints sequentially...");
    await postRequest('/auth/user/login');
    await postRequest('/auth/admin/login');
}

run();
