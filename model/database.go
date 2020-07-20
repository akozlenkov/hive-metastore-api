package model

import (
	"fmt"
	hma "hive-metastore-api"
	"hive-metastore-api/thrift/gen-go/hive_metastore"
	"strings"
)

type Database struct {
	Name 		string				`json:"name"`
	Location	string				`json:"location"`
	Description	string				`json:"description,omitempty"`
	Owner		string				`json:"owner,omitempty"`
	OwnerType	string				`json:"ownerType,omitempty"`
	Parameters	map[string]string	`json:"parameters,omitempty"`
}

func NewDatabase() *Database {
	return &Database{}
}

func NewDatabaseFromMeta(r *hive_metastore.Database) *Database {
	database := NewDatabase()
	database.Name = r.Name
	if r.LocationUri != nil {
		database.Location = *r.LocationUri
	}
	database.Description = r.Description
	if r.OwnerName != nil {
		database.Owner = *r.OwnerName
		database.OwnerType = r.OwnerType.String()
	}
	database.Parameters = r.Parameters
	return database
}

func (db *Database) ToMetaDatabase(owner string) (*hive_metastore.Database, error) {
	r := hive_metastore.NewDatabase()
	if hma.IsEmpty(db.Name) {
		return nil, fmt.Errorf("database name required")
	}

	r.Name = db.Name

	if !hma.IsEmpty(db.Location) {
		r.LocationUri = &db.Location
	}

	if !hma.IsEmpty(db.Description) {
		r.Description = db.Description
	}

	if hma.IsEmpty(db.Owner) {
		r.OwnerName = &owner
	} else {
		r.OwnerName = &db.Owner
	}

	if hma.IsEmpty(db.OwnerType) {
		r.OwnerType = hive_metastore.PrincipalTypePtr(hive_metastore.PrincipalType_USER)
	} else {
		switch strings.ToUpper(db.OwnerType) {
		case "USER":
			r.OwnerType = hive_metastore.PrincipalTypePtr(hive_metastore.PrincipalType_USER)
			break
		case "ROLE":
			r.OwnerType = hive_metastore.PrincipalTypePtr(hive_metastore.PrincipalType_ROLE)
			break
		case "GROUP":
			r.OwnerType = hive_metastore.PrincipalTypePtr(hive_metastore.PrincipalType_GROUP)
			break
		default:
			return nil, fmt.Errorf("unsupported owner type")
		}
	}

	if db.Parameters != nil {
		r.Parameters = db.Parameters
	}
	return r, nil
}