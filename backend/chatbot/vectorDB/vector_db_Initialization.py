import os
from typing import Optional
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_core.embeddings import Embeddings

from chatbot.vectorDB.add_data_to_vector_db import add_data_to_vector_db

# Load environment variables
load_dotenv()

db: Optional[Chroma] = None

def is_vector_db_initialized(persistent_directory: str) -> bool:
    """Checks if the Chroma vector database is initialized."""
    return os.path.exists(persistent_directory) and bool(os.listdir(persistent_directory))


def initialize_vector_db(persistent_directory: str, embedding_model: Embeddings) -> Chroma:
    """Initializes the Chroma vector database if it does not already exist."""
    global db

    if is_vector_db_initialized(persistent_directory):
        db = Chroma(persist_directory=persistent_directory, embedding_function=embedding_model)
        print("Chroma vector database already exists. Loading existing database...")

    else:
        os.makedirs(persistent_directory, exist_ok=True)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        data_path = os.path.join(parent_dir, "data")
        db = Chroma(persist_directory=persistent_directory, embedding_function=embedding_model)
        add_data_to_vector_db(data_path, db)
        print(f"Created persistent directory: {persistent_directory}")


    print("Vector database initialized.")
    return db


def get_vector_db(persistent_directory: Optional[str] = None, embedding_model: Optional[Embeddings] = None) -> Chroma:
    """Retrieves or initializes the Chroma vector database."""
    global db

    if db is None:
        if persistent_directory is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            parent_dir = os.path.abspath(os.path.join(current_dir, os.pardir))
            persistent_directory = os.path.join(parent_dir, "db", "chroma")

        if embedding_model is None:
            from chatbot.helpers.get_embeddings_model import get_embeddings_model
            embedding_model = get_embeddings_model()

        db = initialize_vector_db(persistent_directory, embedding_model)


    print("Vector database ready.")
    return db
