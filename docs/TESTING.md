# Testing Guide

This guide provides comprehensive instructions for testing the proxy functionality using curl commands.

## Prerequisites

1. **Deploy the Firebase Functions:**
   ```bash
   firebase deploy --only functions
   ```

2. **Set up configuration:**
   ```bash
   source firebase.env.sh
   ```

3. **Get your Firebase Function URL:**
   After deployment, note the URL (typically: `https://europe-west6-<project-id>.cloudfunctions.net/observatory`)

firebase emulators:start --only functions,firestore

   http://127.0.0.1:5001/juno-proxy-b361b/europe-west6/observatory
   

## Authentication

All requests require Bearer token authentication:
- **Header:** `Authorization: Bearer <notifications.token>`
- **Current token:** `secret` (change in production)

## Available Endpoints

### POST /notifications/email

Sends emails via Resend API with idempotency support.

## Testing Examples

### 1. Basic Email Send

```bash
curl -X POST \
  http://127.0.0.1:5001/juno-proxy-b361b/europe-west6/observatory/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jf93h287fh4983hjf928h37fgh483hf83h" \
  -H "idempotency-key: test-email-001" \
  -d '{
    "from": "noreply@yourdomain.com",
    "to": "recipient@example.com",
    "subject": "Test Email",
    "text": "This is a test email sent via the proxy.",
    "html": "<h1>Test Email</h1><p>This is a test email sent via the proxy.</p>"
  }'
```

**Expected Response (Success):**
```json
{
  "id": "resend-email-id",
  "from": "noreply@yourdomain.com",
  "to": "recipient@example.com",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Idempotency

Send the same request twice with the same `idempotency-key`:

```bash
# First request
curl -X POST \
  https://europe-west6-juno-proxy-b361b.cloudfunctions.net/observatory/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret" \
  -H "idempotency-key: duplicate-test-001" \
  -d '{
    "from": "noreply@yourdomain.com",
    "to": "test@example.com",
    "subject": "Idempotency Test",
    "text": "Testing idempotency feature"
  }'

# Second request (same idempotency-key)
curl -X POST \
  https://europe-west6-juno-proxy-b361b.cloudfunctions.net/observatory/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret" \
  -H "idempotency-key: duplicate-test-001" \
  -d '{
    "from": "noreply@yourdomain.com",
    "to": "different@example.com",
    "subject": "Different Subject",
    "text": "Different content"
  }'
```

**Expected Behavior:** Both requests return the same response from the first execution.

### 3. Test Authentication Failures

#### Missing Authorization Header
```bash
curl -X POST \
  https://europe-west6-juno-proxy-b361b.cloudfunctions.net/observatory/notifications/email \
  -H "Content-Type: application/json" \
  -H "idempotency-key: auth-test-001" \
  -d '{
    "from": "noreply@yourdomain.com",
    "to": "test@example.com",
    "subject": "Auth Test",
    "text": "This should fail"
  }'
```

**Expected Response:**
```
Status: 500
Body: "Access restricted."
```

#### Wrong Token
```bash
curl -X POST \
  https://europe-west6-juno-proxy-b361b.cloudfunctions.net/observatory/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer wrong-token" \
  -H "idempotency-key: auth-test-002" \
  -d '{
    "from": "noreply@yourdomain.com",
    "to": "test@example.com",
    "subject": "Auth Test",
    "text": "This should fail"
  }'
```

**Expected Response:**
```
Status: 500
Body: "Access restricted."
```

### 4. Test Missing Idempotency Key

```bash
curl -X POST \
  https://europe-west6-juno-proxy-b361b.cloudfunctions.net/observatory/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret" \
  -d '{
    "from": "noreply@yourdomain.com",
    "to": "test@example.com",
    "subject": "No Idempotency Key",
    "text": "This should fail"
  }'
```

**Expected Response:**
```
Status: 500
Body: "An idempotency key is mandatory to provide same result no matter how many times it's applied."
```

### 5. Test Invalid Email Data

```bash
curl -X POST \
  https://europe-west6-juno-proxy-b361b.cloudfunctions.net/observatory/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret" \
  -H "idempotency-key: invalid-email-001" \
  -d '{
    "from": "invalid-email",
    "to": "also-invalid",
    "subject": "Invalid Email Test"
  }'
```

**Expected Response:**
```
Status: 500
Body: Error details from Resend API
```

## Testing Workflow

1. **Start with authentication tests** to ensure security is working
2. **Test basic functionality** with valid email data
3. **Verify idempotency** by sending duplicate requests
4. **Test error scenarios** to ensure proper error handling
5. **Monitor Firebase Console** for function logs and Firestore collections (`query` and `cache`)

## Monitoring

### Check Firestore Collections

After successful requests, verify data in Firebase Console:

- **`query` collection:** Contains request status tracking
- **`cache` collection:** Contains cached responses for idempotency

### View Function Logs

```bash
firebase functions:log --only observatory
```

## Configuration Notes

- **Resend API Key:** Set via `mail.resend.api_key` in Firebase config
- **Auth Token:** Set via `notifications.token` in Firebase config
- **Region:** Functions deployed to `europe-west6`
- **Timeout:** 30 seconds maximum execution time

## Production Considerations

1. **Change default token** from `"secret"` to a secure random value
2. **Use environment-specific domains** for the `from` email address
3. **Monitor rate limits** for Resend API usage
4. **Set up proper error alerting** for failed requests
5. **Consider implementing request validation** for email format and required fields
