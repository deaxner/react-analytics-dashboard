$preferredPort = 3000
$maxPort = 3100
$selectedPort = $preferredPort

while ($selectedPort -le $maxPort) {
    $inUse = Get-NetTCPConnection -LocalPort $selectedPort -ErrorAction SilentlyContinue
    if (-not $inUse) {
        break
    }

    $selectedPort++
}

if ($selectedPort -gt $maxPort) {
    throw "No free port found between $preferredPort and $maxPort."
}

$network = docker network ls --format "{{.Name}}" | Where-Object { $_ -eq "task_api_network" }
if (-not $network) {
    throw "Docker network 'task_api_network' not found. Start symfony-task-api-service first."
}

$env:DASHBOARD_PORT = [string]$selectedPort

Write-Host "Using dashboard host port $selectedPort"
docker compose up --build -d

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "Dashboard available at http://localhost:$selectedPort"
