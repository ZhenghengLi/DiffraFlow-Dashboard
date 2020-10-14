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

# copy from builder
COPY --from=builder /opt/angular-devel/dist/diffraflow-dashboard /usr/share/nginx/html

# add labels
ARG SOURCE_COMMIT
ARG COMMIT_MSG
ARG BUILD_TIME
LABEL description="Dashboard for DiffraFlow project" \
    maintainer="Zhengheng Li <zhenghenge@gmail.com>" \
    source_commit="$SOURCE_COMMIT" \
    commit_msg="$COMMIT_MSG" \
    build_time="$BUILD_TIME"
