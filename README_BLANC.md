# Blanc - Decentralized Social Media dApp

A mobile-first social media platform built on Ethereum that enables true collaborative ownership of content through multi-party verification, automatic payment splitting, and DAO-governed feed algorithms.

## 🌟 Key Features

### 1. **Multi-Party Verification**
- Create posts with multiple participants
- Posts only go live when ALL participants verify via QR code
- True collaborative ownership - no single party controls the content

### 2. **Automatic Payment Splitting**
- Escrow funds when creating a post
- Automatically split payments among all verified participants
- No middleman fees, instant settlement via smart contracts

### 3. **DAO Governance**
- Community controls feed algorithm parameters
- Vote on recency weight, engagement weight, and reputation weight
- Earn BLANC tokens through participation

### 4. **Portable Reputation**
- On-chain reputation system
- Earn points from posts, verifications, and engagement
- Take your social capital to any platform

### 5. **Immutable Content**
- Content stored on IPFS
- Metadata on blockchain prevents deletion
- True ownership of your memories

## 🏗 Architecture

### Smart Contracts

- **BlancPosts.sol** - Main content management with multi-party verification
- **BlancPayments.sol** - Escrow and automatic payment splitting
- **BlancGovernance.sol** - DAO for algorithm governance
- **BlancProfile.sol** - User profiles and reputation system
- **BlancToken.sol** - ERC20 governance token

### Frontend

- **Next.js 14** with App Router
- **RainbowKit** + **Wagmi** for Web3 integration
- **Tailwind CSS** + **DaisyUI** for mobile-first design
- **IPFS** for decentralized storage

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- Yarn
- Foundry

### Installation

```bash
# Install dependencies
yarn install

# Start local blockchain
yarn chain

# Deploy contracts (in another terminal)
yarn deploy

# Start frontend (in another terminal)
yarn start
```

Visit `http://localhost:3000` and the app will redirect to `/feed`

## 📱 Mobile Testing

See [MOBILE_TESTING.md](./MOBILE_TESTING.md) for detailed mobile testing instructions.

Quick steps:
1. Find your local IP: `hostname -I | awk '{print $1}'`
2. Start services: `yarn chain` and `yarn start -- --hostname 0.0.0.0`
3. Configure MetaMask Mobile with RPC URL: `http://YOUR_IP:8545`
4. Open `http://YOUR_IP:3000` on your phone

## 🎯 Why Blockchain?

### Problems Solved

1. **Multi-Party Trust** - 5 friends take a photo together. Who owns it? Blanc ensures all parties must verify.

2. **Transparent Payments** - Viral post makes money? Smart contract automatically splits it fairly. No platform taking 30-50% cuts.

3. **Verifiable Social Proof** - Every verification is an on-chain transaction. Can't fake that real people met IRL.

4. **Algorithmic Transparency** - Community votes on algorithm parameters. No black box engagement addiction.

5. **Portable Reputation** - Your reputation lives on-chain. Platform can't ban you or hold your social capital hostage.

6. **Immutable Memories** - IPFS hash on-chain ensures your content can't be deleted by platform policy changes.

### What Stays Off-Chain (Smart Design)

- **Media files** → IPFS (Ethereum would be too expensive)
- **Feed ordering** → Off-chain indexer reading events
- **Comments** → IPFS hashes or separate contract
- **Drafts** → Local storage until published

**Key Insight:** Blockchain stores only the *minimal trust-critical data* (ownership, verifications, payments, governance). Everything else is optimized for performance.

## 🎨 UI/UX Design

### Mobile-First Approach

- Bottom tab navigation (Feed, Create, Verify, Profile, DAO)
- Touch-optimized interactions (double-tap to like, swipe, pinch-zoom)
- Progressive Web App (PWA) support
- Safe area support for notched devices

### Key Screens

- **Feed** - Instagram-style vertical scroll with algorithm filtering
- **Create** - Camera/upload → Tag participants → Set payment → Generate QR
- **Verify** - QR scanner → Preview → Confirm verification
- **Profile** - Stats, post grid, reputation display
- **DAO** - View/vote on algorithm proposals

## 🧪 Testing

### Smart Contract Tests

```bash
cd packages/foundry
forge test -vv
```

All 37 tests passing ✅

### Contract Coverage

- BlancToken: 5/5 tests
- BlancProfile: 6/6 tests
- BlancPosts: 6/6 tests
- BlancPayments: 4/4 tests
- BlancGovernance: 6/6 tests

## 📊 Gas Optimization

- Using `via_ir` optimization
- Efficient storage patterns (mappings over arrays)
- Event-driven architecture for off-chain indexing
- Minimal on-chain data (only hashes)

## 🔐 Security Considerations

- Multi-party verification prevents single-party manipulation
- Payment escrow with refund timeouts
- DAO parameter bounds (weights must sum to 100%)
- No admin keys (fully decentralized)

## 🗺 Roadmap

### Phase 1: Core Features ✅
- [x] Smart contracts design and deployment
- [x] Multi-party verification
- [x] Payment splitting
- [x] DAO governance
- [x] Mobile-first UI

### Phase 2: Enhanced Features
- [ ] Comments system
- [ ] Video support
- [ ] Push notifications
- [ ] The Graph indexer

### Phase 3: Advanced Features
- [ ] Cross-chain support
- [ ] NFT minting of verified posts
- [ ] Advanced DAO features (delegation, quadratic voting)
- [ ] Reputation-based algorithm boosting

## 🤝 Contributing

This is a hackathon project showcasing how blockchain can solve real problems in social media. Contributions welcome!

## 📄 License

MIT

## 🏆 Hackathon Submission

Built for [Solidity Hackathon]. Demonstrates:
- Well-structured smart contracts with proper schemas
- Real-world blockchain use cases (not forced)
- Mobile-first UX design
- DAO governance integration
- Comprehensive testing

---

**Made with ❤️ using Scaffold-ETH 2**

