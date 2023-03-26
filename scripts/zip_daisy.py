from fileinput import filename
import os
import shutil
import sys

from scripts.logger import Logger
from config import Config


def zip_daisy(logger: Logger):
    """Zips the epub file and moves it to the output folder."""
    try:
        shutil.make_archive(f'{Config.upload_folder}{Config.folder_name}',
                            'zip', f'{Config.upload_folder}{Config.folder_name}')
        # rename the zip file to the original epub file name and move the file to the output folder
        os.rename(f'{Config.upload_folder}{Config.folder_name}.zip',
                  f'{Config.output_folder}{Config.final_name}.zip')
    except Exception as e:
        logger.print_and_flush(f"ERROR: {e}")