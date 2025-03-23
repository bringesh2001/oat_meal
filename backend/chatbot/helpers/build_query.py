from langchain_core.prompts import PromptTemplate

from chatbot.helpers.get_llm_model import get_llm_model

from nltk.corpus import wordnet



def build_query(query):
    llm = get_llm_model()

    prompt_template = PromptTemplate.from_template(
        "user has provided the following query: {input}\n"
        "if inside the query you find that it need to get data of the city then please add the following line to the query: use the data provide by 'get_weather tool' "
        "if inside the query you find that it need to get data of the plant then please add the following line to the query: use the data provide by 'get_plant_data tool' providing plant name "
        "also format the query to make it more precises and clear also make it short while make the context of the query same"
        "give output in plain text in para style"

    )
    query = llm.invoke(prompt_template.format(input=query))
    return query.content
    