const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve HTML files

// ── CONFIG ───────────────────────────────────────────────────────
const GMAIL_USER     = 'kareemsaffarini9@gmail.com';
const GMAIL_APP_PASS = 'YourAppPasswordHere'; // Generate in Google Account > Security > App Passwords
// ────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS }
});

app.post('/order', async (req, res) => {
  const { firstName, lastName, phone, city, address, qty, notes } = req.body;
  const name = `${firstName} ${lastName}`;

  // ── Send Email ──────────────────────────────────────────────
  try {
    await transporter.sendMail({
      from: `"TeaGloss Orders" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject: `🛒 New Order — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px;">
          <h2 style="color:#1a6fd4;margin-bottom:4px;">New TeaGloss Order</h2>
          <hr style="border:none;border-top:1px solid #ddd;margin:16px 0"/>
          <table style="width:100%;font-size:15px;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#666;width:120px;">Name</td>      <td><b>${name}</b></td></tr>
            <tr><td style="padding:8px 0;color:#666;">Phone</td>     <td><b>${phone}</b></td></tr>
            <tr><td style="padding:8px 0;color:#666;">City</td>      <td><b>${city}</b></td></tr>
            <tr><td style="padding:8px 0;color:#666;">Address</td>   <td><b>${address}</b></td></tr>
            <tr><td style="padding:8px 0;color:#666;">Quantity</td>  <td><b>${qty} bottle${qty > 1 ? 's' : ''}</b></td></tr>
            <tr><td style="padding:8px 0;color:#666;">Notes</td>     <td><b>${notes || '—'}</b></td></tr>
          </table>
        </div>
      `
    });
  } catch (err) {
    console.error('Email error:', err.message);
  }

  // ── Send WhatsApp via Callmebot ─────────────────────────────
  try {
    const msg = encodeURIComponent(
      `🛒 New TeaGloss Order!\n\n` +
      `👤 Name: ${name}\n` +
      `📞 Phone: ${phone}\n` +
      `📍 City: ${city}\n` +
      `🏠 Address: ${address}\n` +
      `📦 Quantity: ${qty} bottle${qty > 1 ? 's' : ''}\n` +
      `📝 Notes: ${notes || '—'}`
    );
    await new Promise((resolve, reject) => {
      https.get(
        `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUM}&text=${msg}&apikey=${CALLMEBOT_KEY}`,
        res => { res.resume(); resolve(); }
      ).on('error', reject);
    });
  } catch (err) {
    console.error('WhatsApp error:', err.message);
  }

  res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`TeaGloss server running → http://localhost:${PORT}/Page.html`));
