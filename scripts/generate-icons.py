#!/usr/bin/env python3
"""
Script to generate PWA icons from logo
Requires: pip install Pillow
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ Pillow chưa được cài đặt.")
    print("Cài đặt bằng lệnh: pip install Pillow")
    print("Hoặc: pip3 install Pillow")
    sys.exit(1)

# Paths
script_dir = Path(__file__).parent
project_root = script_dir.parent
public_dir = project_root / "public"
logo_path = public_dir / "logo-temp.png"

# Icon sizes
icons = [
    {"name": "icon-192", "size": 192},
    {"name": "icon-512", "size": 512},
    {"name": "apple-touch-icon", "size": 180},
]

def generate_icons():
    if not logo_path.exists():
        print(f"❌ Không tìm thấy logo tại: {logo_path}")
        print("Vui lòng chạy script create-pwa-icons.js trước để download logo")
        return False
    
    print(f"📷 Đang load logo từ: {logo_path}")
    try:
        logo = Image.open(logo_path)
        print(f"✓ Logo size: {logo.size[0]}x{logo.size[1]}")
    except Exception as e:
        print(f"❌ Lỗi khi mở logo: {e}")
        return False
    
    print("\n🔄 Đang tạo các icon...\n")
    
    for icon in icons:
        name = icon["name"]
        size = icon["size"]
        output_path = public_dir / f"{name}.png"
        
        # Create square canvas with white background
        icon_img = Image.new("RGB", (size, size), "white")
        
        # Calculate scaling to fit logo (maintain aspect ratio, centered)
        logo_ratio = logo.width / logo.height
        if logo_ratio > 1:
            # Logo is wider
            new_width = int(size * 0.9)
            new_height = int(new_width / logo_ratio)
        else:
            # Logo is taller
            new_height = int(size * 0.9)
            new_width = int(new_height * logo_ratio)
        
        # Resize logo
        resized_logo = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Center logo on canvas
        x = (size - new_width) // 2
        y = (size - new_height) // 2
        
        # Paste logo (handle transparency if exists)
        if resized_logo.mode == "RGBA":
            icon_img.paste(resized_logo, (x, y), resized_logo)
        else:
            icon_img.paste(resized_logo, (x, y))
        
        # Save icon
        icon_img.save(output_path, "PNG", optimize=True)
        print(f"✓ Đã tạo {name}.png ({size}x{size})")
    
    print("\n✅ Hoàn thành! Các icon đã được tạo trong thư mục public/")
    return True

if __name__ == "__main__":
    if not public_dir.exists():
        public_dir.mkdir(parents=True, exist_ok=True)
    
    success = generate_icons()
    sys.exit(0 if success else 1)

