#!/bin/sh

cat <<EOF > /usr/share/nginx/html/assets/config.json
{
    "aggregator_address": "$AGGREGATOR_ADDRESS",
    "controller_address": "$CONTROLLER_ADDRESS",
    "ingester_config": "$INGESTER_CONFIG",
    "monitor_config": "$MONITOR_CONFIG"
}
EOF

/docker-entrypoint.sh "$@"
