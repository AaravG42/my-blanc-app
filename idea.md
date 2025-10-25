# Mobile-First Social Media dApp with DAO Governance

## Smart Contract Architecture (Redesign)

### 1. Core Contracts Structure

**BlancPosts.sol** - Main content management

- Store post metadata: `postId`, `creator`, `participants[]`, `ipfsHash`, `caption`, `timestamp`, `isPublic`, `verificationStatus`, `requiredVerifications`, `verifiedBy[]`
- Multi-party verification logic: track which participants have verified
- Post only becomes active/visible when `verifiedBy.length == participants.length`
- Engagement metrics: `likes`, `comments`, `shares` (on-chain counters)
- Events: `PostCreated`, `PostVerified`, `PostFullyVerified`, `PostLiked`, `PostCommented`, `PostShared`

**BlancPayments.sol** - Automatic payment splitting

- Escrow funds when post created with payment
- Release proportionally to all verified participants once fully verified
- Support custom split percentages or default equal split
- Handle refunds if verification expires
- Track: `postId => (totalAmount, splits[], claimed[])`

**BlancGovernance.sol** - DAO for algorithm control

- Governance token: `BlancToken` (ERC20)
- Votable parameters: `recencyWeight`, `engagementWeight`, `creatorReputationWeight`
- Proposal creation/voting mechanism with timelock
- Parameter bounds to prevent abuse (e.g., weights must sum to 100)

**BlancProfile.sol** - User identity & reputation

- Profile data: `username`, `bio`, `profilePicHash`, `reputation`
- Reputation earned from: verified posts, likes received, DAO participation
- Follow/follower system (social graph)
- Badge system for achievements

**BlancComments.sol** (optional separate contract)

- Comment storage to avoid bloating main contract
- Nested comments support (replies)
- Link to posts via `postId`

### 2. Key Schema Design Decisions

**Why this structure makes sense for blockchain:**

- **Verification state** - Multi-sig pattern for social proof (blockchain excels at this)
- **Payment automation** - Smart contracts eliminate trust issues in splits
- **Immutable content** - IPFS hash on-chain prevents post alteration/deletion
- **Transparent algorithm** - DAO governance makes feed algorithm auditable
- **Reputation on-chain** - Portable social capital across platforms
- **Event-driven** - Off-chain indexer can build fast feed from events

**Gas optimization strategies:**

- Store arrays efficiently (use mappings where possible)
- Batch operations for multiple verifications
- Limit on-chain data (only hashes, not full content)
- Separate engagement tracking to cheaper contract

## Mobile-First UI/UX Design

### 1. Navigation Structure (Bottom Tab Bar)

```
[🏠 Feed] [➕ Create] [📷 Verify] [👤 Profile] [🗳️ DAO]
```

### 2. Key Screens & Features

**Feed Screen** (`/feed`)

- Instagram-style vertical scroll of posts
- Mobile gestures: double-tap to like, swipe up/down for navigation
- Filter: All Public / Following / Trending
- Pull-to-refresh
- Algorithm-driven ordering (fetch from indexer with DAO parameters)
- Infinite scroll with lazy loading

**Create Post Screen** (`/create`)

- Mobile camera integration (use device camera API)
- Video/photo upload from gallery
- Tag participants: search by address/ENS, paste address, or QR scan their profile
- Caption input
- Privacy toggle: Public / Private (participants only)
- Payment split setup: Enable/disable, set amounts/percentages
- Submit → Generate QR code for others to verify

**QR Display Screen** (`/post/[id]/qr`)

- Large QR code centered
- "Share QR" button (screenshot, copy link)
- Real-time verification status: "2/5 verified"
- List of participants with checkmarks
- Auto-navigate to post when fully verified

**Verify Screen** (`/verify`)

- Open camera for QR scanning
- Parse scanned URL → extract postId
- Show post preview (creator, participants, content)
- "Verify" button → calls `verifyPost(postId)`
- Success animation

**Post Detail Screen** (`/post/[id]`)

- Full-screen media viewer (swipeable for multi-media)
- Engagement buttons: Like, Comment, Share
- Comments section (collapsible)
- Participant avatars (verified checkmarks)
- Payment distribution status if applicable

**Profile Screen** (`/profile/[address]`)

- Profile header: avatar, username, bio, reputation score
- Stats: Posts, Verified Count, Followers, Following
- Tabs: Grid of posts, Collaborative posts, Pending verifications
- Edit profile button (if own profile)

**DAO Screen** (`/governance`)

- Current algorithm parameters display
- Active proposals list
- "Create Proposal" button
- Vote interface with token balance display
- Proposal detail view with comments/discussion

