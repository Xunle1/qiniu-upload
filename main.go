package main

import (
	"embed"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:       "qiniu-upload",
		Width:       1024,
		Height:      768,
		AssetServer: &assetserver.Options{Assets: assets},
		OnStartup:   app.OnStartup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
