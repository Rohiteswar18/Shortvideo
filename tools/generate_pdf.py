#!/usr/bin/env python3
"""
Generate a PDF containing all files in the workspace with filenames and code content.
Creates `all_source_code.pdf` in the workspace root.
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted, PageBreak
from reportlab.lib.units import inch


def collect_files(root):
    exclude_dirs = {'.git', 'node_modules', 'venv', 'env', '__pycache__'}
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        for f in sorted(filenames):
            files.append(os.path.join(dirpath, f))
    return files


def is_binary(path):
    try:
        with open(path, 'rb') as f:
            chunk = f.read(8000)
            if b'\0' in chunk:
                return True
            return False
    except Exception:
        return True


def main():
    root = os.getcwd()
    files = collect_files(root)
    out = os.path.join(root, 'all_source_code.pdf')
    doc = SimpleDocTemplate(out, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    filename_style = ParagraphStyle('Filename', parent=styles['Heading3'])
    code_style = ParagraphStyle('Code', fontName='Courier', fontSize=8, leading=10)
    story = []

    for path in files:
        rel = os.path.relpath(path, root)
        story.append(Paragraph(rel, filename_style))
        try:
            if is_binary(path):
                story.append(Paragraph('(binary file skipped)', styles['Normal']))
            else:
                with open(path, 'r', encoding='utf-8', errors='replace') as f:
                    text = f.read()
                story.append(Preformatted(text, code_style))
        except Exception as e:
            story.append(Paragraph(f'Error reading file: {e}', styles['Normal']))
        story.append(Spacer(1, 0.1 * inch))
        story.append(PageBreak())

    if not story:
        story.append(Paragraph('No files found', styles['Normal']))
    doc.build(story)
    print('Wrote', out)


if __name__ == '__main__':
    main()
