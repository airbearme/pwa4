---
description: Run comprehensive validation including linting, type checking, and end-to-end testing.
---

1. Type Check Codebase
// turbo
```bash
npm run check
```

2. Build Application (Ensures no build errors)
// turbo
```bash
npm run build
```

3. Start Development Server in Background
```bash
npm run dev &
PID=$!
sleep 10 # Wait for server to be ready
```

4. Run End-to-End Tests
```bash
npx playwright test tests/app-flow.spec.ts
```

5. Cleanup
```bash
kill $PID
```
