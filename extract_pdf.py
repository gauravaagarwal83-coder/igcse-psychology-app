import pdfplumber
import json

def extract_pages(pdf_path, start_page, end_page):
    content = {}
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num in range(start_page - 1, min(end_page, len(pdf.pages))):
            page = pdf.pages[page_num]
            text = page.extract_text()
            if text:
                content[f"page_{page_num + 1}"] = text
    
    return content

if __name__ == "__main__":
    pdf_path = "gcse-psych-text-book_compress.pdf"
    content = extract_pages(pdf_path, 3, 27)
    
    with open("extracted_content.json", "w") as f:
        json.dump(content, f, indent=2)
    
    print(f"Extracted {len(content)} pages")
    for page in sorted(content.keys()):
        print(f"{page}: {len(content[page])} characters")