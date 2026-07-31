# eReport Integration API Documentation

Integration API for the eReport system — covering authentication, reference datasets (report types, regions, provinces, municipalities, barangays), complaint submission, email OTP verification, and report retrieval.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
  - [Generate Token](#generate-token)
- [Datasets](#datasets)
  - [Report Type List](#report-type-list)
  - [Region List](#region-list)
  - [Province List by Params](#province-list-by-params)
  - [Municipality List by Params](#municipality-list-by-params)
  - [Barangay List by Params](#barangay-list-by-params)
- [Complaints](#complaints)
  - [Submit Complaint](#submit-complaint)
- [Email Verification](#email-verification)
  - [Request OTP](#request-otp)
  - [Confirm OTP](#confirm-otp)
- [Reports](#reports)
  - [Reports List](#reports-list)
  - [View Report by Case Number](#view-report-by-case-number)

---

## Environment Variables

| Variable | Description |
|---|---|
| `{{base}}` | The base URL of the eReport API (e.g., `https://api.example.com`) |
| `{{access_code}}` | Pre-issued access code used to generate the integration token |
| `{{integration_token}}` | Bearer token used for authenticating integration API requests |
| `{{integration_report_view_token}}` | Token used to authorize report-viewing endpoints (obtained via OTP confirmation) |

---

## Authentication

### Generate Token

Generates an integration access token used to authenticate subsequent API requests.

**Method & URL**
```
POST {{base}}/api/integration/token
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `access_code` | string | Yes | A pre-issued access code that identifies and authorizes the integration. Set the `access_code` variable in your active environment before sending this request. |

**Example Request Body**
```json
{
  "access_code": "{{access_code}}"
}
```

**Response**

On success, the API returns an `access_token` that must be included in subsequent authenticated requests.

```json
{
  "access_token": "<token>"
}
```

> **Automation note:** The included test script automatically captures the `access_token` from the response and saves it to the `integration_token` environment variable, so it is immediately available for downstream requests without manual steps.

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base}}/api/integration/token' \
  --header 'Content-Type: application/json' \
  --data '{
    "access_code": "{{access_code}}"
}'
```

**Example Response · 200 OK**
```json
{
  "access_token": "00000000-0000-0000-0000-000000000000",
  "expires_at": "2026-07-19T23:08:06.672+08:00"
}
```

**Saved Examples:** Generate Token - Success · Generate Token - Error (invalid/missing `access_code`)

---

## Datasets

### Report Type List

Retrieves a list of all available report types from the eReport integration datasets. Used to fetch the supported report type definitions that can be referenced when working with integration datasets.

**Method & URL**
```
GET {{base}}/api/integration/datasets/report_types
```

**Authentication**

Bearer Token authentication. Token is sourced from `{{integration_token}}`.

| Type | Variable |
|---|---|
| Bearer Token | `{{integration_token}}` |

**Parameters**

None — this endpoint does not require query parameters, path parameters, or request headers.

**Example Request (cURL)**
```bash
curl --request GET \
  --url '{{base}}/api/integration/datasets/report_types' \
  --header 'Authorization: Bearer {{integration_token}}'
```

**Example Response · 200 OK**
```json
{
  "jsonapi": { "version": "1.0" },
  "meta": {
    "pagination": {
      "total": 9,
      "per_page": 25,
      "current_page": 1,
      "total_pages": 1
    }
  },
  "data": [
    {
      "type": "report_types",
      "id": "0ef6d51a-75be-4ff5-9259-e7f080504f48",
      "attributes": { "code": "crime", "name": "Crime", "sequence": 1, "is_visible": true, "is_active": true, "created_at": "Nov 04, 2025 06:28:54 PM" }
    },
    {
      "type": "report_types",
      "id": "faa2eb76-db67-4c17-9bc6-6c65e87a0ea1",
      "attributes": { "code": "red_tape", "name": "Red Tape", "sequence": 2, "is_visible": true, "is_active": true, "created_at": "Nov 04, 2025 06:28:54 PM" }
    },
    {
      "type": "report_types",
      "id": "488172b8-9ede-4aa7-bcbb-f8f9b3777b02",
      "attributes": { "code": "scam", "name": "Scam", "sequence": 3, "is_visible": true, "is_active": true, "created_at": "Nov 04, 2025 06:28:54 PM" }
    },
    {
      "type": "report_types",
      "id": "2c59c356-c866-4578-b004-ef3a89a096e5",
      "attributes": { "code": "child_abuse", "name": "Child Abuse", "sequence": 4, "is_visible": true, "is_active": true, "created_at": "Nov 04, 2025 06:28:54 PM" }
    },
    {
      "type": "report_types",
      "id": "609f649c-baa4-4d7c-af5c-a7ef9fdc1ba4",
      "attributes": { "code": "women_abuse", "name": "Women Abuse", "sequence": 5, "is_visible": true, "is_active": true, "created_at": "Nov 04, 2025 06:28:54 PM" }
    },
    {
      "type": "report_types",
      "id": "a3b6104d-1c41-4af8-b898-a05d0fe88226",
      "attributes": { "code": "overpricing", "name": "Overpricing", "sequence": 6, "is_visible": true, "is_active": true, "created_at": "Nov 04, 2025 06:28:54 PM" }
    },
    {
      "type": "report_types",
      "id": "8b749070-1a87-4d87-b998-08b6faace7f0",
      "attributes": { "code": "fire", "name": "Fire", "sequence": 7, "is_visible": true, "is_active": true, "created_at": "Nov 04, 2025 06:28:54 PM" }
    },
    {
      "type": "report_types",
      "id": "f4f149c3-b089-48f6-a4a1-78c86ed52dfc",
      "attributes": { "code": "accident", "name": "Accident", "sequence": 8, "is_visible": true, "is_active": true, "created_at": "Nov 04, 2025 06:28:54 PM" }
    },
    {
      "type": "report_types",
      "id": "c46aaf5c-4a29-41f7-95e1-3bf852dbfbc5",
      "attributes": { "code": "gas_station_concerns", "name": "Gas Station Concerns", "sequence": 9, "is_visible": true, "is_active": true, "created_at": "Mar 08, 2026 06:32:15 PM" }
    }
  ]
}
```

> Note: each `attributes` object also includes additional (mostly `null`) fields — `img_url`, `icon_url`, `banner_url`, `card_url`, `description`, `agency_name`, `hotline`, `terms_url`, `privacy_url`, `settings_url`, `terms_content`, `privacy_content`, `meta`, `updated_at`.

**Error Response**

Returned when authentication fails, the token is invalid/expired, or the server encounters an issue. Common status codes: `401 Unauthorized`, `500 Internal Server Error`.

**Saved Examples:** Report Type List - Success · Report Type List - Error

---

### Region List

Retrieves a list of available regions from the eReport dataset. Used to populate dropdowns, filter reports, or map region identifiers across the system.

**Endpoint**

| Property | Value |
|---|---|
| Method | `GET` |
| URL | `{{base}}/api/integration/datasets/regions` |

**Authentication**

| Property | Value |
|---|---|
| Type | Bearer Token |
| Token | `{{integration_token}}` |

> Ensure `{{integration_token}}` is set in your active environment before sending the request.

**Request**

No request body, query parameters, or additional headers required.

**Example Request (cURL)**
```bash
curl --request GET \
  --url '{{base}}/api/integration/datasets/regions' \
  --header 'Authorization: Bearer {{integration_token}}'
```

**Example Response · 200 OK**
```json
{
  "jsonapi": { "version": "1.0" },
  "data": [
    { "type": "regions", "id": "010000000", "attributes": { "name": "REGION I (ILOCOS REGION)" } },
    { "type": "regions", "id": "020000000", "attributes": { "name": "REGION II (CAGAYAN VALLEY)" } },
    { "type": "regions", "id": "030000000", "attributes": { "name": "REGION III (CENTRAL LUZON)" } },
    { "type": "regions", "id": "040000000", "attributes": { "name": "REGION IV-A (CALABARZON)" } },
    { "type": "regions", "id": "050000000", "attributes": { "name": "REGION V (BICOL REGION)" } },
    { "type": "regions", "id": "060000000", "attributes": { "name": "REGION VI (WESTERN VISAYAS)" } },
    { "type": "regions", "id": "070000000", "attributes": { "name": "REGION VII (CENTRAL VISAYAS)" } },
    { "type": "regions", "id": "080000000", "attributes": { "name": "REGION VIII (EASTERN VISAYAS)" } },
    { "type": "regions", "id": "090000000", "attributes": { "name": "REGION IX (ZAMBOANGA PENINSULA)" } },
    { "type": "regions", "id": "100000000", "attributes": { "name": "REGION X (NORTHERN MINDANAO)" } },
    { "type": "regions", "id": "110000000", "attributes": { "name": "REGION XI (DAVAO REGION)" } },
    { "type": "regions", "id": "120000000", "attributes": { "name": "REGION XII (SOCCSKSARGEN)" } },
    { "type": "regions", "id": "130000000", "attributes": { "name": "NATIONAL CAPITAL REGION (NCR)" } },
    { "type": "regions", "id": "140000000", "attributes": { "name": "CORDILLERA ADMINISTRATIVE REGION (CAR)" } },
    { "type": "regions", "id": "150000000", "attributes": { "name": "AUTONOMOUS REGION IN MUSLIM MINDANAO (ARMM)" } },
    { "type": "regions", "id": "160000000", "attributes": { "name": "REGION XIII (Caraga)" } },
    { "type": "regions", "id": "170000000", "attributes": { "name": "MIMAROPA REGION" } },
    { "type": "regions", "id": "180000000", "attributes": { "name": "NEGROS ISLAND REGION (NIR)" } }
  ]
}
```

**Error Response**

Returned when authentication fails (e.g., `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`), the token is missing/expired, or an unexpected server error occurs.

**Saved Examples:** Region List - Success · Region List - Error

---

### Province List by Params

Retrieves a list of provinces filtered by a specified region code. Useful for populating province dropdowns or validating province data scoped to a particular region.

**Method & URL**
```
GET {{base}}/api/integration/datasets/provinces?region_code=040000000
```

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `region_code` | string | Required | The region code used to filter the list of provinces. Example: `040000000` |

**Authentication**

Requires `{{integration_token}}`, set in your active environment.

**Example Request (cURL)**
```bash
curl --request GET \
  --url '{{base}}/api/integration/datasets/provinces?region_code=040000000' \
  --header 'Authorization: Bearer {{integration_token}}'
```

**Example Response · 200 OK** (region `040000000` — CALABARZON)
```json
{
  "jsonapi": { "version": "1.0" },
  "data": [
    { "type": "provinces", "id": "041000000", "attributes": { "region_code": "040000000", "name": "BATANGAS", "district": null } },
    { "type": "provinces", "id": "042100000", "attributes": { "region_code": "040000000", "name": "CAVITE", "district": null } },
    { "type": "provinces", "id": "043400000", "attributes": { "region_code": "040000000", "name": "LAGUNA", "district": null } },
    { "type": "provinces", "id": "045600000", "attributes": { "region_code": "040000000", "name": "QUEZON", "district": null } },
    { "type": "provinces", "id": "045800000", "attributes": { "region_code": "040000000", "name": "RIZAL", "district": null } }
  ]
}
```

**Error Response**

Returned for an invalid or missing `region_code`.

**Saved Examples:** Province List by Params - Success · Province List by Params - Error

---

### Municipality List by Params

Retrieves a list of municipalities filtered by a given province code. Useful for populating location-based dropdowns or validating municipality data scoped to a specific province.

**Endpoint**

| Property | Value |
|---|---|
| Method | `GET` |
| URL | `{{base}}/api/integration/datasets/municipalities` |

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `province_code` | string | Yes | The province code used to filter municipalities (e.g. `042100000`) |

**Authentication**

Bearer token stored in the `integration_token` environment variable.

**Example Request (cURL)**
```bash
curl --request GET \
  --url '{{base}}/api/integration/datasets/municipalities?province_code=042100000' \
  --header 'Authorization: Bearer {{integration_token}}'
```

**Example Response · 200 OK** (province `042100000` — CAVITE, abridged)
```json
{
  "jsonapi": { "version": "1.0" },
  "data": [
    { "type": "municipalities", "id": "042101000", "attributes": { "region_code": "040000000", "province_code": "042100000", "name": "ALFONSO", "zip_code": null } },
    { "type": "municipalities", "id": "042102000", "attributes": { "region_code": "040000000", "province_code": "042100000", "name": "AMADEO", "zip_code": null } },
    { "type": "municipalities", "id": "042103000", "attributes": { "region_code": "040000000", "province_code": "042100000", "name": "BACOOR CITY", "zip_code": null } },
    { "type": "municipalities", "id": "042111000", "attributes": { "region_code": "040000000", "province_code": "042100000", "name": "KAWIT", "zip_code": null } },
    { "type": "municipalities", "id": "042122000", "attributes": { "region_code": "040000000", "province_code": "042100000", "name": "TRECE MARTIRES CITY (Capital)", "zip_code": null } }
  ]
}
```
> Full response for Cavite returns all 23 municipalities/cities in the province, following the same `{ region_code, province_code, name, zip_code }` attribute shape.

**Error Response**

Returned for an invalid or missing `province_code`.

**Saved Examples:** Municipality List by Params - Success · Municipality List by Params - Error

---

### Barangay List by Params

Retrieves a list of barangays filtered by a specified municipality code. Use this endpoint to fetch all barangays belonging to a particular municipality.

**HTTP Method & Endpoint**
```
GET {{base}}/api/integration/datasets/barangays?municipality_code=042111000
```

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `municipality_code` | string | Yes | The code of the municipality to filter barangays by. Example: `042111000` |

**Authentication**

Bearer Token authentication. Required environment variables:

- `{{base}}` — The base URL of the API server.
- `{{integration_token}}` — The integration access token used for authorization.

**Example Request (cURL)**
```bash
curl --request GET \
  --url '{{base}}/api/integration/datasets/barangays?municipality_code=042111000' \
  --header 'Authorization: Bearer {{integration_token}}'
```

**Example Response · 200 OK** (municipality `042111000` — KAWIT, abridged)
```json
{
  "jsonapi": { "version": "1.0" },
  "data": [
    { "type": "barangays", "id": "042111014", "attributes": { "region_code": "040000000", "province_code": "042100000", "municipality_code": "042111000", "name": "Balsahan-Bisita", "zip_code": null } },
    { "type": "barangays", "id": "042111006", "attributes": { "region_code": "040000000", "province_code": "042100000", "municipality_code": "042111000", "name": "Poblacion", "zip_code": null } },
    { "type": "barangays", "id": "042111011", "attributes": { "region_code": "040000000", "province_code": "042100000", "municipality_code": "042111000", "name": "Toclong", "zip_code": null } },
    { "type": "barangays", "id": "042111023", "attributes": { "region_code": "040000000", "province_code": "042100000", "municipality_code": "042111000", "name": "Wakas II", "zip_code": null } }
  ]
}
```
> Full response for Kawit returns all 23 barangays in the municipality, following the same `{ region_code, province_code, municipality_code, name, zip_code }` attribute shape.

**Error Response**

Returned for an invalid or missing `municipality_code`.

**Saved Examples:** Barangay List by Params - Success · Barangay List by Params - Error

---

## Complaints

### Submit Complaint

Submits a new complaint report to the eReport system. Accepts complainant details, report classification, and optional evidence attachments along with the geographic location of the incident.

**Method & URL**
```
POST {{base}}/api/integration/submit_complaint
```

**Authorization**

Requires a valid integration token passed via the `Authorization` header (`Bearer {{integration_token}}`).

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `mobile` | string | Yes | Mobile number of the complainant (e.g. `639XXXXXXXXX`). |
| `first_name` | string | Yes | First name of the complainant. |
| `last_name` | string | Yes | Last name of the complainant. |
| `gender` | string | Yes | Gender of the complainant (e.g. `Male`, `Female`). |
| `complainant_email` | string | Yes | Email address of the complainant. |
| `report_type` | string | Yes | Type/category of the report (e.g. `crime`). |
| `subject` | string | Yes | Brief subject or title of the complaint. |
| `message` | string | Yes | Detailed description of the complaint. |
| `evidences` | array of strings | No | List of image URLs to attach as evidence. |
| `region_code` | string | Yes | PSA region code of the incident location. |
| `province_code` | string | Yes | PSA province code of the incident location. |
| `municipality_code` | string | Yes | PSA municipality/city code of the incident location. |
| `barangay_code` | string | Yes | PSA barangay code of the incident location. |
| `latitude` | string | No | Latitude coordinate of the incident location. |
| `longitude` | string | No | Longitude coordinate of the incident location. |

**Example Request Body**
```json
{
  "mobile": "639000000000",
  "first_name": "Juan",
  "last_name": "dela Cruz",
  "gender": "Male",
  "complainant_email": "juan@example.com",
  "report_type": "crime",
  "subject": "Theft incident",
  "message": "A theft occurred near the market area.",
  "evidences": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "region_code": "040000000",
  "province_code": "042100000",
  "municipality_code": "042111000",
  "barangay_code": "042111011",
  "latitude": "14.60",
  "longitude": "120.98"
}
```

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base}}/api/integration/submit_complaint' \
  --header 'Authorization: Bearer {{integration_token}}' \
  --header 'Content-Type: application/json' \
  --data '{
  "mobile": "639999999999",
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "gender": "Male",
  "complainant_email": "juan.delacruz@email.com",
  "report_type": "crime",
  "subject": "Test subject",
  "message": "Test message",
  "evidences": [
    "https://yavuzceliker.github.io/sample-images/image-1021.jpg"
  ],
  "region_code": "040000000",
  "province_code": "042100000",
  "municipality_code": "042111000",
  "barangay_code": "042111011",
  "latitude": "14.60",
  "longitude": "120.98"
}'
```

**Responses**

- **Success** — The complaint was submitted successfully. Returns a confirmation with the generated report reference.
- **Error** — Returns an error message if required fields are missing or invalid.

---

## Email Verification

### Request OTP

Initiates an OTP (One-Time Password) verification flow by sending an OTP to the specified email address. First step in the email verification process.

**Method & URL**
```
POST {{base}}/api/integration/verify/request
```

**Authorization**

Bearer token — `Authorization: Bearer {{integration_token}}`

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | The email address to which the OTP will be sent. |

**Example Request Body**
```json
{
  "email": "user@example.com"
}
```

**Notes**
- The `email` field supports Postman's dynamic variable pattern, e.g. `juan.delacruz@example.com`, for testing purposes.
- Authentication via `integration_token` is required. Ensure the `integration_token` environment variable is set before sending this request.
- The base URL is configured via the `{{base}}` environment variable.

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base}}/api/integration/verify/request' \
  --header 'Authorization: Bearer {{integration_token}}' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "juan.delacruz@email.com"
}'
```

**Example Response · 200 OK**
```json
{
  "code": 200,
  "already_verified": false,
  "message": "A 6-digit verification code has been sent to juan.delacruz@email.com. It expires in 5 minutes."
}
```

**Responses**

- **Success** — Indicates the OTP has been dispatched to the provided email address. The client should prompt the user to enter the OTP they received.
- **Error** — Returned when the request is invalid — e.g. the email address is missing, malformed, or not associated with a valid account.

---

### Confirm OTP

Confirms an OTP sent to the user's email address as part of the integration verification flow. On success, the response includes a `report_view_token`, which is automatically saved to the `integration_report_view_token` environment variable for use in subsequent requests.

**Method & URL**
```
POST {{base}}/api/integration/verify/confirm
```

**Authorization**

Bearer token — `Authorization: Bearer {{integration_token}}`

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | The email address associated with the integration account. |
| `otp` | string | Yes | The one-time password received via email. |

**Example Request Body**
```json
{
  "email": "user@example.com",
  "otp": "000000"
}
```

**Response**

On success, the response contains a `report_view_token` which grants access to report viewing functionality.

> **Post-response script:** The `report_view_token` from the response is automatically stored in the `integration_report_view_token` environment variable.

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base}}/api/integration/verify/confirm' \
  --header 'Authorization: Bearer {{integration_token}}' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "juan.delacruz@email.com",
    "otp": "000000"
}'
```

**Example Response · 200 OK**
```json
{
  "code": 200,
  "report_view_token": "00000000-0000-0000-0000-000000000000",
  "expires_at": "2026-07-19T01:36:59.944+08:00"
}
```

**Saved Examples:** Verify - Confirm OTP - Success · Verify - Confirm OTP - Error (invalid or expired OTP)

---

## Reports

### Reports List

Retrieves a paginated list of reports available to the integration. Use this endpoint to browse or search through submitted reports.

**Method & URL**
```
GET {{base}}/api/integration/reports
```

**Authentication**

Requires the `X-EReport-View-Token` header set to a valid integration report view token.

| Header | Value | Description |
|---|---|---|
| `X-EReport-View-Token` | `{{integration_report_view_token}}` | Integration report view token for authentication |

**Query Parameters**

| Parameter | Default | Description |
|---|---|---|
| `q` | — | Optional search/filter string to narrow down results |
| `page` | `1` | Page number for pagination |
| `limit` | `25` | Number of reports to return per page |

**Example Request (cURL)**
```bash
curl --request GET \
  --url '{{base}}/api/integration/reports' \
  --header 'X-EReport-View-Token: {{integration_report_view_token}}'
```

**Example Response · 200 OK**
```json
{
  "jsonapi": { "version": "1.0" },
  "meta": {
    "pagination": {
      "total": 1,
      "per_page": 25,
      "current_page": 1,
      "total_pages": 1
    }
  },
  "data": [
    {
      "type": "reports",
      "id": "00000000-0000-0000-0000-000000000000",
      "attributes": {
        "case_number": "PFM-071826-0014",
        "complainant": {
          "first_name": "Erick",
          "last_name": "Mann",
          "fullname": "Erick Mann",
          "phone_number": "639000000000",
          "gender": "Male",
          "email": "juan.delacruz@example.com"
        },
        "report_type": {
          "id": "0ef6d51a-75be-4ff5-9259-e7f080504f48",
          "code": "crime",
          "name": "Crime",
          "img_url": null
        },
        "subject": "consequatur",
        "message": "Quaerat consequatur vel eaque est ea nobis.",
        "evidences": [
          "http://placeimg.com/640/480",
          "http://placeimg.com/640/480"
        ],
        "address": {
          "region": { "code": "040000000", "name": "REGION IV-A (CALABARZON)" },
          "province": { "code": "042100000", "name": "CAVITE" },
          "municipality": { "code": "042111000", "name": "KAWIT" },
          "barangay": { "code": "042111011", "name": "Toclong" },
          "latitude": "14.60",
          "longitude": "120.98",
          "country_code": "PH",
          "country_name": "Philippines"
        },
        "status": "PENDING",
        "formatted_status": "Pending",
        "history": [],
        "created_at": "Jul 18, 2026 11:41:22 PM"
      }
    }
  ]
}
```

**Saved Examples:** Reports List - Success · Reports List - Error (invalid or missing token)

---

### View Report by Case Number

Retrieves the full details of a specific report using its case number. Intended for integration use and requires a valid view token for authorization.

**Method & URL**
```
GET {{base}}/api/integration/reports/:case_number
```

**Authentication & Authorization**

| Header | Value | Description |
|---|---|---|
| `X-EReport-View-Token` | `{{integration_report_view_token}}` | Required. An integration report view token used to authorize access to the report. Issued per integration and must be included in every request. |

**Path Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `case_number` | string | ✅ Yes | The unique case number of the report to retrieve. |

**Request Example**
```
GET {{base}}/api/integration/reports/:case_number
X-EReport-View-Token: {{integration_report_view_token}}
```

**Path Variables (example)**

| Key | Value |
|---|---|
| `case_number` | `PFM-071826-0014` |

**Example Request (cURL)**
```bash
curl --request GET \
  --url '{{base}}/api/integration/reports/:case_number' \
  --header 'X-EReport-View-Token: {{integration_report_view_token}}'
```

**Example Response · 200 OK**
```json
{
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "case_number": "PFM-071826-0014",
    "complainant": {
      "first_name": "Erick",
      "last_name": "Mann",
      "fullname": "Erick Mann",
      "phone_number": "639000000000",
      "gender": "Male",
      "email": "juan.delacruz@example.com"
    },
    "report_type": {
      "id": "0ef6d51a-75be-4ff5-9259-e7f080504f48",
      "code": "crime",
      "name": "Crime",
      "img_url": null
    },
    "subject": "consequatur",
    "message": "Quaerat consequatur vel eaque est ea nobis.",
    "evidences": [
      "http://placeimg.com/640/480",
      "http://placeimg.com/640/480"
    ],
    "address": {
      "region": { "code": "040000000", "name": "REGION IV-A (CALABARZON)" },
      "province": { "code": "042100000", "name": "CAVITE" },
      "municipality": { "code": "042111000", "name": "KAWIT" },
      "barangay": { "code": "042111011", "name": "Toclong" },
      "latitude": "14.60",
      "longitude": "120.98",
      "country_code": "PH",
      "country_name": "Philippines"
    },
    "status": "PENDING",
    "formatted_status": "Pending",
    "history": [
      {
        "status": "PENDING",
        "formatted_status": "Pending",
        "remarks": null,
        "created_at": "Jul 18, 2026 11:41:22 PM"
      }
    ],
    "created_at": "Jul 18, 2026 11:41:22 PM"
  }
}
```

**Saved Examples:** View Report by Case Number - Success · View Report by Case Number - Error (report not found or invalid token)
