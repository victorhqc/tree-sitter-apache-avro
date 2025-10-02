/**
 * @file Unofficial Apache Avro Language Parser, it includes IDL and AVSC
 * @author Victor Quiroz <git@victorhqc.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  COMMENT: 1, // Prefer comments over regexes
  STRING: 2, // In a string, prefer string characters over comments

  ASSIGN: 0,
  MEMBER: 9,
};

module.exports = grammar({
  name: "apache_avro",

  rules: {
    program: ($) => repeat($._declaration),

    _declaration: ($) =>
      choice($.protocol_declaration, $.import_declaration, $.enum_declaration),

    protocol_declaration: ($) =>
      choice(
        prec(PREC.MEMBER, seq("protocol", $.identifier, $.statement_block)),
        seq(
          $.namespace_declaration,
          prec(PREC.MEMBER, seq("protocol", $.identifier, $.statement_block)),
        ),
      ),

    namespace_declaration: ($) =>
      prec(PREC.MEMBER, seq("@namespace(", $.string, ")")),

    import_declaration: ($) =>
      prec(PREC.MEMBER, seq("import", $.identifier, $.string, ";")),

    enum_declaration: ($) =>
      prec(
        PREC.MEMBER,
        seq("enum", $.identifier, $.enum_block, optional($.default_enumeral)),
      ),

    statement_block: ($) =>
      seq("{", optional(repeat(choice($.enum_declaration))), "}"),

    enum_block: ($) =>
      seq("{", optional(repeat(seq($.enumeral, optional(",")))), "}"),

    default_enumeral: ($) => seq("=", $.enumeral, ";"),

    enumeral: ($) => {
      const alpha =
        /[^\x00-\x1F\s0-9:;`"'@#.,|^&<=>+*/\\%?!~()\[\]{}\uFEFF\u2060\u200B]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;
      const alphanumeric =
        /[^\x00-\x1F\s:;`"'@#.,|^&<=>+*/\\%?!~()\[\]{}\uFEFF\u2060\u200B]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;
      return token(seq(alpha, repeat(alphanumeric)));
    },

    identifier: ($) => {
      const alpha =
        /[^\x00-\x1F\s0-9:;`"'@#.,|^&<=>+*/\\%?!~()\[\]{}\uFEFF\u2060\u200B]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;
      const alphanumeric =
        /[^\x00-\x1F\s:;`"'@#.,|^&<=>+*/\\%?!~()\[\]{}\uFEFF\u2060\u200B]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}/;
      return token(seq(alpha, repeat(alphanumeric)));
    },

    string: ($) =>
      token(
        choice(
          seq("'", /([^'\n]|\\(.|\n))*/, "'"),
          seq('"', /([^"\n]|\\(.|\n))*/, '"'),
        ),
      ),
  },
});
