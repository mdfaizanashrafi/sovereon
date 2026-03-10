#!/usr/bin/env python3
"""
Generate favicon files from source image
"""

from PIL import Image
import os

# Source image path (user uploaded)
source_path = "image.png"
output_dir = "frontend/public"

def generate_favicons():
    """Generate all favicon variants"""
    
    # Open source image
    img = Image.open(source_path)
    
    # Convert to RGBA if needed
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Sizes needed
    favicon_sizes = {
        'favicon-16x16.png': (16, 16),
        'favicon-32x32.png': (32, 32),
        'favicon-48x48.png': (48, 48),
        'apple-touch-icon.png': (180, 180),
        'android-chrome-192x192.png': (192, 192),
        'android-chrome-512x512.png': (512, 512),
        'mstile-150x150.png': (150, 150),
    }
    
    # Generate PNG favicons
    for filename, size in favicon_sizes.items():
        output_path = os.path.join(output_dir, filename)
        resized = img.resize(size, Image.Resampling.LANCZOS)
        
        # For small favicons, we might want to use a simpler version
        # but for now, just resize
        resized.save(output_path, 'PNG', optimize=True)
        print(f"Generated: {filename}")
    
    # Generate ICO file (multi-resolution)
    ico_path = os.path.join(output_dir, 'favicon.ico')
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_images = [img.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
    ico_images[0].save(ico_path, format='ICO', sizes=ico_sizes, optimize=True)
    print(f"Generated: favicon.ico")
    
    # Generate SVG (simplified - just save a reference PNG for now)
    # For a proper SVG, we'd need vector graphics
    
    print("\n✅ All favicon files generated!")
    print(f"Location: {os.path.abspath(output_dir)}")

if __name__ == "__main__":
    if not os.path.exists(source_path):
        print(f"❌ Error: Source image '{source_path}' not found")
        print("Please save the image as 'image.png' in the project root")
        exit(1)
    
    os.makedirs(output_dir, exist_ok=True)
    generate_favicons()
