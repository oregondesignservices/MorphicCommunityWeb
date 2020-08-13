FROM node:14.8-alpine

ARG BUNDLE_VERSION
ENV MORPHIC_SERVER_URL ""
ENV STRIPE_PUBLIC_KEY ""

EXPOSE 80

RUN mkdir -p /run/nginx

RUN apk add --no-cache nginx

WORKDIR /MorphicCommunityWeb

COPY . /MorphicCommunityWeb
RUN echo -n "${BUNDLE_VERSION}" > bundle-version.txt
RUN npm install --production=false

ENTRYPOINT ["sh", "entrypoint.sh"]