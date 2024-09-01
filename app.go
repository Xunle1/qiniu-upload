package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"

	"github.com/labstack/gommon/log"
	"github.com/qiniu/go-sdk/v7/auth"
	"github.com/qiniu/go-sdk/v7/storage"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type QiniuConfig struct {
	Domain    string `yaml:"domain"`
	AccessKey string `yaml:"accessKey"`
	SecretKey string `yaml:"secretKey"`
}

// App struct
type App struct {
	ctx       context.Context
	Config    QiniuConfig
	FilePaths []string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// OnStartup 启动读取配置文件
func (a *App) OnStartup(ctx context.Context) {
	a.ctx = ctx
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// Upload Greet returns a greeting for the given name
func (a *App) Upload(bucket string, uploadPath string) (urls []string, err error) {
	for _, filePath := range a.FilePaths {
		file, err := os.Open(filePath)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		stat, err := file.Stat()
		if err != nil {
			log.Error(err)
			return nil, err
		}
		key := fmt.Sprintf("%s/%s", uploadPath, stat.Name())
		if len(uploadPath) == 0 {
			key = stat.Name()
		}
		err = a.qiniuUpload(bucket, file, stat.Size(), key)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		urls = append(urls, fmt.Sprintf("%s/%s", a.Config.Domain, key))
	}
	return
}

func (a *App) qiniuUpload(bucket string, data io.Reader, fileSize int64, key string) error {
	putPolicy := storage.PutPolicy{
		Scope:      bucket, // 新增上传
		InsertOnly: 1,
	}
	accessKey := a.Config.AccessKey
	secretKey := a.Config.SecretKey
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
		return errors.New("upload failed: " + err.Error())
	}
	return nil
}

func (a *App) BatchSelectFiles() ([]string, error) {
	files, err := runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "选择图片",
		Filters: []runtime.FileFilter{{
			DisplayName: "Images (*.png;*.jpg;*.jpeg;*.gif)",
			Pattern:     "*.png;*.jpg;*.jpeg;*.gif",
		}},
	})
	if err != nil {
		log.Error(err)
		return nil, err
	}

	if len(files) == 0 {
		return nil, errors.New("请选择至少一张图片")
	}
	var resp []string
	a.FilePaths = a.FilePaths[0:0]
	for _, file := range files {
		a.FilePaths = append(a.FilePaths, file)
		resp = append(resp, file)
	}
	return resp, nil
}

func (a *App) SetConfig(ak, sk, domain string) (err error) {
	if len(domain) == 0 {
		return errors.New("域名不能为空")
	}
	if len(ak) == 0 {
		return errors.New("accessKey不能为空")
	}
	if len(sk) == 0 {
		return errors.New("secretKey不能为空")
	}
	a.Config = QiniuConfig{
		Domain:    domain,
		AccessKey: ak,
		SecretKey: sk,
	}
	return
}
