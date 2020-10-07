FROM nginx:stable-alpine
ARG SOURCE_DIR=/opt/diffraflow-dashboard_src
RUN set -x \
    && date
