FROM alpine:3.9

LABEL maintainer="jtakvori@redhat.com"

EXPOSE 8000
ENV APP_HOME=/opt/
WORKDIR $APP_HOME

COPY k-charted-server $APP_HOME/
ADD web/react/build $APP_HOME/web/react/build

# RUN chgrp -R 0 $APP_HOME/web && \
#    chmod -R g=u $APP_HOME/web

ENTRYPOINT [$APP_HOME/k-charted-server]
