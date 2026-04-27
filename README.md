# Finance App

Offline-first mobile finance tracker built with Expo and React Native.

## Stack

- Expo Router for file-based navigation
- Zustand for local state
- AsyncStorage for offline persistence
- TypeScript for the domain model and feature modules

## MVP scope

- Create expense and income transactions
- Edit and delete existing transactions
- Group transaction history by day
- Show total income, total expenses, and net balance
- Keep data available after app restart without network dependency

## Route map

- `/` — Home overview
- `/transactions` — grouped transaction list
- `/balance` — balance summary
- `/transaction` — add/edit modal route

## Project structure

```text
app/
   (tabs)/
      _layout.tsx
      index.tsx
      transactions.tsx
      balance.tsx
   _layout.tsx
   transaction.tsx
src/
   entities/
      transaction/
         model.ts
         store.ts
         index.ts
   features/
      add-transaction/
      transaction-list/
      balance/
   shared/
      ui/
      lib/
```

## Local development

1. Install dependencies.

```bash
npm install
```

2. Start Expo.

```bash
npm run start
```

3. Run lint.

```bash
npm run lint
```

## Notes

- The transaction form stores dates as timestamps, but the current MVP edits dates through a `YYYY-MM-DD` text field.
- The app uses local persistence only in this iteration. There is no backend sync, auth, recurring transactions, or category management UI yet.
