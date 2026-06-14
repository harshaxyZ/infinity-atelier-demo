import os
from PIL import Image

src_image = r"C:\Users\harsh\.gemini\antigravity-ide\brain\048ccc89-c590-463e-b103-41c206afeadd\hero_interior_design_1781422926784.png"
dest_onedrive_hero = r"C:\Users\harsh\OneDrive\Pictures\antigravity\infinity-atelier\assets\hero"
dest_scratch_hero = r"C:\Users\harsh\.gemini\antigravity-ide\scratch\infinity-atelier\assets\hero"

def process_hero():
    if not os.path.exists(src_image):
        print("Error: Source image not found.")
        return

    img = Image.open(src_image)
    
    # Save optimized desktop version (1024x1024)
    print("Saving desktop version...")
    for path in [dest_onedrive_hero, dest_scratch_hero]:
        os.makedirs(path, exist_ok=True)
        img.save(os.path.join(path, "hero_desktop.webp"), format="WEBP", quality=85)
        
    # Save optimized mobile version (800x800)
    print("Saving mobile version...")
    img_mobile = img.resize((800, 800), Image.Resampling.LANCZOS)
    for path in [dest_onedrive_hero, dest_scratch_hero]:
        os.makedirs(path, exist_ok=True)
        img_mobile.save(os.path.join(path, "hero_mobile.webp"), format="WEBP", quality=80)
        
    print("Generated hero images successfully!")

if __name__ == "__main__":
    process_hero()
