# eGovPH SSO (Single Sign-On) Integration Documentation

Integration API for eGovPH's Single Sign-On service — allows partner agencies/apps to authenticate citizens using their eGovPH identity (OAuth 2.0 authorization code flow), retrieve their verified profile data, and implement full SSO-based login on their own platforms.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Test Account](#test-account)
- [Authentication Flow](#authentication-flow)
  - [Generate Access Token](#generate-access-token)
  - [SSO Authentication](#sso-authentication)
- [Core Technical Requirements](#core-technical-requirements)
- [SSO Implementation Logic](#sso-implementation-logic)
- [Integration Checklist](#integration-checklist)
- [Expected Outcome](#expected-outcome)

---

## Environment Variables

| Variable | Description |
|---|---|
| `{{base_url}}` | The base URL of the eGovPH SSO API (e.g. staging or production) |
| `{{partner_code}}` | The unique code identifying your partner/agency system |
| `{{partner_secret}}` | The secret key associated with your partner account — **never expose client-side** |
| `{{access_token}}` | JWT access token returned by the token exchange endpoint, used to authenticate the profile-resolution request |

---

## Test Account

Use a test eGov identity to try the integration end-to-end before going live.

| Field | Value |
|---|---|
| Test email | `josie@yopmail.com` |

> Mint an exchange code for your app's partner using this test identity — see [Core Technical Requirements](#core-technical-requirements) for how the exchange code is delivered to your redirect URL.

---

## Authentication Flow

eGovPH SSO follows the **OAuth 2.0 authorization code flow**:

1. User authenticates with eGovPH and is redirected back to your `Base URL for SSO` with an `exchange_code` appended.
2. Your backend exchanges that `exchange_code` for an `access_token` — [Generate Access Token](#generate-access-token).
3. Your backend uses the `access_token` to resolve the user's verified profile — [SSO Authentication](#sso-authentication).

---

### Generate Access Token

Exchanges an authorization code for an access token using the eGov SSO service. This is the first step a partner system performs after a user successfully authenticates and an exchange code is issued.

**Method & URL**
```
POST {{base_url}}/api/token
```

**Request Body** (`application/json`)

| Field | Type | Required | Description |
|---|---|---|---|
| `exchange_code` | string | Yes | The authorization code received after user authentication. |
| `scope` | string | Yes | The requested scope. Use `SSO_AUTHENTICATION` for standard SSO login. |
| `partner_code` | string | Yes | The unique code identifying the partner/agency system. |
| `partner_secret` | string | Yes | The secret key associated with the partner account. |

**Example Request Body**
```json
{
  "exchange_code": "generated_exchange_code",
  "scope": "SSO_AUTHENTICATION",
  "partner_code": "{{partner_code}}",
  "partner_secret": "{{partner_secret}}"
}
```

**Notes**
- The `exchange_code` is **single-use** and expires after a short period.
- Store `partner_secret` securely — **never expose it on the client side**. This call must be made server-to-server.
- Use the returned access token in the `Authorization` header of subsequent requests.

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base_url}}/api/token' \
  --header 'Content-Type: application/json' \
  --data '{
    "exchange_code": "generated_exchange_code",
    "scope": "SSO_AUTHENTICATION",
    "partner_code": "{{partner_code}}",
    "partner_secret": "{{partner_secret}}"
}'
```

**Example Response · 200 OK**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3N0Zy1zdXBlcmFwcC1zc28ub3VlZy5pbmZvIiwiaWF0IjoxNzgzMzk3NDEyLjEwNDY0LCJzY29wZSI6IlNTT19BVVRIRU5USUNBVElPTiIsInBjIjoiVEVTVF9BR0VOQ1kiLCJ0a2kiOjY4LCJqdGkiOiJNVlBDQkVVVkNHUFpSIiwiZXhwIjoxNzgzNDAxMDEyfQ._zr4dq-hwNpVctc-Vm6j5cyVn98W0FOQS3fxY4UwNcE"
}
```

**Responses**

| Status | Description |
|---|---|
| `200 OK` | Access token successfully generated. |
| `403 Forbidden` | Invalid or unauthorized partner credentials. |
| `422 Unprocessable Entity` | The exchange code is invalid or has already been used/expired. |

**Saved Examples:** 200 - Success · 422 - Invalid Exchange Code · 403 - Forbidden

---

### SSO Authentication

Resolves the authenticated user's profile for a partner application via SSO. Call this **after** obtaining an access token from `POST /api/token`.

**Method & URL**
```
POST {{base_url}}/api/partner/sso_authentication
```

**Authentication**

| Type | Details |
|---|---|
| Bearer Token | Pass the access token in the `Authorization` header: `Bearer {{access_token}}` |

**Request Body**

None — this endpoint takes no request body. The caller is identified entirely by the bearer access token.

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base_url}}/api/partner/sso_authentication' \
  --header 'Authorization: Bearer {{access_token}}'
```

**Responses**

| Status | Meaning |
|---|---|
| `200 OK` | Authentication successful. Returns the authenticated citizen's profile (personal details, national ID, passport, etc.). |
| `401 Unauthorized` | The access token is missing, invalid, or expired. |

**Example Response · 200 OK**
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "uniqid": "MVPCBEUVCGPZR",
    "email": "josie@yopmail.com",
    "birth_date": "1990-01-01",
    "first_name": "JOSIE",
    "middle_name": "SANTOS",
    "last_name": "DELA CRUZ",
    "suffix": null,
    "gender": "female",
    "nationality": "Filipino",
    "photo": "https://staging-files.oueg.info/staging/<file_id>.png",
    "mobile": "+639090000000",
    "address": "1123 RIZAL ST., POBLACION, CITY OF ALAMINOS, PANGASINAN, PHILIPPINES",
    "street": "1123 RIZAL ST.",
    "barangay": "POBLACION",
    "municipality": "CITY OF ALAMINOS",
    "region": "REGION I (ILOCOS REGION)",
    "province": "PANGASINAN",
    "country": "Philippines",
    "country_alpha_2_code": "PH",
    "country_alpha_3_code": "PHL",
    "postal": null,
    "address_line_2": null,
    "barangay_code": "0105503021",
    "province_code": "0105500000",
    "municipality_code": "0105503000",
    "region_code": "0100000000",
    "country_id": 175,
    "foreign_address": null,
    "signature": "data:image/png;base64,<...>",
    "signature_url": "https://egov-stg.s3.ap-southeast-1.amazonaws.com/tmp/signatures/<signed_s3_url>",
    "additional_information": {
      "health_data": {
        "weight": "55",
        "height": "168",
        "eyes_color": "Black",
        "complexion": "WHITE"
      },
      "birth_place": {
        "birth_country": "Philippines",
        "birth_province": "PANGASINAN",
        "birth_municipality": "CITY OF ALAMINOS"
      },
      "other_personal_information": {
        "marital_status": "Single",
        "religion": "N/A"
      },
      "mother_details": {
        "mother_maiden_lastname": "SANTOS",
        "mother_maiden_firstname": "MARIE",
        "mother_maiden_middlename": "GARCIA",
        "mother_birthdate": "2021-03-18"
      },
      "father_details": {
        "father_lastname": "N/A",
        "father_firstname": "N/A",
        "father_birthdate": "1978-10-09"
      },
      "emergency_information": {
        "emergency_name": "MARK DELA CRUZ",
        "emergency_contact": "+63 9090000010",
        "emergency_relationship": "Parent"
      },
      "industry": { "industry": "Professional, Scientific and Technical Activities" },
      "occupation": { "occupation": "Software And Applications Developers And Analyst Not Elsewhere Classified" },
      "expected_salary": { "expected_salary": "130,001-180,000" },
      "educational_attainment": [
        {
          "level": "Master",
          "school": "AMA Computer College-Pangasinan",
          "from": "2008",
          "educational_background": "INFORMATION TECHNOLOGY",
          "to": "2012"
        }
      ]
    },
    "passport": {
      "first_name": "Josie",
      "middle_name": "SANTOS",
      "last_name": "Dela Cruz",
      "suffix": null,
      "gender": "female",
      "birth_date": "1990-01-01",
      "passport_number": "PN1234567",
      "place_issued": "Philippines",
      "issued_date": "2023-08-29",
      "expiry_date": "2030-08-29"
    },
    "national_id": {
      "code": "XXX001",
      "pcn": "9639954762664080",
      "face_url": "https://egov-cdn-stg.oueg.info/uploads/profile_merchants/<file_id>",
      "signature": "data:image/png;base64,<...>"
    },
    "tin_id": null
  }
}
```

> `data` is a rich profile object covering identity, address (with PSA region/province/municipality/barangay codes), health/biometric data, education, family/emergency contacts, passport, and national ID. Fields not applicable to a given user (e.g. `tin_id`) return `null`.

**Notes**
- Obtain the access token first from `POST /api/token`.

**Saved Examples:** 200 - Success · 401 - Unauthorized

---

## Core Technical Requirements

- **Active SSL Certificate** — Mandatory for end-to-end data security.
- **Mobile Responsiveness** — Required to optimize user experience across all devices.
- **Base URL for SSO** — Partners must provide a base URL where eGovPH can append the `exchange_code` authentication parameter.
  - Example: `https://test_website.com/egovph/sso?exchange_code=text_exchange_code`

---

## SSO Implementation Logic

### User Authentication

| Case | Behavior |
|---|---|
| **Existing Users** | Match using `uniqid` or personal details (name, birthdate). Bind the `uniqid` to streamline future logins and auto-authenticate. |
| **New Users** | Automatically register using provided SSO details, guide through onboarding if additional info is needed, and auto-authenticate. |

### UI / UX Requirements

Disable or hide the following on the agency (partner) website, since eGovPH owns identity and session management:

- Login & Registration pages
- Profile & Password management pages
- External links (e.g., app download pages)

---

## Integration Checklist

### 1. SSO Functionality

- [ ] **Data Sync** — Accurately map eGovPH user info (name, birthdate, address, email, contact number).
- [ ] **Auto-Login** — Users are logged in automatically upon successful SSO authentication.
- [ ] **Profile Locking** — Profile updates must occur exclusively through eGovPH (no direct editing on agency site).
- [ ] **No Manual Auth** — Remove manual login and logout options; manage all sessions via eGovPH.

### 2. Mobile Responsiveness

- [ ] **Layout** — Ensure no overlapping or distorted text/images.
- [ ] **Screen Fitting** — Confirm proper display across various smartphone and tablet screen sizes.
- [ ] **Performance & Feature Parity** — Verify fast load times, intuitive navigation, and full feature availability on mobile.

---

## Expected Outcome

Full integration allows authenticated users to access system features seamlessly without needing separate logins or profile management on the partner website.
