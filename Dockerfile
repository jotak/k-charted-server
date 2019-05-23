FROM centos:centos7

LABEL maintainer="jtakvori@redhat.com"

ENV APP_HOME=/opt/app \
    PATH=$APP_HOME:$PATH

WORKDIR $APP_HOME

COPY k-charted-server $APP_HOME/
ADD web/react/build $APP_HOME/web/react/build

RUN chgrp -R 0 $APP_HOME/web/react/build && \
    chmod -R g=u $APP_HOME/web/react/build

ENTRYPOINT ["/opt/app/k-charted-server"]
