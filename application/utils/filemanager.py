import os
from werkzeug.utils import secure_filename
from index import app

def save_file_from_request(request, name, path):
    app.logger.info('Checking the request for the file: {}'.format(request.files))
    app.logger.info(str(request))
    if name not in request.files:
        app.logger.info('Name not in file :(')
        return False
    file = request.files[name]
    if not file or file.filename == '':
        app.logger.info('{} and {}'.format(file, file.filename))
        return False
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], path, filename)
    file.save(file_path)
    return file_path