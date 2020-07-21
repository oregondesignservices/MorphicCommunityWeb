FROM ubuntu:18.04

RUN apt-get update && apt-get install -y nginx

COPY MorphicCommunityWeb /MorphicCommunityWeb

# forward request and error logs to docker log collector
RUN mkdir -p /MorphicCommunityWeb/logs && ln -sf /dev/stdout /MorphicCommunityWeb/logs/access.log && ln -sf /dev/stderr /MorphicCommunityWeb/logs/error.log

EXPOSE {{HTTP_PORT}}

CMD ["nginx", "-p", "/MorphicCommunityWeb", "-c", "conf/nginx.conf", "-g", "daemon off;"]