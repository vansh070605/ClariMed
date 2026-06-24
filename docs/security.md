# Security Documentation

ClariMed handles sensitive medical and personal data. As such, several core security paradigms have been implemented in the MVP phase to ensure data privacy and integrity.

## Implemented Security Features

### 1. HttpOnly Cookies
Authentication tokens (JWTs) are no longer stored in `localStorage` or `sessionStorage` where they could be accessed by malicious client-side scripts. Instead, they are securely managed by the browser via `HttpOnly` cookies, heavily mitigating Cross-Site Scripting (XSS) token exfiltration risks.

### 2. SameSite Protection
The session cookie is configured with `SameSite=Lax`, providing baseline protection against Cross-Site Request Forgery (CSRF) attacks while ensuring smooth navigation.

### 3. JWT Authentication
We utilize secure, cryptographically signed JSON Web Tokens (`HS256` algorithm) with short expiration windows to manage stateless user sessions securely.

### 4. Ownership Validation
All data endpoints implicitly filter by `user_id`. It is cryptographically impossible for User A to fetch, view, edit, or delete a report owned by User B, as the backend ORM queries are strictly scoped to the `current_user` derived from the verified JWT.

### 5. Input Validation
FastAPI utilizes Pydantic to strictly type-check and validate all incoming payloads. The frontend leverages `zod` schema validation to ensure only correctly formatted data is transmitted.

---

## Known MVP Limitations

While robust for a Minimum Viable Product, ClariMed has several known limitations that must be addressed before HIPAA-compliant production scaling:

- **Local Filesystem Storage:** PDF reports are temporarily saved to the local disk before processing. In production, this must be migrated to a secure, encrypted S3 bucket.
- **No Rate Limiting:** The API currently lacks rate-limiting middleware, making it susceptible to brute-force attacks on the `/auth/login` endpoint or DoS attacks via massive PDF uploads.
- **No Audit Logging:** Comprehensive action-auditing (e.g., logging every time a report is viewed or an IP address changes) is not currently implemented.
- **No OCR Support:** We currently rely on native PDF text extraction. Scanned PDFs without text layers will fail extraction gracefully but yield no data.
