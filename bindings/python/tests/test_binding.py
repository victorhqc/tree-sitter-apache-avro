from unittest import TestCase

from tree_sitter import Language, Parser
import tree_sitter_apache_avro


class TestLanguage(TestCase):
    def test_can_load_grammar(self):
        try:
            Parser(Language(tree_sitter_apache_avro.language()))
        except Exception:
            self.fail("Error loading Apache Avro grammar")
