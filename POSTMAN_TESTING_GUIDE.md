# Marathon Backend API - Postman Testing Guide

## 📋 Step-by-Step Testing Instructions

### Prerequisites
1. Import the collection: `Marathon_Backend_API.postman_collection.json`
2. Server running on: `http://localhost:5000`

---

## 🔐 STEP 1: Admin Registration & Login

### 1.1 Register Admin (First Time Only)
**Request:** `POST /auth/register`

**Body:**
```json
{
    "email": "admin@example.com",
    "password": "admin123"
}
```

**Expected Response:**
```json
{
    "message": "Admin registered successfully",
    "id": "uuid-here"
}
```

---

### 1.2 Login Admin
**Request:** `POST /auth/login`

**Body:**
```json
{
    "email": "admin@example.com",
    "password": "admin123"
}
```

**Expected Response:**
```json
{
    "status": 200,
    "message": "Login successful",
    "email": "admin@example.com",
    "access_token": "eyJhbGciOiJIUz..."
}
```

**✅ Action:** Copy the `access_token` - you'll need it for admin endpoints.

---

## 📝 STEP 2: Create Registration

### 2.1 Create a New Registration
**Request:** `POST /registrations`

**Body:**
```json
{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "+919876543210",
    "gender": "Male",
    "dateOfBirth": "1995-05-15",
    "age": 28,
    "presentAddress": "123 Main Street, Chennai",
    "tshirtSize": "L",
    "raceCategory": "KM_5",
    "emergencyContactName": "Jane Doe",
    "emergencyContactMobile": "+919876543211",
    "waiverAccepted": true,
    "amount": 300
}
```

**Expected Response:**
```json
{
    "id": "temp-registration-uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "razorpayOrderId": "order_S3EmrLwH2o6XrR",
    ...
}
```

**✅ Action:** Copy the `razorpayOrderId` - you'll need it for payment verification.

**📌 Note:** 
- This creates a TEMPORARY registration
- Data is stored in `TempRegistration` table
- Razorpay order is created automatically

---

## 💳 STEP 3: Verify Payment (Test Mode)

### 3.1 Verify Payment with Test Data
**Request:** `POST /payment/verify`

**Body:**
```json
{
    "razorpayOrderId": "order_S3EmrLwH2o6XrR",
    "razorpayPaymentId": "pay_test123456789",
    "signature": "test_signature"
}
```

**⚠️ Important:** 
- Use `razorpayPaymentId` starting with `pay_test` for test mode
- Any signature works in test mode

**Expected Response:**
```json
{
    "success": true,
    "message": "Payment verified and Registration confirmed.",
    "ticketId": "AM26-001",
    "emailSent": true
}
```

**✅ What Happens:**
1. ✅ Payment verified (test mode)
2. ✅ Registration moved from `TempRegistration` → `Registration`
3. ✅ Ticket ID generated: `AM26-001`, `AM26-002`, etc.
4. ✅ Email sent with:
   - Event Name: AYYAPANTHANGAL MARATHON 2026
   - Date: Sunday, 15 February 2026
   - Venue: Ayyapanthangal
   - Category: KM_5
   - Ticket ID: AM26-001
   - Amount Paid: ₹300
5. ✅ `emailSent` flag set to `true`

---

## 👨‍💼 STEP 4: Admin Operations

### 4.1 Get All Registrations
**Request:** `GET /registrations/admin/list`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Expected Response:**
```json
{
    "message": "Registrations fetched successfully",
    "data": [
        {
            "id": "uuid",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "ticketId": "AM26-001",
            "paymentStatus": "PAID",
            ...
        }
    ]
}
```

---

### 4.2 Get Registration Stats
**Request:** `GET /registrations/admin/stats`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Expected Response:**
```json
{
    "message": "Stats fetched successfully",
    "data": {
        "totalCount": 5,
        "totalRevenue": 1500
    }
}
```

---

### 4.3 Get Registration by ID
**Request:** `GET /registrations/admin/:id`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**URL Parameter:**
- Replace `:id` with actual registration ID

**Expected Response:**
```json
{
    "message": "Registration fetched successfully",
    "data": {
        "id": "uuid",
        "name": "John Doe",
        "ticketId": "AM26-001",
        ...
    }
}
```

---

## 🔄 Complete Flow Example

### Scenario: Register a new participant and verify payment

1. **Create Registration**
   ```
   POST /registrations
   → Get razorpayOrderId: "order_ABC123"
   ```

2. **Verify Payment**
   ```
   POST /payment/verify
   Body: {
     "razorpayOrderId": "order_ABC123",
     "razorpayPaymentId": "pay_test123",
     "signature": "any"
   }
   → Get ticketId: "AM26-001"
   → Email sent ✅
   ```

3. **Check Registration (Admin)**
   ```
   GET /registrations/admin/list
   Headers: Authorization: Bearer TOKEN
   → See the confirmed registration
   ```

---

## 🎯 Testing Different Categories

### Test KM_1_5 Category:
```json
{
    "raceCategory": "KM_1_5",
    "amount": 200
}
```

### Test KM_3 Category:
```json
{
    "raceCategory": "KM_3",
    "amount": 250
}
```

### Test KM_5 Category:
```json
{
    "raceCategory": "KM_5",
    "amount": 300
}
```

---

## ⚠️ Important Notes

### Test Mode
- Only works when `razorpayPaymentId` starts with `pay_test`
- Real Razorpay payments require valid signatures
- For production testing, use `client/index.html`

### Email Configuration
Make sure these are set in your `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Ticket ID Sequence
- First registration: `AM26-001`
- Second registration: `AM26-002`
- Third registration: `AM26-003`
- And so on...

### Gender Options
- `Male`
- `Female`
- `Others`

---

## 🐛 Troubleshooting

### Error: "Invalid payment signature"
- Make sure `razorpayPaymentId` starts with `pay_test`

### Error: "Unauthorized"
- Get a fresh token from `/auth/login`
- Add `Authorization: Bearer TOKEN` header

### Error: "Email already exists"
- Use a different email address
- Or check existing registrations

### Error: "Registration not found"
- Make sure you created a registration first
- Check the `razorpayOrderId` is correct

---

## 📧 Email Preview

After successful payment, user receives:

```
Subject: Marathon Event Registration Successful

AYYAPANTHANGAL MARATHON 2026

Event Details:
📅 Date: Sunday, 15 February 2026
📍 Venue: Ayyapanthangal
🏃 Category: KM_5
🎫 Ticket ID: AM26-001
💰 Amount Paid: ₹300

Please keep this Ticket ID safe for entry.
See you at the starting line!
```

---

## 🚀 Quick Test Sequence

```bash
1. POST /auth/login → Get token
2. POST /registrations → Get order ID
3. POST /payment/verify → Get ticket ID
4. GET /registrations/admin/list → Verify registration
```

Done! 🎉
