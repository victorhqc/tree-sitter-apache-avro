/**
 * @file Unofficial Apache Avro Language Parser, it includes IDL and AVSC
 * @author Victor Quiroz <git@victorhqc.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  ASSIGN: 0,
  COMMENT: 1,
  STRING: 2, // In a string, prefer string characters over comments

  CALL: 8,
  MEMBER: 9,
};

module.exports = grammar({
  name: "apache_avro",

  rules: {
    program: ($) => repeat($._declaration),

    _declaration: ($) =>
      choice(
        $.protocol_declaration,
        $.import_declaration,
        $.enum_declaration,
        $.fixed_declaration,
        $.record_declaration,
        $.field_declaration,
      ),

    protocol_declaration: ($) =>
      choice(
        prec(PREC.MEMBER, seq("protocol", $.identifier, $.protocol_block)),
        seq(
          $.namespace_declaration,
          prec(PREC.MEMBER, seq("protocol", $.identifier, $.protocol_block)),
        ),
      ),

    namespace_declaration: ($) =>
      prec(PREC.MEMBER, seq("@namespace(", $.string, ")")),

    import_declaration: ($) =>
      prec(PREC.MEMBER, seq("import", $.identifier, $.string, ";")),

    fixed_declaration: ($) =>
      prec(PREC.MEMBER, seq("fixed", $.call_expression, ";")),

    record_declaration: ($) =>
      prec(PREC.MEMBER, seq("record", $.identifier, $.record_block)),

    enum_declaration: ($) =>
      prec(
        PREC.MEMBER,
        seq("enum", $.identifier, $.enum_block, optional($.default_enumeral)),
      ),

    protocol_block: ($) =>
      seq(
        "{",
        optional(
          repeat(
            choice(
              $.enum_declaration,
              $.fixed_declaration,
              $.record_declaration,
            ),
          ),
        ),
        "}",
      ),

    enum_block: ($) =>
      seq("{", optional(repeat(seq($.enumeral, optional(",")))), "}"),

    record_block: ($) => seq("{", optional(repeat($.field_declaration)), "}"),

    default_enumeral: ($) => seq("=", $.enumeral, ";"),

    enumeral: ($) => alias($.identifier, "enumeral"),

    call_expression: ($) =>
      prec(PREC.CALL, seq($._constructable_expression, $.arguments)),

    arguments: ($) => seq("(", commaSep(optional($._expression)), ")"),

    field_declaration: ($) =>
      seq(
        $.primitive_type,
        choice($.identifier, $.default_value_expression),
        ";",
      ),

    assignment_expression: ($) =>
      prec.right(
        PREC.ASSIGN,
        seq(field("right", $.identifier), "=", field("left", $._expression)),
      ),

    default_value_expression: ($) =>
      prec.right(
        PREC.ASSIGN,
        seq($.identifier, "=", alias($._constructable_expression, $.value)),
      ),

    _expression: ($) =>
      choice(
        $._constructable_expression,
        $.assignment_expression,
        $.call_expression,
      ),

    _constructable_expression: ($) => choice($.literal_type, $.identifier),

    identifier: (_) => {
      const alpha =
        /[^\x00-\x1F\s\p{Zs}0-9:;`"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;

      const alphanumeric =
        /[^\x00-\x1F\s\p{Zs}:;`"'@#.,|^&<=>+\-*/\\%?!~()\[\]{}\uFEFF\u2060\u200B\u2028\u2029]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;
      return token(seq(alpha, repeat(alphanumeric)));
    },

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

    word: ($) => $.identifier,

    true: (_) => "true",
    false: (_) => "false",
    null: (_) => "null",
  },
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}
