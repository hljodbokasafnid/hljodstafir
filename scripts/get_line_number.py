def get_line_number(filename, text):
    with open(filename, 'r', encoding='utf8') as f:
        book = f.read()
        for i, line in enumerate(book.splitlines()):
            if text in line:
                return i + 1
        return '?'
