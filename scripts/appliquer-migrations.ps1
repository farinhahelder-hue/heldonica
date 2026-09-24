# Applique les migrations en attente, en ecartant celles qui ecrivent du vecu
# fabrique.
#
# Deux migrations inserent en base des affirmations qu'aucune photo n'atteste
# — « on a arpente ce troncon en toute saison, au fil de nos marches en 2025 et
# 2026 », des odeurs, des horaires d'ouverture. La regle n°1 d'Heldonica les
# exclut : elles sont mises de cote le temps du push, puis remises dans le
# depot sans avoir ete appliquees, pour que la decision reste ouverte.
#
# Usage :  powershell -ExecutionPolicy Bypass -File scripts\appliquer-migrations.ps1

$ErrorActionPreference = 'Stop'

$racine = Split-Path -Parent $PSScriptRoot
Set-Location $racine

$aEcarter = @(
  '20260901174500_update_paris_14_blog_post.sql',
  '20260901175500_align_all_drafts_brand_voice.sql'
)

$abri = Join-Path $env:TEMP 'heldonica-migrations-ecartees'
New-Item -ItemType Directory -Force -Path $abri | Out-Null

Write-Host ''
Write-Host '== Migrations ecartees (vecu fabrique) ==' -ForegroundColor Yellow
$deplacees = @()
foreach ($nom in $aEcarter) {
  $chemin = Join-Path 'supabase\migrations' $nom
  if (Test-Path $chemin) {
    Move-Item $chemin $abri -Force
    $deplacees += $nom
    Write-Host "   $nom"
  }
}
if ($deplacees.Count -eq 0) { Write-Host '   (aucune - deja ecartees ou appliquees)' }

Write-Host ''
Write-Host '== Application des migrations saines ==' -ForegroundColor Cyan

# On remet les fichiers en place quoi qu'il arrive : une interruption ou un
# echec du push ne doit pas laisser le depot ampute.
try {
  npx supabase db push --include-all
  $codeSortie = $LASTEXITCODE
} finally {
  Write-Host ''
  Write-Host '== Remise en place (non appliquees) ==' -ForegroundColor Yellow
  foreach ($nom in $deplacees) {
    Move-Item (Join-Path $abri $nom) 'supabase\migrations' -Force
    Write-Host "   $nom"
  }
}

if ($codeSortie -ne 0) {
  Write-Host ''
  Write-Host 'Le push a echoue. Rien n a ete perdu, les fichiers sont revenus.' -ForegroundColor Red
  exit $codeSortie
}

Write-Host ''
Write-Host 'Termine. Verification des colonnes :' -ForegroundColor Green
npm run check:cms-drift
