package main

import (
	"context"
	"errors"
	"fmt"
	"github.com/qiniu/go-sdk/v7/auth"
	"github.com/qiniu/go-sdk/v7/storage"
	"io"
	"mime/multipart"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

// Upload Greet returns a greeting for the given name
func (a *App) Upload(path string, files []*multipart.FileHeader) (urls []string, err error) {
	for _, file := range files {
		fmt.Println(file)
	}
	for _, file := range files {
		f, err := file.Open()
		if err != nil {
			return nil, err
		}

		key := fmt.Sprintf("%s/%s", path, file.Filename)
		err = qiniuUpload(f, file.Size, key)
		if err != nil {
			return nil, err
		}
	}
	return
}

func qiniuUpload(data io.Reader, fileSize int64, key string) error {
	putPolicy := storage.PutPolicy{
		Scope: fmt.Sprintf("%s:%s", "", key), //覆盖上传
	}
	accessKey := "your access key"
	secretKey := "your secret key"
	mac := auth.New(accessKey, secretKey)
	upToken := putPolicy.UploadToken(mac)
	cfg := storage.Config{}
	// 空间对应的机房
	cfg.Zone = &storage.ZoneHuanan
	// 是否使用https域名
	cfg.UseHTTPS = true
	// 上传是否使用CDN上传加速
	cfg.UseCdnDomains = false
	formUploader := storage.NewFormUploader(&cfg)
	ret := storage.PutRet{}

	err := formUploader.Put(context.Background(), &ret, upToken, key, data, fileSize, nil)
	if err != nil {
		return errors.New("upload " + err.Error())
	}
	return nil
}
