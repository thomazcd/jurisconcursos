#!/bin/bash

# Script para automatizar o versionamento e criação de Tags (Pontos de Restauração)
# Antigravity AI - 2026

VERSION_FILE="src/lib/version.ts"

# Extrair versão atual
CURRENT_VERSION=$(grep -oE "[0-9]+\.[0-9]+\.[0-9]+" $VERSION_FILE)

echo "--------------------------------------------------"
echo "🚀 JURIS CONCURSOS - VERSIONADOR"
echo "Versão Atual: v$CURRENT_VERSION"
echo "--------------------------------------------------"

read -p "Digite a nova versão (ex: 1.0.072): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    echo "❌ Erro: Versão não pode ser vazia."
    exit 1
fi

# Atualizar o arquivo de versão
sed -i '' "s/$CURRENT_VERSION/$NEW_VERSION/g" $VERSION_FILE

echo "✅ Arquivo $VERSION_FILE atualizado para v$NEW_VERSION"

# Git operations
git add .
git commit -m "Bump version to v$NEW_VERSION"
git tag -a "v$NEW_VERSION" -m "Versão v$NEW_VERSION - Backup Automático"

echo "--------------------------------------------------"
echo "🎉 Versão v$NEW_VERSION criada e tagueada com sucesso!"
echo "Use 'npm run version:rollback' se precisar voltar."
echo "--------------------------------------------------"
