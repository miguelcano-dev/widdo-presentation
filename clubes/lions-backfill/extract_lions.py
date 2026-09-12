import zipfile, re, csv, datetime
from xml.etree import ElementTree as ET

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
M = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
path = '/Users/miguelcano/Downloads/realacion de pagos lions.xlsx'
z = zipfile.ZipFile(path)

shared = []
root = ET.fromstring(z.read('xl/sharedStrings.xml'))
for si in root.findall('m:si', NS):
    shared.append(''.join(t.text or '' for t in si.iter(M + 't')))

def col_to_idx(ref):
    m = re.match(r'([A-Z]+)', ref)
    col = 0
    for ch in m.group(1):
        col = col * 26 + (ord(ch) - 64)
    return col - 1

root = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
rows = {}
for row in root.iter(M + 'row'):
    cells = {}
    for c in row.findall('m:c', NS):
        t = c.get('t')
        v = c.find('m:v', NS)
        val = v.text if v is not None else None
        if t == 's' and val is not None:
            val = shared[int(val)]
        if val is not None and str(val).strip() != '':
            cells[col_to_idx(c.get('r'))] = str(val).strip()
    if cells:
        rows[int(row.get('r'))] = cells

MONTHS = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']
EPOCH = datetime.date(1899, 12, 30)

def parse_serial(v):
    try:
        n = float(v)
        if 40000 < n < 50000:
            return EPOCH + datetime.timedelta(days=int(n))
    except ValueError:
        pass
    return None

def looks_amount(v):
    try:
        n = float(v)
        return 1000 <= n <= 500000 and not (45000 < n < 47000)
    except ValueError:
        return False

out = []
category = ''
rownums = sorted(rows)
for r in rownums:
    cells = rows[r]
    name = cells.get(2)
    if not name:
        continue
    category = cells.get(1, category)
    if name in ('DEPORTISTA',):
        continue
    daterow = rows.get(r + 1, {})
    note = daterow.get(19) or cells.get(19) or ''
    for mi, month in enumerate(MONTHS):
        col = 3 + mi
        amt_raw = cells.get(col)
        date_raw = daterow.get(col)
        if amt_raw is None and date_raw is None:
            continue
        flags = []
        amount = None
        pay_date = None
        # normal: amount in row r, serial date in row r+1
        if amt_raw is not None and looks_amount(amt_raw):
            amount = int(float(amt_raw))
        elif amt_raw is not None:
            d = parse_serial(amt_raw)
            if d:
                pay_date = d
                flags.append('SWAPPED(date-in-amount-row)')
            else:
                flags.append(f'TEXT-AMOUNT:{amt_raw}')
        if date_raw is not None:
            d = parse_serial(date_raw)
            if d:
                pay_date = d
            elif looks_amount(date_raw):
                if amount is None:
                    amount = int(float(date_raw))
                    flags.append('SWAPPED(amount-in-date-row)')
                else:
                    flags.append(f'EXTRA-AMOUNT-IN-DATE-ROW:{date_raw}')
            else:
                flags.append(f'TEXT-DATE:{date_raw}')
        if pay_date:
            expected_month = mi + 1
            if pay_date.year == 2025:
                pay_date = pay_date.replace(year=2026)
                flags.append('YEAR-TYPO-2025')
            if pay_date.month != expected_month:
                flags.append(f'DATE-MONTH-MISMATCH(paid {pay_date.month} vs col {expected_month})')
        if amount is None and pay_date is None and not flags:
            continue
        out.append({
            'row': r, 'category': category, 'player': name, 'month': month,
            'month_num': mi + 1, 'amount': amount if amount is not None else '',
            'paid_date': pay_date.isoformat() if pay_date else '',
            'flags': ';'.join(flags), 'note': note,
        })

csvpath = '/private/tmp/claude-501/-Users-miguelcano-Desktop-todo-Widdo-desarrollo/8de3c061-1ccb-4db5-8b69-be83512a40d2/scratchpad/lions_mensualidades.csv'
with open(csvpath, 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(out[0].keys()))
    w.writeheader()
    w.writerows(out)

players = sorted({o['player'] for o in out})
print(f'pagos extraidos: {len(out)}')
print(f'jugadores: {len(players)}')
for p in players:
    print(' -', p)
print()
clean = [o for o in out if not o['flags'] and o['amount'] and o['paid_date']]
flagged = [o for o in out if o['flags']]
noamt = [o for o in out if not o['amount']]
nodate = [o for o in out if o['amount'] and not o['paid_date']]
print(f'limpios (monto+fecha sin flags): {len(clean)}')
print(f'con flags: {len(flagged)}')
print(f'sin monto: {len(noamt)} | con monto sin fecha: {len(nodate)}')
total = sum(o['amount'] for o in out if o['amount'])
print(f'total COP: {total:,}')
print()
print('== FLAGGED ==')
for o in flagged:
    print(f"r{o['row']} {o['player'][:32]:32} {o['month']:10} amt={o['amount']} date={o['paid_date']} [{o['flags']}]")
