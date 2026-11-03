import urllib.request
import re

urls = [
  'https://pin.it/712UNlFOi',
  'https://pin.it/1L3uYKniO',
  'https://pin.it/65shWU6fB',
  'https://pin.it/2pHo68lDo',
  'https://pin.it/6FHelVDGo',
  'https://pin.it/2ijGxfSL0',
  'https://pin.it/62COr8jWN',
  'https://pin.it/2jTvgGcNx',
  'https://pin.it/8QfGzdKrO',
  'https://pin.it/36WucbQKe',
  'https://pin.it/3FNdG7RYS',
  'https://pin.it/5AN6ikuLT',
  'https://pin.it/cSB2QdJ1p'
]

req = urllib.request.build_opener()
req.addheaders = [('User-agent', 'Mozilla/5.0')]

for url in urls:
    try:
        response = req.open(url)
        html = response.read().decode('utf-8')
        match = re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', html)
        if not match:
            match = re.search(r'<meta[^>]+content="([^"]+)"[^>]+property="og:image"', html)
        if match:
            print(match.group(1))
        else:
            print("No image found for", url)
    except Exception as e:
        print("Error for", url, str(e))
