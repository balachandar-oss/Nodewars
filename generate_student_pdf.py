import csv
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf(csv_path, pdf_path):
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#002B49'),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#4A5568'),
        spaceAfter=12
    )

    notice_style = ParagraphStyle(
        'NoticeStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#718096'),
        spaceAfter=14
    )

    th_style = ParagraphStyle(
        'ThStyle',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=1
    )

    td_style = ParagraphStyle(
        'TdStyle',
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#1A202C'),
        alignment=1
    )

    td_mono = ParagraphStyle(
        'TdMono',
        fontName='Courier-Bold',
        fontSize=9.5,
        leading=11,
        textColor=colors.HexColor('#0D3880'),
        alignment=1
    )

    td_pwd = ParagraphStyle(
        'TdPwd',
        fontName='Courier-Bold',
        fontSize=9.5,
        leading=11,
        textColor=colors.HexColor('#C53030'),
        alignment=1
    )

    elements = []
    
    elements.append(Paragraph("NODE WARS // NODE LAB SEMINAR", title_style))
    elements.append(Paragraph("Student Access Passwords & Credentials List (Admin Excluded)", subtitle_style))
    elements.append(Paragraph("CONFIDENTIAL — For Seminar Participant Distribution Only. Exactly 49 Students. Absent: Roll 01, Roll 40.", notice_style))

    # Read students from CSV
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cleaned_row = {k.strip(): (v.strip() if v else '') for k, v in row.items() if k}
            if cleaned_row.get('Role') != 'ADMIN':
                rows.append(cleaned_row)

    # Sort by Roll No integer
    rows.sort(key=lambda x: int(x['Roll No']))

    # Column layout with Team field
    table_data = [
        [
            Paragraph("Roll", th_style),
            Paragraph("Login ID", th_style),
            Paragraph("Name", th_style),
            Paragraph("Team", th_style),
            Paragraph("Class", th_style),
            Paragraph("Password", th_style)
        ]
    ]

    for s in rows:
        table_data.append([
            Paragraph(f"#{s['Roll No']}", td_style),
            Paragraph(s['Login ID'], td_mono),
            Paragraph(s.get('Name', ''), td_style),
            Paragraph(s.get('Team', ''), td_style),
            Paragraph(s.get('Classification', ''), td_style),
            Paragraph(s['Initial Password'], td_pwd)
        ])

    # Table styling and widths (total ~ 540)
    t = Table(table_data, colWidths=[35, 140, 75, 80, 60, 150])
    
    t_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1A365D')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E0')),
    ])

    # Alternate row colors
    for r_idx in range(1, len(table_data)):
        bg = colors.HexColor('#F7FAFC') if r_idx % 2 == 0 else colors.white
        t_style.add('BACKGROUND', (0, r_idx), (-1, r_idx), bg)

    t.setStyle(t_style)
    elements.append(t)

    doc.build(elements)
    print(f"PDF successfully generated at: {pdf_path} (Total students: {len(rows)})")

if __name__ == '__main__':
    csv_file = r"c:\Users\Balachandar A\Downloads\node-wars\node lab\seminar-credentials.csv"
    pdf_file = r"c:\Users\Balachandar A\Downloads\node-wars\node lab\student-logins.pdf"
    generate_pdf(csv_file, pdf_file)
