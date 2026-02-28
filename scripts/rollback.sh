#!/bin/bash

# Script de ROLLBACK (Restaurar Versão Anterior)
# Antigravity AI - 2026

echo "--------------------------------------------------"
echo "⏮️  JURIS CONCURSOS - ROLLBACK"
echo "--------------------------------------------------"

# Listar últimas 10 Tags
echo "Selecione uma versão anterior para restaurar:"
git tag --sort=-v:refname | head -n 10

echo "--------------------------------------------------"
read -p "Digite a versão completa para voltar (ex: v1.0.070): " VERSION

if [ -z "$VERSION" ]; then
    echo "❌ Erro: Versão não especificada."
    exit 1
fi

# Verificar se a tag existe
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo "⚠️  Você está prestes a voltar para a versão $VERSION."
    echo "🚨 Isso irá descartar mudanças não salvas."
    read -p "Deseja continuar? (s/n): " CONFIRM
    
    if [ "$CONFIRM" != "s" ]; then
        echo "❌ Cancelado."
        exit 0
    fi
    
    # Executar o checkout
    git checkout "$VERSION"
    
    echo "--------------------------------------------------"
    echo "🔥 SUCESSO! Código restaurado para a versão $VERSION."
    echo "Para voltar para a versão mais recente (main), use: git checkout main"
    echo "--------------------------------------------------"
else
    echo "❌ Erro: Versão '$VERSION' não encontrada no Git."
    exit 1
fi
