
Purpose in Your Proxy
In your codebase, the idempotency key serves as a deduplication mechanism for API requests:

Prevents duplicate operations - If the same email request is sent multiple times with the same key, it will only be processed once
Returns cached results - Subsequent requests with the same key return the original response
Handles network issues - If a client retries due to network timeouts, they won't create duplicate emails
How It Works in Your Code
From 
proxy.ts
:

typescript
const key = req.get("idempotency-key");  // Extract from header

const query = await readQuery(key);      // Check if already processed
if (nonNullish(query)) {
  await pollCachedResponse({key, res});  // Return cached result
  return;
}
Example Scenario
Without idempotency key:

Send email request → Email sent ✅
Network timeout, client retries → Another email sent ❌
With idempotency key:

Send email with key "email-001" → Email sent ✅
Network timeout, retry with same key "email-001" → Returns cached response, no duplicate email ✅
Best Practices
Use unique, meaningful identifiers like user-123-welcome-email or UUIDs
Keep keys consistent for the same logical operation
Include context in the key to avoid collisions across different operations
This prevents issues like sending duplicate notification emails to users when network problems cause request retries.