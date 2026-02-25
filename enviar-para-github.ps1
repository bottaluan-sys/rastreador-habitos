# Script para enviar o projeto ao GitHub e gerar o APK
# Execute: .\enviar-para-github.ps1

Write-Host "=== Enviar para GitHub e gerar APK ===" -ForegroundColor Cyan
Write-Host ""

# 1. Inicializar git (se ainda nao)
if (-not (Test-Path ".git")) {
    git init
    git branch -M main
    Write-Host "Git inicializado." -ForegroundColor Green
}

# 2. Adicionar e commitar
git add .
git status
$commit = Read-Host "Deseja fazer commit? (s/n)"
if ($commit -eq "s") {
    git commit -m "Enviar para gerar APK"
}

# 3. Instrucoes para push
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "1. Crie um repositorio em: https://github.com/new"
Write-Host "2. Execute os comandos (substitua SEU_USUARIO/rastreador-habitos):"
Write-Host ""
Write-Host "   git remote add origin https://github.com/SEU_USUARIO/rastreador-habitos.git"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "3. No GitHub: Actions > Gerar APK Android > Run workflow"
Write-Host "4. Baixe o APK em: Actions > ultima execucao > Artifacts"
Write-Host ""
