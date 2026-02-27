#!/bin/bash
echo "Rebuildando containers e subindo..."
echo docker compose up --build -d

docker compose up --build -d
