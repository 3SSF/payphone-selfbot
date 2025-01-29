$ErrorActionPreference = "Stop"

$sui = Read-Host "Enter UserID of selfbot"
$ci = Read-Host "Enter ChannelID that will be used"
$iUI = Read-Host "Enter ignored users UserIDs (comma-separated)"
$token = Read-Host "Enter selfbot token"

$formatted_iUI = ($iUI -split ', *') -join '", "'

@"
{
    "sUI": "$sui",
    "cI": "$ci",
    "iUI": ["$formatted_iUI"]
}
"@ | Set-Content -Encoding UTF8 c.json

@"
token="$token"
"@ | Set-Content -Encoding UTF8 .env

