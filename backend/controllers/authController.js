const nodemailer = require('nodemailer');
const User  = require('../models/User');
const Admin = require('../models/Admin');
const OTP   = require('../models/OTP');

// ── Email transporter (Gmail SMTP) ───────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS   // 16-char App Password, NOT your Gmail password
  }
});

// ── Generate 4-digit OTP ─────────────────────────────────────────
const genOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// ── Send OTP email ───────────────────────────────────────────────
async function sendOTPEmail(to, name, otp) {
  await transporter.sendMail({
    from: `"AI Disaster Response 🚨" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${otp} — Your Verification Code`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
          <h2 style="margin:0;color:#fff;font-size:1.4rem;">🚨 AI Disaster Response System</h2>
        </div>
        <div style="padding:32px;">
          <p style="margin-top:0;">Hi <strong>${name}</strong>,</p>
          <p style="color:#94a3b8;">Your one-time verification code is:</p>
          <div style="background:#1e293b;border:2px solid #6366f1;border-radius:14px;padding:24px;text-align:center;margin:24px 0;">
            <span style="font-size:3rem;font-weight:900;letter-spacing:0.6rem;color:#818cf8;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#94a3b8;font-size:0.85rem;">
            ⏰ This code expires in <strong>10 minutes</strong>.<br>
            🔒 Never share this with anyone.
          </p>
          <hr style="border:1px solid #1e293b;margin:24px 0;">
          <p style="color:#475569;font-size:0.75rem;margin:0;">
            AI Disaster Response System — Emergency Coordination Platform
          </p>
        </div>
      </div>`
  });
}

// ════════════════════════════════════════════════════════════
// SEND OTP
// POST /api/auth/send-otp  { email, name, purpose }
// ════════════════════════════════════════════════════════════
exports.sendOTP = async (req, res) => {
  try {
    const { email, name = 'User', purpose = 'register' } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const lowerEmail = email.toLowerCase().trim();

    // Validation per purpose
    if (purpose === 'register') {
      const exists = await User.findOne({ email: lowerEmail });
      if (exists) return res.status(409).json({ message: 'This email is already registered. Please sign in.' });
    }
    if (purpose === 'reset') {
      const exists = await User.findOne({ email: lowerEmail });
      if (!exists) return res.status(404).json({ message: 'This email is not registered.' });
    }

    const otp = genOTP();

    // Delete any old OTP for this email+purpose
    await OTP.deleteMany({ email: lowerEmail, purpose });

    // Save new OTP
    await OTP.create({ email: lowerEmail, otp, purpose });

    // Send email
    await sendOTPEmail(lowerEmail, name, otp);

    res.json({ success: true, message: `OTP sent to ${email}` });
  } catch (err) {
    console.error('sendOTP error:', err.message);
    res.status(500).json({ message: 'Failed to send OTP: ' + err.message });
  }
};

// ════════════════════════════════════════════════════════════
// VERIFY OTP (standalone check, used before register/reset)
// POST /api/auth/verify-otp  { email, otp, purpose }
// ════════════════════════════════════════════════════════════
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose = 'register' } = req.body;
    const record = await OTP.findOne({ email: email.toLowerCase(), otp, purpose });
    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// REGISTER
// POST /api/auth/register  { name, email, phone, address, emergencyContact, password, otp }
// ════════════════════════════════════════════════════════════
exports.register = async (req, res) => {
  try {
    const { name, email, phone, address, emergencyContact, password, otp } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    // Verify OTP
    const otpRecord = await OTP.findOne({ email: lowerEmail, otp, purpose: 'register' });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });

    // Check not already registered
    const exists = await User.findOne({ email: lowerEmail });
    if (exists) return res.status(409).json({ message: 'Email already registered.' });

    // Create user
    const user = await User.create({ name, email: lowerEmail, phone, address, emergencyContact, password });

    // Delete used OTP
    await OTP.deleteMany({ email: lowerEmail, purpose: 'register' });

    const { password: _, ...userObj } = user.toObject();
    res.json({ success: true, user: userObj });
  } catch (err) {
    console.error('register error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// LOGIN
// POST /api/auth/login  { email, password }
// ════════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'This email is not registered. Please sign up first.', code: 'EMAIL_NOT_FOUND' });
    if (user.password !== password) return res.status(401).json({ message: 'Incorrect password. Please try again.', code: 'WRONG_PASSWORD' });

    const { password: _, ...userObj } = user.toObject();
    res.json({ success: true, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// RESET PASSWORD
// POST /api/auth/reset-password  { email, otp, newPassword }
// ════════════════════════════════════════════════════════════
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    const record = await OTP.findOne({ email: lowerEmail, otp, purpose: 'reset' });
    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    await User.updateOne({ email: lowerEmail }, { password: newPassword });
    await OTP.deleteMany({ email: lowerEmail, purpose: 'reset' });

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// ADMIN LOGIN
// POST /api/auth/admin/login  { id, pass }
// ════════════════════════════════════════════════════════════
exports.adminLogin = async (req, res) => {
  try {
    const { id, pass } = req.body;

    // Master admin
    if (id === 'admin' && pass === 'admin123') {
      return res.json({ success: true, name: 'System Admin', department: 'Central Command', adminId: 'admin' });
    }

    const admin = await Admin.findOne({ adminId: id });
    if (!admin) return res.status(404).json({ message: 'Admin ID not found in the system.', code: 'ID_NOT_FOUND' });
    if (admin.password !== pass) return res.status(401).json({ message: 'Incorrect admin password.', code: 'WRONG_PASSWORD' });

    res.json({ success: true, name: admin.name, department: admin.department, adminId: admin.adminId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// ADMIN REGISTER
// POST /api/auth/admin/register
// ════════════════════════════════════════════════════════════
exports.adminRegister = async (req, res) => {
  try {
    const { name, adminId, department, password, clearance, region } = req.body;
    if (clearance !== '1234') return res.status(403).json({ message: 'Invalid security clearance code.' });

    const exists = await Admin.findOne({ adminId });
    if (exists) return res.status(409).json({ message: 'Admin ID already in use.' });

    await Admin.create({ name, adminId, department, password, region });
    res.json({ success: true, message: 'Admin registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// ADMIN RESET PASSWORD (no OTP — uses clearance code)
// POST /api/auth/admin/reset-password  { adminId, clearance, newPassword }
// ════════════════════════════════════════════════════════════
exports.adminResetPassword = async (req, res) => {
  try {
    const { adminId, clearance, newPassword } = req.body;
    if (clearance !== '1234') return res.status(403).json({ message: 'Invalid security clearance code.' });
    if (adminId === 'admin') return res.status(403).json({ message: 'Cannot reset the master admin account.' });

    const result = await Admin.updateOne({ adminId }, { password: newPassword });
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Admin ID not found.' });

    res.json({ success: true, message: 'Admin password reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
