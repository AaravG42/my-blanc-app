# Simple Vercel Deployment Guide

## Quick Setup

### 1. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: my-blanc-app
# - Directory: ./packages/nextjs
# - Framework: Next.js
# - Build command: yarn build
# - Output directory: .next
```

### 2. Configure Environment Variables
In Vercel dashboard, add these environment variables:

```bash
# For IPFS (Pinata)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt

# For blockchain (use testnet for simplicity)
NEXT_PUBLIC_TARGET_NETWORK=sepolia
```

### 3. Deploy Smart Contracts to Testnet
```bash
# Deploy to Sepolia testnet
yarn deploy --network sepolia

# Update scaffold.config.ts to use Sepolia
```

## How the Session System Works

### The Problem
- **localStorage doesn't work** between different users/devices
- **Incognito vs regular tabs** have separate storage
- **No shared state** between users

### The Solution
- **API Routes**: `/api/sessions` and `/api/sessions/[id]/participants`
- **Polling**: Frontend polls every 2 seconds for updates
- **Shared State**: All users read from same API endpoints

### Flow:
1. **Creator** generates QR code → calls `/api/sessions` to create session
2. **Scanner** scans QR → calls `/api/sessions/[id]/participants` to join
3. **Creator** polls `/api/sessions?id=sessionId` every 2 seconds
4. **Real-time updates** via polling (simple but effective)

## Testing the Deployment

### 1. Test with Multiple Devices
- Open app on phone: `https://your-app.vercel.app`
- Open app on computer: same URL
- Create QR code on one device
- Scan with other device
- Should see participants appear in real-time

### 2. Test with Different Browsers
- Chrome regular tab
- Chrome incognito tab
- Firefox
- Mobile Safari

All should work because they use the same API endpoints.

## Production Considerations

### Current Implementation (Simple)
- ✅ Works across devices/users
- ✅ No database needed
- ✅ Easy to deploy
- ❌ Data lost on server restart
- ❌ No persistence

### For Production (Later)
- Replace in-memory store with database (PostgreSQL/MongoDB)
- Add WebSocket for real-time updates
- Add session expiration
- Add rate limiting
- Add authentication

## Troubleshooting

### QR Code Not Working
1. Check browser console for errors
2. Verify API routes are deployed: `https://your-app.vercel.app/api/sessions`
3. Test with same browser first, then different browsers

### Participants Not Appearing
1. Check network tab for API calls
2. Verify polling is working (every 2 seconds)
3. Check if session exists: `GET /api/sessions?sessionId=your_session_id`

### Mobile Testing
1. Use testnet (Sepolia) for easier wallet setup
2. Add custom network in MetaMask mobile
3. Get testnet ETH from faucets

