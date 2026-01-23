const https = require('https');

const experiments = [
    { path: '/auth/user/login', body: { name: "imed", password: "1234", phone_number: "" } },
    { path: '/auth/user/login', body: { phone_number: "imed", password: "1234" } },
    { path: '/auth/user/login', body: { username: "imed", password: "1234" } },
    { path: '/auth/admin/login', body: { name: "imed", password: "1234", phone_number: "" } },
    { path: '/auth/admin/login', body: { phone: "imed", password: "1234" } },
    { path: '/auth/admin/login', body: { username: "imed", password: "1234" } },
    { path: '/auth/login', body: { username: "imed", password: "1234" } }, // common fallback
    { path: '/auth/login', body: { name: "imed", password: "1234" } },
];

function postRequest(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
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
            res.on('data', c => responseBody += c);
            res.on('end', () => {
                resolve({ path, body, status: res.statusCode, response: responseBody });
            });
        });

        req.on('error', (e) => resolve({ path, body, status: 'ERR', response: e.message }));
        req.write(data);
        req.end();
    });
}

async function run() {
    console.log("Starting brute force...");
    for (const exp of experiments) {
        const res = await postRequest(exp.path, exp.body);
        console.log(`[${res.status}] ${exp.path} with keys [${Object.keys(exp.body).join(',')}]`);
        if (res.status === 200 || res.status === 201) {
            console.log("SUCCESS FOUND!");
            console.log(res.response);
        }
    }
}

run();
