import re
import os

with open('src/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Remove @font-face rules
css = re.sub(r'@font-face\s*{[^}]*}\s*', '', css)

# 2. Update typography variables
css = re.sub(r"--font-display:.*?;\n", "--font-display: 'Playfair Display', serif;\n", css)
css = re.sub(r"--font-heading:.*?;\n", "--font-heading: 'Playfair Display', serif;\n", css)
css = re.sub(r"--font-body:.*?;\n", "--font-body: 'DM Sans', sans-serif;\n", css)
css = re.sub(r"--font-ui:.*?;\n", "--font-ui: 'DM Sans', sans-serif;\n", css)

# 3. Update slate color
css = re.sub(r"--slate: #635C51;.*?$", "--slate: #4F4941; /* Darkened for better contrast */", css, flags=re.MULTILINE)

# 4. Enhance .btn-gold
btn_gold_replacement = """
.btn-gold {
  background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 50%, var(--gold-warm) 100%);
  color: var(--forest-deep);
  border: none;
  box-shadow: var(--shadow-glow-gold);
}
.btn-gold:hover {
  background: linear-gradient(135deg, var(--white) 0%, var(--gold-light) 50%, var(--gold) 100%);
  transform: translateY(-2px);
  box-shadow: 0 16px 40px -8px rgba(213, 205, 191, 0.4);
}
"""
css = re.sub(r'\.btn-gold\s*{[^}]*}\s*\.btn-gold:hover\s*{[^}]*}', btn_gold_replacement.strip(), css)

# 5. Staggered mobile menu
# Find mobile menu a tags
mobile_menu_css = """
.mobile-menu a {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 500;
  text-decoration: none;
  color: var(--dark);
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  opacity: 0;
  transform: translateY(20px);
}
.mobile-menu.active a {
  opacity: 1;
  transform: translateY(0);
}
.mobile-menu.active a:nth-child(2) { transition-delay: 0.1s; }
.mobile-menu.active a:nth-child(3) { transition-delay: 0.15s; }
.mobile-menu.active a:nth-child(4) { transition-delay: 0.2s; }
.mobile-menu.active a:nth-child(5) { transition-delay: 0.25s; }
.mobile-menu.active a:nth-child(6) { transition-delay: 0.3s; }
.mobile-menu.active a:nth-child(7) { transition-delay: 0.35s; }
.mobile-menu.active a:nth-child(8) { transition-delay: 0.4s; }
"""
# Replace the existing .mobile-menu a
css = re.sub(r'\.mobile-menu a\s*{[^}]*}', mobile_menu_css.strip(), css)

# 6. Add prefers-reduced-motion at the end
reduced_motion = """
/* Accessibility: Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
"""
if "prefers-reduced-motion" not in css:
    css += "\n" + reduced_motion

# 7. Add lenis smooth scrolling core styles
lenis_css = """
html.lenis, html.lenis body {
  height: auto;
}
.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}
.lenis.lenis-smooth [data-scroll-container] {
  will-change: transform;
}
.lenis.lenis-stopped {
  overflow: hidden;
}
.lenis.lenis-scrolling iframe {
  pointer-events: none;
}
"""
if "html.lenis" not in css:
    css += "\n" + lenis_css

with open('src/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Updated style.css")
