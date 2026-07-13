"""
EduNaija Certificate Generator
Generates professional PDF certificates using ReportLab.
"""
import io
from datetime import datetime
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfgen import canvas


def generate_certificate(certificate):
    """
    Generate a PDF certificate and return as bytes.
    """
    buffer = io.BytesIO()
    width, height = landscape(A4)

    c = canvas.Canvas(buffer, pagesize=landscape(A4))

    # Background color
    c.setFillColor(colors.HexColor('#FAFAFA'))
    c.rect(0, 0, width, height, fill=True, stroke=False)

    # Outer border
    c.setStrokeColor(colors.HexColor('#1a1a2e'))
    c.setLineWidth(8)
    c.rect(20, 20, width - 40, height - 40, fill=False, stroke=True)

    # Inner border
    c.setStrokeColor(colors.HexColor('#e94560'))
    c.setLineWidth(2)
    c.rect(30, 30, width - 60, height - 60, fill=False, stroke=True)

    # Header — EduNaija
    c.setFillColor(colors.HexColor('#1a1a2e'))
    c.setFont('Helvetica-Bold', 36)
    c.drawCentredString(width / 2, height - 100, 'EduNaija')

    c.setFont('Helvetica', 14)
    c.setFillColor(colors.HexColor('#e94560'))
    c.drawCentredString(width / 2, height - 125, 'Nigerian Learning Management System')

    # Decorative line
    c.setStrokeColor(colors.HexColor('#e94560'))
    c.setLineWidth(1.5)
    c.line(100, height - 140, width - 100, height - 140)

    # Certificate of Completion
    c.setFillColor(colors.HexColor('#1a1a2e'))
    c.setFont('Helvetica-Bold', 28)
    c.drawCentredString(width / 2, height - 190, 'Certificate of Completion')

    # This is to certify
    c.setFont('Helvetica', 16)
    c.setFillColor(colors.HexColor('#444444'))
    c.drawCentredString(width / 2, height - 230, 'This is to certify that')

    # Student name
    student_name = certificate.student.get_full_name() or certificate.student.username
    c.setFont('Helvetica-Bold', 32)
    c.setFillColor(colors.HexColor('#e94560'))
    c.drawCentredString(width / 2, height - 275, student_name)

    # Underline student name
    name_width = c.stringWidth(student_name, 'Helvetica-Bold', 32)
    c.setStrokeColor(colors.HexColor('#e94560'))
    c.setLineWidth(1)
    c.line(
        width / 2 - name_width / 2,
        height - 282,
        width / 2 + name_width / 2,
        height - 282
    )

    # Has successfully completed
    c.setFont('Helvetica', 16)
    c.setFillColor(colors.HexColor('#444444'))
    c.drawCentredString(width / 2, height - 315, 'has successfully completed the course')

    # Course title
    course_title = certificate.course.title
    c.setFont('Helvetica-Bold', 22)
    c.setFillColor(colors.HexColor('#1a1a2e'))
    c.drawCentredString(width / 2, height - 355, f'"{course_title}"')

    # Date and certificate number
    issued_date = certificate.issued_at.strftime('%B %d, %Y')

    c.setFont('Helvetica', 12)
    c.setFillColor(colors.HexColor('#666666'))
    c.drawCentredString(width / 2, height - 400, f'Issued on: {issued_date}')
    c.drawCentredString(
        width / 2, height - 420,
        f'Certificate ID: {certificate.certificate_number}'
    )

    # Decorative line before signatures
    c.setStrokeColor(colors.HexColor('#1a1a2e'))
    c.setLineWidth(0.5)
    c.line(100, height - 445, width - 100, height - 445)

    # Instructor signature line
    instructor_name = certificate.course.instructor.get_full_name() or \
                      certificate.course.instructor.username

    c.setFont('Helvetica-Bold', 12)
    c.setFillColor(colors.HexColor('#1a1a2e'))
    c.drawCentredString(width / 4, height - 470, instructor_name)

    c.setFont('Helvetica', 10)
    c.setFillColor(colors.HexColor('#666666'))
    c.drawCentredString(width / 4, height - 485, 'Course Instructor')

    # EduNaija signature line
    c.setFont('Helvetica-Bold', 12)
    c.setFillColor(colors.HexColor('#1a1a2e'))
    c.drawCentredString(3 * width / 4, height - 470, 'EduNaija')

    c.setFont('Helvetica', 10)
    c.setFillColor(colors.HexColor('#666666'))
    c.drawCentredString(3 * width / 4, height - 485, 'Learning Platform')

    # Signature lines
    c.setStrokeColor(colors.HexColor('#1a1a2e'))
    c.setLineWidth(0.5)
    c.line(width / 4 - 80, height - 460, width / 4 + 80, height - 460)
    c.line(3 * width / 4 - 80, height - 460, 3 * width / 4 + 80, height - 460)

    c.save()
    buffer.seek(0)
    return buffer.getvalue()