$ErrorActionPreference = "Stop"

$ci = Read-Host "Enter ChannelID that will be used"
$iUI = Read-Host "Enter ignored users UserIDs (comma-separated)"
$token = Read-Host "Enter selfbot token"
$botName = Read-Host "Enter your userphone/payphone bot name (case sentitive)"
$call = Read-Host "Enter your call command, e.g p.c"
$hangup = Read-Host "Enter your hangup command, e.g p.h"
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
iUI="[$formatted_iUI]"
bot="$botName"
call="$call"
hangup="$hangup"
"@ | Set-Content -Encoding UTF8 .env

