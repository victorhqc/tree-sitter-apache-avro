# Tree Sitter Apache Avro

## Introduction

**This is a WIP** Project, not ready for general use :)

This is an **unofficial** Apache Avro (.avsc) and IDL (.avdl) based on the
official specs:

- [avsc](https://avro.apache.org/docs/1.11.1/specification/)
- [avdl](https://avro.apache.org/docs/1.11.1/idl-language/)

If you notice any bug or problem, please submit an issue or make a pull request.
Any contribution is welcomed and needed.

## Development

**Requirements:**

- Rust >= 1.90
- node >= 24
- Docker (For the playground)

All the parsing logic is specified in `grammar.js` at the root level. To see if
the changes made to it are working, run the tests and compare the results.

```sh
npm test
```

A playground is also available to test the parser (though it needs Docker to
run)

```sh
npm start
```

More information about how to write or use the tree parser can be found here:
[http://tree-sitter.github.io/tree-sitter/](http://tree-sitter.github.io/tree-sitter/)
