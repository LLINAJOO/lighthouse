#!/usr/bin/env python3
"""Build one self-contained HTML file (fonts, styles and scripts inlined) from index.html.
Usage: python3 tools/build_single.py [output]   (default: dist/lighthouse.html)"""
import base64, os, re, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, 'dist', 'lighthouse.html')
html = open(os.path.join(root, 'index.html'), encoding='utf-8').read()

def inline_css(m):
    path = os.path.join(root, m.group(1))
    css = open(path, encoding='utf-8').read()
    def font(fm):
        data = open(os.path.join(os.path.dirname(path), fm.group(1)), 'rb').read()
        return 'url(data:font/woff2;base64,' + base64.b64encode(data).decode() + ')'
    css = re.sub(r'url\("([^"]+\.woff2)"\)', font, css)
    return '<style>\n' + css + '</style>'

def inline_js(m):
    return '<script>\n' + open(os.path.join(root, m.group(1)), encoding='utf-8').read() + '</script>'

html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', inline_css, html)
html = re.sub(r'<script src="(js/[^"]+)"></script>', inline_js, html)
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w', encoding='utf-8').write(html)
print('built', out, len(html) // 1024, 'KB')
