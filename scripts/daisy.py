from __future__ import unicode_literals, print_function
from scripts.logger import Logger
from scripts.remove_files import remove_files
from config import Config
from os import listdir
from os.path import isfile, join
from scripts.clean import clean
from scripts.markup import markup
from scripts.segment import segment
from scripts.force_align import force_align
from scripts.remove_clean_files import remove_clean_files
from scripts.zip_daisy import zip_daisy
from scripts.adjust_smil_files import adjust_smil_files
import re
from shutil import unpack_archive

def handle_daisy_input(logger: Logger):
    """Handle the Daisy 2.02 input"""
    def get_mp3_files():
        """Get the mp3 files from the upload folder"""
        return [f for f in listdir(f"{Config.upload_folder}{Config.folder_name}") if isfile(join(f"{Config.upload_folder}{Config.folder_name}", f)) and f.endswith(".mp3") and not 'daisy-online-sample' in f]

    def get_daisy_html_file():
        """Get the daisy html file from the upload folder"""
        text_files = [f for f in listdir(f"{Config.upload_folder}{Config.folder_name}") if isfile(join(f"{Config.upload_folder}{Config.folder_name}", f)) and (
            f.endswith('.html') or f.endswith('.xhtml')) and not (f.startswith('ncc') or f.startswith('toc') or f.startswith('nav'))]
        if len(text_files) == 0:
            logger.print_and_flush(
                f'ERROR: No html or xhtml file found in {Config.final_name}')
            return False
        if len(text_files) > 1:
            logger.print_and_flush(
                f'ERROR: More than one possible content html or xhtml file found in {Config.final_name}')
            return False
        text_file = text_files[0]
        print(f'Found text file: {text_file}')
        return text_file

    def fix_daisy_smil_file_references():
        """Fix the daisy smil file references"""
        smil_files = [f for f in listdir(f"{Config.upload_folder}{Config.folder_name}") if isfile(
            join(f"{Config.upload_folder}{Config.folder_name}", f)) and f.endswith(".smil")]
        for smil in smil_files:
            smil_nr = smil.split('.')[0]
            with open(f"{Config.upload_folder}{Config.folder_name}/{smil}", "r", encoding="utf-8") as f:
                smil_content = f.read()
            smil_content = smil_content.replace(
                f"{smil_nr}.html", Config.daisy_book)
            with open(f"{Config.upload_folder}{Config.folder_name}/{smil}", "w", encoding="utf-8") as f:
                f.write(smil_content)
        return smil_files

    try:
        # unpack archive with shutil (utf-8 filenames might be a problem)
        unpack_archive(f"{Config.upload_folder}{Config.folder_name}.zip", f"{Config.upload_folder}{Config.folder_name}", "zip")
        # Only include the mp3 files and sort for linux env
        
        # Check if there's an extra directory in the zip file
        inner_files = listdir(f"{Config.upload_folder}{Config.folder_name}")
        if len(inner_files) == 1:
            Config.folder_name = f"{Config.folder_name}/{inner_files[0]}"

        mp3files = get_mp3_files()
        mp3files.sort()

        Config.daisy_book = get_daisy_html_file()
        logger.print_and_flush(f"Processing {Config.daisy_book}..")
        markup([Config.daisy_book], logger)
        logger.print_and_flush(f"Cleaning {Config.daisy_book}..")
        clean([Config.daisy_book], logger)
        logger.print_and_flush(f"Segmenting {Config.daisy_book}..")
        segment()

        # starts with s + 3 numbers regex
        s3regex = re.compile(r"^s\d{3}")

        segments = [f for f in listdir(f"{Config.upload_folder}{Config.folder_name}/clean/") if isfile(join(
            f"{Config.upload_folder}{Config.folder_name}/clean/", f)) and s3regex.search(f) and f.endswith(".html")]
        segments.sort()

        logger.print_and_flush(
            f"Number of mp3 files and text segments (h1) in the book need to be equal.")
        logger.print_and_flush(f"Number of text segments: {len(segments)}")
        logger.print_and_flush(f"Number of mp3 files: {len(mp3files)}")
        if len(segments) != len(mp3files):
            raise Exception("Number of mp3 files and text segments (h1) are not equal.")

        logger.print_and_flush("Processing forced alignment..")
        force_align(
            audio_files=mp3files,
            text_files=segments,
            location="",
            logger=logger
        )

        logger.print_and_flush("Fixing references..")
        smil_files = fix_daisy_smil_file_references()
        if (Config.adjustment > 0):
            adjust_smil_files(smil_files, logger)
        # clean up and zip the daisy book
        logger.print_and_flush("Zipping the daisy book..")
        remove_clean_files(logger=logger, location="")
        zip_daisy(logger)
        # Remove the extra files from the server (Doesn't log any exceptions)
        remove_files(logger, False)
        # Notifies the server that the process is complete
        # Waits for extra 1 second to allow all other messages to clear
        logger.print_log_end()
        logger.print_and_flush("DONE", 1)
    except Exception as e:
        remove_files(logger)
        logger.add_to_log_end(f"ERROR: {e}")
        raise


if __name__ == "__main__":
    handle_daisy_input()
