# Job: napuni sve tablice za snapshot_id=1090
# Redoslijed: 1) sync_promjene (expected counts + promjene_stavke), 2) sync svake tablice (chunked za velike).
# Postavi $BaseUrl (npr. https://registar-poslovnih-subjekata.onrender.com) ili koristi env SUDREG_APP_URL.

param(
    [string]$BaseUrl = $env:SUDREG_APP_URL,
    [int]$MaxBatchesPerCall = 100,
    [int]$SnapshotId = 1090
)

if (-not $BaseUrl) {
    Write-Error "Postavi BaseUrl ili env SUDREG_APP_URL. Npr. .\sync-snapshot-1090.ps1 -BaseUrl https://your-app.onrender.com"
    exit 1
}

$BaseUrl = $BaseUrl.TrimEnd('/')

# Tablice koje syncamo (redoslijed: subjekti prvi, ostalo po volji; ako server ima više endpointa u SYNC_SNAPSHOT_CONFIG, dodaj ih ovdje)
$SnapshotEndpoints = @(
    'subjekti',
    'tvrtke',
    'sjedista',
    'gfi',
    'objave_priopcenja',
    'nazivi_podruznica',
    'skraceni_nazivi_podruznica',
    'sjedista_podruznica',
    'email_adrese_podruznica',
    'inozemni_registri',
    'counts',
    'bris_pravni_oblici',
    'bris_registri',
    'prijevodi_tvrtki',
    'prijevodi_skracenih_tvrtki',
    'predmeti_poslovanja'
)

function Invoke-Sync {
    param([string]$Uri, [string]$Label)
    try {
        $r = Invoke-WebRequest -Uri $Uri -Method POST -UseBasicParsing -TimeoutSec 600
        $json = $r.Content | ConvertFrom-Json
        return $json
    } catch {
        $statusCode = $_.Exception.Response?.StatusCode?.value__
        $body = $null
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $body = $reader.ReadToEnd()
        } catch {}
        Write-Warning "$Label -> HTTP $statusCode $body"
        return $null
    }
}

# --- 1. Sync promjena (expected counts + promjene_stavke) ---
Write-Host "1. POST sync_promjene snapshot_id=$SnapshotId ..."
$promjeneUri = "$BaseUrl/api/sudreg_sync_promjene?snapshot_id=$SnapshotId"
$promjeneResult = Invoke-Sync -Uri $promjeneUri -Label "sync_promjene"
if (-not $promjeneResult) {
    Write-Error "sync_promjene nije uspio. Zaustavljam."
    exit 2
}
Write-Host "   OK: synced=$($promjeneResult.synced) durationMs=$($promjeneResult.durationMs)"

# --- 2. Sync svake tablice (chunked ako treba) ---
foreach ($endpoint in $SnapshotEndpoints) {
    Write-Host ""
    Write-Host "2. Tablica: $endpoint"
    $startOffset = $null
    $totalSynced = 0
    $round = 0
    do {
        $round++
        $uri = "$BaseUrl/api/sudreg_sync_$endpoint`?snapshot_id=$SnapshotId&max_batches=$MaxBatchesPerCall"
        if ($null -ne $startOffset) {
            $uri += "&start_offset=$startOffset"
        }
        $result = Invoke-Sync -Uri $uri -Label "sync_$endpoint"
        if (-not $result) {
            Write-Warning "  Preskacem $endpoint zbog greške."
            break
        }
        $synced = if ($result.synced) { [int]$result.synced } else { 0 }
        $totalSynced += $synced
        $hasMore = $result.has_more -eq $true
        $nextOffset = $result.next_start_offset
        Write-Host "   Krug $round : synced=$synced total=$totalSynced has_more=$hasMore"
        if ($hasMore -and $null -ne $nextOffset) {
            $startOffset = $nextOffset
        } else {
            $startOffset = $null
        }
    } while ($null -ne $startOffset -and $startOffset -ge 0)
    Write-Host "   Završeno $endpoint : ukupno $totalSynced redaka"
}

Write-Host ""
Write-Host "Gotovo. Provjera: GET $BaseUrl/api/sudreg_sync_greske?snapshot_id=$SnapshotId"
