package model

import (
	"fmt"
	hma "hive-metastore-api"
	"hive-metastore-api/thrift/gen-go/hive_metastore"
)

type StorageDescriptor	struct{
	Columns				[]*Column			`json:"columns"`
	Location			string				`json:"location,omitempty"`
	InputFormat 		string				`json:"input_format"`
	OutputFormat 		string				`json:"output_format"`
	SerDeInfo			*SerDeInfo			`json:"serde_info,omitempty"`
	Parameters			map[string]string	`json:"parameters,omitempty"`
}

func NewStorageDescriptor() *StorageDescriptor {
	return &StorageDescriptor{}
}

func (s *StorageDescriptor) ToMetaStorageDescriptor(tableType string) (*hive_metastore.StorageDescriptor, error) {
	var (
		err error
	)

	r := hive_metastore.NewStorageDescriptor()

	if len(s.Columns) == 0 {
		return nil, fmt.Errorf("columns required")
	}

	for _, c := range s.Columns {
		f := hive_metastore.NewFieldSchema()

		if hma.IsEmpty(c.Name) {
			return nil, fmt.Errorf("column name required")
		}
		f.Name = c.Name

		if hma.IsEmpty(c.Type) {
			return nil, fmt.Errorf("column name required")
		}
		f.Type = c.Type

		if !hma.IsEmpty(c.Comment) {
			f.Name = c.Name
		}

		r.Cols = append(r.Cols, f)
	}

	if !hma.IsEmpty(s.Location) {
		r.Location = &s.Location
	}

	if hma.IsEmpty(s.InputFormat) {
		return nil, fmt.Errorf("input format required")
	}
	r.InputFormat = s.InputFormat

	if hma.IsEmpty(s.OutputFormat) {
		return nil, fmt.Errorf("output format required")
	}
	r.OutputFormat = s.OutputFormat

	if s.Parameters != nil {
		r.Parameters = s.Parameters
	}

	if tableType != "VIRTUAL_VIEW" {
		if s.SerDeInfo == nil {
			return nil, fmt.Errorf("serde info required")
		}

		if r.SerdeInfo, err = s.SerDeInfo.ToMetaSerDeInfo(); err != nil {
			return nil, err
		}
	}
	return r, nil
}

func NewStorageDescriptorFromMeta(r *hive_metastore.StorageDescriptor) *StorageDescriptor {
	s := NewStorageDescriptor()
	for _, c := range r.Cols {
		column := NewColumn()
		column.Name = c.Name
		column.Type = c.Type
		if c.Comment != nil {
			column.Comment = *c.Comment
		}

		s.Columns = append(s.Columns, column)
	}
	if r.Location != nil {
		s.Location = *r.Location
	}
	s.InputFormat = r.InputFormat
	s.OutputFormat = r.OutputFormat
	s.SerDeInfo = NewSerDeInfoFromMeta(r.SerdeInfo)
	return s
}