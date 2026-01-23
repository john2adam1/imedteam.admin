const https = require('https');

const data = JSON.stringify({
    name: "imed",
    password: "1234",
    phone_number: ""
});

const options = {
    hostname: 'dev.axadjonovsardorbek.uz',
    path: '/api/auth/admin/login',
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
        console.log(`Endpoint: /api/auth/admin/login`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${responseBody}`);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
