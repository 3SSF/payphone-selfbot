#!/bin/sh

echo 'Enter UserID of selfbot:'
read sui
echo 'Enter ChannelID that will be used:'
read ci
echo 'Enter ignored users UserIDs (comma-separated):'
read iUI
echo 'Enter selfbot token:'
read token

formatted_iUI=$(echo "$iUI" | sed 's/, */", "/g')

echo "{
    \"sUI\": \"$sui\",
    \"cI\": \"$ci\",
    \"iUI\": [\"$formatted_iUI\"]
}" > c.json

echo "
token=\"$token\"
" > .env

