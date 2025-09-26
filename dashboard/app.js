const storageKey = 'pick-insights-studio';

const defaultState = {
  sources: [
    {
      id: crypto.randomUUID(),
      name: 'Sharp Football Analysis',
      type: 'Model',
      url: 'https://www.sharpfootballanalysis.com/'
    },
    {
      id: crypto.randomUUID(),
      name: 'The Ringer Gambling Show',
      type: 'Podcast',
      url: 'https://www.theringer.com/podcasts'
    },
    {
      id: crypto.randomUUID(),
      name: 'PFF Forecast',
      type: 'Analytics',
      url: 'https://www.pff.com/podcasts/the-forecast'
    }
  ],
  games: [
    {
      id: crypto.randomUUID(),
      name: 'Lions @ Packers',
      kickoff: '',
      tags: ['Divisional', 'Primetime'],
      notes: 'Monitor weather at Lambeau and offensive line injuries.',
      archived: false,
      picks: [
        {
          id: crypto.randomUUID(),
          source: 'Sharp Football Analysis',
          choice: 'Lions -2.5',
          confidence: 68,
          notes: 'Edge in EPA/play and explosive plays.'
        },
        {
          id: crypto.randomUUID(),
          source: 'PFF Forecast',
          choice: 'Packers +2.5',
          confidence: 60,
          notes: 'Numbers show value on the home dog.'
        }
      ]
    }
  ]
};

const state = loadState();

const elements = {
  gamesContainer: document.querySelector('#gamesContainer'),
  gameTemplate: document.querySelector('#gameTemplate'),
  pickRowTemplate: document.querySelector('#pickRowTemplate'),
  addGameForm: document.querySelector('#addGameForm'),
  gameNameInput: document.querySelector('#gameNameInput'),
  gameTimeInput: document.querySelector('#gameTimeInput'),
  gameTagsInput: document.querySelector('#gameTagsInput'),
  gameNotesInput: document.querySelector('#gameNotesInput'),
  addSourceForm: document.querySelector('#addSourceForm'),
  sourceNameInput: document.querySelector('#sourceNameInput'),
  sourceTypeInput: document.querySelector('#sourceTypeInput'),
  sourceUrlInput: document.querySelector('#sourceUrlInput'),
  sourceList: document.querySelector('#sourceList'),
  sourceOptions: document.querySelector('#sourceOptions'),
  exportButton: document.querySelector('#exportButton'),
  importInput: document.querySelector('#importInput')
};

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return structuredClone(defaultState);
    }
    const parsed = JSON.parse(raw);
    parsed.sources ??= [];
    parsed.games ??= [];
    parsed.games.forEach((game) => {
      game.picks ??= [];
      game.tags = Array.isArray(game.tags)
        ? game.tags
        : (game.tags || '')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);
    });
    return parsed;
  } catch (error) {
    console.error('Failed to parse state, falling back to defaults', error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function render() {
  renderSources();
  renderGames();
}

function renderSources() {
  elements.sourceList.innerHTML = '';
  elements.sourceOptions.innerHTML = '';

  if (!state.sources.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Add the podcasts, models, and insiders you trust.';
    elements.sourceList.append(empty);
  }

  state.sources.forEach((source) => {
    const option = document.createElement('option');
    option.value = source.name;
    elements.sourceOptions.append(option);

    const chip = document.createElement('div');
    chip.className = 'source-chip';

    const name = document.createElement('div');
    name.className = 'source-chip__name';
    name.textContent = source.name;
    chip.append(name);

    const meta = document.createElement('div');
    meta.className = 'source-chip__meta';
    if (source.type) {
      const type = document.createElement('span');
      type.textContent = source.type;
      meta.append(type);
    }
    if (source.url) {
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Visit';
      meta.append(link);
    }
    if (meta.childElementCount) {
      chip.append(meta);
    }

    const actions = document.createElement('div');
    actions.className = 'source-chip__actions';
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'ghost-button ghost-button--danger';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      state.sources = state.sources.filter((item) => item.id !== source.id);
      saveState();
      render();
    });
    actions.append(removeButton);
    chip.append(actions);

    elements.sourceList.append(chip);
  });
}

