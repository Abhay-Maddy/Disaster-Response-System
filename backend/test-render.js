const http = require('https');

const data = JSON.stringify({
  email: 'abhaymaddy2006@gmail.com',
  name: 'Abhay',
  purpose: 'register'
});

const req = http.request('https://disaster-response-system-xrwi.onrender.com/api/auth/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(res.statusCode, body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
