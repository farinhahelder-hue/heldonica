#!/usr/bin/env python3
"""
Fix corrupted UTF-8 emojis in cms-admin/page.tsx
Corrupted pattern: f0 9f xx yy -> c3 b0 c5 b8 xx yy 
These appear as ð followed by special chars in the file
"""

import re
import sys

def fix_file(filename):
    with open(filename, 'rb') as f:
        data = f.read()
    
    # Fix emoji corruption patterns - this specific pattern
    # Correct UTF-8 emoji: F0 9F xx yy
    # Corrupted: C3 B0 C5 B8 xx yy (5 bytes instead of 4)
    replacements = [
        # Settings emojis
        (b'\xc3\xb0\xc5\xb8\xc2\x8f\xc2\xa0', b'\xf0\x9f\x8f\xa0'),  # 🏠 Line 68
        (b'\xc3\xb0\xc5\xb8\xc2\x8b\xc2\x89', b'\xf0\x9f\x91\x8b'),  # 👋 Line 83
        (b'\xc3\xb0\xc5\xb8\xc2\xa7\xc2\xa3', b'\xf0\x9f\x93\xa7'),  # 📧 Line 93
        (b'\xc3\xb0\xc5\xb8\xc2\xa8\xc2\xa0', b'\xf0\x9f\x8f\xa8'),  # 🏨 Line 105
        (b'\xc3\xb0\xc5\xb8\xc2\xa6\xc2\xa6', b'\xf0\x9f\x93\xa6'),  # 📦 Line 115
        (b'\xc3\xb0\xc5\xb8\xc2\x9c\xc2\xa0', b'\xf0\x9f\x93\x9c'),  # 📂 Line 123
        (b'\xc3\xb0\xc5\xb8\xc2\x84\xc2\x86', b'\xf0\x9f\x93\x84'),  # 📄 Line 131
        (b'\xc3\xb0\xc5\xb8\xc2\xbe\xc2\xb6', b'\xf0\x9f\x92\xbe'),  # 💾 Line 142
        (b'\xc3\xb0\xc5\xb8\xc2\x9d',       b'\xf0\x9f\x93\x9d'),  # 📝 
        # Fix common toast/message emojis
        (b'\xc3\xb0\xc5\xb8\xc2\xa6\xc2\xa6', b'\xf0\x9f\x93\xa6'),  # 📦 
        (b'\xc3\xb0\xc5\xb8\xc2\x9c\xc2\x9d', b'\xf0\x9f\x93\x9d'),  # 📝
        (b'\xc3\xb0\xc5\xb8\xc2\x8f\xc2\x8f', b'\xf0\x9f\x8f\xa0'),  # 🏠
        # Fix double-encoded em-dashes (â€" -> —)  
        (b'\xc3\xa2\xe2\x80\x94', b'\xe2\x80\x94'),  # —
        (b'\xc3\xa2\xe2\x80\x9c', b'\xe2\x80\x9c'),  # "
        (b'\xc3\xa2\xe2\x80\x9d', b'\xe2\x80\x9d'),  # "
    ]
    
    original_size = len(data)
    for old, new in replacements:
        data = data.replace(old, new)
    
    # Write fixed file
    with open(filename, 'wb') as f:
        f.write(data)
    
    return original_size, len(data)

if __name__ == '__main__':
    filename = 'app/cms-admin/page.tsx'
    orig, new = fix_file(filename)
    print(f'Fixed! Original: {orig} bytes, New: {new} bytes')