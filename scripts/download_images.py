import os
import re
import urllib.request
import urllib.parse
import hashlib

def download_and_replace():
    import glob
    files_to_check = glob.glob('src/*.njk')
    image_dir = 'images/external'
    os.makedirs(image_dir, exist_ok=True)

    img_regex = re.compile(r'https://(images\.unsplash\.com|i\.pinimg\.com)[^\s"\'\?]+(?:\?[^\s"\']*)?')

    req = urllib.request.build_opener()
    req.addheaders = [('User-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')]
    urllib.request.install_opener(req)

    for filename in files_to_check:
        if not os.path.exists(filename):
            continue
        print(f"Processing {filename}...")
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        matches = list(re.finditer(r'(https://(images\.unsplash\.com|i\.pinimg\.com)[^\s"\'\>]+)', content))
        unique_urls = set(m.group(1) for m in matches)
        replacements = {}

        for url in unique_urls:
            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            ext = '.jpg'
            if '.png' in url:
                ext = '.png'
            elif '.webp' in url:
                ext = '.webp'
            
            local_filename = f"ext_{url_hash}{ext}"
            local_path = os.path.join(image_dir, local_filename)

            if not os.path.exists(local_path):
                print(f"Downloading {url} -> {local_path}")
                try:
                    urllib.request.urlretrieve(url, local_path)
                except Exception as e:
                    print(f"Failed to download {url}: {e}")
                    continue
            else:
                print(f"Already downloaded {local_filename}")

            replacements[url] = local_path.replace('\\', '/')

        for url, local_path in replacements.items():
            content = content.replace(url, local_path)

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")

if __name__ == "__main__":
    download_and_replace()
