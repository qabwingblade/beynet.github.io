# beynet.github.io

Static site currently containing a **GUI mock** for a Beyblade X combo testing web app.

## Test this in your browser (quick start)

1. Open a terminal in this project folder.
2. Start a local web server:

   ```bash
   python3 -m http.server 4173
   ```

3. Open your browser and go to:
   - `http://localhost:4173/index.html`

4. You should see the mock UI with:
   - `BeyNet Combo Testing Tracker`
   - `Session Setup`
   - `Round Entry (Fast Input)`
   - `Auto Summary (per candidate)`

5. When done, return to terminal and press `Ctrl + C` to stop the server.

## Browser checks to run manually

This mock is mostly visual (no real persistence/business logic yet), so testing is primarily:

1. **Layout smoke test**
   - Header, session cards, session setup, round table, and summary panel all render.
2. **Responsive test**
   - Open browser devtools and switch between desktop and mobile widths to verify stacked grids.
3. **Content test**
   - Verify scoring copy says: `X = 3, KO = 2, B = 2, S = 1`.
4. **Accessibility quick pass**
   - Ensure text contrast is readable and controls are keyboard-focusable.

## Scripted smoke test

You can run a minimal script that serves the page and validates key UI text exists:

```bash
bash scripts/test_mock.sh
```

This confirms the page can be served and includes core sections:

- `BeyNet Combo Testing Tracker`
- `Session Setup`
- `Round Entry (Fast Input)`
- `Auto Summary (per candidate)`

## Optional visual regression check

If Playwright is available in your environment, capture a screenshot and compare changes over time.