**Pending Screen** (`/pending`)

- List of posts awaiting your verification
- Quick verify action (tap → camera scan QR)
- Badge notification count in tab bar

### 3. Mobile-First UX Patterns

**Responsive Design:**

- Breakpoints: mobile-first (320px+), tablet (768px+), desktop (1024px+)
- Touch-friendly tap targets (min 44x44px)
- Thumb-zone navigation (bottom tabs)

**Progressive Web App:**

- `manifest.json` for home screen installation
- Service worker for offline viewing of cached posts
- Push notifications for verification requests

**Gesture Controls:**

- Double-tap: Like
- Long-press: Show context menu (share, report, etc.)
- Swipe left/right: Navigate between posts
- Pinch: Zoom images

**Loading States:**

- Skeleton screens for posts
- Optimistic UI updates (like instantly, sync on-chain)
- Toast notifications for transactions

**Camera Integration:**

- Use `navigator.mediaDevices.getUserMedia()` for camera
- Fallback to file input on desktop
- Native QR scanner using device camera

## Why Blockchain is Essential (Not Forced)

### Problems Blockchain Actually Solves Here

**1. Multi-Party Trust Problem**

- **Problem:** When 5 friends take a photo together, who controls it? Traditional apps: whoever uploaded it owns it
- **Blockchain Solution:** Post exists on-chain with all 5 addresses as participants. Cannot be posted without all verifications. No single party controls it
- **Why it matters:** True collaborative ownership, no central authority can delete/monetize without consent

**2. Transparent Automated Payments**

- **Problem:** Splitting money from viral posts (ad revenue, sponsorships) requires trust in platform or manual Venmo
- **Blockchain Solution:** Smart contract escrows funds, automatically releases proportional splits when all verify. No middleman fees, instant settlement
- **Why it matters:** Removes platform as rent-seeking intermediary (like how TikTok/Instagram take 30-50% cuts)

**3. Verifiable Social Proof**

- **Problem:** Fake engagement (bots, purchased likes), platforms arbitrarily boost/suppress content
- **Blockchain Solution:** Every verification is an on-chain transaction from a real wallet. Engagement is cryptographically verifiable
- **Why it matters:** Can't fake that 5 people met in real life and all signed with their wallets

**4. Algorithmic Transparency via DAO**

- **Problem:** Twitter/Instagram algorithms are black boxes, optimized for engagement addiction not user happiness
- **Blockchain Solution:** Feed algorithm parameters live on-chain, governed by token holders who are users themselves
- **Why it matters:** Community controls what content gets promoted (recency vs virality vs creator reputation)

**5. Portable Reputation**

- **Problem:** If Instagram bans you, you lose all followers/reputation. Platform lock-in
- **Blockchain Solution:** Your reputation score, posts, and social graph live on-chain. Take it to any frontend
- **Why it matters:** No platform can deplatform you or hold your social capital hostage

**6. Immutable Memories**

- **Problem:** Platforms delete content (copyright claims, policy changes), accounts get hacked
- **Blockchain Solution:** IPFS hash on-chain is permanent. Content pinned to decentralized storage
- **Why it matters:** Your memories can't disappear because a company changed TOS

### What Stays Off-Chain (Smart Design)

- **Media files** → IPFS (not Ethereum, too expensive)
- **Feed ordering** → Off-chain indexer reading on-chain events (fast queries)
- **Comments text** → Could be IPFS hashes or separate cheap contract (debatable)
- **Drafts/private data** → Local storage until published

**Key Insight:** Blockchain stores the *minimal trust-critical data* (ownership, verifications, payments, governance). Everything else is optimized for performance.

## Detailed UI Specifications

### Color Scheme & Branding

```
Primary: #6366f1 (Indigo) - Trust, technology
Secondary: #8b5cf6 (Purple) - Creativity
Accent: #ec4899 (Pink) - Social, energy
Success: #10b981 (Green) - Verification checkmarks
Background: #0f172a (Dark) / #ffffff (Light)
```

### Typography

- Headers: Inter Bold (clean, modern)
- Body: Inter Regular
- Monospace: JetBrains Mono (addresses, hashes)

### Component Library (Mobile-First)

**PostCard Component**

```
┌─────────────────────────┐
│ [@user] 2h ago     [•••]│ ← Header with menu
│                         │
│   [Full-screen image]   │ ← 16:9 aspect ratio
│                         │
│ ❤️ 234  💬 12  🔄 5     │ ← Engagement row
│                         │
│ ✓ Verified by @user2... │ ← Verification status
│                         │
│ Caption text here...    │ ← Truncated with "more"
│                         │
│ 💰 0.05 ETH split 3 ways│ ← Payment info (if applicable)
└─────────────────────────┘
```

