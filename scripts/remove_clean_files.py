import shutil
from scripts.logger import Logger
from config import Config

CANT_FIND_FILE = "The system cannot find the file specified"


def remove_clean_files(logger: Logger, location: str):
    """Removes the clean files from the uploads folder."""
    try:
        shutil.rmtree(
            f"{Config.upload_folder}{Config.folder_name}/{location}clean")
    except Exception as e:
        if (CANT_FIND_FILE not in str(e)):
            logger.print_and_flush(
                f"ERROR: Could not remove files in {Config.folder_name}/{location}clean")
