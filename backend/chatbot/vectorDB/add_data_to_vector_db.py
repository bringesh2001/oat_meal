import os
from dotenv import load_dotenv
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import CSVLoader

# Load environment variables
load_dotenv()


def add_data_to_vector_db(data_path, vector_db):
    """Adds data from CSV files in the specified path to the vector database."""

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"The data directory {data_path} does not exist. Please check the path.")

    # Load documents from CSV files
    csv_files = [f for f in os.listdir(data_path) if f.endswith(".csv")]
    documents = []

    for csv_file in csv_files:
        loader = CSVLoader(os.path.join(data_path, csv_file))
        for doc in loader.load():
            doc.metadata = {"source": csv_file}
            documents.append(doc)

    # Split documents into chunks
    text_splitter = CharacterTextSplitter(chunk_size=2000, chunk_overlap=100)
    doc_chunks = text_splitter.split_documents(documents)

    print(f"\n--- Document Chunks Information ---\nNumber of document chunks: {len(doc_chunks)}")

    # Add documents to the vector database
    print("\n--- Adding data to vector database ---")
    vector_db.add_documents(doc_chunks)
    print("\n--- Finished adding data to vector database ---")
