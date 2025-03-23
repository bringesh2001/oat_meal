import os

from chatbot.vectorDB.add_data_to_vector_db import add_data_to_vector_db


def load_data(vDB=None):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    data_path = os.path.join(parent_dir, "data")

    if vDB is None:
        from chatbot.vectorDB.vector_db_Initialization import get_vector_db
        vDB = get_vector_db()

    add_data_to_vector_db(data_path, vDB)