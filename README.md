# Taska-Loop

A modern household management app for trip coordination, task management, and shared resources.

## Features

### Shopping Trips
- Create and manage shopping trips
- Add items to shopping trips
- Track trip status (open, shopping, completed)
- Share trips with household members
- Reactivate completed trips
- **Price Memory**: Track and compare item prices across different stores and shopping trips
- **Cost Splitting**: Split trip costs equally, by percentage, or with custom amounts per item
- **Barcode Scanning**: Quickly add items by scanning product barcodes with your device camera
- **Smart Duplicates**: Detect duplicate and similar items to prevent redundant entries

### Tasks
- Create and assign tasks
- Set due dates and priorities
- Track task completion
- Rotating task assignments

### Map Integration
- View nearby stores
- Save favorite locations
- View trips on a map

### Mobile-Optimized
- Responsive design for all screen sizes
- Touch-friendly interface
- Dark mode support

## Recent Updates

### Smart Duplicates Feature
The Smart Duplicates feature helps prevent redundant items in shopping lists by:
- Detecting exact duplicate items automatically when adding to a list
- Using natural language processing to identify similar items (e.g., "apples" and "red apples")
- Providing intelligent suggestions to either increase quantity or add as a separate item
- Helping keep shopping lists clean and avoiding buying the same item twice

### Barcode Scanning Feature
The new Barcode Scanning feature allows users to:
- Scan product barcodes directly from the shopping trip interface
- Automatically look up product information from scanned barcodes
- Save unknown barcodes as new products for future scans
- Quickly add items to shopping lists without manual typing

### Cost Splitting Feature
The new Cost Splitting feature allows users to:
- Split costs for individual items or entire trips
- Choose from multiple splitting methods (equal, percentage, fixed amount)
- Select specific participants for each item split
- View a summary of how much each person owes
- Initiate payments directly from the app

### Price Memory Feature
The Price Memory feature allows users to:
- Record item prices when shopping
- View price history for frequently purchased items
- Get notifications when prices increase significantly
- Compare prices across different stores
- Track total trip costs

### Cost Splitting
- Multiple split options: equal, percentage, or fixed amount
- Per-item split configuration
- Bulk split option to apply the same split to all items at once
- Support for selecting which participants are part of each split
- Real-time cost summary showing what each person owes
- Integration with payment services

## Technology Stack
- React with TypeScript
- Vite for fast builds
- Framer Motion for animations
- Tailwind CSS for styling
- Date-fns for date manipulation
- localStorage for data persistence

## Project info

**URL**: https://lovable.dev/projects/97dac5d0-1bd7-4e0c-aed9-27c6c555b6bc

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/97dac5d0-1bd7-4e0c-aed9-27c6c555b6bc) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/97dac5d0-1bd7-4e0c-aed9-27c6c555b6bc) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Feature Implementation Checklist
A. Grocery list & cost-splitting
[x] Basic list capture - Add items manually to trip lists
[x] Split visibility - Multiple participants can view trips
[x] Price memory - Show last-paid price and flag if today's price is higher
[x] Instant list capture (barcode scan) - Scan product barcodes to quickly add items
[x] Smart duplicates - Detect duplicate and similar items to prevent redundant entries
[ ] Adaptive units
[x] Split by item or ratio - Split costs equally, by percentage, or with fixed amounts
[ ] Ledger & payouts
[ ] Receipt-scan proof
