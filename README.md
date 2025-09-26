# Pick Insights Studio

Pick Insights Studio is a lightweight web dashboard for consolidating betting
intel from every expert source you trust. Log each matchup, capture the voices
that influenced your card, and see consensus at a glance with auto-generated
breakdowns.

## Features

- **Flexible slate builder** – track any matchup with kickoff times, custom tags,
  and running notes.
- **Source library** – maintain a list of trusted experts, podcasts, models, or
  beat reporters that you can reuse across games.
- **Pick tracking** – add as many predictions as you need per game, including
  notes and confidence percentages.
- **Consensus visuals** – automatically compute pick counts, average confidence,
  and a consensus meter that highlights agreement strength.
- **Import/export** – snapshot the entire setup to share or back up, then reload
  it later.
- **Local-first** – everything is stored in your browser via `localStorage`, so
  no accounts or databases are required.

## Getting Started

1. Launch a static file server from the project root:

   ```bash
   cd dashboard
   python -m http.server 8000
   ```

2. Open `http://localhost:8000` in your browser to start organizing your slate.

> 💡 The tool ships with a small amount of sample data so you can see how the
> workflow feels. Use the archive/delete buttons on each card to prune it down
> to only the games you care about.

## Export Format

Exported files include every saved source and matchup. They can be versioned or
shared with league mates, then re-imported via the **Import Setup** control in
the header. The schema is:

```json
{
  "sources": [
    {
      "name": "string",
      "type": "string",
      "url": "string"
    }
  ],
  "games": [
    {
      "name": "string",
      "kickoff": "ISO date",
      "tags": ["string"],
      "notes": "string",
      "archived": false,
      "picks": [
        {
          "source": "string",
          "choice": "string",
          "confidence": "0-100",
          "notes": "string"
        }
      ]
    }
  ]
}
```

Imported files generate fresh identifiers to keep existing data intact. If an
import fails, double-check that the JSON aligns with this structure.
