package controller

import (
	"github.com/labstack/echo/v4"
	hma "hive-metastore-api"
	"hive-metastore-api/model"
	"hive-metastore-api/thrift/gen-go/hive_metastore"
	"net/http"
	"strings"
)

type ApiController struct {
	Config hma.Config
}

func (c ApiController) Init(group *echo.Group) {
	group.GET("/databases", c.GetDatabases)
	group.POST("/databases", c.CreateDatabases)
	group.GET("/databases/:database", c.GetDatabase)
	group.PATCH("/databases/:database", c.UpdateDatabase)
	group.DELETE("/databases/:database", c.DeleteDatabase)
	group.GET("/databases/:database/tables", c.GetTables)
	group.POST("/databases/:database/tables", c.CreateTable)
	group.GET("/databases/:database/tables/:table", c.GetTable)
	group.PATCH("/databases/:database/tables/:table", c.UpdateTable)
	group.DELETE("/databases/:database/tables/:table", c.DeleteTable)
}

func (ApiController) GetDatabases(context echo.Context) error {
	thriftClient := context.Get("thriftClient").(*hive_metastore.ThriftHiveMetastoreClient)
	databases, err := thriftClient.GetAllDatabases(context.Request().Context())
	if err != nil {
		return err
	}
	return context.JSON(http.StatusOK, map[string]interface{}{"count": len(databases), "databases": databases})
}

func (ApiController) CreateDatabases(context echo.Context) error {
	thriftClient := context.Get("thriftClient").(*hive_metastore.ThriftHiveMetastoreClient)
	user := context.Get("user").(string)

	var database model.Database
	if err := context.Bind(&database); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	r, err := database.ToMetaDatabase(user)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := thriftClient.CreateDatabase(context.Request().Context(), r); err != nil {
		return err
	}
	return context.JSON(http.StatusCreated, "OK")
}

func (ApiController) GetDatabase(context echo.Context) error {
	thriftClient := context.Get("thriftClient").(*hive_metastore.ThriftHiveMetastoreClient)
	r, err := thriftClient.GetDatabase(context.Request().Context(), context.Param("database"))
	if err != nil {
		return err
	}
	return context.JSON(http.StatusOK, model.NewDatabaseFromMeta(r))
}

func (ApiController) UpdateDatabase(context echo.Context) error {
	thriftClient := context.Get("thriftClient").(*hive_metastore.ThriftHiveMetastoreClient)
	r, err := thriftClient.GetDatabase(context.Request().Context(), context.Param("database"))
	if err != nil {
		return err
	}

	var database model.Database
	if err := context.Bind(&database); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	if !hma.IsEmpty(database.Name) {
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to change database name")
	}

	if !hma.IsEmpty(database.Location) {
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to change database location")
	}

	if !hma.IsEmpty(database.Description) {
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to change database description")
	}

	if !hma.IsEmpty(database.Owner) {
		r.OwnerName = &database.Owner
	}

	if !hma.IsEmpty(database.OwnerType) {
		switch strings.ToUpper(database.OwnerType) {
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
			return echo.NewHTTPError(http.StatusBadRequest, "Unsupported owner type")
		}
	}

	if database.Parameters != nil {
		r.Parameters = database.Parameters
	}

	if err := thriftClient.AlterDatabase(context.Request().Context(), context.Param("database"), r); err != nil {
		return err
	}
	return context.JSON(http.StatusAccepted, "OK")
}

func (ApiController) DeleteDatabase(context echo.Context) error {
	thriftClient := context.Get("thriftClient").(*hive_metastore.ThriftHiveMetastoreClient)
	if err := thriftClient.DropDatabase(context.Request().Context(), context.Param("database"), true, true); err != nil {
		return err
	}
	return context.JSON(http.StatusAccepted, "OK")
}

func (ApiController) GetTables(context echo.Context) error {
	thriftClient := context.Get("thriftClient").(*hive_metastore.ThriftHiveMetastoreClient)
	tables, err := thriftClient.GetAllTables(context.Request().Context(), context.Param("database"))
	if err != nil {
		return err
	}
	return context.JSON(http.StatusOK, map[string]interface{}{"count": len(tables), "tables": tables})
}

func (ApiController) CreateTable(context echo.Context) error {
	thriftClient := context.Get("thriftClient").(*hive_metastore.ThriftHiveMetastoreClient)
	user := context.Get("user").(string)

	table := &model.Table{
		Database: context.Param("database"),
	}
	if err := context.Bind(table); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	r, err := table.ToMetaTable(user)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := thriftClient.CreateTable(context.Request().Context(), r); err != nil {
		return err
	}
	return context.JSON(http.StatusCreated, "OK")
}

