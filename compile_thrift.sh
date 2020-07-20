#!/bin/bash

docker run -v "$PWD/thrift:/data" thrift thrift -o /data --gen go /data/hive_metastore.thrift
