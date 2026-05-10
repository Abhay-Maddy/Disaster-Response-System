const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abhaymaddheshiya150@gmail.com',
    pass: 'wlaljnbcxljjwcto'
  }
});

transporter.verify()
  .then(() => {
    console.log('✅ Gmail SMTP transporter verified — emails ready');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Gmail SMTP verification FAILED:', err.message);
    process.exit(1);
  });
