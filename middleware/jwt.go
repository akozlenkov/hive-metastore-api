package middleware

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo/v4"
	hma "hive-metastore-api"
	"net/http"
)

func JWT(config hma.Config) func(handlerFunc echo.HandlerFunc) echo.HandlerFunc {
	return func(handlerFunc echo.HandlerFunc) echo.HandlerFunc {
		return func(context echo.Context) error {
			tokenString := context.Request().Header.Get("Authorization")
			if !hma.IsEmpty(tokenString) {
				token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
					if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
						return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
					}
					return []byte(config.Secret), nil
				})

				if claims, ok := token.Claims.(jwt.MapClaims); ok && err == nil && token.Valid {
					context.Set("user", claims["user"])
					return handlerFunc(context)
				}
			}
			return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized")
		}
	}
}
