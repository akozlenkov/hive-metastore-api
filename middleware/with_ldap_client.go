package middleware

import (
	"github.com/jtblin/go-ldap-client"
	"github.com/labstack/echo/v4"
	hma "hive-metastore-api"
)

func WithLdapClient(config hma.Config) func(handlerFunc echo.HandlerFunc) echo.HandlerFunc {
	return func(handlerFunc echo.HandlerFunc) echo.HandlerFunc {
		return func(context echo.Context) error {
			ldapClient := &ldap.LDAPClient{
				Host:         config.Ldap.Host,
				Port:         config.Ldap.Port,
				Base:         config.Ldap.Base,
				UseSSL:       false,
				BindDN:       config.Ldap.BindDN,
				BindPassword: config.Ldap.BindPassword,
				UserFilter:   config.Ldap.UserFilter,
				GroupFilter:  config.Ldap.GroupFilter,
				Attributes:   []string{"sAMAccountName"},
			}
			defer ldapClient.Close()

			context.Set("ldapClient", ldapClient)

			return handlerFunc(context)
		}
	}
}
