# Landing Page Content Audit

This document records the audit of all numeric claims, trust claims, partner logos, testimonials, and review scores on the Aide landing page, in accordance with the specified Content Audit Procedure.

## Scanned Copy & Component Items

### 1. Trusted Universities Bar
- **Original Content**:
  - Heading: "Aide is trusted by students and professionals at..." (with translations for RU, HY, KO).
  - Logos: List of 16 university logos (Harvard, Princeton, Columbia, Cornell, Stanford, MIT, UC Berkeley, Caltech, UChicago, University of California, McGill, University of Washington, Yale, University of Maryland, University of Oxford, University of Cambridge).
- **Classification**: `unverified_or_false`
- **Action**: Remove the university logos array (`trustedLogos`), the marquee tracker component, and the section entirely.
- **Reason**: Prohibited by Constraint 1 (no named university/institution logos or "trusted by" university claims).

### 2. Student Scale Metric
- **Original Content**:
  - Heading: "Trusted by 1,000,000+ students" (in GPA reviews section).
- **Classification**: `unverified_or_false`
- **Action**: Remove the section heading or replace with a generic placeholder/omit. We will omit the scale claim and replace the section with a placeholder for real metrics or testimonials.
- **Reason**: Explicitly prohibited by Constraint 1 ("Trusted by 1,000,000+ students").

### 3. Fictional GPA Reviews & Testimonials
- **Original Content**:
  - List of 6 student testimonials with GPA numbers:
    - Amelia, Pre-Med: "2.8 -> 3.7"
    - Daniel, Engineering: "3.0 -> 3.8"
    - Sofia, Economics: "3.1 -> 3.9"
    - Arman, Computer Science: "2.9 -> 3.8"
    - Mina, Law: "3.2 -> 3.9"
    - Leo, Biology: "2.7 -> 3.6"
- **Classification**: `unverified_or_false`
- **Action**: Omit the GPA reviews marquee and cards entirely from the landing page. Leave a clearly marked code placeholder for future real testimonials.
- **Reason**: Prohibited by Constraints 1 & 2 (no fictional testimonials or GPA numbers).

### 4. CTA Performance Statistic
- **Original Content**:
  - `ctaSubtitle`: "Join the students using Aide to study 5x faster." (with translations for RU, HY, KO: "5배 더 빠르게", "в 5 раз быстрее", "5 անգամ ավելի արագ").
- **Classification**: `unverified_or_false`
- **Action**: Tone down the copy to focus on qualitative speed improvement, e.g., "Join the students using Aide to study faster and remember more."
- **Reason**: The "5x faster" statistic is not backed by real, provided research data (Constraint 1).

### 5. Workflow Speed Comparison Table
- **Original Content**:
  - `comparisonRows` showing "10-15 min setup" vs "60-120 min setup" for Prep Time.
- **Classification**: `placeholder_needed` / `unverified_or_false`
- **Action**: Change the numbers to qualitative estimates, e.g., "Minutes to set up" vs "Hours of preparation", to keep the comparison helpful without inventing false statistics.
- **Reason**: The specific time numbers are generalized estimates and not verified data.

---

## Retained and Verified Copy Elements (Factual Capabilities)

1. **"Daily Free Analysis" Badge** (`freeBadge`): Kept. This matches the actual product tier system.
2. **"4 Languages" Badge** (`langBadge`): Kept. The platform supports English, Russian, Armenian, and Korean in its UI.
3. **"PDF + Image + Voice" Ingestion Badge** (`uploadBadge`): Kept. These represent actual system features (PDF upload, OCR, and voice transcript integration).
4. **"24/7 AI Tutor" / "Neural Map" / "AI Podcasts" Feature Lists**: Kept. These correspond to active application screens and components in the app path.
