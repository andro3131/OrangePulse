# Customer Management Guide

## 📊 Tracking Spreadsheet Setup

### How to Import:

1. **Open Google Sheets:** https://sheets.google.com
2. **Create New Sheet:** Click "+ Blank"
3. **Import CSV:**
   - File → Import
   - Upload tab → Upload `customer-tracking-template.csv`
   - Import location: Replace current sheet
   - Click "Import data"

4. **Format the sheet:**
   - Freeze first row (View → Freeze → 1 row)
   - Add filters (Data → Create a filter)
   - Color-code status column (Optional)

---

## 📧 Follow-up Email Workflow

### When Customer Replies with TradingView Username:

**Example customer reply:**
```
Hi,
My TradingView username is: john_trader
Thanks!
John
```

### Your Process:

**1. Update Tracking Sheet:**
- Find customer by email
- Add TV username to column "TV Username"
- Change "Invite Sent" to "NO" (will change to YES later)

**2. Send Invite on TradingView:**
- Log in to TradingView
- Go to Pine Script editor
- Open OrangePulse script
- Click "Share" → "Invite-only script"
- Enter username: `john_trader`
- Send invite

**3. Send Follow-up Email:**
- Open file: `tradingview-invite-email.html`
- Copy entire HTML content
- Compose new email in your email client
- **Replace:** `[TRADINGVIEW_USERNAME]` with actual username (appears 2x in template)
- Send to customer email
- **OR** use iCloud Mail with HTML email composer

**4. Update Tracking Sheet:**
- Change "Invite Sent" to "YES"
- Add today's date in Notes if needed
- Status: "Active"

---

## 📝 Email Template Usage

### Quick Copy-Paste Method:

1. Open `tradingview-invite-email.html` in browser
2. Copy all (Cmd+A, Cmd+C)
3. Paste into email (Gmail/iCloud supports HTML paste)
4. Find `[TRADINGVIEW_USERNAME]` and replace with real username
5. Send!

### Alternative: Plain Text Version

If your email client doesn't support HTML well, use this simplified version:

```
Subject: ✅ TradingView Invite Sent - OrangePulse

Hi [Name],

Great news! Your TradingView invite for OrangePulse has been sent. 🎉

NEXT STEPS:
1. Check your TradingView notifications (bell icon in top right)
2. Accept the invite from OrangePulse
3. Add the indicator to your chart: Indicators → Invite-only scripts → OrangePulse
4. Configure using Chapter 4-6 in the User Manual

Your username: [TRADINGVIEW_USERNAME]

The invite should appear within a few minutes. If you don't see it:
- Double-check notifications
- Verify your username is correct
- Reply to this email if still missing

Download manual: https://orangepulse.net/OrangePulse_v3.0_User_Manual.pdf

Need help? Just reply to this email or contact support@orangepulse.net

Happy trading!
OrangePulse Team
```

---

## 🔄 Daily Workflow

### Morning Routine (5-10 minutes):

1. **Check Stripe Dashboard** for new payments
2. **Check Email** for TradingView username replies
3. **Update Tracking Sheet:**
   - Add new customers
   - Mark invites as sent
   - Follow up on pending usernames (if >3 days old)

### When Customer Doesn't Reply:

**After 3 days:** Send friendly reminder

```
Subject: 🔔 Quick reminder - TradingView Username needed

Hi [Name],

Just a friendly reminder! To complete your OrangePulse setup, we need your TradingView username.

Simply reply to this email with your username and we'll send the script invite within 24-48 hours.

Example: "My username is: john_trader"

Need help finding your username? 
Login to TradingView → Click your profile (top right) → Your username is displayed there.

Questions? We're here to help!

Best regards,
OrangePulse Team
```

---

## 📈 Tracking Stats

### Useful Metrics (Optional):

Add these to your spreadsheet if you want analytics:

- **Total customers:** Count of rows
- **Conversion rate:** (Invited customers / Total customers) × 100
- **Average response time:** Days between purchase and username received
- **Active subscriptions:** Monthly vs Lifetime
- **MRR (Monthly Recurring Revenue):** Count of Monthly × €99

---

## ✅ Customer Onboarding Checklist

For each new customer:

- [ ] Payment received in Stripe
- [ ] Welcome email sent automatically (Make.com)
- [ ] Customer added to tracking sheet
- [ ] Customer replied with TV username
- [ ] Invite sent on TradingView
- [ ] Follow-up email sent
- [ ] Tracking sheet updated (Invite Sent = YES)
- [ ] Status = Active

**Average time per customer: 5 minutes**

---

## 🚨 Common Issues

### Customer can't find invite:
- Check if username is spelled correctly
- Resend invite on TradingView
- Ask them to check spam/filters

### Customer hasn't sent username after 7 days:
- Send reminder email
- Check if welcome email was delivered

### Refund request:
- Process in Stripe Dashboard
- Update tracking sheet: Status = "Refunded"
- Remove TradingView access if already granted

---

**You're all set!** 🎉

This system will help you manage customers efficiently until you decide to automate further.
