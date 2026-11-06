# scripts/db.ps1
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Requested
)

if (-not $Requested -or $Requested.Count -eq 0) {
    $Requested = @('skeleton')
}

pnpm exec tsx scripts/generate-context.ts @Requested