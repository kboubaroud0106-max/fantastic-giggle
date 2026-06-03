import os
import urllib.request
import ssl

def download_file(url, filepath):
    print(f"Downloading {url} to {filepath}...")
    try:
        # Create directories if they do not exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Avoid SSL certificate validation issues on some Windows systems
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(url, context=ctx) as response:
            with open(filepath, 'wb') as out_file:
                out_file.write(response.read())
        print(f"Successfully downloaded {filepath}")
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

if __name__ == "__main__":
    assets = [
        {
            "url": "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js",
            "path": os.path.join("static", "js", "chart.umd.js")
        }
    ]
    
    for asset in assets:
        download_file(asset["url"], asset["path"])
