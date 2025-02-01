#!/bin/sh

echo 'Enter ChannelID that will be used:'
read ci
echo 'Enter ignored users UserIDs (comma-separated):'
read iUI
echo 'Enter selfbot token:'
read token
echo 'Enter call msg:'
read call
echo 'Enter hangup msg:'
read hangup
echo 'Enter auto skip delay (number):'
read delay

formatted_iUI=$(echo "$iUI" | sed 's/, */", "/g')

echo "{
    \"cI\": \"$ci\",
    \"iUI\": [\"$formatted_iUI\"],
    \"callMsg\": \"$call\",
    \"hangupMsg\": \"$hangup\",
    \"autoSkipDelay\": $delay
}" > c.json

echo "
token=\"$token\"
" > .env

echo "Config saved to c.json and .env"

