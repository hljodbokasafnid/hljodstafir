import os
from config import Config

def check_if_folders_exists():
    """Creates public/logs and public/output directories if they don't exist"""
    upload_folder = './public/uploads/'
    output_folder = f'./public/output/{Config.userID}/'
    logs_folder = f'./public/logs/{Config.userID}/'
    # check if ./public/logs exists
    if not os.path.exists(logs_folder):
        # create ./public/logs directory
        os.makedirs(logs_folder)
    # check if ./public/output exists
    if not os.path.exists(output_folder):
        # create ./public/output directory
        os.makedirs(output_folder)
    return upload_folder, output_folder, logs_folder
