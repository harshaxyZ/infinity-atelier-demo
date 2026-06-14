import os
from PIL import Image

src_dir = r"C:\Users\harsh\OneDrive\Pictures\antigravity\infinity demo\images"
dest_onedrive_hero = r"C:\Users\harsh\OneDrive\Pictures\antigravity\infinity-atelier\assets\hero"
dest_onedrive_proj = r"C:\Users\harsh\OneDrive\Pictures\antigravity\infinity-atelier\assets\projects"
dest_scratch_hero = r"C:\Users\harsh\.gemini\antigravity-ide\scratch\infinity-atelier\assets\hero"
dest_scratch_proj = r"C:\Users\harsh\.gemini\antigravity-ide\scratch\infinity-atelier\assets\projects"

images_to_process = [
    {
        "src": os.path.join(src_dir, "desktop view.png"),
        "dests": [
            os.path.join(dest_onedrive_hero, "hero_desktop.webp"),
            os.path.join(dest_scratch_hero, "hero_desktop.webp")
        ],
        "width": 1920,
        "max_kb": 350
    },
    {
        "src": os.path.join(src_dir, "mobile view.png"),
        "dests": [
            os.path.join(dest_onedrive_hero, "hero_mobile.webp"),
            os.path.join(dest_scratch_hero, "hero_mobile.webp")
        ],
        "width": 1080,
        "max_kb": 250
    },
    {
        "src": os.path.join(src_dir, "before image.png"),
        "dests": [
            os.path.join(dest_onedrive_proj, "before_construction.webp"),
            os.path.join(dest_scratch_proj, "before_construction.webp")
        ],
        "width": 1200,
        "max_kb": 250
    }
]

def compress_img(src_path, dest_paths, target_width, max_kb):
    if not os.path.exists(src_path):
        print(f"Error: {src_path} does not exist.")
        return
        
    img = Image.open(src_path)
    w, h = img.size
    aspect = h / w
    target_height = int(target_width * aspect)
    
    img_resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    # Try webp quality optimization
    quality = 85
    min_quality = 30
    
    while quality >= min_quality:
        # Save temp buffer to check size
        from io import BytesIO
        buffer = BytesIO()
        img_resized.save(buffer, format="WEBP", quality=quality, method=6)
        size_kb = len(buffer.getvalue()) / 1024
        
        if size_kb <= max_kb or quality == min_quality:
            for dest in dest_paths:
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                with open(dest, "wb") as f:
                    f.write(buffer.getvalue())
            print(f"Optimized {os.path.basename(src_path)} -> {size_kb:.1f} KB at quality {quality} (width: {target_width})")
            break
        quality -= 5

for item in images_to_process:
    compress_img(item["src"], item["dests"], item["width"], item["max_kb"])
