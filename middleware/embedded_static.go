package middleware

import (
	rice "github.com/GeertJohan/go.rice"
	"github.com/labstack/echo/v4"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
)

type StaticConfig struct {
	Index string `yaml:"index"`
	Catch bool	 `yaml:"catch"`
}

var DefaultStaticConfig = StaticConfig{
	Index:   "index.html",
	Catch: 	 false,
}

func EmbeddedStatic(box *rice.HTTPBox) echo.MiddlewareFunc {
	return EmbeddedStaticWithConfig(box, DefaultStaticConfig)
}

func EmbeddedStaticWithConfig(box *rice.HTTPBox, config StaticConfig) echo.MiddlewareFunc {
	return func(handlerFunc echo.HandlerFunc) echo.HandlerFunc {
		return func(context echo.Context) (err error) {
			p := context.Request().URL.Path
			if strings.HasSuffix(context.Path(), "*") {
				p = context.Param("*")
			}

			p, err = url.PathUnescape(p)
			if err != nil {
				return err
			}

			name := strings.TrimLeft(p, "/")
			if name == "" {
				return context.HTML(http.StatusOK, box.MustString(config.Index))
			}

			f, err := box.Open(name)
			if err != nil {
				if os.IsNotExist(err) {
					if err = handlerFunc(context); err != nil {
						if he, ok := err.(*echo.HTTPError); ok {
							if config.Catch && he.Code == http.StatusNotFound {
								return context.HTML(http.StatusOK, box.MustString(config.Index))
							}
						}
						return
					}
				}
				return
			}
			return context.Stream(http.StatusOK, mime.TypeByExtension(filepath.Ext(name)), f)
		}
	}
}