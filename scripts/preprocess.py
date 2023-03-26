# Preprocess the incoming html file to make sure it doesn't have invalid ID's
import sys
import os
import re
from bs4 import BeautifulSoup

from scripts.print_and_flush import print_and_flush

def preprocess(foldername, bookname):
  # In cases where no bookname was given or found and gets returned as null don't run
  if bookname == 'null':
    return
  try:
    print_and_flush("Preprocessing {}".format(bookname))
    # Many html files have unicodes that utf-8 cant handle
    with open("././public/uploads/EPUB/Content/{}/{}.xhtml".format(foldername, bookname), "r", encoding='utf8') as f:
      html_doc = f.read()

    soup = BeautifulSoup(html_doc, 'html.parser')

    def has_invalid_id(css_id):
      pattern = re.compile("[A-z]+ [0-9]+")
      return bool(pattern.match(str(css_id)))

    # images taken in
    original = soup.find_all(re.compile("img"), id=has_invalid_id)

    # replace each id that has space in it with an underscore
    for line in original:
      # if line is found then we have to search for the id in all smil files
      for f in os.listdir("././public/uploads/{}/EPUB/Content/".format(foldername)):
        if f.endswith(".smil"):
          with open("././public/uploads/{}/EPUB/Content/{}".format(foldername, f), "r", encoding='utf8') as cf:
            current_smil = cf.read()
          current_soup = BeautifulSoup(current_smil, 'html.parser')
          current_original = current_soup.find_all(re.compile("text"), id=line['id'])
          if len(current_original) > 0:
            for issue in range(len(current_original)):
              print_and_flush("Replacing {} with {} in {}".format(current_original[issue]['id'], current_original[issue]['id'].replace(" ", "_"), current_smil))
              current_original[issue]['id'] = current_original[issue]['id'].replace(" ", "_")
              current_original[issue]['src'] = current_original[issue]['src'].replace(" ", "_")
            # Replace the original smil file with a preprocessed smil file
            with open("././public/uploads/{}/EPUB/Content/{}".format(foldername, f), "w", encoding='utf8') as cf:
              cf.write(str(current_soup))
      line['id'] = line['id'].replace(" ", "_")
    # Replace the original file with a preprocessed html file
    with open("././public/uploads/{}/EPUB/Content/{}.xhtml".format(foldername, bookname), "w", encoding='utf8') as f:
      f.write(str(soup))
    print_and_flush("Preprocessing complete")
  except Exception as exception:
    print_and_flush("ERROR: {}".format(exception))

preprocess(sys.argv[1], sys.argv[2])