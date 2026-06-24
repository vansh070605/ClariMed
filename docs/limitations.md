# Platform Limitations

ClariMed is currently in its Minimum Viable Product (MVP) stage. In the spirit of engineering honesty and transparency, here are the known constraints of the current system.

## Current MVP Constraints

### 1. Limited Biomarker Alias Coverage
The deterministic extraction engine relies on a predefined list of regex mappings and aliases. If a specific laboratory uses a highly irregular name for a biomarker (e.g., "Hemo-G Level" instead of "Hemoglobin"), the engine may miss it. 

### 2. No OCR Fallback
Currently, the PyMuPDF extractor only parses native text layers within PDFs. Scanned images or photographed documents are not supported. Integrating an OCR fallback (e.g., AWS Textract) is scoped for Phase 3.

### 3. Local Storage for PDFs
PDFs are temporarily stored on the backend's local filesystem (`/uploads`). This is insufficient for horizontally scaled, containerized production environments. A migration to AWS S3 or a similar blob storage provider is necessary.

### 4. Synthetic Demo Data
For privacy and HIPAA compliance, the provided demonstration data relies on synthetic reports generated via `fpdf` rather than real, unstructured lab reports. Real-world PDFs are significantly messier and require more robust parsing rules.

### 5. Limited Trend Directions
The Trend Analysis logic currently assumes a simplistic "Higher is Worse" or "Lower is Worse" paradigm based on static schemas. More nuanced biomarkers (which might have complex non-linear healthy ranges based on age or gender) require an upgraded clinical evaluation layer.
