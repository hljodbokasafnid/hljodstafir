import fitz
import json
import os
import sys
import shutil
from datetime import datetime
from config import Config
from scripts.logger import Logger
from scripts.remove_files import remove_files
from scripts.zip_epub import zip_epub

XHTML_START = f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:nordic="http://www.mtm.se/epub/" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="{Config.language_code}" lang="{Config.language_code}" epub:prefix="z3998: http://www.daisy.org/z3998/2012/vocab/structure/#">"""

XHTML_END = """
</html>"""


def bit_to_font_style(bit: int) -> str:
    """
        # bit 0: superscripted (2^0) 0 – not a font property, detected by MuPDF code. (default is 0 so will default to normal not superscripted)
        # bit 1: italic (2^1) 2
        # bit 2: serifed (2^2) 4
        # bit 3: monospaced (2^3) 8
        # bit 4: bold (2^4) 16
    """
    font_styles = {
        0: 'normal',
        2: 'italic',
        4: 'serifed',
        8: 'monospaced',
        16: 'bold'
    }
    if bit not in font_styles:
        return 'normal'
    return font_styles[bit]


def assume_text_type(size: float) -> str:
    if size >= 16:  # ? assuming anything bigger than 16 is a heading 1
        return 'h1'
    elif size >= 14:  # ? assuming anything bigger than 14 is a heading 2
        return 'h2'
    elif size >= 12:  # ? assuming anything bigger than 12 is a heading 3
        return 'h3'
    return 'p'  # ? anything smaller than 16 is a paragraph


def generate_book_head(book_title: str, filename: str):
    nav_head = f"""<head>
        <meta charset="UTF-8"/>
        <title>{book_title}</title>
        <meta name="dc:identifier" content="{filename}"/>
        <meta name="dc:viewport" content="width=device-width"/>
        <link rel="stylesheet" type="text/css" href="css/HBS_stylesheet.css"/>
    </head>"""
    return nav_head


def generate_nav(pdf_dict: dict, book_title: str, filename: str, destination: str) -> None:
    content = ""
    page_list = ""
    last_heading_type = None
    last_book_split = 0
    for key, value in pdf_dict.items():
        if value['type'] == 'h1' or value['type'] == 'h2' or value['type'] == 'h3':
            if value['type'] == 'h1':
                last_book_split += 1
                suffix = str(last_book_split).zfill(3)
                if (last_heading_type == 'h1'):  # √
                    content += f"""</li>
                    <li><a href="{filename}-{suffix}.xhtml#{value['id']}">{value['text']}</a>"""
                elif (last_heading_type == 'h2'):  # √
                    content += f"""</li>
                    </ol>
                    </li>
                    <li><a href="{filename}-{suffix}.xhtml#{value['id']}">{value['text']}</a>"""
                else:  # None # √
                    content += f"""<li><a href="{filename}-{suffix}.xhtml#{value['id']}">{value['text']}</a>"""
            if value['type'] == 'h2':
                if (last_heading_type == 'h1'):  # √
                    content += f"""<ol class="list-style-type-none" style="list-style-type: none;">
                        <li><a href="{filename}-{suffix}.xhtml#{value['id']}">{value['text']}</a>"""
                elif (last_heading_type == 'h2'):  # √
                    content += f"""</li>
                    <li><a href="{filename}-{suffix}.xhtml#{value['id']}">{value['text']}</a>"""
            last_heading_type = value['type']
        elif value['type'] == 'div':
            suffix = str(last_book_split).zfill(3)
            page_list += f"""<li><a href="{filename}-{suffix}.xhtml#page-{value['page']}">{value['page']}</a></li>"""
    if last_heading_type == 'h1':
        content += f"</li>"
    if last_heading_type == 'h2':
        content += f"""</li>
        </ol>
        </li>"""
    nav_xhtml = f"""{XHTML_START}
    {generate_book_head(book_title, filename)}
    <body>
        <nav epub:type="toc" id="toc">
            <h1>Contents</h1>
            <ol class="list-style-type-none" style="list-style-type: none;">
            {content}
            </ol>
        </nav>
        <nav epub:type="page-list" hidden="">
        <ol class="list-style-type-none" style="list-style-type: none;">
        {page_list}
        </ol>
        </nav>
    </body>
    {XHTML_END}"""
    with open(f'{destination}/EPUB/nav.xhtml', 'w', encoding='utf-8') as f:
        f.write(nav_xhtml)


def write_chapter_to_file(content: str, book_title: str, filename: str, chapter_counter: int, written_file_paths: list, destination: str) -> list:
    # chapter_soup = BeautifulSoup(content.rstrip(), 'html5lib')
    # pretty_chapter = chapter_soup.prettify()
    confirmed_files = written_file_paths
    chapter = f"""{XHTML_START}
    {generate_book_head(book_title, filename)}
        <body epub:type="chapter" id="chapter_{2}">
            {content}
        </body>
    {XHTML_END}"""

    suffix = str(chapter_counter).zfill(3)
    with open(f'{destination}/EPUB/{filename}-{suffix}.xhtml', 'w', encoding='utf-8') as f:
        f.write(chapter)
    confirmed_files.append(f'{filename}-{suffix}.xhtml')
    return confirmed_files


def generate_book_chapters(pdf_dict: dict, book_title: str, filename: str, destination: str) -> list:
    content = ""
    chapter_counter = 0
    written_file_paths = []
    for key, value in pdf_dict.items():
        if value['type'] == 'h1':
            # new chapter
            if content != "":
                written_file_paths = write_chapter_to_file(
                    content, book_title, filename, chapter_counter, written_file_paths, destination)
                content = ""  # reset content

            chapter_counter += 1
            content += f"""<h1 id="{value['id']}">{value['text']}</h1>\n"""
        elif value['type'] == 'h2':
            content += f"""<h2 id="{value['id']}">{value['text']}</h2>\n"""
        elif value['type'] == 'h3':
            content += f"""<h3 id="{value['id']}">{value['text']}</h3>\n"""
        elif value['type'] == 'p':
            content += f"""<p>{value['text']}</p>\n"""
        elif value['type'] == 'div' and Config.skip_pagenums == False:
            content += f"""<div class="{value['class']}" epub:type="{value['epub:type']}" id="page-{value['page']}" title="{value['title']}" />\n"""
    written_file_paths = write_chapter_to_file(
        content, book_title, filename, chapter_counter, written_file_paths, destination)
    return written_file_paths


def generate_package_opf(book_title: str, filename: str, content_file_names: list, destination: str, creator: str = "xxxxx", lang: str = "is") -> None:
    today = datetime.today().strftime('%Y-%m-%d')
    timestamp = datetime.today().strftime('%Y-%m-%dT%H:%M:%SZ')

    opf_start = f"""<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" prefix="nordic: http://www.mtm.se/epub/" unique-identifier="pub-identifier" version="3.0">
