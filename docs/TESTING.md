
# Firebase Notes

## Node Version
Use Node **22**, otherwise Firebase may not work:

```bash
➜  proxy git:(main) ✗ nvm use 22
```

## Functions

-   **2nd-gen functions**:  
    Using `functions.config()` is an indication of **first-gen** functions.
    

## 401 error on Curl
If you see:
    

```
www-authenticate: Bearer error="invalid_token"
```

-   This **does not mean your token is wrong**.
    
-   It indicates **Google expects an Identity Token / IAM authentication** and is blocking the request.
    

When setting up first time, you need to activate firestore API and init a store within your Firebase project. 

Use this command to get logs from deployment in terminal:

```bash
firebase functions:log --only observatory
```







### 1️⃣ Load all variables from `.env`

```bash
export $(cat functions/.env | xargs)
```

### 2️⃣ Verify variables are set

```bash
echo $MAIL_FROM
echo $MAILGUN_API_KEY
echo $NOTIFICATIONS_TOKEN
```

---

### **Start Firebase Emulators**

```bash
firebase emulators:start --only functions,firestore
```

Local URL: `http://127.0.0.1:5001/juno-proxy-b361b/europe-west6/observatory`

---

### **For Production Deploy**

```bash
firebase deploy --only functions
```

set multiple environment variables for Firebase Functions in one command:

```bash
firebase functions:config:set mail.host="smtp.eu.mailgun.org" mail.from="hello@futura.now" mail.subject="Juno ⚠️" mailgun.api_key="-" notifications.token=""
```


Production URL: `https://europe-west6-<project-id>.cloudfunctions.net/observatory`

---

## Important: Rebuild After Code Changes

Always rebuild functions after making TypeScript changes:

```bash
cd functions
npm run build
cd ..
```

The Firebase emulator runs compiled JavaScript from `functions/lib/`, not the TypeScript source files. Changes to `.ts` files won't take effect until you rebuild.

---

## Authentication

All requests require Bearer token authentication:

-   **Header:** `Authorization: Bearer <notifications.token>`
    
-   **Local development token:** `$NOTIFICATIONS_TOKEN`
    

---

## Available Endpoints

### POST /notifications/email

Sends emails via Mailgun API with idempotency support.

---

## Testing Examples

### 1\. Direct Mailgun API Test (Reference)

Test Mailgun directly using env variables:

```bash
curl -s --user "api:$MAILGUN_API_KEY" \
    https://api.eu.mailgun.net/v3/futura.now/messages \
    -F from="$MAIL_FROM" \
    -F to="l.mangallon@gmail.com" \
    -F subject="Direct Mailgun Test" \
    -F text="This is a direct test to Mailgun API"
```

**Expected Response:**

```json
{"id":"<message-id@futura.now>","message":"Queued. Thank you."}
```

---

### 2\. Local Server Email Send

Test your Firebase function via the local emulator:

```bash
curl -v -X POST \
  http://127.0.0.1:5001/juno-proxy-b361b/europe-west6/observatory/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NOTIFICATIONS_TOKEN" \
  -H "idempotency-key: test-email-001" \
  -d '{
    "from": "'"$MAIL_FROM"'",
    "to": "l.mangallon@gmail.com",
    "subject": "Firebase Function Test",
    "text": "This email is sent through Firebase Functions and Mailgun!"
  }'
```

**Expected Response (Success):**

```json
{
  "success": true,
  "message": "Email sent successfully",
  "timestamp": "2025-08-20T12:35:14.488Z",
  "mailgunResponse": {
    "id": "<message-id@futura.now>",
    "message": "Queued. Thank you."
  },
  "emailDetails": {
    "from": "hello@futura.now",
    "to": "l.mangallon@gmail.com",
    "subject": "Firebase Function Test",
    "hasHtml": false,
    "hasText": true
  }
}
```

---

### 3\. Production Server Email Send

For production deployment using env variables:

```bash
curl -X POST \
  https://europe-west6-juno-proxy-b361b.cloudfunctions.net/observatory/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NOTIFICATIONS_TOKEN" \
  -H "idempotency-key: prod-test-001" \
  -d '{
    "from": "'"$MAIL_FROM"'",
    "to": "recipient@example.com",
    "subject": "Production Test",
    "text": "Testing production email functionality"
  }'
```

---

### 4\. Test Idempotency

Send the same request twice with the same `idempotency-key`.

**Expected Behavior:** Both requests return identical responses from the first execution. The second request content is ignored.
