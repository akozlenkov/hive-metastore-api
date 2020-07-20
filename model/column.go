package model

type Column struct {
	Name	string	`json:"name"`
	Type	string	`json:"type"`
	Comment string	`json:"comment,omitempty"`
}

func NewColumn() *Column {
	return &Column{}
}