\t<metadata>
    <dc:title xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dtb="http://www.daisy.org/z3986/2005/dtbook/" xmlns:d="http://www.daisy.org/ns/pipeline/data">{book_title}</dc:title>
    <dc:identifier id="pub-identifier">{filename}</dc:identifier>
    <dc:language xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dtb="http://www.daisy.org/z3986/2005/dtbook/" xmlns:d="http://www.daisy.org/ns/pipeline/data" id="language_1">{lang}</dc:language>
    <dc:format xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dtb="http://www.daisy.org/z3986/2005/dtbook/" xmlns:d="http://www.daisy.org/ns/pipeline/data" id="format">EPUB3</dc:format>
    <dc:creator xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dtb="http://www.daisy.org/z3986/2005/dtbook/" xmlns:d="http://www.daisy.org/ns/pipeline/data" id="creator_1">{creator}</dc:creator>
    <dc:date xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dtb="http://www.daisy.org/z3986/2005/dtbook/" xmlns:d="http://www.daisy.org/ns/pipeline/data" id="date_1">{today}</dc:date>
    <dc:publisher xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dtb="http://www.daisy.org/z3986/2005/dtbook/" xmlns:d="http://www.daisy.org/ns/pipeline/data" id="publisher_1">HBS</dc:publisher>
    <dc:source>urn:isbn:0</dc:source>
    <meta property="dcterms:modified">{timestamp}</meta>
    <meta content="{timestamp}" name="dcterms:modified"/>
    <meta xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dtb="http://www.daisy.org/z3986/2005/dtbook/" xmlns:d="http://www.daisy.org/ns/pipeline/data" property="nordic:guidelines">2015-1</meta>
    <meta content="2015-1" name="nordic:guidelines"/>
    <meta xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dtb="http://www.daisy.org/z3986/2005/dtbook/" xmlns:d="http://www.daisy.org/ns/pipeline/data" property="nordic:supplier">AEL Data</meta>
    <meta content="AEL Data" name="nordic:supplier"/>
    <meta name="cover" content="cover-image"/>
\t</metadata>"""
    opf_manifest = f"""
\t<manifest>
    <item id="css_1" media-type="text/css" href="css/HBS_stylesheet.css" />
    <item id="nav" media-type="application/xhtml+xml" href="nav.xhtml" properties="nav" />"""
    opf_spine = f"""
