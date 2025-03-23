import axios from 'axios';
import { AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_VERSION } from '../config';

const API_URL = process.env.REACT_APP_API_URL;

export const sendChatMessage = async (message) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, { message });
    return response.data; // Return the response from the backend
  } catch (error) {
    console.error("Error sending message:", error);
    throw error; // Rethrow the error for handling in the component
  }
};

// Define getChatHistory
export const getChatHistory = async () => {
  // Implement the logic to fetch chat history from your backend
  // For example:
  const response = await axios.get(`${AZURE_OPENAI_ENDPOINT}/v1/chat/history`, {
    headers: {
      'api-key': AZURE_OPENAI_API_KEY,
    },
  });
  return response.data; // Return the chat history
};
