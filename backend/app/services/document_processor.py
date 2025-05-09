import threading
import logging
from flask import current_app
from app import db
from app.models import Document, Chunk
from app.utils.text_extraction import extract_text_from_file
from app.utils.text_chunking import chunk_text
from app.services.embedding_service import get_embedding

logger = logging.getLogger(__name__)

def process_document_async(document_id):
    """Process document asynchronously"""
    thread = threading.Thread(target=process_document, args=(document_id,))
    thread.daemon = True
    thread.start()
    return thread

def process_document(document_id):
    """Process document: extract text, chunk it, and generate embeddings"""
    with current_app.app_context():
        try:
            # Get document
            document = Document.query.get(document_id)
            if not document:
                logger.error(f"Document {document_id} not found")
                return
            
            # Update status
            document.embedding_status = "processing"
            db.session.commit()
            
            # Extract text
            logger.info(f"Extracting text from document {document_id}: {document.name}")
            text = extract_text_from_file(document.file_path)
            
            if not text:
                logger.warning(f"No text extracted from document {document_id}")
                document.embedding_status = "failed"
                document.text_content = ""
                db.session.commit()
                return
            
            # Save extracted text
            document.text_content = text
            db.session.commit()
            
            # Chunk text
            logger.info(f"Chunking text from document {document_id}")
            chunks = chunk_text(
                text, 
                chunk_size=current_app.config.get('CHUNK_SIZE', 1000),
                chunk_overlap=current_app.config.get('CHUNK_OVERLAP', 200)
            )
            
            # Process chunks
            for i, chunk_text in enumerate(chunks):
                # Create chunk
                chunk = Chunk(
                    document_id=document_id,
                    chunk_index=i,
                    text=chunk_text
                )
                db.session.add(chunk)
            
            db.session.commit()
            
            # Generate embeddings for each chunk
            chunks = Chunk.query.filter_by(document_id=document_id).all()
            for chunk in chunks:
                try:
                    embedding = get_embedding(chunk.text)
                    chunk.set_embedding(embedding)
                    db.session.commit()
                except Exception as e:
                    logger.error(f"Error generating embedding for chunk {chunk.id}: {str(e)}")
            
            # Update status
            document.embedding_status = "completed"
            db.session.commit()
            
            logger.info(f"Document {document_id} processed successfully")
            
        except Exception as e:
            logger.error(f"Error processing document {document_id}: {str(e)}")
            try:
                document = Document.query.get(document_id)
                if document:
                    document.embedding_status = "failed"
                    db.session.commit()
            except:
                pass
