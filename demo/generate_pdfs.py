import os
from fpdf import FPDF

def generate_pdf(filename, patient_name, date, biomarkers):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Header
    pdf.cell(200, 10, txt="ClariMed Laboratories", ln=True, align='C')
    pdf.cell(200, 10, txt=f"Patient Name: {patient_name}", ln=True, align='L')
    pdf.cell(200, 10, txt=f"Date: {date}", ln=True, align='L')
    pdf.cell(200, 10, txt="-"*50, ln=True, align='L')
    
    # Biomarkers
    pdf.cell(200, 10, txt="TEST NAME       VALUE   UNIT      REFERENCE RANGE", ln=True, align='L')
    for b in biomarkers:
        line = f"{b['name']:<15} {b['value']:<7} {b['unit']:<9} {b['ref']}"
        pdf.cell(200, 10, txt=line, ln=True, align='L')
        
    pdf.output(filename)

if __name__ == "__main__":
    os.makedirs("demo", exist_ok=True)
    patient = "Sarah Mitchell"
    
    # Report 1 (Baseline)
    generate_pdf(
        "demo/sample_report_1_baseline.pdf",
        patient,
        "January 15, 2026",
        [
            {"name": "HbA1c", "value": "8.4", "unit": "%", "ref": "4.0 - 5.6"},
            {"name": "LDL", "value": "165", "unit": "mg/dL", "ref": "0 - 99"},
            {"name": "HDL", "value": "38", "unit": "mg/dL", "ref": "40 - 60"},
            {"name": "Hemoglobin", "value": "11.2", "unit": "g/dL", "ref": "12.0 - 15.5"}
        ]
    )
    
    # Report 2 (Follow-up)
    generate_pdf(
        "demo/sample_report_2_followup.pdf",
        patient,
        "April 20, 2026",
        [
            {"name": "HbA1c", "value": "7.2", "unit": "%", "ref": "4.0 - 5.6"},
            {"name": "LDL", "value": "145", "unit": "mg/dL", "ref": "0 - 99"},
            {"name": "HDL", "value": "42", "unit": "mg/dL", "ref": "40 - 60"},
            {"name": "Hemoglobin", "value": "12.0", "unit": "g/dL", "ref": "12.0 - 15.5"}
        ]
    )

    # Report 3 (Improved)
    generate_pdf(
        "demo/sample_report_3_improved.pdf",
        patient,
        "July 10, 2026",
        [
            {"name": "HbA1c", "value": "6.1", "unit": "%", "ref": "4.0 - 5.6"},
            {"name": "LDL", "value": "118", "unit": "mg/dL", "ref": "0 - 99"},
            {"name": "HDL", "value": "51", "unit": "mg/dL", "ref": "40 - 60"},
            {"name": "Hemoglobin", "value": "13.4", "unit": "g/dL", "ref": "12.0 - 15.5"}
        ]
    )
    print("Demo PDFs generated successfully in demo/ directory.")