\t<spine>"""
    for num, file_name in enumerate(content_file_names):
        opf_manifest += f"""\n\t\t<item id="item_{num + 1}" media-type="application/xhtml+xml" href="{file_name}" />"""
        opf_spine += f"""\n\t\t<itemref idref="item_{num + 1}" />"""
    opf_manifest += f"""\n\t</manifest>"""
    opf_spine += f"""\n\t</spine>"""
    opf_end = f"""</package>"""
    opf_content = f"""{opf_start}
    {opf_manifest}
    {opf_spine}
{opf_end}
    """
    with open(f'{destination}/EPUB/package.opf', 'w') as f:
        f.write(opf_content.rstrip())


def pdf_to_dict(pdf_path: str) -> dict:
    doc = fitz.open(pdf_path)
    num_of_pages = doc.pageCount
    clean_dict = {}

    counter = 0
    h1_counter = 1
    h2_counter = 1
    h3_counter = 1
    for page_number in range(num_of_pages):
        page = doc.loadPage(page_number)
        page_dict = page.getText("dict")
        for i, item in enumerate(page_dict['blocks']):
            if item.get('lines') is None:
                if item.get('image') is not None:
                    continue
                    print(f'image found on page {page_number}')
                    # with open(f'./test_files/{page_number}.png', 'wb') as f:
                    #     f.write(item['image'])
            elif item.get('lines') is not None:
                text = ''
                for line in item['lines']:
                    text_type = assume_text_type(line['spans'][0]['size'])
                    text_size = round(line['spans'][0]['size'], 1)
                    text_font = line['spans'][0]['font']
                    text_font_style = bit_to_font_style(
                        line['spans'][0]['flags'])
                    if text != '':
                        text += ' '
                    for span in line['spans']:
                        text += span['text']
                if text != ' ' and text != '':
                    clean_dict[counter] = {
                        'type': text_type,
                        'size': text_size,
                        'text': text,
                        'font': text_font,
                        'font-style': text_font_style,
                    }
                    if text_type == 'h1':
                        clean_dict[counter]['id'] = f'h1_{h1_counter}'
                        h1_counter += 1
                    elif text_type == 'h2':
                        clean_dict[counter]['id'] = f'h2_{h2_counter}'
                        h2_counter += 1
                    elif text_type == 'h3':
                        clean_dict[counter]['id'] = f'h3_{h3_counter}'
                        h3_counter += 1
                    counter += 1
        clean_dict[counter] = {
            'type': 'div',
            'class': 'page-normal',
            'page': page_number + 1,
            'title': page_number + 1,
            'epub:type': 'pagebreak',
        }
        counter += 1
    return clean_dict


def copy_epub_structure(folder_path: str) -> None:
    # copy file and folders from constants/EPUB_structure to folder_path
    for item in os.listdir('./constants/EPUB_structure'):
        try:
            if os.path.isfile(f'./constants/EPUB_structure/{item}'):
                shutil.copy(f'./constants/EPUB_structure/{item}',
                            f'{folder_path}/{item}')
            elif os.path.isdir(f'./constants/EPUB_structure/{item}'):
                shutil.copytree(f'./constants/EPUB_structure/{item}',
                                f'{folder_path}/{item}')
        except Exception as e:
            if (e.args[0] == 17):
                print(f'Directory {item} already exists')


def handle_pdf_input(logger: Logger):
    try:
        pdf = f"{Config.upload_folder}{Config.folder_name}.pdf"  # pdf file path
        filename = Config.final_name  # dc:identifier
        # temp_destination folder
        temp_destination = f"{Config.upload_folder}temp/{Config.userID}/{Config.final_name}/"

        copy_epub_structure(temp_destination)
        logger.print_and_flush('Processing PDF...')
        pdf_dict = pdf_to_dict(pdf)

        # set title of book
        try:
            Config.title = pdf_dict[0]['text']
            logger.print_and_flush(f'Title of book set to: {Config.title}')
        except:
            logger.print_and_flush('Could not find title of book')
            Config.title = 'xxxxx'

        logger.print_and_flush('Generating EPUB...')
        if (Config.skip_pagenums == True):
            logger.print_and_flush('Skipping PDF page breaks...')
        generate_nav(pdf_dict, Config.title, filename, temp_destination)
        content_file_names = generate_book_chapters(
            pdf_dict, Config.title, filename, temp_destination)
        generate_package_opf(Config.title, filename, content_file_names,
                            temp_destination, lang=Config.language_code)

        # zip epub
        logger.print_and_flush('Zipping EPUB...')
        zip_epub(logger, root_dir=temp_destination)

        remove_files(logger, False, remove_from_temp=True)

        logger.print_log_end()
        logger.print_and_flush("DONE", 1)
        # dict to json for debugging
        # with open('./test_files/newfile.json', "w", encoding='utf-8') as f:
        #     json.dump(pdf_dict, f, ensure_ascii=False, indent=4)
    except Exception as e:
        remove_files(logger, True, remove_from_temp=True)
        logger.add_to_log_end(f"ERROR: {e}")
        raise
