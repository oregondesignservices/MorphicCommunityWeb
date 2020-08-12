FROM node:14.8-alpine

ENV MORPHIC_SERVER_URL ""
ENV STRIPE_PUBLIC_KEY ""
ENV BUNDLE_VERSION ""

EXPOSE 80

RUN mkdir -p /run/nginx

RUN apk add --no-cache nginx

WORKDIR /MorphicCommunityWeb

COPY . /MorphicCommunityWeb
RUN npm install

ENTRYPOINT ["sh", "entrypoint.sh"]