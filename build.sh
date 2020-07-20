#!/bin/bash

cat <<EOF | docker run --rm -i -v $(pwd):/hive-metastore-api -w /hive-metastore-api go:latest
  rice embed-go
  go build -o hive-metastore-api -tags kerberos cmd/main.go
EOF
