# thoughts — Sanctuary of Stillness

An editorial, minimalist digital sanctuary and journal inspired by wabi-sabi aesthetics, featuring cryptographic privacy, a PIN-protected vault, collapsible sidebar, and full mobile responsiveness.

---

## ✨ Features

- **Branding & Identity**: Named **"thoughts"** with a 4-point celestial star icon app icon and favicon.
- **PIN-Protected Private Vault**:
  - Secure sensitive notes with a 4-digit PIN.
  - **Default PIN**: `1234`
  - Tactile keypad with keyboard number support, dot indicators, and error-shake animations.
  - Change or reset your PIN anytime via the Settings modal or PIN dialog.
  - Inline encrypted segments within entries that decrypt in place upon PIN verification.
  - One-click "Lock All Notes" action.
- **Collapsible Sidebar**:
  - **Desktop**: Toggle collapse between full width (240px) and a compact icon rail (72px) with persistent state.
  - **Mobile**: Responsive hamburger menu with smooth slide-over drawer and backdrop blur.
- **Mobile-Friendly Design**:
  - Fluid responsive grid (1 column on phones, 2 on tablets, 3 on desktops).
  - Touch-optimized PIN keypad.
  - Slide-over properties inspector drawer on mobile.
  - Mobile-docked floating toolbar for formatting.
- **Editorial Writing & Reading Canvas**:
  - Rich typography featuring *Newsreader* and *Cormorant Garamond*.
  - Live word count, reading time calculator, and circular Daily Focus Goal progress ring.
  - Distraction-free **Quiet Mode** with optional ambient rain sound (powered by Web Audio API).
  - Filter tabs: `All`, `Reflections`, `Vault`, and `Saved`.
  - Live search across titles, content, tags, and locations.
  - LocalStorage persistence for your notes, PIN, and settings.

---

## 🚀 Getting Started

To run the app locally:

```bash
# Start development server
npm run dev

# Or view production build
npm run preview
```

Open `http://localhost:5173` in your browser.
