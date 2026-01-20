# Trial Email Automation - Make.com Setup Guide

Complete guide for setting up automated trial reminder emails in Make.com.

---

## 📋 Overview

We need to set up **two email automations** in Make.com:

1. **Welcome Email** - Sent immediately when trial starts
2. **Trial Reminder Email** - Sent 2 days before trial ends (Day 12 of 14)

---

## 🔧 Setup 1: Welcome Email (Already Exists - Update Needed)

### **Modify Existing Scenario**

You already have a scenario for welcome emails. We need to update it to handle trial subscriptions.

**Steps:**

1. **Go to Make.com** → Your existing scenario (Stripe → Email)
2. **Stripe Webhook Module** → Should already trigger on `checkout.session.completed`
3. **Add Router** after Stripe webhook:
   - **Route 1:** Trial subscriptions (new)
   - **Route 2:** Direct purchases (existing)

### **Add Filter for Trial**

**After Stripe Webhook, add Filter:**

**Filter Name:** "Is Trial Subscription"

**Condition:**
```
{{1.data.object.subscription}} EXISTS
```

This checks if payment was for a subscription (which has trial) vs one-time payment.

### **Update Email Module (Trial Route)**

**Email Settings:**
- **To:** `{{1.data.object.customer_details.email}}`
- **Subject:** `Welcome to OrangePulse - Your 14-Day Trial Starts Now! 🎁`
- **Content:** HTML from `welcome-email-branded.html`

**Dynamic Date Fields:**

Replace placeholders with Stripe data:

**Trial End Date:**
```
{{formatDate(addDays(now; 14); "MMMM D, YYYY")}}
```

**First Billing Date:**
```
{{formatDate(addDays(now; 14); "MMMM D, YYYY")}}
```

---

## 🔧 Setup 2: Trial Reminder Email (NEW)

### **Create New Scenario**

**Scenario Name:** "Trial Reminder - Day 12"

---

### **Module 1: Stripe Webhook**

**Trigger Event:** `customer.subscription.trial_will_end`

**Setup:**
1. **Add Module** → **Stripe** → **Watch Events**
2. **Connection:** Your Stripe account (Live mode)
3. **Event Type:** Select `customer.subscription.trial_will_end`
4. **Limit:** `1` (for testing)

**What this does:**
- Stripe automatically sends this webhook **3 days before trial ends** (Day 11)
- We'll add a delay to send on Day 12

---

### **Module 2: Tools → Sleep**

**Purpose:** Delay email by 24 hours to send on Day 12 instead of Day 11

**Settings:**
- **Delay:** `86400` seconds (24 hours)

**Why:**
- Stripe sends webhook 3 days before = Day 11
- We wait 24h → Day 12
- Email says "2 days left" ✅

---

### **Module 3: Stripe → Get Customer**

**Purpose:** Get customer email and details

**Settings:**
- **Customer ID:** `{{1.data.object.customer}}`

---

### **Module 4: Email → Send an Email (iCloud SMTP)**

**Connection:** `iCloud OrangePulse` (your existing connection)

**Settings:**

**To:** `{{3.email}}`

**Subject:** `⏰ Your OrangePulse Trial Ends in 2 Days`

**Content Type:** `HTML`

**HTML Content:**

Copy entire content from `trial-reminder-email.html` and replace placeholders:

**Replace `[DATE + 14 DAYS]` with:**
```
{{formatDate(1.data.object.trial_end; "MMMM D, YYYY")}}
```

**Example:**
```html
<p>Your first billing date: <strong>{{formatDate(1.data.object.trial_end; "MMMM D, YYYY")}}</strong></p>
```

**Replace `[PORTAL_LINK]` with:**

Get this from Stripe → Settings → Customer Portal → Copy portal URL

Example: `https://billing.stripe.com/p/login/xxxxx`

---

### **Module 5: Google Sheets → Add Row (Optional)**

**Purpose:** Track who received reminder emails

**Settings:**
- **Spreadsheet:** Your customer tracking sheet
- **Sheet:** Trial Reminders
- **Values:**
  - Email: `{{3.email}}`
  - Trial End: `{{formatDate(1.data.object.trial_end; "YYYY-MM-DD")}}`
  - Sent Date: `{{now}}`
  - Status: `Reminder Sent`

---

## 🧪 Testing the Setup

### **Test Stripe Webhook**

**Important:** You MUST test with real Stripe trial subscription, not just "Send test webhook"

