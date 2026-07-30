# HANDA Layer 2 API Reference

**Base URL:** `https://api.handa.gov.ph/v1`
**Auth:** Bearer token (API key from Developer Console)

All endpoints are scoped to the barangay or municipality associated with the API key.

**Scope types:**
- **Barangay scope** — access limited to a single barangay
- **LGU scope** — access to all barangays within the key's municipality

---

## Barangay

### Get Barangay

```
GET /barangays/{psgc}
```

Returns metadata for the barangay matching the given PSGC code. **Barangay-scoped keys** can only query their own barangay — querying a different PSGC returns 403. **LGU-scoped keys** can query any barangay in their municipality.

**Response 200**

```json
{
  "code": "0105503021",
  "name": "Poblacion, Alaminos, Pangasinan",
  "municipality": "CITY OF ALAMINOS",
  "municipality_code": "0105503000",
  "province": "PANGASINAN",
  "province_code": "0105500000",
  "region": "REGION I (ILOCOS REGION)",
  "region_code": "0100000000"
}
```

**Response 403 — Scope mismatch (barangay-scoped key querying different barangay)**

```json
{
  "error": "forbidden",
  "message": "API key is not scoped to this barangay"
}
```

---

## Assessments

### List Assessments

```
GET /assessments
```

**Query params**

| Param | Type | Default | Description |
|---|---|---|---|
| `status` | string | — | Filter: `draft`, `active`, `closed`, `archived` |
| `limit` | int | 25 | Results per page |
| `offset` | int | 0 | Pagination offset |

**Response 200**

```json
{
  "data": [
    {
      "id": "a0000000-0000-0000-0000-000000000001",
      "name": "Typhoon Odette Response",
      "disaster_type": "Typhoon",
      "disaster_date": "2025-01-15",
      "status": "active",
      "created_by": "Admin",
      "barangay_code": "0105503021",
      "created_at": "2025-01-15T00:00:00Z",
      "updated_at": "2025-01-15T00:00:00Z"
    }
  ],
  "meta": { "total": 1, "limit": 25, "offset": 0 }
}
```

### Get Assessment

```
GET /assessments/{id}
```

**Response 200**

```json
{
  "id": "a0000000-0000-0000-0000-000000000001",
  "name": "Typhoon Odette Response",
  "disaster_type": "Typhoon",
  "disaster_date": "2025-01-15",
  "status": "active",
  "created_by": "Admin",
  "barangay_code": "0105503021",
  "questions": [
    {
      "id": "b0000000-0000-0000-0000-000000000001",
      "question_text": "Is your home damaged?",
      "need_category": "Shelter",
      "display_order": 0
    }
  ],
  "created_at": "2025-01-15T00:00:00Z",
  "updated_at": "2025-01-15T00:00:00Z"
}
```

### Get Aggregates

```
GET /assessments/{id}/aggregates
```

**Response 200**

```json
{
  "assessment_id": "a0000000-0000-0000-0000-000000000001",
  "affected_count": 2,
  "unresolved_count": 1,
  "needs_breakdown": {
    "Shelter": 2,
    "Food or water": 1
  }
}
```

### Get Responses

```
GET /assessments/{id}/responses
```

**Query params**

| Param | Type | Default | Description |
|---|---|---|---|
| `status` | string | — | Filter: `unresolved`, `visited`, `resolved` |
| `limit` | int | 25 | Results per page |
| `offset` | int | 0 | Pagination offset |

**Response 200**

```json
{
  "data": [
    {
      "id": "c0000000-0000-0000-0000-000000000001",
      "name": "Juan Dela Cruz",
      "submitted_by": "Juan Dela Cruz",
      "status": "visited",
      "answers": [
        { "question_id": "b0000000-0000-0000-0000-000000000001", "question_text": "Is your home damaged?", "need_category": "Shelter", "answer": "yes" },
        { "question_id": "b0000000-0000-0000-0000-000000000002", "question_text": "Do you need food or water?", "need_category": "Food or water", "answer": "no" }
      ],
      "created_at": "2025-01-15T00:00:00Z"
    }
  ],
  "meta": { "total": 2, "limit": 25, "offset": 0 }
}
```

### Export CSV

```
GET /assessments/{id}/export.csv
```

**Response 200** — `text/csv`

```csv
Name,Needs,Status,Submitted By,Created At
"Juan Dela Cruz","Shelter",visited,"Juan Dela Cruz","2025-01-15T00:00:00Z"
"Maria Santos","Shelter; Food or water; Medical",unresolved,"Maria Santos","2025-01-15T00:00:00Z"
```

---

## Error Responses

All endpoints return standard error shapes.

**401 Unauthorized**

```json
{
  "error": "unauthorized",
  "message": "Missing or invalid API key"
}
```

**403 Forbidden**

```json
{
  "error": "forbidden",
  "message": "API key is not scoped to this barangay"
}
```

**404 Not Found**

```json
{
  "error": "not_found",
  "message": "Assessment not found"
}
```
