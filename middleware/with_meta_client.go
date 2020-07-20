package middleware

import (
	"fmt"
	"github.com/apache/thrift/lib/go/thrift"
	"github.com/labstack/echo/v4"
	hma "hive-metastore-api"
	"hive-metastore-api/thrift/gen-go/hive_metastore"
)

func WithMetaClient(config hma.Config) func(handlerFunc echo.HandlerFunc) echo.HandlerFunc {
	return func(handlerFunc echo.HandlerFunc) echo.HandlerFunc {
		return func(context echo.Context) error {
			socket, err := thrift.NewTSocket(fmt.Sprintf("%s:%d", config.Metastore.Host, config.Metastore.Port))
			if err != nil {
				return err
			}

			var transport thrift.TTransport

			if config.Metastore.Security == nil {
				transportFactory := thrift.NewTBufferedTransportFactory(24 * 1024 * 1024)
				transport, _ = transportFactory.GetTransport(socket)
			} else {
				if _, ok := config.Metastore.Security["auth_mechanisms"]; !ok {
					return fmt.Errorf("auth_mechanisms must be set in config")
				}
				transport, err = hma.NewTSaslTransport(socket, config.Metastore.Host, config.Metastore.Security["auth_mechanisms"], config.Metastore.Security)
				if err != nil {
					return err
				}
			}

			protocolFactory := thrift.NewTBinaryProtocolFactoryDefault()
			thriftClient := hive_metastore.NewThriftHiveMetastoreClient(thrift.NewTStandardClient(protocolFactory.GetProtocol(transport), protocolFactory.GetProtocol(transport)))
			if err := transport.Open(); err != nil {
				return err
			}

			defer transport.Close()

			context.Set("thriftClient", thriftClient)

			return handlerFunc(context)
		}
	}
}
