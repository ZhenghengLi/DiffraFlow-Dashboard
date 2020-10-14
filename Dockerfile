# Dockerfile for Diffraflow-Dashboard project
# maintainer: Zhengheng Li <zhenghenge@gmail.com>

# build ############################################################
FROM zhenghengli/angular:10.1.5 AS builder

ARG SOURCE_DIR=/opt/angular-devel

ADD $PWD $SOURCE_DIR

RUN set -x \
    && cd $SOURCE_DIR \
    && npm install \
    && npx ng build --prod

# deploy ############################################################
FROM nginx:stable-alpine

ARG DIST_DIR=/opt/angular-devel/dist/diffraflow-dashboard
ARG ROOT_DIR=/usr/share/nginx/html

# copy from builder
COPY --from=builder $DIST_DIR $ROOT_DIR

# add labels
ARG SOURCE_COMMIT
ARG COMMIT_MSG
ARG BUILD_TIME
LABEL description="Dashboard for DiffraFlow project" \
    maintainer="Zhengheng Li <zhenghenge@gmail.com>" \
    source_commit="$SOURCE_COMMIT" \
    commit_msg="$COMMIT_MSG" \
    build_time="$BUILD_TIME"

# set runtime environment variables
ENV AGGREGATOR_ADDRESS=10.15.86.19:27711 \
    CONTROLLER_ADDRESS=10.15.86.19:27511

COPY scripts/30-serve-index-when-not-found.sh /docker-entrypoint.d
COPY scripts/entrypoint.sh /scripts/

ENTRYPOINT [ "/scripts/entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]
