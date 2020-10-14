#!/bin/sh

ME=$(basename $0)
DEFAULT_CONF_FILE="etc/nginx/conf.d/default.conf"

if [ ! -f "/$DEFAULT_CONF_FILE" ]; then
    echo >&3 "$ME: error: /$DEFAULT_CONF_FILE is not a file or does not exist"
    exit 0
fi

# check if the file can be modified, e.g. not on a r/o filesystem
touch /$DEFAULT_CONF_FILE 2>/dev/null || { echo >&3 "$ME: error: can not modify /$DEFAULT_CONF_FILE (read-only file system?)"; exit 0; }

# check if the file is already modified, e.g. on a container restart
grep -q 'try_files $uri $uri/ /index.html =404;' /$DEFAULT_CONF_FILE && { echo >&3 "$ME: error: try_files already added"; exit 0; }

# add try_files
sed -i -E 's,index  index.html index.htm;,index  index.html index.htm;\n        try_files $uri $uri/ /index.html =404;,' /$DEFAULT_CONF_FILE

echo >&3 "$ME: Added try_files in /$DEFAULT_CONF_FILE"

exit 0

