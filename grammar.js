/**
 * @file Unofficial Apache Avro Language Parser, it includes IDL and AVSC
 * @author Victor Quiroz <git@victorhqc.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "apache_avro",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
