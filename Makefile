APP_NAME    := upsun-manager
IMAGE       := $(APP_NAME)-builder
PORT        := 3002

# ── Web ───────────────────────────────────────

.PHONY: dev build preview

dev:
	npx nuxt dev

build:
	npx nuxt build

preview: build
	@-lsof -ti:$(PORT) | xargs kill -9 2>/dev/null; true
	npx nuxt preview --port $(PORT)

# ── Electron (local) ─────────────────────────

.PHONY: electron-build electron-dev electron-pack

electron-build:
	ELECTRON=true npx nuxt build
	npx tsc -p electron/tsconfig.json

electron-dev: electron-build
	npx electron . --no-sandbox

electron-pack: electron-build
	npx electron-builder --dir

# ── Web (Docker) ─────────────────────────────

.PHONY: docker-web docker-preview

docker-web:
	docker build -f Dockerfile.build --target web -t $(IMAGE):web .

docker-preview: docker-web
	@-docker rm -f $(APP_NAME) 2>/dev/null; true
	docker run --rm --name $(APP_NAME) -p $(PORT):3000 -e NUXT_UPSUN_API_TOKEN=$(NUXT_UPSUN_API_TOKEN) $(IMAGE):web

# ── Electron (Docker) ────────────────────────

.PHONY: dist-linux dist-windows dist-all docker-build clean

docker-build:
	docker build -f Dockerfile.build --target compile -t $(IMAGE) .

dist-linux: docker-build
	docker build -f Dockerfile.build --target dist-linux -t $(IMAGE):linux .
	@mkdir -p release
	docker run --rm -v $(CURDIR)/release:/out $(IMAGE):linux sh -c 'cp -r /app/release/* /out/ 2>/dev/null || true'
	@echo "✓ Artefacts Linux dans release/"

dist-windows: docker-build
	docker build -f Dockerfile.build --target dist-windows -t $(IMAGE):windows .
	@mkdir -p release
	docker run --rm -v $(CURDIR)/release:/out $(IMAGE):windows sh -c 'cp -r /app/release/* /out/ 2>/dev/null || true'
	@echo "✓ Artefacts Windows dans release/"

dist-all: dist-linux dist-windows

# ── Nettoyage ─────────────────────────────────

clean:
	rm -rf .output .nuxt .nitro dist-electron release
	@echo "✓ Nettoyé"
