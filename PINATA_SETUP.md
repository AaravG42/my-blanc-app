# Pinata API Key Setup

## How to Get Your Pinata API Keys

1. Go to https://app.pinata.cloud/
2. Sign up or log in
3. Navigate to your API Keys section
4. Create a new API key (or use existing one)
5. Copy your JWT token

## Setting Up Environment Variables

Create a `.env.local` file in the `packages/nextjs/` directory:

```bash
cd packages/nextjs
cp .env.example .env.local
```

Then edit `.env.local` and add your Pinata credentials:

```env
NEXT_PUBLIC_PINATA_JWT=your_jwt_token_here
```

OR if you're using the legacy API key setup:

```env
NEXT_PUBLIC_PINATA_API_KEY=your_api_key_here
```

## Restart Your Dev Server

After adding the credentials, restart your Next.js development server:

```bash
yarn dev
```

The app will now be able to upload files to IPFS through Pinata!
