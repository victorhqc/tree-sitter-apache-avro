import XCTest
import SwiftTreeSitter
import TreeSitterApacheAvro

final class TreeSitterApacheAvroTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_apache_avro())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Apache Avro grammar")
    }
}
