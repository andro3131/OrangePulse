# iCloud SMTP Setup Guide for Make.com

## Connection Settings

When you click "Create a connection" in Make.com, use these settings:

### Required Fields:

**Connection name:**
```
iCloud OrangePulse
```

**Host:**
```
smtp.mail.me.com
```

**Port:**
```
587
```

**Secure connection:**
```
TLS
```

**Username:**
```
your@icloud.com
```
(Replace with your actual iCloud email or support@orangepulse.net if connected to iCloud)

**Password:**
```
[paste your app-specific password here]
```
⚠️ Use the app-specific password you just generated (xxxx-xxxx-xxxx-xxxx format)
⚠️ NOT your regular iCloud password!

---

## Troubleshooting

If connection fails:
- Make sure you're using app-specific password (not regular password)
- Check that TLS is selected (not SSL)
- Verify port is 587
- Try removing dashes from app-specific password (just letters/numbers)

---

## Next Step After Connection Works:

Fill in email fields:
- **To:** Use dynamic data from Stripe (customer email)
- **Subject:** 🎉 Welcome to OrangePulse - Your Access Details
- **Content:** Welcome message with manual link
