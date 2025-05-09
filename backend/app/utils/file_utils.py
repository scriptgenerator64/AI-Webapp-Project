import os
import mimetypes
from datetime import datetime

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 
    'ppt', 'pptx', 'csv', 'json', 'xml'
}

def allowed_file(filename):
    """Check if file has an allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_metadata(file_path, content_type):
    """Extract metadata from file"""
    metadata = {
        'content_type': content_type,
        'extension': os.path.splitext(file_path)[1][1:].lower(),
        'last_modified': datetime.utcnow().isoformat()
    }
    
    # Get file stats
    stats = os.stat(file_path)
    metadata['size_bytes'] = stats.st_size
    metadata['created'] = datetime.fromtimestamp(stats.st_ctime).isoformat()
    
    return metadata
