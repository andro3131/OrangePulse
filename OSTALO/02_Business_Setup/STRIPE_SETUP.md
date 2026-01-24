# Stripe Configuration Guide

## Step 1: Set Success URL (Redirect after payment)

After a customer completes payment, Stripe needs to know where to redirect them.

### Instructions:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)

2. Navigate to **Products** in left menu

3. Click on your **Monthly Plan** product

4. Scroll to **Payment links** or **Checkout settings**

5. Find **Success URL** field and enter:
   ```
   https://yourdomain.com/thank-you.html?session_id={CHECKOUT_SESSION_ID}
   ```
   
   Replace `yourdomain.com` with your actual domain (e.g., `orangepulse.net`)

6. Click **Save**

7. **Repeat for Lifetime Plan** product

### Alternative: Update Payment Links Directly

If you're using Stripe Payment Links:

1. Go to **Payment links** in Stripe Dashboard
2. Click on your Monthly payment link
3. Click **Edit**
4. Under **After payment**, set:
   - **Success page**: Custom URL
   - URL: `https://orangepulse.net/thank-you.html?session_id={CHECKOUT_SESSION_ID}`
5. Save
6. Repeat for Lifetime payment link

---

## Step 2: Enable Email Receipts (Optional but Recommended)

Stripe can automatically send receipt emails.

### Instructions:

1. Go to **Settings** → **Emails** in Stripe Dashboard

2. Under **Customer emails**, toggle ON:
   - ✅ **Successful payments** (receipt)
   - ✅ **Refunded payments**
   - ✅ **Failed payments**

3. Click **Save**

**Note:** These are just receipts, not your welcome email. You still need to send the welcome email with User Manual manually.

---

## Step 3: Update Your Pricing Button Links

Your current pricing buttons in `index.html` already have the correct Stripe links:

**Monthly:** 
```
https://buy.stripe.com/6oU7sM6yGeLAgDSfLd9Zm01
```

**Lifetime:**
```
https://buy.stripe.com/7sYdRa1emavkafuaqT9Zm00
```

These should redirect to `thank-you.html` after payment if you configured Step 1 correctly.

---

## Step 4: Test the Complete Flow

### Test Mode (Recommended First):

1. In Stripe Dashboard, toggle **Test mode** ON (top right)

2. Visit your website and click "Start Monthly Plan"

3. Use test card: `4242 4242 4242 4242`
   - CVV: any 3 digits (e.g., 123)
   - Expiry: any future date (e.g., 12/28)
   - ZIP: any (e.g., 12345)

4. Complete payment

5. **Expected result:**
   - Redirects to `thank-you.html`
   - Shows success message
   - You receive Stripe email notification

6. Check Stripe Dashboard → **Payments** to see test payment

### Live Mode:

Once test mode works:

1. Toggle **Test mode** OFF in Stripe
2. Test with real card (your own)
3. Verify redirect works
4. Check email receipt
5. **Immediately refund** your test payment (Dashboard → Payments → Refund)

---

## Step 5: Manual Process Workflow

When you receive a **real payment notification** email from Stripe:

### 1. Check Payment Details
- Open Stripe Dashboard → Payments
- Find the payment
- Note: customer email, name, amount, plan

### 2. Send Welcome Email
- Open `email-templates.md`
- Copy the email template
- Compose new email from Gmail/your email client
- Replace [Customer Name] and [Plan type]
- **Attach:** OrangePulse_User_Manual.pdf
- Send to customer email

### 3. Wait for Customer Reply
- Customer will reply with TradingView username
- Typically within 1-7 days

### 4. Send TradingView Invite
- Go to TradingView
- Invite user to OrangePulse script
- Send follow-up email (template in `email-templates.md`)

### 5. Track in Spreadsheet (Optional)
- Update your tracking sheet
- Mark invite as sent
- Customer is now fully onboarded! ✅

---

## Quick Checklist

Before going live:

- [ ] Stripe Success URL configured for both Monthly and Lifetime
- [ ] Email receipts enabled in Stripe settings
- [ ] Test purchase in Test Mode completed successfully
- [ ] `thank-you.html` is uploaded to website
- [ ] `OrangePulse_User_Manual.pdf` ready to send
- [ ] Email templates ready in `email-templates.md`
- [ ] Support email (support@orangepulse.net) is accessible

**You're ready to accept customers!** 🚀

---

## Need Help?

- Stripe Docs: https://stripe.com/docs/payments/checkout/custom-success-page
- Stripe Support: https://support.stripe.com/
