#!/bin/bash
# Widdo — Centro de Documentos
# Levanta el servidor y abre el browser automaticamente
# Uso: ./start-docs.sh

cd "$(dirname "$0")"

PORT=3456
URL="http://localhost:$PORT"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║     WIDDO DOCUMENT CENTER                    ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Verificar si el puerto ya esta en uso
if lsof -i :$PORT > /dev/null 2>&1; then
    echo "  El servidor ya esta corriendo en $URL"
    echo "  Abriendo browser..."
    echo ""
    open "$URL"
    exit 0
fi

# Abrir browser despues de 1 segundo
(sleep 1 && open "$URL") &

# Iniciar servidor (esto bloquea hasta Ctrl+C)
node server.js
