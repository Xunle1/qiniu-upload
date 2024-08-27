create-dmg \
  --volname "Application Installer" \
  --background "../build/bg.svg" \
  --window-pos 400 200 \
  --window-size 660 400 \
  --icon-size 100 \
  --icon "qiniu-upload.app" 160 185 \
  --hide-extension "qiniu-upload.app" \
  --app-drop-link 500 185 \
  "../build/bin/qiniu-upload.dmg" \
  "../build/bin/qiniu-upload.app"