func (ApiController) GetTable(context echo.Context) error {
	thriftClient := context.Get("thriftClient").(*hive_metastore.ThriftHiveMetastoreClient)
	r, err := thriftClient.GetTable(context.Request().Context(), context.Param("database"), context.Param("table"))
	if err != nil {
		return err
	}
	return context.JSON(http.StatusOK, model.NewTableFromMeta(r))
}

func (ApiController) UpdateTable(context echo.Context) error {
	thriftClient := context.Get("thriftClient").(*hive_metastore.ThriftHiveMetastoreClient)
	r, err := thriftClient.GetTable(context.Request().Context(), context.Param("database"), context.Param("table"))
	if err != nil {
		return err
	}

	var table model.Table
	if err := context.Bind(&table); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	if !hma.IsEmpty(table.Name) {
		r.TableName = table.Name
	}

	if !hma.IsEmpty(table.Database) {
		r.DbName = table.Database
	}

	if !hma.IsEmpty(table.Owner) {
		r.Owner = table.Owner
	}

	if !hma.IsEmpty(table.TableType) {
		if r.TableType == "VIRTUAL_VIEW" {
			return echo.NewHTTPError(http.StatusBadRequest, "Unable change type for view")
		}
		switch strings.ToUpper(table.TableType) {
		case "MANAGED_TABLE":
			r.TableType = "MANAGED_TABLE"
			break
		case "EXTERNAL_TABLE":
			r.TableType = "EXTERNAL_TABLE"
			break
		default:
			return echo.NewHTTPError(http.StatusBadRequest, "Unknown table type")
		}
	}

	if table.StorageDescriptor != nil {
		if len(table.StorageDescriptor.Columns) != 0 {
			columns := make([]*hive_metastore.FieldSchema, 0)
			for _, c := range table.StorageDescriptor.Columns {
				f := hive_metastore.NewFieldSchema()

				if hma.IsEmpty(c.Name) {
					return echo.NewHTTPError(http.StatusBadRequest, "Column name required")
				} else {
					f.Name = c.Name
				}

				if hma.IsEmpty(c.Type) {
					return echo.NewHTTPError(http.StatusBadRequest, "Column type required")
				} else {
					f.Type = c.Type
				}

				if !hma.IsEmpty(c.Comment) {
					f.Name = c.Name
				}
				columns = append(columns, f)
			}
			r.Sd.Cols = columns
		}

		if !hma.IsEmpty(table.StorageDescriptor.Location) {
			r.Sd.Location = &table.StorageDescriptor.Location
		}

		if !hma.IsEmpty(table.StorageDescriptor.InputFormat) {
			r.Sd.InputFormat = table.StorageDescriptor.InputFormat
		}

		if !hma.IsEmpty(table.StorageDescriptor.OutputFormat) {
			r.Sd.OutputFormat = table.StorageDescriptor.OutputFormat
		}

		if table.StorageDescriptor.SerDeInfo != nil {
			if !hma.IsEmpty(table.StorageDescriptor.SerDeInfo.SerializationLib) {
				r.Sd.SerdeInfo.SerializationLib = table.StorageDescriptor.SerDeInfo.SerializationLib
			}

			if table.StorageDescriptor.SerDeInfo.Parameters != nil {
				r.Sd.SerdeInfo.Parameters = table.StorageDescriptor.SerDeInfo.Parameters
			}
		}
	}

	if len(table.PartitionKeys) != 0 {
		columns := make([]*hive_metastore.FieldSchema, 0)
		for _, c := range table.StorageDescriptor.Columns {
			f := hive_metastore.NewFieldSchema()

			if hma.IsEmpty(c.Name) {
				return echo.NewHTTPError(http.StatusBadRequest, "Column name required")
			} else {
				f.Name = c.Name
			}

			if hma.IsEmpty(c.Type) {
				return echo.NewHTTPError(http.StatusBadRequest, "Column type required")
			} else {
				f.Type = c.Type
			}

			if !hma.IsEmpty(c.Comment) {
				f.Name = c.Name
			}
			columns = append(columns, f)
		}
		r.PartitionKeys = columns
	}

	if !hma.IsEmpty(table.ViewText) {
		r.ViewOriginalText = table.ViewText
		r.ViewExpandedText = table.ViewText
	}

	if table.Parameters != nil {
		r.Parameters = table.Parameters
	}

	if err := thriftClient.AlterTable(context.Request().Context(), context.Param("database"), context.Param("table"), r); err != nil {
		return err
	}
	return context.JSON(http.StatusAccepted, "OK")
}

func (ApiController) DeleteTable(context echo.Context) error {
	thriftClient := context.Get("thriftClient").(*hive_metastore.ThriftHiveMetastoreClient)
	if err := thriftClient.DropTable(context.Request().Context(), context.Param("database"), context.Param("table"), true); err != nil {
		return err
	}
	return context.JSON(http.StatusAccepted, "OK")
}