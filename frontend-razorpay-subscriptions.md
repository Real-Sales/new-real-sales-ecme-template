# Frontend integration: subscriptions + Razorpay

**API base path:** `{BASE_URL}/api/v1`  
Example: `https://your-api.example.com/api/v1`

**Authentication:** Where noted, send:

```http
Authorization: Bearer <access_token>
```

Use an **access** token (not refresh). Tokens are validated via `AccessTokenBearer` / `get_current_user`.

---

## End-to-end flow (recommended)

| Step | Action |
|------|--------|
| 1 | Load the user’s subscription state (see [§1](#1-current-user-subscription-status)). |
| 2 | Load catalog plans ([§2](#2-subscription-catalog-choose-a-plan)). |
| 3 | Create a Razorpay order (`POST /create-order`). Open Razorpay Checkout with returned `order_id` and `key_id`. |
| 4 | After checkout, call `POST /verify-payment` with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`. |
| 5 | Persist payment: `POST /payments/create-payment` (see [important backend behavior](#important-backend-behavior-align-with-backend-team)). |
| 6 | Grant/change entitlements: `POST /user-subscriptions/` with the chosen `subscription_id`. |

**Note:** The Razorpay route is **`/create-order`** (singular), not `/create-orders`.

---

## 1. Current user subscription status

### Option A — By `user_id`

**`GET /user-subscriptions/by-user/{user_id}`**

- **Auth:** Required. Caller must have one of: `sales_person`, `sales_manager`, `admin`, `super_admin` (`sales_checker`).
- **Response:** `200` — JSON array of `UserSubscriptionResponse` (may be empty).

**`UserSubscriptionResponse` (each element)**

| Field | Type | Notes |
|--------|------|--------|
| `user_subscription_id` | string | |
| `user_id` | string | |
| `subscription_id` | string | FK to plan row |
| `status_active` | boolean | |
| `start_date` | string (ISO 8601 datetime) | |
| `end_date` | string \| null | ISO datetime |
| `credits_allocated` | integer | |
| `credits_used` | integer | |
| `credits_remaining` | integer | |
| `sessions_completed` | integer | |
| `time_used` | integer | |
| `created_at`, `updated_at` | string (ISO 8601) | |
| `subscription` | object | Nested `SubscriptionResponse` (see §2) |

**Errors:** `403` if role not allowed; invalid/expired token per global auth behavior.

### Option B — Logged-in user only

**`GET /user-subscriptions/my-subscription`**

- **Auth:** Bearer required (no extra role dependency in code).
- **Response:** `200` — single `UserSubscriptionResponse` for the active subscription.
- **Errors:** `404` if no active subscription.

Prefer this when the UI is always for the current user and you do not need `by-user`.

---

## 2. Subscription catalog (choose a plan)

**`GET /subscriptions/`**

- **Auth:** None on this route in the current controller (treat as public catalog unless middleware is added).
- **Response:** `200` — JSON array of `SubscriptionResponse`.

**`SubscriptionResponse` (each element)**

| Field | Type |
|--------|------|
| `subscription_id` | string |
| `plan_type` | string enum: `free`, `starter`, `manager`, `enterprise` |
| `billing_cycle` | string enum: `monthly`, `yearly` |
| `credits_per_month` | integer |
| `monthly_price` | decimal (JSON may serialize as string) |
| `yearly_price` | decimal \| null |
| `max_users` | integer |
| `max_session_duration` | integer \| null |
| `status_active` | boolean |
| `is_custom` | boolean |
| `features` | object |
| `created_at`, `updated_at` | string (ISO 8601) |

**Optional filtered listing**

- **`GET /subscriptions/plans?billing_cycle=monthly`** (or `yearly`) — same `SubscriptionResponse[]`.
- **`GET /subscriptions/plans/{plan_name}?billing_cycle=monthly`** — one `SubscriptionResponse`; `plan_name`: `free` \| `starter` \| `manager` \| `enterprise`.

---

## 3. Razorpay: create order

**`POST /create-order`**

Full URL: `{BASE}/api/v1/create-order` (router is mounted at `/api/v1`, not under `/payments`).

- **Auth:** Not enforced on this route in the current code. Consider requiring auth in production.

**Request body — `RazorpayCreateOrderRequest`**

| Field | Type | Required | Notes |
|--------|------|----------|--------|
| `amount` | integer | Yes | Smallest currency unit (e.g. **paise** for INR). **Minimum 100**. |
| `currency` | string | No | Default `"INR"`. |
| `receipt` | string \| null | No | Max 40 chars after normalization; server may generate `rcpt_<uuid>` if omitted. |
| `notes` | object (string → string) \| null | No | Passed to Razorpay as `notes`. |

**Response `200` — `RazorpayCreateOrderResponse`**

| Field | Type |
|--------|------|
| `order_id` | string |
| `amount` | integer |
| `currency` | string |
| `key_id` | string |

Use **`key_id`** as Razorpay Checkout **`key`**, and **`order_id`** as **`order_id`**, so test/live keys match the order.

**Example errors:** `400` (e.g. amount &lt; 100); `502`/`503` for credential/configuration issues.

---

## 4. Razorpay: verify payment

**`POST /verify-payment`**

- **Auth:** Not enforced in the current code.

**Request body — `RazorpayVerifyPaymentRequest`**

| Field | Type | Required |
|--------|------|----------|
| `razorpay_payment_id` | string | Yes (non-empty) |
| `razorpay_order_id` | string | Yes |
| `razorpay_signature` | string | Yes |

These align with the handler payload from [Razorpay Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration).

**Response `200` — `RazorpayVerifyPaymentResponse`**

| Field | Type |
|--------|------|
| `success` | boolean — `true` when signature is valid |

**Errors:** `400` — missing fields, or `"Invalid payment signature."`; other codes for Razorpay misconfiguration.

Only treat the payment as successful in your app after **`success === true`**.

---

## 5. Record payment in your DB

**`POST /payments/create-payment`**

- **Auth:** Bearer required.
- **Rule:** `body.user_id` **must equal** the authenticated user’s `user_id`, or **`403`**.

**Request body — `PaymentCreateInitRequest`**

| Field | Type | Required | Notes |
|--------|------|----------|--------|
| `subscription_id` | string | Yes | Plan row id from §2 |
| `user_id` | string | Yes | Must match current user |
| `amount` | decimal | Yes | Per schema (e.g. major currency units with 2 decimal places) |
| `currency` | string | Yes | e.g. `INR` |
| `payment_method` | string | Yes | App-defined label, e.g. `razorpay` / `card` |
| `provider` | string enum | No | Default `unknown`. Use **`razorpay`** for this flow. |
| `external_payment_id` | string \| null | No | Recommended: Razorpay **`razorpay_payment_id`** |
| `receipt_url` | string \| null | No | |
| `failure_reason` | string \| null | No | |
| `payment_status` | string enum | No | Omit for **`pending`**. After `verify-payment`, typical values are **`paid`** or **`failed`**. |

**`PaymentProviderEnum`:** `stripe` \| `paypal` \| `manual` \| `razorpay` \| `unknown`

**Response `201` — `PaymentResponse`**

| Field | Type |
|--------|------|
| `payment_id` | string |
| `subscription_id`, `user_id` | string |
| `amount`, `currency` | |
| `payment_status` | enum — see below |
| `payment_method` | string |
| `provider` | enum |
| `external_payment_id` | string \| null |
| `payment_date` | string (ISO 8601) |
| `receipt_url`, `failure_reason` | string \| null |
| `created_at`, `updated_at` | string (ISO 8601) |

**`payment_status` enum:** `pending` \| `paid` \| `cancelled` \| `failed` \| `refunded`  

Use **`paid`** for a successful payment (there is no `success` value).

### Updating a payment after create

**`PUT /payments/{payment_id}`**

- **Auth:** Bearer required.
- **Admins** (`admin`, `super_admin`): may update any field allowed by **`PaymentUpdate`**.
- **Other users:** may update **only** rows where `payment.user_id` matches the JWT user. They **must not** send `amount`, `currency`, or `payment_date` (those return **`403`**). They may update e.g. `payment_status`, `external_payment_id`, `failure_reason`, `receipt_url`, `provider`, `payment_method`.

Typical Razorpay flow: set `payment_status` (and related fields) on **`POST /create-payment`**, or create as `pending` then **`PUT`** to `paid` / `failed` after checkout.

---

## 6. Update user subscription (after successful payment)

**`POST /user-subscriptions/`**

- **Auth:** Not listed on this route in the current controller; confirm with backend if auth should be required.

**Request body — `UserSubscriptionCreate`**

| Field | Type | Required |
|--------|------|----------|
| `user_id` | string | Yes |
| `subscription_id` | string | Yes — chosen plan from catalog |

**Response `201` — `UserSubscriptionResponse`**

Same shape as §1. Server behavior: can create new, upgrade/switch plan, or return `400` if already on the same paid plan within `end_date`, etc. (see controller docstring).

Call this **after** verify and after the payment row reflects **`paid`** (via `payment_status` on create and/or `PUT`).

---

## Quick reference — URLs

| Purpose | Method | Path |
|--------|--------|------|
| Subscriptions by user | GET | `/api/v1/user-subscriptions/by-user/{user_id}` |
| My active subscription | GET | `/api/v1/user-subscriptions/my-subscription` |
| All plans | GET | `/api/v1/subscriptions/` |
| Plans by billing cycle | GET | `/api/v1/subscriptions/plans?billing_cycle=monthly` |
| Razorpay order | POST | `/api/v1/create-order` |
| Razorpay verify | POST | `/api/v1/verify-payment` |
| Create payment row | POST | `/api/v1/payments/create-payment` |
| Update payment row | PUT | `/api/v1/payments/{payment_id}` (owner or admin; see §5) |
| Create/update user subscription | POST | `/api/v1/user-subscriptions/` |

---

## Suggested frontend order (happy path)

1. `GET /user-subscriptions/my-subscription` or `GET /user-subscriptions/by-user/{user_id}` (if role allows).
2. `GET /subscriptions/` (or `/plans`) and let the user pick `subscription_id` and price.
3. Convert displayed price to **paise** for INR; `POST /create-order`.
4. Run Razorpay Checkout; on success, `POST /verify-payment`.
5. `POST /payments/create-payment` with `provider: "razorpay"`, `external_payment_id`, etc. Omit **`payment_status`** for **`pending`** (default), then **`PUT /payments/{payment_id}`** with **`payment_status`: `paid`** (and allowed fields only for non-admin owners). Alternatively send **`payment_status`: `paid`** on create and skip the PUT if your API returns no `payment_id` or you prefer one step.
6. `POST /user-subscriptions/` with `user_id` + `subscription_id`.

**This SPA (default):** step 5 uses **create (pending) → `PUT` `paid`** so the owner **`PUT`** path is exercised; `user-subscriptions` runs only after **`PUT`** succeeds.

On checkout dismiss or failure, you can record **`failed`** on create (with `failure_reason` if useful) or **`PUT`** an existing pending row.

---

## Source of truth in this repo

- Routes: `main.py` (prefixes), `controllers/user_subscriptions_controller.py`, `controllers/subscriptions_controller.py`, `controllers/razorpay_controller.py`, `controllers/payments_controller.py`
- Schemas: `schemas/payments_schemas.py`, `schemas/user_subscriptions_schemas.py`, `schemas/subscriptions_schemas.py`
- Razorpay logic: `services/razorpay_service.py`
