from .vector_db_Initialization import get_vector_db

def retrieve_from_vector_db(query: str, vector_store=None):
    """Retrieves relevant documents from the vector database based on the query."""

    if vector_store is None:
        vector_store = get_vector_db()

    retriever = vector_store.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={"k": 2, "score_threshold": 0.5},
    )

    relevant_docs = retriever.invoke(query)

    # print("\n--- Relevant Documents ---")
    # print(f"Number of relevant documents: {len(relevant_docs)}")

    # for i, doc in enumerate(relevant_docs, 1):
    #     print(f"Document {i}:\n{doc.page_content}\n")
    #     if doc.metadata:
    #         print(f"Source: {doc.metadata.get('source', 'Unknown')}\n")

    combined_input = (
            "Here are some documents that might help answer the question: "
            + query
            + "\n\nRelevant Documents:\n"
            + "\n\n".join([doc.page_content for doc in relevant_docs])
            + "\n\nPlease provide an answer based only on the provided documents."
    )
    # print("\n--- combined_input ---")

    # print(combined_input)

    return combined_input