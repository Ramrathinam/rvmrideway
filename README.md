# RVM Rideway MVP – Starter

This is a minimal Next.js (App Router) + Firebase Admin starter with a basic Booking API and form.

## Prerequisites
- Node.js >= 18
- A Firebase project with Firestore enabled
- A Firebase Service Account key (JSON)

## Setup
```bash
cp .env.example .env.local
# Fill env values
npm install
npm run dev
```

Open http://localhost:3000

### Firebase Service Account
Firebase Console → Project Settings → Service Accounts → Generate new private key.
Then set the env variables in `.env.local`.

> IMPORTANT: Replace literal newlines in the private key with `\n`.

## What works now
- Customer booking form (Airport/Outstation/Rental)
- POST /api/bookings → validates & stores in Firestore
- Returns booking reference and rough fare estimate

## Next
- Add WhatsApp + Email notifications on booking confirmation
- Add payment flow (Stripe/Razorpay)
- Enhance fare logic with Distance Matrix
```

