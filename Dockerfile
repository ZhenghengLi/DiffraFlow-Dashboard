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
