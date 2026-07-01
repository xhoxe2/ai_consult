# AI Shop Agent Prototype

Throwaway prototype for a site assistant: the user types a shopping request, the assistant finds a matching product in the catalog, highlights it, and scrolls/navigates to the card.

## Run

```bash
cd /Users/valentinpetruk/Documents/Codex/2026-07-01/new-chat/outputs/ai-shop-agent-prototype
GEMINI_API_KEY="YOUR_KEY_HERE" npm start
```

Open `http://localhost:4173`.

If `GEMINI_API_KEY` is not set, the prototype still works with a local keyword matcher.

## Notes

- Do not put the API key in frontend JavaScript.
- The key shared in chat should be rotated or restricted in Google Cloud / AI Studio.
- This is not a real virtual try-on generator. The try-on block is a product concept placeholder and links to existing services.
