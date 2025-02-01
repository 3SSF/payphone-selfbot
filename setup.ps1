$ErrorActionPreference = "Stop"

$ci = Read-Host "Enter ChannelID that will be used"
$iUI = Read-Host "Enter ignored users UserIDs (comma-separated)"
$token = Read-Host "Enter selfbot token"

$formatted_iUI = ($iUI -split ', *') -join '", "'

#@"
#{
 #   "cI": "$ci",
  #  "iUI": ["$formatted_iUI"]
#}
#"@ | Set-Content -Encoding UTF8 c.json
#deprecate c.json in windows, doesn't work. use env

@"
token="$token"
channelId="$ci"
iUI="$formatted_iUI"
"@ | Set-Content -Encoding UTF8 .env

