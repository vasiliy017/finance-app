# E2E tests (Maestro)

End-to-end UI flows for the Finance App, driven by [Maestro](https://maestro.mobile.dev/).
These tests exercise the real native build against an iOS Simulator or Android Emulator —
no mocking, real Zustand store, real `AsyncStorage` persistence.

## Layout

```
.maestro/
  config.yaml              # Workspace defaults (appId, etc.)
  helpers/
    launch-clean.yaml      # Cold launch with cleared state/keychain
    add-expense.yaml       # Reusable "add one expense" subflow (env: AMOUNT, CATEGORY_ID)
  flows/
    01-add-expense.yaml        # Happy path
    02-validation.yaml         # Submit stays disabled when invalid
    03-edit-expense.yaml       # Edit an existing transaction
    04-delete-expense.yaml     # Destructive delete + alert confirmation
    05-type-tab-switch.yaml    # Income / Expense toggle
    06-navigate-to-list.yaml   # Home <-> transactions list
    07-persistence.yaml        # Kill & relaunch keeps data
```

Bundle id: `com.faust.financeapp` (declared in `app.json` under `expo.ios.bundleIdentifier`
and `expo.android.package`). Change in both places if you fork.

## Prerequisites

### 1. Install Maestro CLI

The Maestro CLI is shell-based and **must be installed inside WSL2 on Windows**
(it does not support native cmd.exe / PowerShell).

```bash
# Inside WSL2 (Ubuntu) or macOS / Linux:
curl -fsSL "https://get.maestro.mobile.dev" | bash
maestro --version
```

### 2. Install a simulator

- **iOS** (macOS only): Xcode + an iOS Simulator runtime, then boot one (`xcrun simctl boot "iPhone 15"`).
- **Android** (any host): Android Studio + an AVD, then boot it (`emulator -avd <name>`).

### 3. Produce a native build

Expo's managed runtime (Expo Go) is not enough — Maestro needs a real installed
app with our `bundleIdentifier`. Generate the native projects and build/install
the dev binary once:

```bash
npx expo prebuild              # writes /ios and /android (gitignored)
npx expo run:ios               # build + install + launch on the booted Simulator
# or
npx expo run:android           # build + install + launch on the booted Emulator
```

Re-run `expo run:ios` / `run:android` whenever native dependencies change.

## Running the flows

```bash
# All flows on whichever device is currently booted:
npm run e2e

# Filter by platform tag (each flow declares `tags: [ios, android]`):
npm run e2e:ios
npm run e2e:android

# Interactive recorder / inspector:
npm run e2e:record
```

A single flow can be run directly:

```bash
maestro test .maestro/flows/01-add-expense.yaml
```

## Test ID conventions

Flows locate elements by stable `testID` props, not visual text where possible.
Existing test IDs:

| testID                       | Component                                 |
| ---------------------------- | ----------------------------------------- |
| `home-add-btn`               | Floating "+" on home screen               |
| `home-open-list`             | Receipt icon on home header               |
| `tx-form-amount`             | Amount input on the form                  |
| `tx-form-note`               | Comment input on the form                 |
| `tx-form-submit`             | Form submit button                        |
| `category-tile-<id>`         | Each category in the picker grid          |
| `tx-row-<id>`                | Each row in the transactions list         |

When adding a flow, prefer `id:` selectors over `text:` so copy changes don't
break tests.

## Out of scope

- Photo picker flow (requires permissions + image fixture handling).
- Web E2E (we ship native; Playwright would target a different build).
- CI integration (run locally only).
- Visual regression (Maestro supports it but it's noisy on Expo splash screens).
