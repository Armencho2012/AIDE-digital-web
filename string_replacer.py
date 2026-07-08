with open('src/pages/Landing.tsx', 'r', encoding='utf-8', errors='surrogateescape') as f:
    content = f.read()

replacements = {
    'trustedBy: "Aide is trusted by students and professionals at...",\n': '',
    'trustedBy: "Aide를 신뢰하는 학생과 전문가들이 있는 곳",\n': '',
    'trustedBy: "Aide выбирают студенты и специалисты из...",\n': '',
    'trustedBy: "Aide-ին վստահում են ուսանողներն ու մասնագետները",\n': '',
    'ctaSubtitle: "Join the students using Aide to study 5x faster.",': 'ctaSubtitle: "Join the students using Aide to study smarter and remember more.",',
    'ctaSubtitle: "Aide와 함께 5배 더 빠르게 공부하는 학생이 되어보세요.",': 'ctaSubtitle: "더 스마트하게 공부하고 더 많이 기억하는 학생이 되어보세요.",',
    'ctaSubtitle: "Учись в 5 раз быстрее вместе с Aide.",': 'ctaSubtitle: "Учись умнее и запоминай больше с Aide.",',
    'ctaSubtitle: "Սովորիր 5 անգամ ավելի արագ Aide-ի հետ:",': 'ctaSubtitle: "Սովորիր ավելի խելամտորեն և հիշողությունդ բարելավիր Aide-ի հետ:",',
    '{ metric: "Prep Time", aide: "10-15 min setup", traditional: "60-120 min setup" },': '{ metric: "Prep Time", aide: "Fast, focused setup", traditional: "Lengthy manual preparation" },'
}

for old, new in replacements.items():
    content = content.replace(old, new)
    # Also handle possible spaces
    content = content.replace('    ' + old, new if new == '' else '    ' + new)

with open('src/pages/Landing.tsx', 'w', encoding='utf-8', errors='surrogateescape') as f:
    f.write(content)