function renderGames() {
  elements.gamesContainer.innerHTML = '';

  if (!state.games.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No games yet. Add your first matchup to get started!';
    elements.gamesContainer.append(empty);
    return;
  }

  state.games.forEach((game) => {
    const clone = elements.gameTemplate.content.cloneNode(true);
    const card = clone.querySelector('.game-card');
    const title = clone.querySelector('.game-card__title');
    const meta = clone.querySelector('.game-card__meta');
    const tbody = clone.querySelector('tbody');
    const addRowButton = clone.querySelector('.js-add-row');
    const duplicateButton = clone.querySelector('.js-duplicate');
    const archiveButton = clone.querySelector('.js-archive');
    const deleteButton = clone.querySelector('.js-delete');
    const meterBar = clone.querySelector('.meter__bar');
    const meterLabel = clone.querySelector('.meter__label');
    const breakdown = clone.querySelector('.breakdown');
    const notesArea = clone.querySelector('.game-notes');

    card.dataset.id = game.id;
    if (game.archived) {
      card.classList.add('game-card--archived');
    }

    title.textContent = game.name;
    const metaParts = [];
    if (game.kickoff) {
      metaParts.push(new Date(game.kickoff).toLocaleString());
    }
    if (game.tags?.length) {
      const tags = document.createElement('div');
      tags.className = 'tag-list';
      game.tags.forEach((tag) => {
        const badge = document.createElement('span');
        badge.className = 'tag';
        badge.textContent = tag;
        tags.append(badge);
      });
      meta.append(tags);
    }
    meta.prepend(metaParts.join(' • '));

    notesArea.value = game.notes || '';
    notesArea.addEventListener('input', (event) => {
      game.notes = event.target.value;
      saveState();
    });

    const renderRows = () => {
      tbody.innerHTML = '';
      game.picks.forEach((pick) => {
        const row = elements.pickRowTemplate.content.cloneNode(true);
        const sourceInput = row.querySelector('.pick-source');
        const choiceInput = row.querySelector('.pick-choice');
        const confidenceInput = row.querySelector('.pick-confidence');
        const notesInput = row.querySelector('.pick-notes');
        const removeButton = row.querySelector('.js-remove-row');

        sourceInput.value = pick.source || '';
        choiceInput.value = pick.choice || '';
        confidenceInput.value = pick.confidence ?? '';
        notesInput.value = pick.notes || '';

        sourceInput.addEventListener('change', (event) => {
          pick.source = event.target.value.trim();
          maybeAddSource(pick.source);
          saveState();
          render();
        });

        choiceInput.addEventListener('input', (event) => {
          pick.choice = event.target.value;
          saveState();
          refreshInsights();
        });

        confidenceInput.addEventListener('input', (event) => {
          const value = event.target.value;
          pick.confidence = value === '' ? '' : Math.max(0, Math.min(100, Number(value)));
          saveState();
          refreshInsights();
        });

        notesInput.addEventListener('input', (event) => {
          pick.notes = event.target.value;
          saveState();
        });

        removeButton.addEventListener('click', () => {
          game.picks = game.picks.filter((item) => item.id !== pick.id);
          saveState();
          render();
        });

        tbody.append(row);
      });

      if (!game.picks.length) {
        const emptyRow = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 5;
        cell.className = 'empty-state';
        cell.textContent = 'Add your first pick for this matchup!';
        emptyRow.append(cell);
        tbody.append(emptyRow);
      }

      refreshInsights();
    };

    const refreshInsights = () => {
      const counts = new Map();
      let totalConfidence = 0;
      let confidenceEntries = 0;

      game.picks.forEach((pick) => {
        const key = pick.choice?.trim();
        if (!key) return;

        const data = counts.get(key) || {
          total: 0,
          confidence: 0,
          notes: []
        };
        data.total += 1;
        if (pick.confidence !== '' && !Number.isNaN(Number(pick.confidence))) {
          data.confidence += Number(pick.confidence);
          totalConfidence += Number(pick.confidence);
          confidenceEntries += 1;
        }
        if (pick.source) {
          data.notes.push({ source: pick.source, notes: pick.notes });
        }
        counts.set(key, data);
      });

      const totalPicks = Array.from(counts.values()).reduce((sum, item) => sum + item.total, 0);
      const sorted = Array.from(counts.entries()).sort((a, b) => b[1].total - a[1].total);
      const top = sorted[0];

      const consensus = top ? Math.round((top[1].total / Math.max(totalPicks, 1)) * 100) : 0;
      meterBar.style.width = `${consensus}%`;
      meterLabel.textContent = top
        ? `${consensus}% like ${top[0]} (${top[1].total} of ${totalPicks})`
        : 'No picks logged yet';

      breakdown.innerHTML = '';
      if (!sorted.length) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'Log picks to generate a breakdown.';
        breakdown.append(empty);
        return;
      }

      const maxCount = sorted[0][1].total;
      sorted.forEach(([choice, info]) => {
        const row = document.createElement('div');
        row.className = 'breakdown-row';

        const header = document.createElement('div');
        header.className = 'breakdown-row__header';

        const label = document.createElement('span');
        label.className = 'breakdown-row__label';
        label.textContent = choice;

        const detail = document.createElement('span');
        const avgConfidence = info.confidence && info.total
          ? Math.round(info.confidence / info.total)
          : '—';
        detail.textContent = `${info.total} pick${info.total === 1 ? '' : 's'} · Avg conf: ${avgConfidence}`;

        header.append(label, detail);
        row.append(header);

        const bar = document.createElement('div');
        bar.className = 'breakdown-row__bar';
        const fill = document.createElement('div');
        fill.className = 'breakdown-row__fill';
        fill.style.width = `${(info.total / maxCount) * 100}%`;
        bar.append(fill);
        row.append(bar);

        if (info.notes.length) {
          const notesList = document.createElement('ul');
          notesList.className = 'breakdown-row__notes';
          info.notes.forEach((note) => {
            if (!note.notes) return;
            const li = document.createElement('li');
            li.textContent = `${note.source}: ${note.notes}`;
            notesList.append(li);
          });
          if (notesList.childElementCount) {
            row.append(notesList);
          }
        }

        breakdown.append(row);
      });
    };

    addRowButton.addEventListener('click', () => {
      game.picks.push({
        id: crypto.randomUUID(),
        source: '',
        choice: '',
        confidence: '',
        notes: ''
      });
      saveState();
      renderRows();
    });

    duplicateButton.addEventListener('click', () => {
      const copy = structuredClone(game);
      copy.id = crypto.randomUUID();
      copy.name = `${copy.name} (copy)`;
      copy.picks = copy.picks.map((pick) => ({
        ...pick,
        id: crypto.randomUUID()
      }));
      state.games.push(copy);
      saveState();
      render();
    });

    archiveButton.addEventListener('click', () => {
      game.archived = !game.archived;
      archiveButton.textContent = game.archived ? 'Unarchive' : 'Archive';
      saveState();
      render();
    });

    archiveButton.textContent = game.archived ? 'Unarchive' : 'Archive';

    deleteButton.addEventListener('click', () => {
      if (!confirm(`Remove ${game.name}?`)) {
        return;
      }
      state.games = state.games.filter((item) => item.id !== game.id);
      saveState();
      render();
    });

    renderRows();
    elements.gamesContainer.append(clone);
  });
}

