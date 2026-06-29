import importlib.util
import unittest

from pydantic import ValidationError

HAS_SQLALCHEMY = importlib.util.find_spec("sqlalchemy") is not None


@unittest.skipUnless(HAS_SQLALCHEMY, "backend dependencies are not installed")
class AnalysisSchemaTests(unittest.TestCase):
    def setUp(self):
        from app.schemas.analysis import (
            ListingAnalysisRequest,
            UrlAnalysisRequest,
            MAX_LISTING_TEXT_CHARS,
            MAX_URL_CHARS,
        )

        self.ListingAnalysisRequest = ListingAnalysisRequest
        self.UrlAnalysisRequest = UrlAnalysisRequest
        self.MAX_LISTING_TEXT_CHARS = MAX_LISTING_TEXT_CHARS
        self.MAX_URL_CHARS = MAX_URL_CHARS

    def test_listing_text_is_trimmed(self):
        request = self.ListingAnalysisRequest(text="  This is a realistic adoption listing text.  ")

        self.assertEqual(request.text, "This is a realistic adoption listing text.")

    def test_listing_text_rejects_too_short_input(self):
        with self.assertRaises(ValidationError):
            self.ListingAnalysisRequest(text="too short")

    def test_listing_text_rejects_oversized_input(self):
        with self.assertRaises(ValidationError):
            self.ListingAnalysisRequest(text="x" * (self.MAX_LISTING_TEXT_CHARS + 1))

    def test_url_requires_http_scheme(self):
        with self.assertRaises(ValidationError):
            self.UrlAnalysisRequest(url="example.com/cat")

    def test_url_rejects_oversized_input(self):
        with self.assertRaises(ValidationError):
            self.UrlAnalysisRequest(url=f"https://example.com/{'x' * self.MAX_URL_CHARS}")


if __name__ == "__main__":
    unittest.main()
