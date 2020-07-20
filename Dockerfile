FROM ubuntu:bionic

RUN apt-get update && apt-get install -y git gcc wget libkrb5-dev xz-utils && apt-get clean \
    && wget -qO- https://golang.org/dl/go1.14.5.linux-amd64.tar.gz | tar xvz -C /usr/local \
    && wget -qO-  https://nodejs.org/dist/v14.5.0/node-v14.5.0-linux-x64.tar.xz | tar xvJ -C /usr/local \
    && /usr/local/go/bin/go get github.com/GeertJohan/go.rice/rice

ENV PATH="/usr/local/go/bin:/usr/local/node-v14.5.0-linux-x64/bin/:/root/go/bin:${PATH}"
