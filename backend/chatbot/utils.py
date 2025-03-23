import os
import time
import logging
from dotenv import load_dotenv
from langchain.agents import create_react_agent, AgentExecutor
from langchain import hub

# Import custom modules
from chatbot.helpers.build_query import build_query
from chatbot.helpers.get_llm_model import get_llm_model
from chatbot.tools.checkTime import get_system_time
from chatbot.tools.get_plant_data import get_plant_data
from chatbot.tools.weather import get_weather



# Load environment variables
load_dotenv()

# Set up logger
logger = logging.getLogger(__name__)

def setup_logging():
    """Configures logging settings."""
    log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../logs')
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, 'query_log.log')
    logging.basicConfig(
        filename=log_file, level=logging.INFO, format='%(asctime)s - %(message)s'
    )


def process_query(query):
    """Process a user query and return a response using RAG architecture with plant database."""
    try:
        logger.info(f"Processing query: {query[:50]}...")
        start_time = time.time()
        
        # Get the LLM model
        llm = get_llm_model()
        logger.info("LLM model initialized")
        
        # Check if query is related to plants/crops
        if any(keyword in query.lower() for keyword in ["plant", "crop", "variety", "species", "grow", "farm", "farming"]):
            logger.info("Plant-related query detected, retrieving relevant data")
            try:
                # Attempt to retrieve plant data using the get_plant_data tool
                plant_data = get_plant_data(query)
                
                # If we have plant data, enhance the query with this information
                if plant_data:
                    # Build an enhanced prompt using RAG approach
                    rag_prompt = f"""
                    Based on the following information from our plant database:
                    {plant_data}
                    
                    Please answer the user's question:
                    {query}
                    """
                    logger.info("Enhanced query with RAG data")
                    response = llm.invoke(rag_prompt)
                else:
                    # Fall back to regular query if no specific plant data found
                    logger.info("No specific plant data found, using standard query")
                    response = llm.invoke(query)
            except Exception as plant_error:
                logger.error(f"Error retrieving plant data: {str(plant_error)}")
                # Fall back to regular query processing
                response = llm.invoke(query)
        else:
            # For non-plant queries, just use the standard flow
            logger.info("Non-plant query, using standard processing")
            response = llm.invoke(query)
        
        # Extract content from the response, depending on the response structure
        if hasattr(response, 'content'):
            result = response.content
        elif isinstance(response, dict) and 'content' in response:
            result = response['content']
        elif isinstance(response, str):
            result = response
        else:
            logger.warning(f"Unexpected response format: {type(response)}")
            result = f"I received your question: {query}. Let me think about that..."
        
        # Log the processing time
        processing_time = time.time() - start_time
        logger.info(f"Query processed in {processing_time:.2f} seconds")
        
        return result
    except Exception as e:
        # Log the error and return a friendly message
        logger.error(f"Error processing query: {str(e)}")
        
        # Provide a more specific error message based on the query
        if "weather" in query.lower():
            return "I'm sorry, I can't access weather information right now. Please try again later."
        elif "plant" in query.lower() or "crop" in query.lower():
            return "I'm sorry, I can't access plant information right now. Please try again later."
        else:
            return "I'm sorry, I encountered an error while processing your request. Please try again later."
