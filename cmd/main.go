package main

import (
	"fmt"
	"github.com/elastic/go-ucfg"
	"github.com/elastic/go-ucfg/yaml"
	"github.com/jawher/mow.cli"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	hma "hive-metastore-api"
	"hive-metastore-api/controller"
	mymiddleware "hive-metastore-api/middleware"
	"os"
)

func main() {
	app := cli.App("hive-metastore-api", "REST API for hive metastore")
	app.Spec = "[ --config=<config> ]"

	var (
		confFile = app.StringOpt("config", "config.yml", "Service config")
		appConfig = hma.DefaultConfig
	)

	app.Action = func() {
		e := echo.New()

		conf, err := yaml.NewConfigWithFile(*confFile, ucfg.PathSep("."))
		if err != nil {
			e.Logger.Fatal(err)
		}

		if err := conf.Unpack(&appConfig); err != nil {
			e.Logger.Fatal(err)
		}

		e.Use(middleware.Logger())
		e.Use(middleware.Recover())

		e.Validator = hma.NewValidator()

		e.Use(mymiddleware.EmbeddedStaticWithConfig(hma.NewAssetsBox(), mymiddleware.StaticConfig{
			Index: "index.html", Catch: true,
		}))

		bindAddress := fmt.Sprintf("%s:%d", appConfig.Host, appConfig.Port)

		auth := e.Group("/auth", mymiddleware.WithLdapClient(appConfig))
		controller.AuthController{appConfig}.Init(auth)

		api := e.Group("/api/v1", mymiddleware.WithMetaClient(appConfig), mymiddleware.JWT(appConfig))
		controller.ApiController{appConfig}.Init(api)

		if hma.IsEmpty(appConfig.SSL.Cert) && hma.IsEmpty(appConfig.SSL.Key) {
			e.Logger.Fatal(e.Start(bindAddress))
		} else {
			e.Logger.Fatal(e.StartTLS(bindAddress, appConfig.SSL.Cert, appConfig.SSL.Key))
		}
	}
	app.Run(os.Args)
}

