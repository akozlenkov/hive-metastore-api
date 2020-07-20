package model

import (
	"fmt"
	hma "hive-metastore-api"
	"hive-metastore-api/thrift/gen-go/hive_metastore"
)

type SerDeInfo struct{
	SerializationLib	string				`json:"serialization_lib,omitempty"`
	Parameters			map[string]string	`json:"parameters,omitempty"`
}

func NewSerDeInfo() *SerDeInfo {
	return &SerDeInfo{}
}

func (s *SerDeInfo) ToMetaSerDeInfo() (*hive_metastore.SerDeInfo, error) {
	r := hive_metastore.NewSerDeInfo()
	if hma.IsEmpty(s.SerializationLib) {
		return nil, fmt.Errorf("serialization library required")
	}
	r.SerializationLib = s.SerializationLib

	if s.Parameters != nil {
		r.Parameters = s.Parameters
	}
	return r, nil
}

func NewSerDeInfoFromMeta(r *hive_metastore.SerDeInfo) *SerDeInfo {
	s := NewSerDeInfo()
	s.SerializationLib = r.SerializationLib
	s.Parameters = r.Parameters
	return s
}