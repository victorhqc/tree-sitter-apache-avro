[
  "schema"
  "protocol"
  "import"
  "fixed"
  "record"
  "error"
  "enum"
  "throws"
  "namespace"
  (oneway)
] @keyword

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
]  @punctuation.bracket

(comment) @comment

[
  (primitive_type)
  (parameter type: (logical_type (identifier)))
] @type

[
  (void)
] @constant.builtin

[
  (string)
  (literal_type (string))
] @string

[
  (literal_type (number))
] @number

[
  (true)
  (false)
  (null)
] @constant.builtin

[
  ";"
  ","
] @punctuation.delimiter

(rpc_message_declaration name: (identifier) @function)

(anotation_statement name: (anotation_identifier) @attribute)

(record_declaration
  name: (identifier) @constructor)

(error_declaration
  name: (identifier) @constructor)

(enum_declaration
  name: (identifier) @constructor)

(protocol_declaration
  name: (identifier) @constructor)
