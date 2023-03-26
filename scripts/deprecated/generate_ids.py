import re
from bs4 import BeautifulSoup
import random
import string
import shutil

def generate_id(foldername, book):
  # Generates ID's with a prefix for all spans that didn't get a prefix automatically provided to them before
  # REVIEW this may be outdated
  random_prefix = [random.choice(string.ascii_letters).lower() for i in range(3)]
  prefix = "".join(random_prefix)
  with open("././public/uploads/{}/{}".format(foldername, book), "r", encoding="utf8") as f:
    html_doc = f.read()

  soup = BeautifulSoup(html_doc, 'html.parser')

  def is_sentence(css_class):
    return css_class == "sentence"

  def has_no_id(css_id):
    return css_id is None

  # Get all spans that are sentences but have no id and generate an id for that span
  spans = soup.find_all(re.compile("span"), id=has_no_id, class_=is_sentence)
  if spans:
    for i, span in enumerate(spans):
      span['id'] = prefix + '_' + str(i+1).zfill(4)

    # Replaces the Original file
    with open("././public/uploads/{}/{}".format(foldername, book), "w", encoding="utf8") as f:
      f.write(str(soup))