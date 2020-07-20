package hive_metastore_api

type SSL struct {
	Cert 	string	`config:"cert"`
	Key 	string	`config:"key"`
}

type Metastore struct{
	Host 		string				`config:"host" validate:"required"`
	Port 		int					`config:"port" validate:"required"`
	Security 	map[string]string	`config:"security"`
}

type Ldap struct{
	Host 			string			`config:"host" validate:"required"`
	Port 			int				`config:"port" validate:"required"`
	Base 			string			`config:"base" validate:"required"`
	BindDN  		string			`config:"bind_dn" validate:"required"`
	BindPassword	string			`config:"bind_password" validate:"required"`
	UserFilter		string			`config:"user_filter"`
	GroupFilter		string			`config:"group_filter"`
}

type Config struct {
	Host 		string		`config:"host"`
	Port		int			`config:"port"`
	SSL			SSL			`config:"ssl"`
	Secret		string		`config:"secret" validate:"required"`
	Metastore 	Metastore	`config:"metastore" validate:"required"`
	Ldap 		Ldap		`config:"ldap" validate:"required"`
}

var (
	DefaultConfig = Config{
		Host: "localhost",
		Port: 9886,
		Ldap: Ldap{
			UserFilter: "(sAMAccountName=%s)",
			GroupFilter: "(member=%s)",
		},
	}
)

