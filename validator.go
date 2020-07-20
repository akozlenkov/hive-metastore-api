package hive_metastore_api

import "fmt"

type Validator struct {

}

func NewValidator() *Validator {
	return &Validator{}
}

func (v *Validator) Validate(i interface{}) error {
	fmt.Println("__________________")
	fmt.Println(i)
	fmt.Println("__________________")
	return nil
}
