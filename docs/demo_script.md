# ClariMed Demo Script

**Target Duration:** 3-5 Minutes  
**Prerequisites:** Ensure the 3 synthetic PDFs from the `demo/` folder are easily accessible on your desktop.

---

## 0:00 - 0:30 | Problem Statement
**Action:** Show the landing page / Login screen.  
**Talking Points:**
- *"Hello! Today I'm presenting ClariMed, an Explainable Healthcare Copilot."*
- *"When patients receive lab reports, they are often overwhelmed by medical jargon, dense tables, and disconnected PDF files."*
- *"ClariMed solves this by ingesting static PDFs and transforming them into structured, longitudinal health intelligence."*

## 0:30 - 1:30 | Upload Report
**Action:** Log in as `demo@clarimed.app` and navigate to the Upload page. Drag and drop `sample_report_1_baseline.pdf`.  
**Talking Points:**
- *"Let's look at a patient, Sarah Mitchell. She just got her baseline bloodwork in January."*
- *"I'm going to upload her PDF. Notice our pipeline: it doesn't just blindly send this PDF to an AI."*
- *"We prioritize deterministic engineering. The backend extracts the data structurally, validates it against known reference ranges, and flags abnormalities deterministically."*

## 1:30 - 2:30 | Measurements & Interpretation
**Action:** Once the report loads, scroll down to the "Structured Measurements" table.  
**Talking Points:**
- *"Here is the output of the deterministic extraction. We can clearly see her HbA1c is 8.4% and LDL is 165, which our engine has accurately flagged as 'High'."*
- *"Because we parse this structurally first, we completely eliminate the risk of an LLM hallucinating a medical measurement."*

## 2:30 - 3:30 | Evidence-Based Summary
**Action:** Scroll up to the Patient Summary section.  
**Talking Points:**
- *"Now that we have structural ground-truth, ClariMed uses an LLM to generate an Evidence-Based Summary."*
- *"This translates the deterministic findings into an empathetic, easy-to-read overview for Sarah, explaining what her HbA1c and LDL numbers actually mean for her health."*

## 3:30 - 4:30 | Trend Analysis
**Action:** Quickly upload `sample_report_2_followup.pdf` and `sample_report_3_improved.pdf`. Then navigate to the **Trends** tab in the sidebar.  
**Talking Points:**
- *"Single reports only tell half the story. I've uploaded Sarah's subsequent reports from April and July."*
- *"If we go to the Trends tab, ClariMed instantly maps her longitudinal health. We can visually see her HbA1c dropping from 8.4% down to a healthy 6.1%, and her LDL improving significantly."*

## 4:30 - 5:00 | Architecture & Closing
**Action:** Navigate to the **Dashboard** to show the high-level KPIs.  
**Talking Points:**
- *"Finally, our Dashboard gives Sarah a complete overview of her health trajectory."*
- *"Under the hood, this is a Next.js 15 App Router frontend paired with a high-performance FastAPI and PostgreSQL backend."*
- *"To prioritize security, we use strict HttpOnly Cookies to prevent XSS attacks against authentication sessions."*
- *"ClariMed isn't just an AI wrapper; it's a robust, deterministic medical data platform."*
