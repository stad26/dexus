"""
Q1 2026 earnings date corrections based on official IR announcements.
Run: python scripts/update_dates.py
"""
import json, os

path = os.path.join(os.path.dirname(__file__), '..', 'data', 'reits.json')
with open(path) as f:
    data = json.load(f)

# ticker -> fields to overwrite
updates = {
    # ── Already reported ★ ──────────────────────────────────────────────────
    'CCI':  {'releaseDate': 'Apr 22, 2026★', 'callDate': 'Apr 22, 2026, TBD',   'status': 'CONF', 'notes': 'After close'},
    'EGP':  {'releaseDate': 'Apr 22, 2026★', 'callDate': 'Apr 23, 2026, 10:00a','status': 'CONF', 'notes': 'After close'},
    'FR':   {'releaseDate': 'Apr 22, 2026★',                                     'status': 'CONF'},
    'ARE':  {'releaseDate': 'Apr 22, 2026★',                                     'status': 'CONF'},
    'REXR': {'releaseDate': 'Apr 23, 2026★', 'callDate': 'Apr 24, 2026, 11:00a','status': 'CONF', 'notes': 'After close'},
    'GLPI': {'releaseDate': 'Apr 23, 2026★', 'callDate': 'Apr 24, 2026, 10:00a','status': 'CONF', 'notes': 'After close'},
    'BDN':  {'releaseDate': 'Apr 23, 2026★', 'callDate': 'Apr 23, 2026, TBD',   'status': 'CONF', 'notes': 'After close'},

    # ── Releasing today Apr 23 after close (not yet ★) ──────────────────────
    'DLR':  {'releaseDate': 'Apr 23, 2026',  'callDate': 'Apr 24, 2026, TBD',   'status': 'CONF', 'notes': 'After close'},
    'TRNO': {'releaseDate': 'Apr 23, 2026',  'callDate': 'Apr 24, 2026, TBD',   'status': 'CONF', 'notes': 'After close'},

    # ── Upcoming – date or call time corrected ───────────────────────────────
    'WELL': {'releaseDate': 'Apr 28, 2026',  'callDate': 'Apr 29, 2026, 9:00a', 'status': 'CONF', 'notes': 'After close'},
    'AVB':  {'releaseDate': 'Apr 27, 2026',  'callDate': 'Apr 28, 2026, 1:00p', 'status': 'CONF', 'notes': 'After close'},
    'PSA':  {'releaseDate': 'Apr 27, 2026',  'callDate': 'Apr 28, 2026, 11:00a CT','status': 'CONF', 'notes': 'After close'},
    'VTR':  {'releaseDate': 'Apr 27, 2026',  'callDate': 'Apr 28, 2026, 10:00a','status': 'CONF', 'notes': 'After close'},
    'KRC':  {'releaseDate': 'Apr 27, 2026',  'callDate': 'Apr 28, 2026, 1:00p', 'status': 'CONF', 'notes': 'After close'},
    'EQR':  {'releaseDate': 'Apr 28, 2026',  'callDate': 'Apr 29, 2026, 10:00a CT','status': 'CONF', 'notes': 'After close'},
    'BXP':  {'releaseDate': 'Apr 28, 2026',  'callDate': 'Apr 29, 2026, 10:00a','status': 'CONF', 'notes': 'After close'},
    'HIW':  {'releaseDate': 'Apr 28, 2026',  'callDate': 'Apr 29, 2026, 11:00a','status': 'CONF', 'notes': 'After close'},
    'EXR':  {'releaseDate': 'Apr 28, 2026',  'callDate': 'Apr 29, 2026, 1:00p', 'status': 'CONF', 'notes': 'After close'},
    'REG':  {'releaseDate': 'Apr 28, 2026',  'callDate': 'Apr 28, 2026, TBD',   'status': 'CONF', 'notes': 'Before open'},
    'AMT':  {'releaseDate': 'Apr 28, 2026',  'callDate': 'Apr 28, 2026, TBD',   'status': 'CONF', 'notes': 'After close'},
    'OHI':  {'releaseDate': 'Apr 28, 2026',  'callDate': 'Apr 28, 2026, TBD',   'status': 'CONF', 'notes': 'After close'},
    'MAA':  {'releaseDate': 'Apr 29, 2026',  'callDate': 'Apr 30, 2026, 9:00a CT','status': 'CONF', 'notes': 'After close'},
    'IRT':  {'releaseDate': 'Apr 29, 2026',  'callDate': 'Apr 30, 2026, 9:00a', 'status': 'CONF', 'notes': 'After close'},
    'UDR':  {'releaseDate': 'Apr 29, 2026',  'callDate': 'Apr 30, 2026, TBD',   'status': 'CONF', 'notes': 'After close'},
    'EQIX': {'releaseDate': 'Apr 29, 2026',  'callDate': 'Apr 29, 2026, 5:30p', 'status': 'CONF', 'notes': 'After close'},
    'INVH': {'releaseDate': 'Apr 29, 2026',  'callDate': 'Apr 30, 2026, 11:00a','status': 'CONF', 'notes': 'After close'},
    'VICI': {'releaseDate': 'Apr 29, 2026',  'callDate': 'Apr 30, 2026, TBD',   'status': 'CONF', 'notes': 'After close'},
    'SBAC': {'releaseDate': 'Apr 29, 2026',  'callDate': 'Apr 29, 2026, TBD',   'status': 'CONF', 'notes': 'After close'},
    'CUZ':  {'releaseDate': 'Apr 29, 2026',  'callDate': 'Apr 30, 2026, 10:00a','status': 'CONF', 'notes': 'After close'},
    'ESS':  {'releaseDate': 'Apr 28, 2026',  'callDate': 'Apr 29, 2026, TBD',   'status': 'CONF', 'notes': 'After close'},
    'KIM':  {'releaseDate': 'Apr 30, 2026',  'callDate': 'Apr 30, 2026, 8:30a', 'status': 'CONF', 'notes': 'Before open'},
    'NNN':  {'releaseDate': 'Apr 30, 2026',  'callDate': 'Apr 30, 2026, 10:30a','status': 'CONF', 'notes': 'Before open'},
    'CPT':  {'releaseDate': 'Apr 30, 2026',  'callDate': 'May 1, 2026, 10:00a CT','status': 'CONF', 'notes': 'After close'},
    'DRH':  {'releaseDate': 'Apr 30, 2026',  'callDate': 'May 1, 2026, 9:00a',  'status': 'CONF', 'notes': 'After close'},
    'APLE': {'releaseDate': 'May 4, 2026',   'callDate': 'May 5, 2026, 10:00a', 'status': 'CONF', 'notes': 'After close'},
    'VNO':  {'releaseDate': 'May 4, 2026',   'callDate': 'May 5, 2026, 10:00a', 'status': 'CONF', 'notes': 'After close'},
    'SPG':  {'releaseDate': 'May 11, 2026',  'callDate': 'May 11, 2026, 5:00p', 'status': 'CONF', 'notes': 'After close'},
}

changed = []
index = {r['ticker']: i for i, r in enumerate(data)}

for ticker, fields in updates.items():
    if ticker not in index:
        print(f'  WARNING: {ticker} not found in data')
        continue
    i = index[ticker]
    before = {k: data[i].get(k) for k in fields}
    data[i].update(fields)
    diffs = {k: (before[k], fields[k]) for k in fields if before[k] != fields[k]}
    if diffs:
        changed.append((ticker, diffs))

with open(path, 'w') as f:
    json.dump(data, f, indent=2)

print(f'Updated {len(changed)} tickers:')
for ticker, diffs in changed:
    for k, (old, new) in diffs.items():
        print(f'  {ticker}.{k}: {old!r} → {new!r}')
