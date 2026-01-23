const https = require('https');
const fs = require('fs');

const experiments = [
    { prefix: '/api', path: '/auth/user/login', body: { name: "imed", password: "1234", phone_number: "" } },
    { prefix: '', path: '/auth/user/login', body: { name: "imed", password: "1234", phone_number: "" } },
    { prefix: '/api', path: '/auth/admin/login', body: { name: "imed", password: "1234", phone_number: "" } },
    { prefix: '', path: '/auth/admin/login', body: { name: "imed", password: "1234", phone_number: "" } },
    // Try phone variant just in case
    { prefix: '/api', path: '/auth/admin/login', body: { phone: "imed", password: "1234" } },
    { prefix: '', path: '/auth/admin/login', body: { phone: "imed", password: "1234" } },
];

function postRequest(prefix, path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'dev.axadjonovsardorbek.uz',
            path: prefix + path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', c => responseBody += c);
            res.on('end', () => {
                resolve({ url: prefix + path, status: res.statusCode, body: responseBody });
            });
        });

        req.on('error', (e) => resolve({ url: prefix + path, status: 'ERR', body: e.message }));
        req.write(data);
        req.end();
    });
}

async function run() {
    const results = [];
    for (const exp of experiments) {
        const res = await postRequest(exp.prefix, exp.path, exp.body);
        results.push(`URL: ${res.url} | Status: ${res.status} | Body: ${res.body}`);
    }
    fs.writeFileSync('results.txt', results.join('\n'));
    console.log('Done writing results.txt');
}

run();