- Tap image → Full post detail
- Double-tap image → Like (heart animation)
- Long-press → Context menu (share, report, save)
- Swipe left → Next post (optional navigation)

**Bottom Navigation**

```
┌─────────────────────────┐
│                         │
│    Main content area    │
│                         │
└─────────────────────────┘
┌─────┬─────┬─────┬─────┬─┐
│ 🏠  │  ➕ │ 📷  │ 👤  │🗳│ ← Fixed at bottom
│Feed │Post │Scan │ Me  │DAO│
└─────┴─────┴─────┴─────┴─┘
```

- Fixed position, 60px height
- Active tab: primary color
- Badge notifications on Scan tab when pending verifications

**Create Flow Screens**

*Screen 1: Camera/Upload*

```
┌─────────────────────────┐
│         [X] Close       │
│                         │
│                         │
│    [Camera viewfinder]  │
│         or              │
│    [Upload button]      │
│                         │
│                         │
│ [📷 Capture] [🖼️ Gallery]│
└─────────────────────────┘
```

*Screen 2: Post Details*

```
┌─────────────────────────┐
│ [←] Create Post         │
├─────────────────────────┤
│   [Selected image]      │
├─────────────────────────┤
│ Caption:                │
│ ┌─────────────────────┐ │
│ │ Write something...  │ │
│ └─────────────────────┘ │
│                         │
│ Tag Participants:       │
│ ┌─────────────────────┐ │
│ │ + Add by address    │ │
│ │ + Scan QR code      │ │
│ └─────────────────────┘ │
│ [@user1] [@user2] [X]   │ ← Chips for tagged users
│                         │
│ Privacy: [Public ▼]     │
│                         │
│ Payment Split:          │
│ [Enable ○]              │
│                         │
│       [Create Post]     │
└─────────────────────────┘
```

*Screen 3: QR Display (after creation)*

```
┌─────────────────────────┐
│ Verification Required   │
├─────────────────────────┤
│                         │
│   ┌───────────────┐     │
│   │               │     │
│   │   [QR CODE]   │     │
│   │               │     │
│   └───────────────┘     │
│                         │
│ Verified: 2/5           │
│ ✓ @user1                │
│ ✓ @user2                │
│ ○ @user3                │
│ ○ @user4                │
│ ○ @user5                │
│                         │
│ [Share QR] [Copy Link]  │
│                         │
│ Post will be live when  │
│ all participants verify │
└─────────────────────────┘
```

- Auto-refreshes verification status
- Push notification when someone verifies
- Confetti animation when fully verified

**Feed Screen Details**

```
┌─────────────────────────┐
│ Blanc  [🔔][🔍]         │ ← Header with notifications
├─────────────────────────┤
│ [All] [Following] [🔥]  │ ← Filter tabs
├─────────────────────────┤
│                         │
│    [PostCard 1]         │
│                         │
│    [PostCard 2]         │
│                         │
│    [PostCard 3]         │
│                         │
│         ...             │
│                         │
└─────────────────────────┘
```

- Pull down → Refresh
- Infinite scroll → Loads more
- Skeleton loaders while fetching

**Profile Screen**

```
┌─────────────────────────┐
│        [← Back]         │
├─────────────────────────┤
│    [Profile Image]      │
│      @username          │
│  Bio text here...       │
│                         │
│ ⭐ 1,234 reputation     │
│                         │
│ 45 Posts | 123 Verified │
│ 234 Followers | 189 Following
│                         │
│ [Edit Profile] or [Follow]│
├─────────────────────────┤
│ [Posts] [Collabs] [Pending]│ ← Tabs
├─────────────────────────┤
│ ┌───┬───┬───┐           │
│ │ 1 │ 2 │ 3 │           │ ← Post grid
│ ├───┼───┼───┤           │
│ │ 4 │ 5 │ 6 │           │
│ └───┴───┴───┘           │
└─────────────────────────┘
```

**DAO Governance Screen**

```
┌─────────────────────────┐
│ [← Back] Governance     │
├─────────────────────────┤
│ Your Tokens: 150 BLANC  │
│ Voting Power: 0.05%     │
├─────────────────────────┤
│ Current Algorithm:      │
│ • Recency: 40%          │
│ • Engagement: 35%       │
│ • Reputation: 25%       │
├─────────────────────────┤
│ Active Proposals        │
│                         │
│ ┌─────────────────────┐ │
│ │ #12: Boost new users│ │
│ │ 👍 234  👎 45       │ │
│ │ Ends in 2d 5h       │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ #11: Reduce spam... │ │
│ │ 👍 567  👎 123      │ │
│ │ Ends in 5d 12h      │ │
│ └─────────────────────┘ │
│                         │
│   [+ Create Proposal]   │
└─────────────────────────┘
```

