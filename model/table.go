package model

import (
	"fmt"
	hma "hive-metastore-api"
	"hive-metastore-api/thrift/gen-go/hive_metastore"
	"strings"
)

type Table struct {
	Name				string					`json:"name"`
	Database			string					`json:"database"`
	Owner				string					`json:"owner,omitempty"`
	TableType			string					`json:"tableType"`
	StorageDescriptor   *StorageDescriptor		`json:"storageDescriptor"`
	PartitionKeys		[]*Column				`json:"partitionKeys,omitempty"`
	ViewText			string					`json:"viewText,omitempty"`
	Parameters			map[string]string		`json:"parameters,omitempty"`
}

func NewTable() *Table {
	return &Table{}
}

func (t *Table) ToMetaTable(owner string) (*hive_metastore.Table, error) {
	var (
		err error
	)

	r := hive_metastore.NewTable()
	if hma.IsEmpty(t.Name) {
		return nil, fmt.Errorf("table name required")
	}
	r.TableName = t.Name
	r.DbName = t.Database

	if hma.IsEmpty(t.Owner) {
		r.Owner = owner
	} else {
		r.Owner = t.Owner
	}

	if hma.IsEmpty(t.TableType) {
		return nil, fmt.Errorf("table type required")
	} else {
		switch strings.ToUpper(t.TableType) {
		case "VIRTUAL_VIEW":
			r.TableType = "VIRTUAL_VIEW"
			break
		case "MANAGED_TABLE":
			r.TableType = "MANAGED_TABLE"
			break
		case "EXTERNAL_TABLE":
			r.TableType = "EXTERNAL_TABLE"
			break
		default:
			return nil, fmt.Errorf("unknown table type")
		}
	}

	if t.StorageDescriptor == nil {
		return nil, fmt.Errorf("storage descriptor required")
	}



	if r.Sd, err = t.StorageDescriptor.ToMetaStorageDescriptor(r.TableType); err != nil {
		return nil, err
	}

	if len(t.PartitionKeys) != 0 {
		for _, c := range t.PartitionKeys {
			f := hive_metastore.NewFieldSchema()

			if hma.IsEmpty(c.Name) {
				return nil, fmt.Errorf("column name required")
			}
			f.Name = c.Name

			if hma.IsEmpty(c.Type) {
				return nil, fmt.Errorf("column type required")
			}
			f.Type = c.Type

			if !hma.IsEmpty(c.Comment) {
				f.Name = c.Name
			}
			r.PartitionKeys = append(r.PartitionKeys, f)
		}
	}

	if r.TableType == "VIRTUAL_VIEW" {
		if hma.IsEmpty(t.ViewText) {
			return nil, fmt.Errorf("view text required")
		}
		r.ViewOriginalText = t.ViewText
		r.ViewExpandedText = t.ViewText
	}

	if t.Parameters != nil {
		r.Parameters = t.Parameters
	}

	return r, nil
}

func NewTableFromMeta(r *hive_metastore.Table) *Table {
	table := NewTable()
	table.Name = r.TableName
	table.Database = r.DbName
	table.Owner = r.Owner
	table.TableType = r.TableType
	table.StorageDescriptor = NewStorageDescriptorFromMeta(r.Sd)
	for _, c := range r.PartitionKeys {
		column := NewColumn()
		column.Name = c.Name
		column.Type = c.Type
		if c.Comment != nil {
			column.Comment = *c.Comment
		}
		table.PartitionKeys = append(table.PartitionKeys, column)
	}
	table.ViewText = r.ViewOriginalText
	table.Parameters = r.Parameters
	return table
}