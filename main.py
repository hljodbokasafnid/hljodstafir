from datetime import datetime
from scripts.adjust_smil_files import adjust_smil_files
# from scripts.check_audio_length import check_audio_length
from scripts.check_empty_files import check_empty_files
from scripts.markup import markup
from scripts.clean import clean
from scripts.force_align import force_align
from scripts.remove_clean_files import remove_clean_files
from scripts.remove_files import remove_files
from scripts.extract_epub import extract_epub
from scripts.zip_epub import check_end_file_exists, zip_epub
from scripts.get_package_opf import get_package_opf
from scripts.get_files_from_package_opf import get_files_from_package_opf, check_toc_nav
from scripts.check_folders import check_if_folders_exists
from scripts.check_meta_tags import check_meta_tags
from scripts.aeneas_languages import LANGUAGE_CODE_TO_HUMAN as languages
from scripts.add_parent_highlighting import add_parent_highlighting
from scripts.logger import Logger
from scripts.daisy import handle_daisy_input
from scripts.pdftoepub import handle_pdf_input
from config import Config
import sys

if __name__ == "__main__":
    MP3_MAX_LENGTH = 30
    # Currently if the computer running the script is not a linux machine,
    # the script might stall on audio files longer than 30~ minutes.
    try:
        Config.parse_args(Config, sys.argv)
        Config.upload_folder, Config.output_folder, Config.logs_folder = check_if_folders_exists()
        Config.final_name = check_end_file_exists()
        logger = Logger(
            f'{Config.logs_folder}{Config.final_name}-{datetime.now().strftime("%Y-%m-%d-%H-%M-%S")}.log')
        if Config.language_code.upper() not in languages:
            logger.print_and_flush('WARNING: Language not supported')
        logger.print_and_flush(
            f"Language: {languages[Config.language_code.upper()]}")
        error_has_been_logged = False
        if (Config.ignore_aside):
            logger.print_and_flush(f"Ignoring Aside/Image Text")
        
        if (Config.input_type == "daisy"):
            handle_daisy_input(logger)
            exit()

        if (Config.input_type == "pdf"):
            handle_pdf_input(logger)
            exit()

        extract_epub()
        Config.package_opf, Config.location = get_package_opf(logger)
        logger.print_and_flush(Config.location)
        if not Config.package_opf:
            raise Exception(
                "Could not find package.opf, Not a valid EPUB File.\nPlease fix, refresh and try again.")

        audio_files = get_files_from_package_opf('audio/mpeg')
        if audio_files is None:
            raise Exception("Could not find audio files in package.opf")
        # check if audio files lengths are within allowed range
        # if not allow_longer_mp3:
        #     check_audio_length(MP3_MAX_LENGTH,
        #                        foldername, Config.location, audio_files)
        # check if nav.xhtml exists and if its empty or not
        check_toc_nav()
        # check if package.opf has meta properties that break the book
        check_meta_tags(logger)
        text_files = get_files_from_package_opf('application/xhtml+xml')
        if text_files is None:
            raise Exception("Could not find text files in package.opf")
        smil_files = get_files_from_package_opf('application/smil+xml')
        if smil_files is None:
            raise Exception("Could not find smil files in package.opf")

        logger.print_and_flush(f"Audio Files: {len(audio_files)}")
        logger.print_and_flush(f"Text Files: {len(text_files)}")

        segmentation_correct = len(audio_files) == len(text_files)
        if not segmentation_correct:
            logger.print_and_flush(
                "ERROR: Number of mp3 files and number of text segments do not match.")
            logger.print_and_flush(
                "ERROR: List of found text and audio files can be found in the log file.")
            logger.log(f"Audio Files: \n{audio_files}")
            logger.log(f"Text Files: \n{text_files}")
            error_has_been_logged = True
            raise Exception(
                "Number of mp3 files and number of text segments do not match.")

        # Markup the text files before for sentence level highlighting
        markup(text_files, logger)
        # Create clean text files of everything except the text and markup for aeneas
        cleaned = clean(text_files, logger)
        if (cleaned == False):
            raise Exception("Error occurred while cleaning text files.")
        skip_files = check_empty_files(text_files, audio_files, logger)
        # remove empty files from the list of files to be processed
        text_files = [x for x in text_files if x not in skip_files]
        audio_files = [x for x in audio_files if x not in skip_files]
        # Aeneas force alignment of audio and text
        force_align(audio_files, text_files, logger, Config.location)
        if (Config.adjustment > 0):
            adjust_smil_files(smil_files, logger)
        if Config.parent_highlighting:
            add_parent_highlighting(text_files, logger)
        # Remove clean files after aeneas processes them
        remove_clean_files(logger, Config.location)
        # Zip the epub back up
        zip_epub(logger)
        # Remove the extra files from the server (Doesn't log any exceptions)
        remove_files(logger, False)
        # Notifies the server that the process is complete
        # Waits for extra 1 second to allow all other messages to clear
        logger.print_log_end()
        logger.print_and_flush("DONE", 1)
    except Exception as e:
        remove_files(logger)
        if not error_has_been_logged:
            logger.add_to_log_end(f"ERROR: {e}")
        raise