### Mobile Interactions Map

- **Tap** → Open detail, select, action
- **Double-tap** → Like (with haptic feedback)
- **Long-press** → Context menu
- **Swipe down** → Refresh (pull-to-refresh)
- **Swipe up** → Load more
- **Swipe left/right** → Navigate between posts (optional)
- **Pinch** → Zoom images

## Mobile Testing Setup

### Problem

Your phone can't connect to `localhost:3000` because that's on your computer, not your phone. The blockchain is running on your computer (`yarn chain`), so you need to:

1. Expose your computer's local dev server to your phone
2. Configure your phone's wallet to connect to your computer's local blockchain

### Solution: LAN Testing

**Step 1: Find Your Computer's Local IP**

```bash
# On Linux/Mac
hostname -I | awk '{print $1}'

# Or
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows
ipconfig
```

You'll get something like `192.168.1.XXX`

**Step 2: Update scaffold.config.ts**

```typescript
targetNetworks: [
  {
    ...chains.foundry,
    rpcUrls: {
      default: {
        http: ["http://0.0.0.0:8545"], // Listen on all interfaces
      },
    },
  },
],
```

**Step 3: Start Services with Host Binding**

```bash
# Terminal 1: Chain (allow external connections)
yarn chain

# Terminal 2: Frontend (bind to 0.0.0.0)
yarn start -- --hostname 0.0.0.0
```

**Step 4: Connect from Phone**

1. Make sure phone is on same WiFi as computer
2. Open `http://192.168.1.XXX:3000` (your computer's IP)
3. Open MetaMask mobile
4. Add custom network:

   - Network Name: Local Foundry
   - RPC URL: `http://192.168.1.XXX:8545`
   - Chain ID: 31337
   - Currency: ETH

**Step 5: Fund Your Mobile Wallet**

```bash
# In your project, send ETH from default account to your phone's address
cast send YOUR_PHONE_ADDRESS --value 1ether --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Alternative: Use Testnets

Deploy to Sepolia/Base Sepolia for easier mobile testing without network setup:

```bash
yarn deploy --network sepolia
```

Update `scaffold.config.ts` to `targetNetworks: [chains.sepolia]`

### Testing Workflow

1. **Desktop Dev:** Use `yarn chain` + `yarn start` normally
2. **Mobile Testing:** Switch to LAN mode or testnet
3. **PWA Testing:** Use Chrome DevTools > Application > Manifest to simulate install

### Debug Tools

- **Console logs on mobile:** Use `eruda` (mobile dev tools)
  ```typescript
  // Add to layout.tsx in dev mode
  if (process.env.NODE_ENV === 'development') {
    import('eruda').then(eruda => eruda.default.init());
  }
  ```

- **Network inspector:** Use browser DevTools remote debugging
- **Wallet logs:** MetaMask mobile has built-in logs

## Implementation Plan

### Phase 1: Smart Contracts (Foundry)

1. Create new contract files: `BlancPosts.sol`, `BlancPayments.sol`, `BlancGovernance.sol`, `BlancProfile.sol`, `BlancToken.sol`
2. Write deployment script: `DeployBlanc.s.sol`
3. Write comprehensive tests: `BlancPosts.t.sol`, `BlancPayments.t.sol`, etc.
4. Deploy and verify contracts

### Phase 2: Contract Integration (NextJS)

1. Update `deployedContracts.ts` with new ABIs
2. Create custom hooks: `useCreatePost`, `useVerifyPost`, `usePaymentSplit`
3. Set up event indexing (The Graph or simple event listener)

### Phase 3: UI Components

1. Rebuild layout with bottom navigation
2. Create mobile-first components: `PostCard`, `CameraCapture`, `QRDisplay`, `VerificationStatus`, `PaymentSplitter`
3. Implement gesture library (Framer Motion or react-use-gesture)
4. Add PWA support

### Phase 4: Screens Implementation

1. Feed screen with algorithm integration
2. Create post flow (camera → tag → payment → QR)
3. Verify screen with QR scanner
4. Profile screen with tabs
5. DAO governance interface

### Phase 5: Polish & Testing

1. Add animations and transitions
2. Optimize for low-bandwidth (compress images)
3. Test on real mobile devices
4. Add analytics and error tracking