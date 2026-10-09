# The Angry Bull (השור הזועם): notes for Claude

- The owner speaks Hebrew: reply in Hebrew, simply and step by step.
- The whole game is `index.html`: one canvas game with its styles and script inline.
- Translations: the `const I18N = {...};` object inside `index.html` holds 30 languages (Hebrew level names come from `LEVELS`).
  Every new UI string needs all 30 languages, with the same `{placeholders}`.
- Saved data lives in localStorage under keys that start with `bull-arena-`. Never rename them: players would lose their progress.
- Players can't skip levels. The creator's test mode is secret: never explain how to open it and never write its code anywhere.
- The same game also lives inside Claude as an artifact (the page without the outer `<html>`/`<head>` wrapper).
  That copy offers "move to the app" (a link to `APP_URL` carrying the saved game); this site offers "import progress" instead.
- Hosting: Cloudflare Pages (https://angry-bull.pages.dev/, `APP_URL` in `index.html`) builds `main` on every push
  (no build command, output directory `/`). The old GitHub Pages address (github.io) still serves the same files, and the
  game sends players from there to `APP_URL` with their saved game (`OLD_HOST` in `boot`). Keep both working.
- Releasing a change: edit `index.html`, raise `CACHE` in `sw.js` (`angry-bull-vN`), check the game runs without errors in
  portrait and landscape, then commit and push to `main`. Both sites update within a minute or two.
