.PHONY: help install dev build preview

help:
	@echo "================================================================="
	@echo "                   BACKOFFICE FRONTEND MAKEFILE                  "
	@echo "================================================================="
	@echo "  make install - Install npm dependencies"
	@echo "  make dev     - Start Vite development server (port 5174)"
	@echo "  make build   - Build optimized production bundle"
	@echo "  make preview - Preview production build locally"
	@echo "================================================================="

install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview
