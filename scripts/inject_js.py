import re

with open('src/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Enhance Before/After Slider handle
slider_css = """
.ba-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  background-color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ew-resize;
  box-shadow: 0 0 0 8px rgba(255,255,255,0.2), var(--shadow-card);
  z-index: 10;
  transition: box-shadow 0.3s var(--ease);
}
.ba-handle:hover, .ba-handle:focus {
  box-shadow: 0 0 0 16px rgba(255,255,255,0.3), var(--shadow-luxe);
  outline: none;
}
.ba-handle .knob {
  color: var(--forest-deep);
  font-size: 20px;
  pointer-events: none;
}
"""
css = re.sub(r'\.ba-handle\s*{[^}]*}\s*\.ba-handle\s\.knob\s*{[^}]*}', slider_css.strip(), css)

with open('src/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Update app.js
with open('src/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

init_js = """
  // Initialize Smooth Scrolling (Lenis)
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Initialize 3D Tilt (Vanilla-Tilt)
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll(".m-item, .b-card"), {
      max: 5,
      speed: 400,
      glare: true,
      "max-glare": 0.15,
      scale: 1.02
    });
  }
"""

# Append to DOMContentLoaded
js = re.sub(r'document\.addEventListener\(\'DOMContentLoaded\', \(\) => {', "document.addEventListener('DOMContentLoaded', () => {\n" + init_js, js)

with open('src/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated style.css and app.js for slider and JS libs")
