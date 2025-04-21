# DEVLOG

## Issue

- Initial playground hung on "Installing dependencies... Starting server..." with no visible errors in iframe.

## Investigation & Fixes

1. Enabled verbose logging for `npm install` and Vite (`npm run dev`) in `main.js` to inspect process output.
2. Discovered `ERESOLVE unable to resolve dependency tree` due to `@sveltejs/vite-plugin-svelte` requiring Vite ^5.0.0 while `package.json` specified Vite ^4.1.0.
   - **Fix:** Updated Vite version to ^5.0.0 in the container's `package.json` inside `files.js`.
3. Encountered `invalid file name "src/app.svelte"` during `mount(files)`.
   - Restructured `files.js` to provide a proper nested `src` directory and Svelte file entry.
4. Realized Vite needed a standard HTML entrypoint and a `main.js` bootstrap file.
   - Added `index.html` (with `<div id="app"></div>` and `<script src="/src/main.js">`).
   - Added `src/main.js` to import `app.svelte` and mount it on `#app`.
5. Updated Vite configuration by including `vite.config.js` with the Svelte plugin.
6. Ensured the WebContainer handler sets the iframe `src` (removing prior `srcdoc`) on the `server-ready` event.

## Outcome

- Live-edit Svelte playground now boots inside WebContainers:
  - Editor textarea on the left reflects initial `app.svelte` contents.
  - Iframe on the right shows the rendered Svelte component served by Vite.
  - Changes in the textarea trigger HMR and instantly update the preview.

---

_End of log._
