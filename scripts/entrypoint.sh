#!/bin/sh

cat <<EOF > /usr/share/nginx/html/assets/config.json
{
    "aggregator_address": "$AGGREGATOR_ADDRESS",
    "controller_address": "$CONTROLLER_ADDRESS"
}
EOF

/docker-entrypoint.sh "$@"
