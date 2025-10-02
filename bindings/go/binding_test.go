package tree_sitter_apache_avro_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_apache_avro "github.com/victorhqc/tree-sitter-apache-avro/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_apache_avro.Language())
	if language == nil {
		t.Errorf("Error loading Apache Avro grammar")
	}
}
