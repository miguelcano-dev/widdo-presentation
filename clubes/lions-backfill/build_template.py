# -*- coding: utf-8 -*-
# Construye plantilla plana de uniformes/camisetas desde hoja 2 del Excel Lions.
import zipfile, re, csv
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
        if t == 'e':
            val = '#REF!'
        if val is not None and str(val).strip() != '':
            cells[col_to_idx(c.get('r'))] = str(val).strip()
    if cells:
        rows[int(row.get('r'))] = cells

def num(v):
    try:
        n = float(v)
        return int(n)
    except (TypeError, ValueError):
        return None

out = []

def add(comprador, concepto, descripcion, valor, abonado, saldo, estado, origen, pendiente):
    out.append({
        'comprador (como aparece)': comprador,
        'jugador Widdo (completar si difiere)': '',
        'concepto Widdo': concepto,
        'descripcion (talla/numero/espalda)': descripcion,
        'valor_total': valor if valor is not None else '',
        'abonado': abonado if abonado is not None else '',
        'saldo': saldo if saldo is not None else '',
        'estado_original': estado,
        'fecha_pago (COMPLETAR)': '',
        'medio_pago (COMPLETAR)': '',
        'origen_excel': origen,
        'PENDIENTE': pendiente,
    })

# A: abonos uniforme entrenamiento (col1 cat, col2 nombre, col3 abono, col5 talla)
for r in sorted(rows):
    if not (6 <= r <= 56):
        continue
    c = rows[r]
    name = c.get(2)
    ab = num(c.get(3))
    if not name or ab is None:
        continue
    pend = []
    if name == '#REF!':
        pend.append('NOMBRE PERDIDO (formula rota): completar')
    talla = c.get(5, '')
    add(name, 'Uniforme Entrenamiento ($95.000)', f'talla {talla}'.strip(), 95000, ab,
        95000 - ab if ab < 95000 else 0,
        'abono' if ab < 95000 else 'pago',
        f'HojaUniformes bloque-abonos fila {r}', '; '.join(pend))

# C: personalizados 1 (cols 16..22)
BLOQUES = [
    ('personalizados-1 (num 49-76)', 16, 22),
    ('personalizados-2', 25, 31),
    ('personalizados-3', 34, 40),
    ('personalizados-4', 43, 49),
    ('camiseta-escuela-sin-logo', 52, 58),
]
for titulo, c0, c1 in BLOQUES:
    for r in sorted(rows):
        if not (4 <= r <= 32):
            continue
        c = rows[r]
        jugador = c.get(c1 - 0)  # ultima col = Jugador
        valor = num(c.get(c1 - 1))
        estado = (c.get(c1 - 2) or '').lower()
        espalda = c.get(c1 - 3, '')
        genero = c.get(c1 - 4, '')
        talla = c.get(c1 - 5, '')
        numero = c.get(c0, '')
        if valor is None and not jugador:
            continue
        if not (jugador or valor):
            continue
        pend = []
        if not estado:
            pend.append('estado vacio: ¿pago o debe?')
        if estado == 'abono':
            pend.append('es abono: confirmar cuanto abono y saldo')
        if estado == 'debe':
            abonado, saldo = 0, valor
        elif estado == 'abono':
            abonado, saldo = '', ''
        else:
            abonado, saldo = valor, 0
        add(jugador or 'SIN NOMBRE', 'Uniforme personalizado / camiseta (confirmar concepto)',
            f'#{numero} talla {talla} {genero} espalda "{espalda}"',
            valor, abonado, saldo, estado or 'sin estado',
            f'HojaUniformes {titulo} fila {r}', '; '.join(pend))

# H: camisetas presentacion (cols 60..65) compradores familia/coach
for r in sorted(rows):
    if not (4 <= r <= 30):
        continue
    c = rows[r]
    espalda = c.get(63)
    estado = (c.get(64) or '').lower()
    valor = num(c.get(65))
    numero = c.get(60, '')
    talla = c.get(61, '')
    genero = c.get(62, '')
    if not espalda:
        continue
    pend = []
    lower = espalda.lower()
    if 'coach' in lower or valor == 0:
        pend.append('valor 0 / coach: ¿cortesia? no cargar como pago')
    if 'mama' in lower or 'papa' in lower or 'fan' in lower:
        pend.append('comprador es familiar: asignar al jugador correspondiente')
    if estado == 'debe':
        abonado, saldo = 0, valor
    elif not estado:
        abonado, saldo = '', ''
        pend.append('sin estado')
    else:
        abonado, saldo = valor, 0
    add(espalda, 'Camiseta Presentación ($75.000)',
        f'#{numero} talla {talla} {genero}', valor, abonado, saldo,
        estado or 'sin estado', f'HojaUniformes camisetas-presentacion fila {r}', '; '.join(pend))

# I: mayores con logo (cols 68..77)
for r in sorted(rows):
    if not (4 <= r <= 21):
        continue
    c = rows[r]
    numero = c.get(68)
    obs = c.get(69, '')
    espalda = c.get(72, '')
    estado = (c.get(74) or '').lower()
    valor_raw = c.get(75, '')
    valor = num(valor_raw)
    if not numero or numero.startswith('TOTAL'):
        continue
    pend = ['EQUIPO MAYORES: jugadores probablemente NO estan en Widdo']
    if valor is None:
        pend.append(f'valor no numerico: {valor_raw}')
    add(espalda or f'uniforme #{numero}', 'Uniforme+Camiseta Mayores (confirmar concepto)',
        f'#{numero} {obs}'.strip(), valor, valor if estado == 'ok' else '',
        0 if estado == 'ok' else '', estado or 'sin estado',
        f'HojaUniformes mayores fila {r}', '; '.join(pend))

# I-fem (rows 30-32 cols 68..77)
for r in (30, 31, 32):
    c = rows.get(r, {})
    numero = c.get(68)
    espalda = c.get(72, '')
    estado = (c.get(74) or '').lower()
    valor = num(c.get(75))
    abono = num(c.get(76))
    if not numero:
        continue
    pend = ['bloque femenino mayores: confirmar jugador']
    add(espalda, 'Camiseta Presentación Femenino', f'#{numero}', valor,
        abono if estado == 'debe' else valor,
        (valor - abono) if (estado == 'debe' and valor and abono) else 0,
        estado, f'HojaUniformes mayores-fem fila {r}', '; '.join(pend))

dest = '/private/tmp/claude-501/-Users-miguelcano-Desktop-todo-Widdo-desarrollo/8de3c061-1ccb-4db5-8b69-be83512a40d2/scratchpad/lions_uniformes_plantilla.csv'
with open(dest, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.DictWriter(f, fieldnames=list(out[0].keys()))
    w.writeheader()
    w.writerows(out)

print('filas plantilla:', len(out))
pend = [o for o in out if o['PENDIENTE']]
print('filas con pendiente:', len(pend))
tot = sum(o['abonado'] for o in out if isinstance(o['abonado'], int))
print('abonado identificado COP:', f'{tot:,}')
deuda = sum(o['saldo'] for o in out if isinstance(o['saldo'], int))
print('saldo pendiente identificado COP:', f'{deuda:,}')
