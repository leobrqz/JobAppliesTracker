#!/bin/bash
echo "Visualizando logs do backend e frontend..."
echo docker compose logs -f backend frontend

docker compose logs -f backend frontend
