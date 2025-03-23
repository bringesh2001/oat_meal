import datetime
from langchain.agents import tool

from chatbot.vectorDB.retrieve_from_vector_db import retrieve_from_vector_db
from chatbot.vectorDB.vector_db_Initialization import get_vector_db


@tool
def get_plant_data(name: str):
    """ Returns the data of specified plant."""
    # Initialize embeddings and vector database
    vector_db = get_vector_db()
    retrieved_query = retrieve_from_vector_db(name, vector_db)

    return retrieved_query