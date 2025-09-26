#!/bin/bash
set -e

clear

PROJECT_ROOT="/home/ubuntu_user/K8S/"
DOCKERFILE="$PROJECT_ROOT/moviebrain/mb-api-gateway/containers/webserver/Dockerfile"
BUILD_CONTEXT="$PROJECT_ROOT"

docker build -f "$DOCKERFILE" -t docker_private_registry_url/mb-api-gateway-k8s  "$BUILD_CONTEXT"  --no-cache

docker push docker_private_registry_url/mb-api-gateway-k8s
