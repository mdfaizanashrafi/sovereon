#!/usr/bin/env python3
"""
Favicon Generator Script
Generates all favicon variants from source image

Usage:
1. Save your uploaded image as 'favicon-source.png' in project root
2. Run: python generate-favicons.py
"""

from PIL import Image, ImageDraw
import os

SOURCE_IMAGE = "favicon-source.png"
OUTPUT_DIR = "frontend/public"

def create_placeholder_favicon():
    """Create a placeholder favicon with Sovereon branding"""
    size = 512
    # Purple gradient background (Sovereon brand color)
    img = Image.new('RGBA', (size, size), (139, 92, 246, 255))
    
    draw = ImageDraw.Draw(img)
    center_x, center_y = size // 2, size // 2
    white = (255, 255, 255, 255)
    
    # Draw brain hemispheres (simplified shapes)
    # Left hemisphere
    draw.ellipse([center_x - 120, center_y - 100, center_x - 20, center_y + 100], 
                 fill=None, outline=white, width=20)
    # Right hemisphere  
    draw.ellipse([center_x + 20, center_y - 100, center_x + 120, center_y + 100], 
                 fill=None, outline=white, width=20)
    
    # Connecting arc
    draw.arc([center_x - 70, center_y - 70, center_x + 70, center_y + 70], 
             start=0, end=180, fill=white, width=15)
    
    return img

def generate_favicons():
    """Generate all favicon variants"""
    
    if os.path.exists(SOURCE_IMAGE):
        print("Loading source image: {}".format(SOURCE_IMAGE))
        img = Image.open(SOURCE_IMAGE)
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
    else:
        print("Source image not found: {}".format(SOURCE_IMAGE))
        print("Creating placeholder favicon with Sovereon branding...")
        img = create_placeholder_favicon()
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Generate different sizes
    favicons = {
        'favicon-16x16.png': (16, 16),
        'favicon-32x32.png': (32, 32),
        'favicon-48x48.png': (48, 48),
        'apple-touch-icon.png': (180, 180),
        'android-chrome-192x192.png': (192, 192),
        'android-chrome-512x512.png': (512, 512),
        'mstile-150x150.png': (150, 150),
    }
    
    for filename, size in favicons.items():
        output_path = os.path.join(OUTPUT_DIR, filename)
        resized = img.resize(size, Image.Resampling.LANCZOS)
        resized.save(output_path, 'PNG', optimize=True)
        print("  + {}".format(filename))
    
    # Generate ICO file
    ico_path = os.path.join(OUTPUT_DIR, 'favicon.ico')
    ico_img = img.resize((32, 32), Image.Resampling.LANCZOS)
    ico_img.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print("  + favicon.ico")
    
    print("\nDone! Favicons generated in: {}".format(os.path.abspath(OUTPUT_DIR)))

if __name__ == "__main__":
    generate_favicons()
