import openai

OPENAI_API_KEY = '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'


def generate_chat_response(conversation_history):
    """
    Generate a response to a conversation using OpenAI's GPT-4 model.

    This function takes the conversation history as input and uses the OpenAI API to generate a chat response.
    It utilizes the GPT-4 model for generating the response.

    Parameters:
    conversation_history (list of dict): A list of message dictionaries representing the conversation history.
    Each message dictionary should have keys like 'role' (e.g., 'user', 'assistant') and 'content'.

    Returns:
    str: The generated chat response as a string.

    Note: This function requires an API key (OPENAI_API_KEY) for OpenAI services.
    """

    client = openai.OpenAI(
        api_key=OPENAI_API_KEY
    )

    chat_completion = client.chat.completions.create(
        messages=conversation_history,
        model="gpt-4",
        max_tokens=800,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        temperature=0.7,
    )
    return chat_completion.choices[0].message.content.strip()


message =  [
    {
      "role": "system",
      "content": "You are an AI assistant that helps people find information."
    },
    {
      "role": "user",
      "content": "what is the amount for 1146-A Garnet Ave San Diego in october 2022?\n"
    }
  ]
print(generate_chat_response(message))
