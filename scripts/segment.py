import re
import os
from config import Config

# Encode each segment with xml so that icelandic characters dont get distorted
encoding = '<?xml version="1.0" encoding="UTF-8"?>\n'

def suffix(text, number):
    # Convert the number to a string and add leading zeros if necessary
    suffix = str(number).zfill(3)
    return f"{text}{suffix}"


def segment():
    # Takes in the file location and name of the book
    with open(f"{Config.upload_folder}{Config.folder_name}/clean/{Config.daisy_book}", "r", encoding="utf8") as f:
        text = f.read()
    # Split the text at each header
    headers = r'<h1'
    if Config.multiple_headers:
        headers = r'<h1|<h2|<h3'
    segments = re.split(headers, text)

    # If segments and or a directory for the book does not exist create it
    if not os.path.exists(f"{Config.upload_folder}{Config.folder_name}/clean/"):
        os.makedirs(f"{Config.upload_folder}{Config.folder_name}/clean/")

    for i, segment in enumerate(segments[1:]):
        with open(f"{Config.upload_folder}{Config.folder_name}/clean/{suffix('s', i+1) + '.html'}", "w", encoding="utf8") as f:
            # Write each segment into a separate html file for later use
            f.write(encoding + '<h1' + segment)