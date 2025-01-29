#!/bin/sh

echo 'Enter ChannelID that will be used:'
read ci
echo 'Enter ignored users UserIDs (comma-separated):'
read iUI
echo 'Enter selfbot token:'
read token

formatted_iUI=$(echo "$iUI" | sed 's/, */", "/g')

echo "{
    \"cI\": \"$ci\",
    \"iUI\": [\"$formatted_iUI\"]
}" > c.json

echo "
token=\"$token\"
" > .env

