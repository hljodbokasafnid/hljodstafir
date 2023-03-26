import os
import shutil
from scripts.logger import Logger
from config import Config

CANT_FIND_FILE = "The system cannot find the file specified"

def remove_files(logger: Logger, log: bool = True, remove_from_temp: bool = False):
  """Removes the files in the uploads folder."""
  # Remove all uploaded/processing files in the folder
  if (Config.input_type == None):
    try:
      shutil.rmtree(f"{Config.upload_folder}{Config.folder_name}")
    except Exception as e:
      if (CANT_FIND_FILE not in str(e) and log):
        logger.print_and_flush(f"ERROR: Could not remove files in {Config.folder_name}")
    try:
      os.remove(f"{Config.upload_folder}{Config.folder_name}.epub")
    except Exception as e:
      if (CANT_FIND_FILE not in str(e) and log):
        logger.print_and_flush(f"ERROR: Could not remove the uploaded version of {Config.folder_name}.epub")
  if (Config.input_type == "daisy"):
    try:
      os.remove(f"{Config.upload_folder}{Config.folder_name}.zip")
    except Exception as e:
      if (CANT_FIND_FILE not in str(e) and log):
        logger.print_and_flush(f"ERROR: Could not remove {Config.folder_name}.zip")
  if (Config.input_type == "pdf"):
    try:
      os.remove(f"{Config.upload_folder}{Config.folder_name}.pdf")
    except Exception as e:
      if (CANT_FIND_FILE not in str(e) and log):
        logger.print_and_flush(f"ERROR: Could not remove {Config.folder_name}.pdf")
  # Remove all files in the temp folder
  if (remove_from_temp):
    try:
      shutil.rmtree(f"{Config.upload_folder}temp/{Config.userID}/{Config.final_name}")
      # if user temp directory empty delete directory
      if (len(os.listdir(f"{Config.upload_folder}temp/{Config.userID}")) == 0):
        os.rmdir(f"{Config.upload_folder}temp/{Config.userID}")
    except Exception as e:
      if (CANT_FIND_FILE not in str(e) and log):
        logger.print_and_flush(f"ERROR: Could not remove files in {Config.final_name}")

if __name__ == "__main__":
  remove_files()