package hive_metastore_api

import rice "github.com/GeertJohan/go.rice"

func NewAssetsBox() *rice.HTTPBox {
	return rice.MustFindBox("ui/dist/ui").HTTPBox()
}