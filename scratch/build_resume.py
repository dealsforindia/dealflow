from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader

out=Path('output/pdf'); out.mkdir(parents=True,exist_ok=True)
pdf=out/'Rudranil_Saha_Resume.pdf'
c=canvas.Canvas(str(pdf),pagesize=(595.28,841.89))
c.setTitle('Rudranil Saha - Resume')
navy=HexColor('#17324D'); grey=HexColor('#435368')
c.setFillColor(navy); c.rect(0,831,595.28,11,fill=1,stroke=0)
c.setFont('Helvetica-Bold',27); c.drawString(43,781,'Rudranil Saha')
c.setFillColor(grey); c.setFont('Helvetica',10)
for y,t in [(759,'Kolkata, West Bengal'),(742,'rudranil202@gmail.com  |  +91 74394 52072'),(725,'github.com/dealsforindia')]:c.drawString(43,y,t)
c.linkURL('mailto:rudranil202@gmail.com',(43,739,173,751))
c.linkURL('https://github.com/dealsforindia',(43,721,205,735))
c.drawImage(ImageReader('E:/RS/PHOTO.jpg'),464,715,width=83,height=112,preserveAspectRatio=True,mask='auto')
style=ParagraphStyle('body',fontName='Helvetica',fontSize=10.5,leading=15,textColor=grey)
y=687
def text(s,space=10):
 global y
 p=Paragraph(s,style);w,h=p.wrap(509,700);p.drawOn(c,43,y-h);y-=h+space
def heading(s):
 global y
 c.setFillColor(navy);c.setFont('Helvetica-Bold',11);c.drawString(43,y,s.upper());y-=9
 c.setStrokeColor(HexColor('#D9E2EC'));c.line(43,y,552,y);y-=16
heading('Profile')
text('Mathematics Honours student with basic programming knowledge and practical experience developing an AI-assisted web project. Seeking a frontend trainee internship with mentorship, code review and small, clearly defined responsibilities.',18)
heading('Education')
text('<b>Dinabandhu Andrews College | University of Calcutta</b><br/>Mathematics Honours<br/>Expected graduation: June 2028',18)
heading('Project Experience')
text('<b>IndiaDealHunts | Deal-discovery website</b><br/>June 2026 - Present | <link href="https://www.indiadealhunts.me/" color="#17324D">www.indiadealhunts.me</link> | Private source code',8)
for s in ['Used AI coding tools to develop and iterate on a website featuring product listings, search, offer details and locally saved bookmarks.','Identified usability issues involving product imagery, mobile readability and offer presentation; communicated problems through screenshots and feedback to guide revisions.']:
 text('&#8226; '+s,7)
text('<b>Project environment:</b> React, TypeScript, Vite and Tailwind CSS.<br/>Implementation substantially assisted by AI coding tools.',18)
heading('Skills')
text('<b>Programming foundations:</b> Basic programming knowledge; currently practising JavaScript functions, loops and arrays.',8)
text('<b>Website usability:</b> Identifying readability and navigation issues; communicating problems through screenshots and written feedback.',8)
text('<b>AI-assisted development:</b> Exploring ideas, generating implementation drafts and iterating on a web project with AI coding tools.',18)
heading('Areas of Interest')
text('Frontend development | Website usability | Supervised web testing')
assert y>40,y
c.save()
doc=PdfReader(pdf);assert len(doc.pages)==1
print(str(pdf.resolve()),'pages:',len(doc.pages),'bottom:',y)
