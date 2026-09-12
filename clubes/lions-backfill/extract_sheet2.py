import zipfile, re
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

root = ET.fromstring(z.read('xl/worksheets/sheet2.xml'))
rows = {}
for row in root.iter(M + 'row'):
    cells = {}
    for c in row.findall('m:c', NS):
        t = c.get('t')
        v = c.find('m:v', NS)
        val = v.text if v is not None else None
        if t == 's' and val is not None:
            val = shared[int(val)]
        if t == 'e':  # error cell like #REF!
            val = val or '#ERR'
        if val is not None and str(val).strip() != '':
            cells[col_to_idx(c.get('r'))] = str(val).strip()
    if cells:
        rows[int(row.get('r'))] = cells

def dump(title, rowrange, cols):
    print(f'\n### {title} (cols {cols})')
    for r in rowrange:
        if r not in rows:
            continue
        cells = rows[r]
        vals = [cells.get(c, '') for c in cols]
        if any(v for v in vals):
            print(r, '|', ' | '.join(vals))

# Bloque A: uniforme entrenamiento abonos (cols 1-5)
dump('A. UNIFORME ENTRENAMIENTO - abonos por deportista', range(3, 60), [1, 2, 3, 4, 5])
# Bloque B: inventario uniformes entrenamiento (cols 9-13)
dump('B. Inventario uniformes entrenamiento', range(3, 55), [9, 10, 11, 12, 13])
# Bloque C: U9 personalizados (cols 16-22)
dump('C. Personalizados bloque 1 (U9?)', range(3, 35), [16, 17, 18, 19, 20, 21, 22])
# Bloque D: U11 (cols 25-31)
dump('D. Personalizados bloque 2 (U11?)', range(3, 35), [25, 26, 27, 28, 29, 30, 31])
# Bloque E: juvenil masc (cols 34-40)
dump('E. Personalizados juvenil masc', range(3, 35), [34, 35, 36, 37, 38, 39, 40])
# Bloque F: juvenil fem (cols 43-49)
dump('F. Personalizados juvenil fem', range(3, 35), [43, 44, 45, 46, 47, 48, 49])
# Bloque G: camiseta escuela (cols 52-58)
dump('G. Camiseta escuela sin logos', range(3, 35), [52, 53, 54, 55, 56, 57, 58])
# Bloque H: camisetas numeradas (cols 59-66)
dump('H. Camisetas presentacion', range(3, 35), [59, 60, 61, 62, 63, 64, 65])
# Bloque I: mayores con logo (cols 67-78)
dump('I. Uniforme+camiseta Mayores con logo', range(3, 35), [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77])
# Totales zona derecha
dump('J. Totales / deuda', range(20, 55), [66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77])
