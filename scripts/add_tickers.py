import json, os

base = os.path.dirname(__file__)
path = os.path.join(base, '..', 'data', 'reits.json')

with open(path) as f:
    data = json.load(f)

# Fix wrong tickers
remap = {'PEAK': 'DOC', 'DEF': 'DHC', 'PKI': 'PKST'}
for r in data:
    if r['ticker'] in remap:
        r['ticker'] = remap[r['ticker']]

existing = {r['ticker'] for r in data}

new_entries = [
    # Residential
    {'ticker':'CSR',  'name':'Centerspace',                           'sector':'residential', 'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'NXRT', 'name':'NexPoint Residential Trust',            'sector':'residential', 'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'AIRC', 'name':'Apartment Income REIT Corp',            'sector':'residential', 'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'CLPR', 'name':'Clipper Realty',                        'sector':'residential', 'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'BRG',  'name':'Bluerock Residential Growth REIT',      'sector':'residential', 'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'APTS', 'name':'Preferred Apartment Communities',       'sector':'residential', 'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'BRT',  'name':'BRT Realty Trust',                      'sector':'residential', 'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'BHM',  'name':'Bluerock Homes Trust',                  'sector':'residential', 'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'RESI', 'name':'Altisource Residential Corp',           'sector':'residential', 'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'ACC',  'name':'American Campus Communities',           'sector':'residential', 'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    # Retail
    {'ticker':'RPT',  'name':'RPT Realty',                            'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'CURB', 'name':'Curbline Properties',                   'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'CDR',  'name':'Cedar Realty Trust',                    'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'BFS',  'name':'Saul Centers',                          'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'AKR',  'name':'Acadia Realty Trust',                   'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'UE',   'name':'Urban Edge Properties',                 'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'UBA',  'name':'Urstadt Biddle Properties',             'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'WHLR', 'name':'Wheeler REIT',                          'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'WSR',  'name':'Whitestone REIT',                       'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'IVT',  'name':'InvenTrust Properties',                 'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'PECO', 'name':'Phillips Edison & Company',             'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'ALEX', 'name':'Alexander & Baldwin',                   'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'CBL',  'name':'CBL & Associates Properties',           'sector':'retail',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    # Net Lease
    {'ticker':'SRC',  'name':'Spirit Realty Capital',                 'sector':'net-lease',   'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'STOR', 'name':'Store Capital',                         'sector':'net-lease',   'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'GNL',  'name':'Global Net Lease',                      'sector':'net-lease',   'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'RTL',  'name':'Necessity Retail REIT',                 'sector':'net-lease',   'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'PSTL', 'name':'Postal Realty Trust',                   'sector':'net-lease',   'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'MGP',  'name':'MGM Growth Properties',                 'sector':'casino',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'MDV',  'name':'Modiv Industrial',                      'sector':'net-lease',   'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'MRP',  'name':'MRP Industrial',                        'sector':'net-lease',   'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'GIPR', 'name':'Generation Income Properties',          'sector':'net-lease',   'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    # Healthcare
    {'ticker':'HTA',  'name':'Healthcare Trust of America',           'sector':'healthcare',  'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'CHCT', 'name':'Community Healthcare Trust',            'sector':'healthcare',  'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'SNDA', 'name':'Sonida Senior Living',                  'sector':'healthcare',  'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'SILA', 'name':'Sila Realty Trust',                     'sector':'healthcare',  'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'ENSG', 'name':'Ensign Group',                          'sector':'healthcare',  'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'BKD',  'name':'Brookdale Senior Living',               'sector':'healthcare',  'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'STRW', 'name':'Strawberry Fields REIT',                'sector':'healthcare',  'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    # Industrial / Self-Storage
    {'ticker':'MNR',  'name':'Monmouth Real Estate',                  'sector':'industrial',  'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'DRE',  'name':'Duke Realty',                           'sector':'industrial',  'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'PLYM', 'name':'Plymouth Industrial REIT',              'sector':'industrial',  'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'INDT', 'name':'Indus Realty Trust',                    'sector':'industrial',  'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'PSB',  'name':'PS Business Parks',                     'sector':'industrial',  'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'NXDT', 'name':'NexPoint Diversified Real Estate Trust','sector':'specialty',   'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'LINE', 'name':'Lineage, Inc.',                         'sector':'industrial',  'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'LSI',  'name':'Life Storage',                          'sector':'self-storage','releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'NSA',  'name':'National Storage Affiliates',           'sector':'self-storage','releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'SMA',  'name':'SMA (unverified)',                      'sector':'specialty',   'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'SELF', 'name':'Global Self Storage',                   'sector':'self-storage','releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'WSC',  'name':'WillScot Holdings',                     'sector':'specialty',   'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    # Office
    {'ticker':'AAT',  'name':'American Assets Trust',                 'sector':'office',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'BDN',  'name':'Brandywine Realty Trust',               'sector':'office',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'KW',   'name':'Kennedy-Wilson Holdings',               'sector':'office',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'CDP',  'name':'CDP (unverified)',                      'sector':'office',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'ESRT', 'name':'Empire State Realty Trust',             'sector':'office',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'SQFT', 'name':'Presidio Property Trust',               'sector':'office',      'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'MDRR', 'name':'Medalist Diversified REIT',             'sector':'office',      'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'CMCT', 'name':'Creative Media & Community Trust',      'sector':'office',      'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'HPP',  'name':'Hudson Pacific Properties',             'sector':'office',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'AHH',  'name':'Armada Hoffler Properties',             'sector':'office',      'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    # Hotel
    {'ticker':'HT',   'name':'Hersha Hospitality Trust',              'sector':'hotel',       'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'SVC',  'name':'Service Properties Trust',              'sector':'hotel',       'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'CPLG', 'name':'CPLG (unverified)',                     'sector':'hotel',       'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'CDOR', 'name':'Condor Hospitality Trust',              'sector':'hotel',       'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'BHR',  'name':'Braemar Hotels & Resorts',              'sector':'hotel',       'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    # Specialty / Others
    {'ticker':'CORR', 'name':'CorEnergy Infrastructure Trust',        'sector':'specialty',   'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'PW',   'name':'Power REIT',                            'sector':'specialty',   'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'NLCP', 'name':'NewLake Capital Partners',              'sector':'specialty',   'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    # Data Center / Tower
    {'ticker':'CONE', 'name':'CyrusOne',                              'sector':'data-center', 'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'DBRG', 'name':'DigitalBridge Group',                   'sector':'data-center', 'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'BIP',  'name':'Brookfield Infrastructure Partners',    'sector':'specialty',   'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    # Mortgage
    {'ticker':'LFT',  'name':'Lument Finance Trust',                  'sector':'mortgage',    'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'SACH', 'name':'Sachem Capital Corp',                   'sector':'mortgage',    'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'BRMK', 'name':'Broadmark Realty Capital',              'sector':'mortgage',    'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'ABR',  'name':'Arbor Realty Trust',                    'sector':'mortgage',    'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
    {'ticker':'REFI', 'name':'Chicago Atlantic Real Estate Finance',   'sector':'mortgage',    'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'AFCG', 'name':'AFC Gamma',                             'sector':'mortgage',    'releaseDate':'TBD','callDate':'TBD','exchange':'NASDAQ', 'status':'EST','notes':''},
    {'ticker':'FBRT', 'name':'Franklin BSP Realty Trust',             'sector':'mortgage',    'releaseDate':'TBD','callDate':'TBD','exchange':'NYSE',   'status':'EST','notes':''},
]

to_add = [e for e in new_entries if e['ticker'] not in existing]
final = data + to_add

with open(path, 'w') as f:
    json.dump(final, f, indent=2)

print(f"Fixed 3 tickers. Added {len(to_add)} new entries. Total: {len(final)}")
