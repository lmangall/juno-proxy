# Testing Guide


 **Start Firebase Emulators:**
   ```bash
   firebase emulators:start --only functions,firestore
   ```
   
   Local URL: `http://127.0.0.1:5001/juno-proxy-b361b/europe-west6/observatory`

 **For Production Deploy:**
   ```bash
   firebase deploy --only functions
   ```
   Production URL: `https://europe-west6-<project-id>.cloudfunctions.net/observatory`

## Important: Rebuild After Code Changes

**Always rebuild functions after making TypeScript changes:**

```bash
cd functions
npm run build
cd ..
```

The Firebase emulator runs compiled JavaScript from `functions/lib/`, not the TypeScript source files. Changes to `.ts` files won't take effect until you rebuild.

## Authentication

All requests require Bearer token authentication:
- **Header:** `Authorization: Bearer <notifications.token>`
- **Local development token:** `jf93h287fh4983hjf928h37fgh483hf83h`

## Available Endpoints

### POST /notifications/email

Sends emails via Mailgun API with idempotency support.

## Testing Examples

### 1. Direct Mailgun API Test (Reference)

Test Mailgun directly to verify your API key and configuration:

```bash
curl -s --user "api:$MAILGUN_API_KEY" \
    https://api.eu.mailgun.net/v3/futura.now/messages \
    -F from="hello@futura.now" \
    -F to="l.mangallon@gmail.com" \
    -F subject="Direct Mailgun Test" \
    -F text="This is a direct test to Mailgun API"
```

**Expected Response:**
```json
{"id":"<message-id@futura.now>","message":"Queued. Thank you."}
```

### 2. Local Server Email Send

Test your Firebase function via the local emulator:

```bash
curl -v -X POST \
  http://127.0.0.1:5001/juno-proxy-b361b/europe-west6/observatory/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jf93h287fh4983hjf928h37fgh483hf83h" \
  -H "idempotency-key: test-email-001" \
  -d '{
    "from": "hello@futura.now",
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

### 3. Production Server Email Send

For production deployment:

```bash
curl -X POST \
  https://europe-west6-juno-proxy-b361b.cloudfunctions.net/observatory/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <production-token>" \
  -H "idempotency-key: prod-test-001" \
  -d '{
    "from": "hello@futura.now",
    "to": "recipient@example.com",
    "subject": "Production Test",
    "text": "Testing production email functionality"
  }'
```

### 4. Test Idempotency

Send the same request twice with the same `idempotency-key`:

**Expected Behavior:** Both requests return identical responses from the first execution. The second request content is ignored.
