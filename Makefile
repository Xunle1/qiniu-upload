dev:
	wails dev

build:
	wails build -clean

build-darwin-arm64:
	wails build -clean
	cp config.yaml build/bin/qiniu-upload.app/Contents/Resources/

build-windows-amd64:
	wails build -clean -platform 'windows/amd64'

build-windows-arm64:
	wails build -clean -platform 'windows/arm64'

define check
	command -v $(1) 1>/dev/null || $(2)
endef

pkg-darwin-arm64: build-darwin-arm64
	@@$(call check,create-dmg,brew install create-dmg)
	create-dmg \
         --volname "qiniu-upload" \
         --background "build/bg.svg" \
         --window-pos 400 200 \
         --window-size 660 400 \
         --icon-size 100 \
         --icon "qiniu-upload.app" 160 185 \
         --hide-extension "qiniu-upload.app" \
         --app-drop-link 500 185 \
         "build/bin/qiniu-upload.dmg" \
         "build/bin/qiniu-upload.app"

pkg-windows-amd64:
	cp config.yaml build/windows/installer
	wails build -clean -platform 'windows/amd64' -nsis

pkg-windows-arm64:
	cp config.yaml build/windows/installer
	wails build -clean -platform 'windows/arm64' -nsis

.PHONY:dev build-darwin-arm64 build-windows-amd64 build-windows-arm64 pkg-darwin-arm64 pkg-windows-amd64 pkg-windows-arm64
