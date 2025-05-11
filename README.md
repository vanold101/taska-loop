# 🌀 TaskaLoop

**The all-in-one app to manage your shared household.**  
Plan shopping trips, split expenses, track chores, and save money — together.

---

## 🧠 Why TaskaLoop?

TaskaLoop is your **shared household command center**. It combines collaborative to-do management, grocery planning, real-time cost sharing, and intelligent location-based reminders into a single, beautifully designed app. Whether you live with roommates, a partner, or family — TaskaLoop keeps your life synced and your house in order.

---

## 🌟 Core Features

### 🛍️ **Shared Shopping Trips**
Plan and execute multi-stop errands as a team.
- Create trips to specific stores (e.g., “Trader Joe's on Friday”)
- Add items with price, quantity, and store context
- Track purchase status (Pending, Bought, Skipped)
- Reuse past trips with 1-tap reactivation

### 🧾 **Smart Cost Splitting**
Fair, automatic, and fully transparent.
- Split by equal share, percentage, or exact item amounts
- Track who paid and who owes what
- Shared ledger auto-updates after every purchase or receipt scan
- Export to CSV or settle instantly with Venmo, PayPal, or Apple Pay

### 📷 **Scan & Track**
Turn your grocery run digital:
- Scan product barcodes to add items instantly
- Snap receipts for OCR-based item detection
- Prevent double-buying with duplicate detection across trips

### 📍 **Optimized Route Planning**
Save gas, time, and sanity.
- Auto-optimize the order of stops based on distance
- View current traffic-adjusted ETAs and route
- See which store has the most checklist overlap with your current list
- Visualize your day’s trip on an interactive map

### 💵 **Price Intelligence**
Buy smarter, not just faster.
- Track prices across multiple stores over time
- Get real-time deal alerts when items in your list go on sale
- Compare historical price graphs for high-frequency purchases
- View “cheapest nearby” store suggestions based on your current location

### 📅 **Task & Chore Management**
Maintain a fair and efficient home.
- Assign rotating chores (e.g., trash, dishes, cleaning)
- Set custom rotation logic (round-robin, points, priority rules)
- Schedule reminders by time or location (“Take out trash when leaving home”)
- View task streaks, completion history, and overdue alerts

---

## 🔧 Power Features

| Feature | Description |
|--------|-------------|
| 🧑‍🤝‍🧑 Multi-User Support | Add and manage roommates with role-based permissions |
| 🌓 Dark Mode | Battery-efficient and easy on the eyes |
| 🔄 Real-Time Sync | All lists and ledgers update instantly across all devices |
| 📥 Shared Receipts | Everyone sees every purchase — no disputes |
| 💬 In-App Chat | Quick item requests and “Did you already buy this?” answers |
| 📊 Household Dashboard | See weekly spend, chore completion, and XP earned |
| 🧠 AI Smart Suggestions | Automatically suggest reordering staples or missed tasks |
| 🏆 Gamification | Earn XP, level up your streaks, and track household fairness |

---

## 💡 Designed for Real Life

TaskaLoop isn’t just feature-rich — it's thoughtfully designed:
- ✅ **Responsive UI** for mobile & web
- ✅ **Accessibility compliant** (screen reader labels, color-safe themes)
- ✅ **Offline-first architecture** — make updates even with poor signal
- ✅ **Battery-friendly GPS logic** — combines Wi-Fi + motion sensors
- ✅ **Multi-platform** — iOS, Android, and PWA web access

---

## 📱 Example Use Case

> Rachel is heading to Trader Joe’s.  
> ETA: 20 minutes.  
> 🛒 *Need anything?*

→ [Add Items] → [No Thanks]

- Rachel adds “Almond milk” from last week’s list  
- App auto-splits it 50/50 with Dev  
- App shows Kroger has it $0.90 cheaper — would you like to reroute?

→ *“Yes, reroute”*  
→ Taska re-optimizes the trip

---

## 🚀 Getting Started

1. Invite your housemates with a link or phone number  
2. Add your first shopping trip or task list  
3. Scan receipts, mark tasks complete, and split costs  
4. Watch your dashboard update live  

📲 **Download TaskaLoop** → [App Store] [Google Play]  
💻 Or use the [Web App](https://taskaloop.app)

---

## 📂 Project Structure (for developers)

```bash
/taskaloop
├── client/        # React Native frontend
├── server/        # Node.js + Express backend
├── firebase/      # Firebase auth and Firestore DB rules
├── functions/     # Cloud functions for receipts, routing, etc.
├── assets/        # Icons, logos, color themes
└── README.md
