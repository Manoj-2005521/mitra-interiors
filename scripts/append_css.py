import os

css_additions = """
/* UI/UX Enhancements: Magic Line Navigation */
.nav-links li > a {
  position: relative;
  text-decoration: none;
}
.nav-links li > a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--gold);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.4s var(--ease);
}
.nav-links li > a:hover::after,
.nav-links li > a[aria-current="page"]::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* UI/UX Enhancements: Filter Button Magic Line */
.filters .filter-btn {
  position: relative;
}
.filters .filter-btn::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--forest-deep);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s var(--ease);
}
.filters .filter-btn.active::after {
  transform: scaleX(1);
}
"""

with open('src/style.css', 'a', encoding='utf-8') as f:
    f.write(css_additions)

print("Appended UI enhancements to style.css")
