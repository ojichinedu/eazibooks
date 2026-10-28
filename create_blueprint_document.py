from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape

source = Path(r"C:\Users\HP\.codex\attachments\310fa2ff-0603-4ebb-994e-fb72b5f1e296\Pasted text.txt")
output = Path(r"C:\Users\HP\Downloads\eazibooks-main\Ledger Intelligence for Enterprise Growth and Efficiency - Product Blueprint.docx")
raw = source.read_text(encoding="utf-8-sig")
try:
    content = raw.encode("latin1").decode("utf-8")
except (UnicodeEncodeError, UnicodeDecodeError):
    content = raw

def paragraph(text, style="body", page_break=False):
    escaped = escape(text)
    if style == "title":
        props = '<w:jc w:val="center"/><w:spacing w:before="2200" w:after="200" w:line="240" w:lineRule="auto"/>'
        run = '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="0B2545"/><w:b/><w:sz w:val="48"/></w:rPr>'
    elif style == "subtitle":
        props = '<w:jc w:val="center"/><w:spacing w:after="360" w:line="240" w:lineRule="auto"/>'
        run = '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="2E74B5"/><w:sz w:val="28"/></w:rPr>'
    elif style == "meta":
        props = '<w:jc w:val="center"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/>'
        run = '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="595959"/><w:sz w:val="20"/></w:rPr>'
    elif style == "heading":
        props = '<w:spacing w:before="280" w:after="140" w:line="240" w:lineRule="auto"/><w:keepNext/>'
        run = '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="2E74B5"/><w:b/><w:sz w:val="32"/></w:rPr>'
    else:
        props = '<w:spacing w:after="120" w:line="264" w:lineRule="auto"/>'
        run = '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr>'
    if page_break:
        props += '<w:pageBreakBefore/>'
    return f'<w:p><w:pPr>{props}</w:pPr><w:r>{run}<w:t xml:space="preserve">{escaped}</w:t></w:r></w:p>'

def is_heading(s):
    return ((len(s) > 2 and s[0].isdigit() and s[1] in ". ") or s.startswith(("Phase ", "Project:", "Objective:", "Scope for this phase", "Success criteria", "Engineering notes")))

body = [paragraph("Ledger Intelligence for Enterprise Growth & Efficiency", "title"), paragraph("Full Product Blueprint - v1.0", "subtitle"), paragraph("Parent company: Life is Eazi Global Enterprise", "meta"), paragraph("", "body", True)]
for raw_line in content.splitlines():
    line = raw_line.strip()
    if not line or line.startswith("Ledger Intelligence for Enterprise Growth"):
        continue
    body.append(paragraph(line, "heading" if is_heading(line) else "body"))
body.append('<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr>')

document_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + ''.join(body) + '</w:body></w:document>'
content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>'''
rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>'''
core = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Ledger Intelligence for Enterprise Growth &amp; Efficiency Full Product Blueprint</dc:title><dc:creator>Life is Eazi Global Enterprise</dc:creator></cp:coreProperties>'''
app = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Codex</Application></Properties>'''
with ZipFile(output, 'w', ZIP_DEFLATED) as docx:
    docx.writestr('[Content_Types].xml', content_types)
    docx.writestr('_rels/.rels', rels)
    docx.writestr('word/document.xml', document_xml)
    docx.writestr('docProps/core.xml', core)
    docx.writestr('docProps/app.xml', app)