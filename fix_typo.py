with open('src/pages/Landing.tsx', 'r', encoding='utf-8', errors='surrogateescape') as f:
    content = f.read()

content = content.replace("iinterface FeatureCard {", "interface FeatureCard {")

with open('src/pages/Landing.tsx', 'w', encoding='utf-8', errors='surrogateescape') as f:
    f.write(content)
