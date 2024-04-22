#!/bin/sh -e

docker run --rm -it -v "${PWD}:/app" -w "/app" --entrypoint "/bin/bash" node:20
