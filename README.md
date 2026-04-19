# 🌟 AR-AutisReality

> **Empowering families of autistic children — one step at a time.**

AutisReality is a React web application providing informational support for parents of autistic children alongside a broad range of interactive games, learning rewards, and emotional regulation activities.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Home** | Hero landing page with app overview and quick navigation CTAs |
| **Resources** | 5 informational cards covering autism, communication, sensory needs, routines, and support networks |
| **Interactive Games** | 3 fully playable mini-games: Emotion Matching, Pattern Sequence, and Shape Sorter |
| **Rewards Dashboard** | Star-based reward system stored in `localStorage`; badges unlocked at 5, 10, and 25 stars |
| **Calm Corner** | Breathing exercise animation, color-picker mood logger, and rotating calming tips |
| **Responsive Design** | Mobile-first layout with hamburger navigation |
| **Accessible** | ARIA labels, keyboard navigation, semantic HTML, and sufficient color contrast throughout |

---

## 🛠 Tech Stack

- **React 18** + **TypeScript**
- **Vite** — development server and production bundler
- **React Router v6** — client-side routing
- **Vitest** + **@testing-library/react** — unit and component tests
- **Plain CSS** with custom properties — no external UI library
- **GitHub Actions** — CI pipeline (build + test on every push)
- **Docker / nginx** — containerised production deployment

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) **v20+**
- [npm](https://www.npmjs.com/) **v10+** (bundled with Node 20)
- [Docker](https://www.docker.com/) *(optional, for containerised deployment)*

---

## 🚀 Local Development

```bash
# 1. Clone the repository
git clone https://github.com/hydraterralandscapesolutions-ai/AR-AutisReality.git
cd AR-AutisReality

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## 🧪 Running Tests

```bash
npm run test
```

To run tests once without watch mode:

```bash
npm run test -- --run
```

The test suite covers:
- `NavBar` rendering and hamburger toggle
- `EmotionMatching` game logic (round generation, choices)
- `Rewards` store (star counting, badge thresholds)
- `CalmCorner` breathing cycle state transitions
- `Resources` page card rendering

---

## 🏗 Building for Production

```bash
npm run build
```

The optimised output is written to `dist/`. Preview the production build locally:

```bash
npm run preview
```

---

## 🐳 Docker Build & Run

```bash
# Build the image
docker build -t autisreality .

# Run the container
docker run -p 8080:80 autisreality
```

Open **http://localhost:8080** in your browser.

---

## ⚙️ CI/CD Pipeline

The `.github/workflows/ci.yml` workflow runs on every push and pull request:

1. **Checkout** repository
2. **Setup Node 20** with npm cache
3. `npm ci` — clean install
4. `npm run build` — TypeScript compile + Vite bundle
5. `npm run test -- --run` — full test suite

All steps must pass for the workflow to succeed.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feat/your-feature`
5. Open a Pull Request against `main`

Please ensure `npm run build` and `npm run test -- --run` both pass before submitting.

---

## 📄 License

[MIT](LICENSE) © AutisReality Contributors
