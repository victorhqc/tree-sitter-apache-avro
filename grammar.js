/**
 * @file Unofficial Apache Avro Language Parser for the IDL Language
 * @author Victor Quiroz <git@victorhqc.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  ASSIGN: 0,
  COMMENT: 1,
  STRING: 2,

  CALL: 5,
  FIELD: 6,
  UNION: 7,
  STATEMENT: 8,
  MEMBER: 9,
};

module.exports = grammar({
  name: "apache_avro",

  conflicts: ($) => [
    // [$.protocol_declaration, $.record_declaration],
    // [$.record_declaration, $._anotated_type],
    [$._anotated_type, $.nullable],
  ],

  word: ($) => $.identifier,

  extras: ($) => [$.comment, /[\s\p{Zs}\uFEFF\u2028\u2029\u2060\u200B]/],

  rules: {
    program: ($) => repeat($._all_declarations),

    _all_declarations: ($) =>
      choice(
        $.schema_declaration,
        $.protocol_declaration,
        $.import_declaration,
        $.enum_declaration,
        $.fixed_declaration,
        $.record_declaration,
        $.error_declaration,
        $.rpc_message_declaration,
      ),

    _protocol_declarations: ($) =>
      choice(
        $.import_declaration,
        $.enum_declaration,
        $.fixed_declaration,
        $.record_declaration,
        $.error_declaration,
        $.rpc_message_declaration,
      ),

    schema_declaration: ($) =>
      prec(
        PREC.MEMBER,
        seq(
          optional($.namespace_statement),
          "schema",
          choice($.primitive_type, $.identifier),
          ";",
        ),
      ),

    protocol_declaration: ($) =>
      prec(
        PREC.MEMBER,
        seq(
          optional($.anotation_statement),
          "protocol",
          field("name", $.identifier),
          $.protocol_block,
        ),
      ),

    protocol_block: ($) =>
      seq("{", optional(repeat($._protocol_declarations)), "}"),

    import_declaration: ($) =>
      prec(PREC.MEMBER, seq("import", $.identifier, $.literal_type, ";")),

    fixed_declaration: ($) =>
      prec(
        PREC.MEMBER,
        seq("fixed", choice($.call_expression, $.identifier), ";"),
      ),

    record_declaration: ($) =>
      prec(
        PREC.MEMBER,
        seq(
          optional($.anotation_statement),
          "record",
          field("name", $.identifier),
          $.statement_block,
        ),
      ),

    error_declaration: ($) =>
      prec(
        PREC.MEMBER,
        seq("error", field("name", $.identifier), $.statement_block),
      ),

    enum_declaration: ($) =>
      prec(
        PREC.MEMBER,
        seq(
          optional($.anotation_statement),
          "enum",
          field("name", $.identifier),
          $.enum_block,
          optional($.default_enumeral),
        ),
      ),

    enum_block: ($) =>
      seq("{", optional(repeat(seq($.enumeral, optional(",")))), "}"),

    statement_block: ($) =>
      seq("{", optional(repeat($.field_declaration)), "}"),

    default_enumeral: ($) => seq("=", $.identifier, ";"),

    enumeral: ($) => $.identifier,

    call_expression: ($) => prec(PREC.CALL, seq($.identifier, $.argument_list)),

    argument_list: ($) => seq("(", commaSep(optional($._expression)), ")"),

    field_declaration: ($) =>
      seq(
        field("type", $._possible_types),
        optional($.anotation_statement),
        choice(field("name", $.identifier), $.default_value_expression),
        ";",
      ),

    rpc_message_declaration: ($) =>
      seq(
        $.return_value,
        seq(field("name", $.identifier), $.parameter_list),
        optional(choice($.throw_statement, $.oneway)),
        ";",
      ),

    return_value: ($) => choice($._possible_types, $.void),

    parameter_list: ($) => seq("(", commaSep(optional($.parameter)), ")"),

    parameter: ($) =>
      seq(
        field("type", $._possible_types),
        field("name", choice($.identifier, $.default_value_expression)),
      ),

    throw_statement: ($) => seq("throws", $.identifier),

    oneway: ($) => "oneway",

    namespace_statement: ($) =>
      prec(PREC.STATEMENT, seq("namespace", $.namespace_identifier, ";")),

    anotation_statement: ($) =>
      prec(
        PREC.STATEMENT,
        seq(field("name", $.anotation_identifier), $.anotation_arguments),
      ),

    anotation_arguments: ($) =>
      seq(
        "(",
        choice(
          $.literal_type,
          seq("[", commaSep(optional($.literal_type)), "]"),
        ),
        ")",
      ),

    _possible_types: ($) =>
      choice(
        $.primitive_type,
        $.logical_type,
        $.array,
        $.map,
        $.union,
        $.nullable,
        $._anotated_type,
      ),

    _anotated_type: ($) => seq($.anotation_statement, $._possible_types),

    assignment_expression: ($) =>
      prec.right(
        PREC.ASSIGN,
        seq(field("right", $.identifier), "=", field("left", $._expression)),
      ),

    default_value_expression: ($) =>
      prec.right(
        PREC.ASSIGN,
        seq(
          field("left", $.identifier),
          "=",
          field("right", alias($._constructable_expression, $.value)),
        ),
      ),

    _expression: ($) =>
      choice(
        $._constructable_expression,
        $.assignment_expression,
        $.call_expression,
      ),

    _constructable_expression: ($) => choice($.literal_type, $.identifier),

    namespace_identifier: (_) => {
      const alpha =
        /[^\x00-\x1F\s\p{Zs}0-9:;"'@#,|^&<=>+\*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;

      const alphanumeric =
        /[^\x00-\x1F\s\p{Zs}:;"'@#,|^&<=>+\*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;
      return token(seq(alpha, repeat(alphanumeric)));
    },

    anotation_identifier: (_) => {
      const alpha =
        /[^\x00-\x1F\s\p{Zs}0-9:;"'@#,|^&<=>+\*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;

      const alphanumeric =
        /[^\x00-\x1F\s\p{Zs}:;"'@#,|^&<=>+\*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;
      return token(seq("@", alpha, repeat(alphanumeric)));
    },

    identifier: (_) => {
      const alpha =
        /[^\x00-\x1F\s\p{Zs}0-9:;"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;

      const alphanumeric =
        /[^\x00-\x1F\s\p{Zs}:;"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;
      return token(seq(alpha, repeat(alphanumeric)));
    },

    array: ($) => seq("array", $.type_block),

    map: ($) => seq("map", $.type_block),

    type_block: ($) => seq("<", $._possible_types, ">"),

    union: ($) => seq("union", $.union_block),

    union_block: ($) => seq("{", commaSep($._possible_types), "}"),

    nullable: ($) => seq($._possible_types, "?"),

    logical_type: ($) =>
      choice($.known_logical_type, $.identifier, $.call_expression),

    known_logical_type: ($) =>
      choice(
        $.decimal,
        "date",
        "time_ms",
        "timestamp_ms",
        "local_timestamp_ms",
        "uuid",
      ),

    decimal: ($) => seq("decimal", optional($.argument_list)),

    primitive_type: (_) =>
      choice(
        "int",
        "long",
        "string",
        "boolean",
        "float",
        "double",
        "null",
        "bytes",
      ),

    void: (_) => "void",

    literal_type: ($) => choice($.number, $.string, $.true, $.false, $.null),

    string: ($) =>
      token(
        choice(
          seq("'", /([^'\n]|\\(.|\n))*/, "'"),
          seq('"', /([^"\n]|\\(.|\n))*/, '"'),
        ),
      ),

    number: (_) => {
      const decimalDigits = /\d(_?\d)*/;
      const signedInteger = seq(optional(choice("-", "+")), decimalDigits);
      const exponentPart = seq(choice("e", "E"), signedInteger);

      const decimalIntegerLiteral = choice(
        "0",
        seq(optional("0"), /[1-9]/, optional(decimalDigits)),
      );

      const decimalLiteral = choice(
        seq(
          decimalIntegerLiteral,
          ".",
          optional(decimalDigits),
          optional(exponentPart),
        ),
        seq(".", decimalDigits, optional(exponentPart)),
        seq(decimalIntegerLiteral, exponentPart),
        signedInteger,
        decimalDigits,
      );

      return token(decimalLiteral);
    },

    true: (_) => "true",
    false: (_) => "false",
    null: (_) => "null",

    // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: (_) =>
      token(
        choice(
          seq("//", /[^\r\n\u2028\u2029]*/),
          seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"),
        ),
      ),
  },
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}