**Steps:**

1. **Switch Stripe to Test Mode**
2. **Create test Payment Link** with 14-day trial
3. **Make test purchase** with test card: `4242 4242 4242 4242`
4. **Check Make.com:**
   - Should trigger welcome email immediately ✅
   - Should schedule trial reminder for Day 12

**Test Trial Reminder:**

Since you can't wait 11 days for testing:

1. **Make.com Scenario** → **Run Once** (manual trigger)
2. **Or:** In Stripe Dashboard, manually trigger webhook:
   - **Developers** → **Webhooks** → **Send test webhook**
   - Event: `customer.subscription.trial_will_end`
   - Click **Send test webhook**

**Check:**
- ✅ Sleep module delays 24h
- ✅ Customer email fetched
- ✅ Reminder email sent with correct date

---

## ⚠️ Important Notes

### **Stripe Webhook Timing:**

- `checkout.session.completed` → **Immediate** (Day 0)
- `customer.subscription.trial_will_end` → **Day 11** (3 days before trial ends)
- Our Sleep delay → **Day 12** (2 days before trial ends)

### **Timezone Considerations:**

Stripe webhooks use UTC time. If you want to send email at specific local time:

**Add Time Filter:**
```
{{formatDate(now; "HH")}} > 9 AND {{formatDate(now; "HH")}} < 18
```

This ensures emails only send 9 AM - 6 PM local time.

### **Rate Limits:**

iCloud SMTP limits:
- **~1000 emails/day** for @icloud.com
- **~200 emails/day** for custom domain

If you have many trials starting, consider:
- Using SendGrid, Mailgun, or AWS SES
- Batch processing with delays

---

## 🔄 Flow Diagram

```
Stripe Trial Subscription Created
         ↓
[Webhook: checkout.session.completed]
         ↓
    Make.com Scenario 1
         ↓
  Welcome Email Sent (Day 0)
         ↓
         ⏳ Wait 11 days...
         ↓
[Webhook: trial_will_end] (Day 11)
         ↓
    Make.com Scenario 2
         ↓
    Sleep 24h (Delay to Day 12)
         ↓
  Reminder Email Sent (Day 12)
         ↓
         ⏳ Wait 2 days...
         ↓
    Auto-billing on Day 14
    (Stripe handles this)
```

---

## 📧 Email Templates Summary

| Email | Trigger | Timing | Template File |
|-------|---------|--------|---------------|
| Welcome | `checkout.session.completed` | Day 0 (Immediate) | `welcome-email-branded.html` |
| Trial Reminder | `trial_will_end` | Day 12 (2 days before) | `trial-reminder-email.html` |
| TradingView Invite | Manual (after username) | Day 1-2 | `tradingview-invite-email.html` |

---

## 🚨 Troubleshooting

### **Webhook Not Triggering:**

1. Check Stripe → **Developers** → **Webhooks**
2. Verify endpoint URL is correct
3. Check webhook logs for errors
4. Ensure webhook is in **Live mode** (not Test)

### **Email Not Sending:**

1. Check Make.com execution history
2. Verify iCloud SMTP credentials
3. Check spam folder
4. Try sending test email manually

### **Wrong Date in Email:**

1. Check timezone in Make.com
2. Verify `formatDate()` function syntax
3. Ensure using `{{1.data.object.trial_end}}` not `{{now}}`

### **Duplicate Emails:**

1. Check Make.com scenario isn't running twice
2. Add deduplication:
   - Google Sheets lookup before sending
   - Check if email already sent to this customer

---

## ✅ Final Checklist

Before going live:

- [ ] Stripe webhooks configured (Live mode)
- [ ] Make.com scenarios tested end-to-end
- [ ] Email templates have correct dynamic fields
- [ ] Dates format correctly (no `[DATE + 14 DAYS]` placeholders)
- [ ] Customer Portal link works in reminder email
- [ ] Tracking spreadsheet updated on each email
- [ ] Spam filters tested (send to Gmail, Outlook, etc.)
- [ ] Mobile rendering tested (view on phone)

---

## 🔗 Resources

- **Stripe Webhook Events:** https://stripe.com/docs/api/events/types
- **Make.com Stripe Module:** https://www.make.com/en/help/apps/finance/stripe
- **Date Formatting:** https://www.make.com/en/help/functions/date-and-time-functions

---

**Need help?** Check Make.com execution logs for detailed error messages.

**Questions?** support@orangepulse.net
