import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_path: str):
    """
    Extracts raw text from a PDF file using PyMuPDF.
    Returns a tuple of (extracted_text, page_count).
    """
    try:
        doc = fitz.open(file_path)
        page_count = len(doc)
        text_content = []
        for page_num in range(page_count):
            page = doc.load_page(page_num)
            text_content.append(page.get_text("text"))
        doc.close()
        return "\n".join(text_content), page_count
    except Exception as e:
        logger.error(f"Failed to extract text from {file_path}: {e}")
        raise ValueError(f"Could not parse PDF file: {str(e)}")