function maybeAddSource(name) {
  const trimmed = name?.trim();
  if (!trimmed) return;
  const exists = state.sources.some((item) => item.name.toLowerCase() === trimmed.toLowerCase());
  if (exists) return;
  state.sources.push({
    id: crypto.randomUUID(),
    name: trimmed,
    type: '',
    url: ''
  });
}

elements.addGameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = elements.gameNameInput.value.trim();
  if (!name) return;
  const kickoff = elements.gameTimeInput.value;
  const tags = elements.gameTagsInput.value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const notes = elements.gameNotesInput.value.trim();

  state.games.unshift({
    id: crypto.randomUUID(),
    name,
    kickoff,
    tags,
    notes,
    archived: false,
    picks: []
  });

  saveState();
  render();
  event.target.reset();
});

elements.addSourceForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = elements.sourceNameInput.value.trim();
  if (!name) return;
  const type = elements.sourceTypeInput.value.trim();
  const url = elements.sourceUrlInput.value.trim();

  state.sources.push({
    id: crypto.randomUUID(),
    name,
    type,
    url
  });

  saveState();
  render();
  event.target.reset();
});

elements.exportButton.addEventListener('click', () => {
  const exportBlob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(exportBlob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `pick-insights-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
});

elements.importInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.games) || !Array.isArray(parsed.sources)) {
      throw new Error('Invalid file format.');
    }
    parsed.games = parsed.games.map((game) => ({
      ...game,
      id: crypto.randomUUID(),
      picks: (game.picks || []).map((pick) => ({
        ...pick,
        id: crypto.randomUUID()
      }))
    }));
    parsed.sources = parsed.sources.map((source) => ({
      ...source,
      id: crypto.randomUUID()
    }));
    Object.assign(state, parsed);
    saveState();
    render();
  } catch (error) {
    console.error(error);
    alert('Unable to import file. Ensure it was exported from this tool.');
  } finally {
    event.target.value = '';
  }
});

render();
