package controller

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/jtblin/go-ldap-client"
	"github.com/labstack/echo/v4"
	hma "hive-metastore-api"
	"hive-metastore-api/model"
	"net/http"
	"time"
)

type AuthController struct {
	Config 	hma.Config
}

func (c AuthController) Init(group *echo.Group) {
	group.POST("/token", c.GetToken)
}

func (c AuthController) GetToken(context echo.Context) error {
	ldapClient := context.Get("ldapClient").(*ldap.LDAPClient)

	var user model.User
	if err := context.Bind(&user); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	ok, _, err := ldapClient.Authenticate(user.Username, user.Password)
	if !ok || err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized)
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user": user.Username,
		"exp": time.Now().Add(time.Hour * 72).Unix(),
	})

	signedToken, err := token.SignedString([]byte(c.Config.Secret))
	if err != nil {
		return err
	}
	return context.JSON(http.StatusOK, map[string]string{"token": signedToken})
}