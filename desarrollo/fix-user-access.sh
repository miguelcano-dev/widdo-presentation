#!/bin/bash

# Script para diagnosticar y arreglar problemas de acceso de usuarios
# Uso: ./fix-user-access.sh javi@mail.com

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar un email"
    echo "Uso: ./fix-user-access.sh email@example.com"
    exit 1
fi

EMAIL="$1"

echo "═══════════════════════════════════════════"
echo "  FIX USER ACCESS: $EMAIL"
echo "═══════════════════════════════════════════"
echo ""

cd saas_sport

# Ejecutar el comando de diagnóstico
./vendor/bin/sail artisan user:diagnose "$EMAIL"
