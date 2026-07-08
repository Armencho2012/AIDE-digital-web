import re

with open('src/pages/Landing.tsx', 'r', encoding='utf-8', errors='surrogateescape') as f:
    content = f.read()

# 1. Remove trustedLogos array
content = re.sub(r'const trustedLogos = \[.*?\];', '', content, flags=re.DOTALL)

# 2. Remove gpaReviews array
content = re.sub(r'const gpaReviews = \[.*?\];', '', content, flags=re.DOTALL)

# 3. Remove trustedBy lines
content = re.sub(r'\s*trustedBy:\s*".*?",', '', content)

# 4. Remove trusted-logo-marquee section
marquee_regex = r'<section[^>]*>\s*<div[^>]*>\s*<p[^>]*>\s*\{t\.trustedBy\}\s*</p>.*?</div>\s*</section>'
content = re.sub(marquee_regex, '', content, flags=re.DOTALL)
# Alternatively, since it was `<section className="container mx-auto max-w-7xl px-4 pb-14">` right before `how-it-works`:
alt_marquee_regex = r'<section className="container mx-auto max-w-7xl px-4 pb-14">\s*<div\s*data-reveal[^>]*>.*?</div>\s*</section>'
content = re.sub(alt_marquee_regex, '', content, flags=re.DOTALL)

# 5. Remove gpa-reviews section and replace with comment
gpa_regex = r'<section id="gpa-reviews"[^>]*>.*?</section>'
content = re.sub(gpa_regex, '{/* TODO: INSERT REAL TESTIMONIALS HERE — requires verified student data */}', content, flags=re.DOTALL)

# 6. Fix ctaSubtitle
content = content.replace('"Join the students using Aide to study 5x faster."', '"Join the students using Aide to study smarter and remember more."')
content = content.replace('"Aide와 함께 5배 더 빠르게 공부하는 학생이 되어보세요."', '"더 스마트하게 공부하고 더 많이 기억하는 학생이 되어보세요."')
content = content.replace('"Учись в 5 раз быстрее вместе с Aide."', '"Учись умнее и запоминай больше с Aide."')
content = content.replace('"Սովորիր 5 անգամ ավելի արագ Aide-ի հետ:"', '"Սովորիր ավելի խելամտորեն և հիշողությունդ բարելավիր Aide-ի հետ:"')

# 7. Fix comparisonRows[0]
content = content.replace('aide: "10-15 min setup"', 'aide: "Fast, focused setup"')
content = content.replace('traditional: "60-120 min setup"', 'traditional: "Lengthy manual preparation"')

# 8. Import StickyNoteScene
if "StickyNoteScene" not in content:
    import_statement = "import { StickyNoteScene } from '@/components/StickyNoteScene';\n"
    last_import_idx = content.rfind("import ")
    end_of_last_import = content.find(";", last_import_idx) + 1
    content = content[:end_of_last_import] + "\n" + import_statement + content[end_of_last_import:]

# 9. Insert StickyNoteScene after hero section. 
scene_insertion = """
      {/* ===== 3D SCROLL SCENE ===== */}
      <section aria-label="Interactive scroll experience" className="relative">
        <StickyNoteScene />
      </section>

"""
if "StickyNoteScene />" not in content:
    content = content.replace('<section id="how-it-works"', scene_insertion + '      <section id="how-it-works"')


with open('src/pages/Landing.tsx', 'w', encoding='utf-8', errors='surrogateescape') as f:
    f.write(content)
