# Telegram Channel Archive

This project automatically scrapes content from a list of public Telegram channels and displays them in a clean, searchable interface.

## Features

- **Automated Scraping**: Runs every hour via GitHub Actions.
- **Data Persistence**: Saves messages to `public/data.json` in the repository.
- **Deduplication**: Prevents duplicate messages.
- **Search & Filter**: Filter by channel or search text.
- **Media Support**: Displays images and file attachments (links).
- **Responsive UI**: Built with React and Tailwind CSS.

## Setup

1.  **Fork or Clone** this repository to your GitHub account.
2.  **Enable GitHub Actions**: Go to the "Actions" tab and ensure workflows are allowed.
3.  **Enable GitHub Pages**:
    *   Go to **Settings** > **Pages**.
    *   Under "Build and deployment", select **Source** as `gh-pages` branch (this branch will be created automatically after the first successful run of the action).
    *   Alternatively, you can configure it to deploy from `main` / `docs` if you change the workflow, but the provided workflow uses the `gh-pages` branch.

## Configuration

### Adding Channels

Edit `scripts/scrape.ts` and add the channel username to the `CHANNELS` array:

```typescript
const CHANNELS = [
  'persianvpnhub',
  'mitivpn',
  // Add your channels here
];
```

### Modifying Schedule

Edit `.github/workflows/scrape.yml` to change the cron schedule:

```yaml
on:
  schedule:
    - cron: '0 * * * *' # Runs every hour
```

## Local Development

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the scraper manually:
    ```bash
    npx tsx scripts/scrape.ts
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
