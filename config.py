from dataclasses import dataclass


@dataclass
class Config:
    userID: str = ''
    upload_folder: str = ''
    output_folder: str = ''
    logs_folder: str = ''
    folder_name: str = ''
    final_name: str = ''
    daisy_book: str = ''
    title: str = ''
    package_opf: str = ''
    location: str = ''
    language_code: str = 'isl'
    ignore_aside: bool = False
    adjustment: int = 100
    parent_highlighting: bool = False
    input_type: str = None
    skip_pagenums: bool = False
    multiple_headers: bool = False

    def parse_args(self, args):
        self.folder_name = args[1]
        self.language_code: str = args[2] if len(args) >= 3 else 'isl'
        self.ignore_aside: bool = args[3] == "true" if len(
            args) >= 4 else False
        self.adjustment: int = int(args[4]) if len(args) >= 5 else 100
        self.parent_highlighting: bool = args[5] == "true" if len(
            args) >= 6 else False
        # allow_longer_mp3 = args[6] == "true" if len(args) >= 7 else False
        if (args[6] == None):
            raise Exception("No userID was provided")
        self.userID: str = args[6] if len(args) >= 7 else None
        self.input_type: str = args[7] if len(args) >= 8 else None
        self.skip_pagenums: str = args[8] == "true" if len(
            args) >= 9 else False
        self.multiple_headers: bool = args[9] == "true" if len(
            args) >= 10 else False
