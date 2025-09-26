#!/bin/bash
set -e

clear

PROJECT_ROOT="/home/ubuntu_user/K8S/"
DOCKERFILE="$PROJECT_ROOT/moviebrain/mb-movie-db/containers/webserver/Dockerfile"
BUILD_CONTEXT="$PROJECT_ROOT"

docker build -f "$DOCKERFILE" -t docker_private_registry_url/mb-movie-db-k8s  "$BUILD_CONTEXT"  --no-cache

docker push docker_private_registry_url/mb-movie-db-k8s
