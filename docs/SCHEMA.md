# PropFlow Database Schema

Reference this file in Cursor chats for full schema context.

## organizations

Top-level tenant for multi-org SaaS. Every property belongs to an org.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| name | text | Company or landlord name |
| slug | text | URL-safe unique identifier |
| stripe_customer_id | text | Stripe customer ID |
| stripe_subscription_id | text | Active subscription ID |
| plan | text | starter \| growth \| pro \| enterprise |
| unit_count | int4 | Cached for billing calculations |
| created_at | timestamptz | default now() |

## users

Extends Supabase auth.users. Stores profile + org membership.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK — matches auth.users.id |
| org_id | uuid | FK → organizations.id |
| email | text | Synced from auth.users |
| full_name | text | Display name |
| avatar_url | text | Supabase storage URL |
| role | text | owner \| manager \| tenant \| vendor |
| phone | text | For SMS notifications |
| created_at | timestamptz | default now() |

## properties

A building or complex. Has many units. Belongs to an organization.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| org_id | uuid | FK → organizations.id |
| name | text | e.g. Sunset Apartments |
| address | text | Full street address |
| city, state, zip | text | |
| type | text | residential \| commercial \| hoa \| student |
| unit_count | int4 | Total units in property |
| year_built | int4 | |
| image_url | text | Cover photo |
| created_at | timestamptz | default now() |

## units

Individual rentable units within a property.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| property_id | uuid | FK → properties.id |
| unit_number | text | e.g. 101, A, Suite 4B |
| floor | int4 | Floor number |
| bedrooms | int4 | |
| bathrooms | numeric | e.g. 1.5 |
| sqft | int4 | |
| rent_amount | numeric | Monthly rent in dollars |
| status | text | vacant \| occupied \| maintenance \| listed |
| amenities | text[] | parking, washer, etc. |
| created_at | timestamptz | default now() |

## tenants

A renter profile. Can have one active lease, many historical leases.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users.id (nullable, portal access) |
| org_id | uuid | FK → organizations.id |
| full_name | text | |
| email, phone | text | |
| date_of_birth | date | For screening |
| ssn_last4 | text | Encrypted reference |
| emergency_contact | jsonb | {name, phone, relationship} |
| screening_status | text | pending \| approved \| denied |
| created_at | timestamptz | default now() |

## leases

Active or historical lease agreement between tenant and unit.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| unit_id | uuid | FK → units.id |
| tenant_id | uuid | FK → tenants.id |
| start_date, end_date | date | |
| monthly_rent | numeric | Locked rent at signing |
| security_deposit | numeric | |
| status | text | draft \| active \| expired \| terminated |
| signed_at | timestamptz | When all parties signed |
| document_url | text | Supabase storage PDF URL |
| renewal_offered | bool | Renewal offer sent? |
| created_at | timestamptz | default now() |

## roles

Granular permissions per user per org.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| org_id | uuid | FK → organizations.id |
| role | text | owner \| manager \| tenant \| vendor \| accountant |
| property_ids | uuid[] | null = access to all properties in org |
| created_at | timestamptz | default now() |

## RLS summary

- Users can only see rows where `org_id` matches their own org.
- **Owners** can do anything in their org.
- **Managers** can read/write properties, units, tenants, leases.
- **Tenants** read-only for their own records (future portal phase).
