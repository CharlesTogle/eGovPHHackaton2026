# eGov Hackathon 2026 AI Integration API Documentation

Integration API for the eGov Hackathon 2026 AI services — covering authentication, an AI assistant for eGov queries, speech and tourism content generation, legal/regulatory Q&A, translation, document extraction (OCR), and credit balance tracking.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
  - [Generate Access Token](#generate-access-token)
- [AI Generation Endpoints](#ai-generation-endpoints)
  - [AI Assistant](#ai-assistant)
  - [Speech Maker](#speech-maker)
  - [Tourism Content Generator](#tourism-content-generator)
  - [Laws & Regulations](#laws--regulations)
  - [Translator](#translator)
  - [Document Extractor](#document-extractor)
- [Usage & Credits](#usage--credits)
  - [Token Credits](#token-credits)

---

## Environment Variables

| Variable | Description |
|---|---|
| `{{base}}` | The base URL of the eGov Hackathon API (Local, Staging, or Production) |
| `{{access_code}}` | The unique access code issued to your team for the hackathon |
| `{{hackathon_token}}` (aka `access_token`) | Bearer token returned by the token endpoint, used to authenticate all subsequent requests |

---

## Authentication

### Generate Access Token

Generates a short-lived access token for authenticating with the eGov API Docs. The token is automatically saved to the `access_token` environment variable upon a successful response.

**Method & URL**
```
POST {{base}}/api/v1/egov/integration/token
```

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `access_code` | string | Yes | The unique access code issued to your team for the hackathon. Stored in the `access_code` environment variable. |

**Example Request Body**
```json
{
  "access_code": "{{access_code}}"
}
```

**Response**

On success, the API returns a JSON object containing an `access_token` field. This token must be included as a Bearer token in the `Authorization` header for all subsequent authenticated requests.

**Notes**
- The `base` environment variable must be set to the correct API base URL before sending this request.
- The included test script automatically stores the returned `access_token` into the `hackathon_token` environment variable for reuse across other requests.

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base}}/api/v1/egov/integration/token' \
  --header 'Content-Type: application/json' \
  --data '{
    "access_code": "{{access_code}}"
}'
```

**Example Response · 200 OK**
```json
{
  "access_token": "bebaddec-de7e-4d4e-91b1-ae3a73544b22",
  "expires_in_seconds": 28800,
  "credits_total": 200,
  "credits_remaining": 200
}
```

**Saved Examples:** Generate Access Token - Success · Generate Access Token - Error

---

## AI Generation Endpoints

### AI Assistant

Generates an AI-powered response to a user's query about eGov services. Accepts a natural language prompt and a category/country code, then returns a contextually relevant answer scoped to the specified eGov service region.

**Method & URL**
```
POST {{base}}/api/v1/egov/integration/ai_assistant/generate
```

**Authentication**

Bearer Token.

| Key | Value |
|---|---|
| Type | Bearer Token |
| Token | `{{hackathon_token}}` |

> Ensure the `hackathon_token` variable is set in your active environment before sending requests.

**Request Body** (`Content-Type: application/json`)

| Field | Type | Required | Description |
|---|---|---|---|
| `prompt` | string | ✅ Required | The user's natural language question or query directed to the AI assistant (e.g., "how can i get my digital tin id here in egov"). |
| `category` | string | ✅ Required | The category or country code used to scope the AI response to the relevant eGov service context (e.g., `"PH"` for Philippines). |

**Example Request Body**
```json
{
  "prompt": "how can i get my digital tin id here in egov",
  "category": "PH"
}
```

**Notes & Usage Tips**
- **Category Codes:** Use the appropriate country or region code for the `category` field to ensure the AI assistant returns responses relevant to the correct eGov service jurisdiction. `"PH"` targets Philippine eGov services.
- **Prompt Quality:** More specific and clearly worded prompts tend to yield more accurate and helpful responses.
- **Token Scope:** Make sure `{{hackathon_token}}` is a valid hackathon-issued token. Tokens may have expiry or scope restrictions — regenerate via the Generate Access Token request if needed.
- **Base URL:** `{{base}}` should point to the correct API environment (Local, Staging, or Production).

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base}}/api/v1/egov/integration/ai_assistant/generate' \
  --header 'Authorization: Bearer {{hackathon_token}}' \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "how can i get my digital tin id here in egov",
    "category": "PH"
}'
```

**Example Response · 200 OK**
```json
{
  "data": "To obtain your digital Taxpayer Identification Number (TIN) ID through the eGovPH app, you must first ensure you have a Digital TIN ID registered in the Bureau of Internal Revenue's (BIR) Online Registration and Update System (ORUS)...\n\n1. Download the eGovPH App\n2. Register and Verify Account\n3. Log In\n4. Access Mobile ID Wallet\n5. Select BIR Digital TIN ID\n\n(Full response is a multi-step, Markdown-formatted walkthrough covering both the eGovPH app steps and the ORUS registration prerequisite.)",
  "session_id": "b67017a4-da57-40ab-96c9-ca0ccb530ec7"
}
```

> `data` is a free-form, Markdown-formatted string; `session_id` is a UUID useful for tracking/follow-up.

**Saved Examples:** AI Assistant - Success · AI Assistant - Error

---

### Speech Maker

Generates a speech based on a given prompt and category. Leverages AI to produce a well-structured, contextually relevant speech tailored to the specified topic and locale/category.

**Method & URL**
```
POST {{base}}/api/v1/egov/integration/speech_maker/generate
```

**Authentication**

Bearer token — `Authorization: Bearer {{hackathon_token}}`

**Request Body** (raw JSON)

| Parameter | Type | Required | Description |
|---|---|---|---|
| `prompt` | string | ✅ Yes | The topic or instruction describing what the speech should be about. |
| `category` | string | ✅ Yes | The category or locale context for the speech (e.g., `"PH"` for Philippines). |

**Example Request Body**
```json
{
  "prompt": "Give me a speech about current trends in PH",
  "category": "PH"
}
```

**Notes**
- `{{base}}` must point to the appropriate API base URL (e.g., staging or production).
- `category` helps the AI tailor the speech to a specific regional or thematic context. Use standard country/region codes or relevant category identifiers as supported by the API.
- Ensure a valid access token is included (refer to [Generate Access Token](#generate-access-token)).
- The response contains the AI-generated speech content based on the provided prompt and category.

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base}}/api/v1/egov/integration/speech_maker/generate' \
  --header 'Authorization: Bearer {{hackathon_token}}' \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "Give me a speech about current trends in PH",
    "category": "PH"
}'
```

**Example Response · 200 OK**
```json
{
  "data": "Magandang araw po sa inyong lahat! Isang karangalan po ang tumayo sa inyong harapan ngayong araw upang talakayin ang mga kasalukuyang takbo at pagbabago sa ating minamahal na Pilipinas...\n\n(Full response is a multi-paragraph Filipino-language speech covering the economy, technology/AI, environmental challenges, and the political landscape, closing with 'Maraming salamat po.')",
  "session_id": "d6b5c2be-11ff-41f1-ac92-fdba3bcc75ca"
}
```

**Saved Examples:** Speech Maker - Success · Speech Maker - Error

---

### Tourism Content Generator

Generates AI-powered tourism and travel content based on a user-provided prompt and a destination category. Returns a detailed, narrative-style response — such as a multi-day travel itinerary, cultural insights, and activity recommendations — along with a session ID for tracking the conversation.

**Method & URL**
```
POST {{base}}/api/v1/egov/integration/tourism/generate
```

**Authentication**

Requires a Bearer token. Set the `hackathon_token` environment variable to your issued hackathon access token before sending.

**Request Body**

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `prompt` | string | ✅ Yes | A natural language instruction describing the tourism content to generate. | `"Provide travel itinerary for Boracay"` |
| `category` | string | ✅ Yes | A country or region code to scope the response to a specific destination. | `"PH"` (Philippines) |

**Example Request Body**
```json
{
  "prompt": "Provide travel itinerary for Boracay",
  "category": "PH"
}
```

**Response**

A successful request returns `HTTP 200 OK` with a JSON body containing:

| Field | Type | Description |
|---|---|---|
| `data` | string | The AI-generated tourism content (e.g., itinerary, cultural background, activity suggestions). Supports Markdown-formatted content, including bold headings and structured day-by-day itineraries. |
| `session_id` | string | A UUID identifying the session, useful for follow-up or conversation tracking. |

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base}}/api/v1/egov/integration/tourism/generate' \
  --header 'Authorization: Bearer {{hackathon_token}}' \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "Provide travel itinerary for Boracay",
    "category": "PH"
}'
```

**Example Response · 200 OK**
```json
{
  "data": "Boracay Island, located in Aklan province in Western Visayas, is renowned globally for its pristine white sand beaches, particularly the famous White Beach...\n\n**Boracay Itinerary Suggestion:**\n\n**Day 1: Arrival and White Beach Exploration**\n...\n**Day 2: Island Hopping and Water Activities**\n...\n**Day 3: Adventure and Relaxation**\n...\n**Day 4: Departure**\n...\n\n(Full response is a Markdown-formatted 4-day itinerary followed by cultural background on the island.)",
  "session_id": "525d4e90-245c-4415-91a3-9cc1f1dd4497"
}
```

**Saved Examples:** Tourism - Success · Tourism - Error

---

### Laws & Regulations

Generates an AI-powered response related to laws and regulations based on a given prompt and category. Part of the eGov Hackathon 2026 collection — intended for querying legal and regulatory information using a natural language prompt, generated by an underlying ML model tailored to government regulations.

**Method & URL**
```
POST {{base}}/api/v1/egov/integration/laws_and_regulations/generate
```

**Authentication**

Bearer Token — use the `{{hackathon_token}}` environment variable to authenticate.

**Request Body** (`Content-Type: application/json`)

| Field | Type | Required | Description |
|---|---|---|---|
| `prompt` | string | Yes | A natural language question or instruction related to laws and regulations. |
| `category` | string | Yes | The jurisdiction or category code for the laws to query (e.g., `PH` for the Philippines). |

**Example Request Body**
```json
{
  "prompt": "Can you explain your purpose?",
  "category": "PH"
}
```

**Notes**
- The `category` field accepts jurisdiction codes. `PH` refers to the Philippines.
- Ensure `{{base}}` and `{{hackathon_token}}` are set in your active environment before sending the request.

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base}}/api/v1/egov/integration/laws_and_regulations/generate' \
  --header 'Authorization: Bearer {{hackathon_token}}' \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "Can you explain your purpose?",
    "category": "PH"
}'
```

**Example Response · 200 OK**
```json
{
  "data": "Ako ay isang eGovPH AI Assistant na nilikha upang tulungan ang mga mamamayang Pilipino. Ang aking pangunahing layunin ay magbigay ng tumpak na impormasyon, lalo na tungkol sa mga batas at regulasyon sa Pilipinas.\n\nMay kakayahan akong tumugon sa iba't ibang wika, kabilang ang Filipino, English, at mga lokal na wika tulad ng Ilocano, Cebuano/Bisaya, Hiligaynon/Ilonggo, Waray, Kapampangan, Pangasinan, at Bikolano.\n\nKung ang iyong katanungan ay hindi nauugnay sa mga legal na usapin, ipapaalam ko sa iyo na walang kaugnay na batas para sa paksa.",
  "session_id": "6220bc87-0ba9-4fd9-9fda-d5c44b31a061"
}
```

**Saved Examples:** Laws & Regulations - Success · Laws & Regulations - Error

---

### Translator

Translates a given text prompt from one language to another using the eGov Hackathon translation service. Accepts a source language, a target language, and the text to be translated, then returns the translated output.

**Method & URL**
```
POST {{base}}/api/v1/egov/integration/translator/generate
```

**Authentication**

Bearer Token authentication.

| Type | Token Variable |
|---|---|
| Bearer | `{{hackathon_token}}` |

> Ensure `{{hackathon_token}}` is set in your active environment before sending the request.

**Request Body** (`application/json`)

| Parameter | Type | Required | Description |
|---|---|---|---|
| `prompt` | string | ✅ Yes | The text content to be translated. |
| `source_lang` | string | ✅ Yes | The language code of the input text (e.g., `"en"` for English). |
| `target_lang` | string | ✅ Yes | The language code of the desired output language (e.g., `"fil"` for Filipino). |

**Sample Request Body**
```json
{
  "prompt": "How should the education system adapt to prepare future generations to thrive in a world when human AI collaboration is a norm?",
  "source_lang": "en",
  "target_lang": "fil"
}
```

**Notes**
- Language codes follow the ISO 639-1 standard (e.g., `en`, `fil`, `es`, `fr`, `ja`).
- The `prompt` field supports multi-sentence and paragraph-length text inputs.
- Make sure `{{base}}` points to the correct API base URL for your target environment (Local, Staging, or Production).
- `{{hackathon_token}}` must be a valid, non-expired token scoped for hackathon endpoints.

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base}}/api/v1/egov/integration/translator/generate' \
  --header 'Authorization: Bearer {{hackathon_token}}' \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "How should the education system adapt to prepare future generations to thrive in a world when human AI collaboration is a norm?",
    "source_lang": "en",
    "target_lang": "fil"
}'
```

**Example Response · 200 OK**
```json
{
  "original_prompt": "How should the education system adapt to prepare future generations to thrive in a world when human AI collaboration is a norm?",
  "source_lang": "en",
  "target_lang": "fil",
  "translate_from": {
    "code": "en",
    "label": "English"
  },
  "translated_prompt": "Paano dapat umangkop ang sistema ng edukasyon upang ihanda ang mga susunod na henerasyon upang umunlad sa isang mundo kung saan ang pakikipagtulungan ng tao at AI ay isang pamantayan?",
  "transliterated_prompt": "Paano dapat umangkop ang sistema ng edukasyon upang ihanda ang mga susunod na henerasyon upang umunlad sa isang mundo kung saan ang pakikipagtulungan ng tao at AI ay isang pamantayan?"
}
```

**Saved Examples:** Translator - Success · Translator - Error

---

### Document Extractor

Extracts structured information from an uploaded document image or file using AI-powered OCR and document analysis. Accepts a document file (such as a photo of a government-issued ID, driver's license, or similar document) and uses machine learning to extract and return structured data from it. Useful for automating data entry and document verification workflows in eGov applications.

**Endpoint**
```
POST {{base}}/api/v1/egov/integration/document_extractor/generate
```

**Request Body**

This endpoint accepts a `multipart/form-data` request with the following field:

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | Yes | The document file to be processed (e.g., image of an ID, license, or any government document) |

**Notes**
- Supported file types typically include common image formats (JPEG, PNG) and PDF.
- Ensure `{{hackathon_token}}` is set with a valid authentication token before sending the request.
- `{{base}}` should point to the appropriate API base URL for your environment.

**Authorization**

Bearer token — `Authorization: Bearer {{hackathon_token}}`

**Example Request (cURL)**
```bash
curl --request POST \
  --url '{{base}}/api/v1/egov/integration/document_extractor/generate' \
  --header 'Authorization: Bearer {{hackathon_token}}'
```

**Example Response · 200 OK** (sample: Philippine driver's license)
```json
{
  "data": "Here's the information extracted from the image:<br><br><b>Document Type:</b> Philippine Driver's License<br>\n<b>Issuing Authority:</b> REPUBLIC OF THE PHILIPPINES<br>\n<b>Department:</b> DEPARTMENT OF TRANSPORTATION<br>\n<b>Office:</b> LAND TRANSPORTATION OFFICE<br>\n<b>License Type:</b> NON-PROFESSIONAL DRIVER'S LICENSE<br>\n<b>Last Name, First Name, Middle Name:</b> DELA CRUZ, JUAN PEDRO GARCIA<br>\n<b>Nationality:</b> PHL<br>\n<b>Sex:</b> M<br>\n<b>Date of Birth:</b> 1987/10/04<br>\n<b>Address:</b> UNIT/HOUSE NO. BUILDING, STREET NAME, BARANGAY, CITY/MUNICIPALITY<br>\n<b>Weight (kg):</b> 70<br>\n<b>Height (m):</b> 1.55<br>\n<b>License Issue Date:</b> 2017/11/2<br>\n<b>License No.:</b> N03-12-123456<br>\n<b>Signature of Licensee:</b> DELA CRUZ, JUAN PEDRO GARCIA<br>\n<b>Expiration Date:</b> 2022/10/04<br>\n<b>Agency Code:</b> N32<br>\n<b>Blood Type:</b> O+<br>\n<b>Eyes Color:</b> BLACK<br>\n<b>Restrictions:</b> 1,2<br>\n<b>Conditions:</b> NONE<br>\n<b>Assistant Secretary:</b> EDGAR C GALVANTE<br>"
}
```

> `data` is returned as an HTML-formatted string (`<br>`/`<b>` tags) rather than structured JSON fields.

**Saved Examples:** Document Extractor - Success · Document Extractor - Error

---

## Usage & Credits

### Token Credits

Retrieves the current token credit balance associated with the authenticated hackathon participant or team. Useful for monitoring how many API credits remain during the hackathon, allowing participants to manage their usage and avoid hitting limits.

**Method & URL**
```
GET {{base}}/api/v1/egov/integration/credits
```

**Authentication**

Bearer Token authentication.

| Parameter | Value |
|---|---|
| Token | `{{hackathon_token}}` |

> Ensure the `hackathon_token` environment variable is set with a valid token before sending this request.

**Response**

Returns the token credit information for the authenticated user. A successful response includes the remaining credit balance and any relevant usage details.

**Notes**
- Make sure `{{base}}` is configured to point to the correct API environment (e.g., Local, Staging, or Production).
- Token credits may be consumed by other endpoints in the hackathon API. Use this endpoint to check your balance before making resource-intensive calls.

**Example Request (cURL)**
```bash
curl --request GET \
  --url '{{base}}/api/v1/egov/integration/credits' \
  --header 'Authorization: Bearer {{hackathon_token}}'
```

**Example Response · 200 OK**
```json
{
  "credits_total": 200,
  "credits_used": 5,
  "credits_remaining": 195,
  "expires_at": "2026-07-10T23:33:34.000+08:00"
}
```

**Saved Examples:** Token Credits - Success · Token Credits - Error
