# Mobile Testing Guide for Blanc dApp

## Quick Start

### Step 1: Find Your Computer's IP Address

```bash
hostname -I | awk '{print $1}'
```

You'll get something like `192.168.1.XXX` - this is your LOCAL_IP

### Step 2: Start Development Servers

```bash
yarn chain
```

In another terminal:
```bash
yarn start -- --hostname 0.0.0.0
```

### Step 3: Configure MetaMask Mobile

1. Open MetaMask app on your phone
2. Tap the network selector at the top
3. Tap "Add Network"
4. Enter these details:
   - Network Name: `Local Foundry`
   - RPC URL: `http://YOUR_LOCAL_IP:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

### Step 4: Fund Your Mobile Wallet

Get your mobile wallet address from MetaMask app, then run on your computer:

```bash
cast send YOUR_MOBILE_ADDRESS --value 1ether --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Step 5: Access the App

Open your phone browser and go to:
```
http://YOUR_LOCAL_IP:3000
```

## Alternative: Deploy to Testnet

For easier testing without local network setup:

```bash
yarn deploy --network sepolia
```

Update `packages/nextjs/scaffold.config.ts`:
```typescript
targetNetworks: [chains.sepolia],
```

## Troubleshooting

### Can't connect from phone
- Make sure phone and computer are on the same WiFi
- Check firewall settings (allow port 8545 and 3000)
- Try disabling VPN

### MetaMask not connecting
- Make sure you're using the correct RPC URL with your IP
- Check that `yarn chain` is running
- Try removing and re-adding the network

### Page loads but transactions fail
- Verify you funded your wallet
- Check that the contract addresses match in deployedContracts.ts
- Restart MetaMask app

## PWA Installation

Once loaded on mobile:
1. Tap browser menu (⋮)
2. Select "Add to Home Screen"
3. The app will install as a standalone app

## Features to Test

- [x] Bottom navigation works on mobile
- [x] Camera/photo upload in Create Post
- [x] QR code generation and scanning
- [x] Touch gestures (tap to like, swipe, etc.)
- [x] Wallet connection flow
- [x] Transaction signing
- [x] Feed scrolling performance
- [x] Profile viewing
- [x] DAO voting interface

