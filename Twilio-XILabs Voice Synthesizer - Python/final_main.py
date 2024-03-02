import logging
import os
import sys
import time
import boto3
import openai
from twilio.rest import Client
from dotenv import load_dotenv
from elevenlabs import generate, set_api_key
from fastapi import FastAPI, Request, WebSocket, HTTPException
from fastapi.responses import Response
from starlette.responses import FileResponse
from twilio.twiml.voice_response import Gather, VoiceResponse
from pyngrok import ngrok
import uvicorn

logging.basicConfig(level=logging.INFO)
load_dotenv()

# Set your API keys
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
TWILIO_ACCOUNT_SID=os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN=os.environ.get('TWILIO_AUTH_TOKEN')

## Constants
DEBUG = True
PORT = 8000
messages =  [   {
                "role": "system",
                "content": "You are an AI assistant that helps people please respond under 50 words."
                }
            ]

## ChatGPT and Twilio Client setup
llm_client = openai.OpenAI(api_key=OPENAI_API_KEY)
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
app = FastAPI()

async def generate_chat_response(conversation_history):
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
    start_time = time.time()
    logging.info("Generating chat response started.")
    chat_completion = llm_client.chat.completions.create(
        messages=conversation_history,
        model="gpt-3.5-turbo",
        max_tokens=200,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        temperature=0.7
    )
    end_time = time.time()
    logging.info(f"Generating chat response completed in {end_time - start_time} seconds.")
    return chat_completion.choices[0].message.content.strip()


@app.post("/start_voice_call")
async def start_voice_call(request: Request):
    """
    Starts a voice call and responds with an initial greeting.

    This endpoint initiates a voice call using Twilio's VoiceResponse. It greets the user with a message, and then listens for a speech input. The function uses Twilio's Polly.Amy voice for the greeting. After greeting, it waits for the user's speech input for further processing.

    Parameters:
    SpeechResult (str): A default parameter for the speech result, which is empty by default.

    Returns:
    Response: A TwiML response in XML format, configuring the call behavior.
    """
    logging.info("Starting voice call.")

    start_time = time.time()
    twiml = VoiceResponse()
    twiml.play("http://18.191.179.55:8000/audio/greeting.mp3") 
    end_time = time.time()
    logging.info(f"Pre recorded greeting Voice {end_time - start_time} seconds.")

    start_time = time.time()
    twiml.gather(
        input='speech',
        action='/continue_call',
        timeout=0.5,
        transcribe=True,
        interruptOnSpeech=True
    )
    end_time = time.time()
    logging.info(f"Text to speech and redirect on continue_call {end_time - start_time} seconds.")

    return Response(content=str(twiml), media_type='text/xml')


@app.post("/continue_call")
async def continue_call(request: Request):
    """
    Continues the voice call by processing user's speech input.

    This endpoint receives the user's speech input from the voice call, transcribes it, and processes it further. It uses the transcribed text to generate a response, and then sends this response back to the user in the form of synthesized speech.

    The function first attempts to retrieve the 'SpeechResult' from the form data of the request. It then processes this speech result, which could involve sending it to a chat model for generating a response. Finally, the function responds with the generated text using Twilio's Polly.Amy voice.

    Parameters:
    request (Request): The request object containing the user's input and other data.

    Returns:
    Response: A TwiML response in XML format to continue the call with the processed response, or an error message in case of exceptions.
    """
    start_time = time.time()
    logging.info("Continuing voice call.")

    form_data = await request.form()

    user_input = form_data.get('SpeechResult')
    logging.info(f"User Input: {user_input}")

    try:
        # Send text to ChatGPT for processing
        # ChatGPT Respond with the text
        twiml = VoiceResponse()
        if user_input:
            messages.append({"role": "user", "content": user_input})
            txt = generate_chat_response(messages)
            messages.append({"role": "assistant", "content": txt})
            logging.info(f"Answer: {txt}")
            
            # Synthesize voice response
            twiml.say(txt)
            
        gather = Gather(input="speech", action="/continue_call", timeout=5)
        twiml.append(gather)
        end_time = time.time()
        logging.info(f"Voice call continued and response generated in {end_time - start_time} seconds.")        
        return Response(content=str(twiml), media_type="text/xml")
    
    except Exception as e:
        # Handle exceptions
        return Response(content=str(e), media_type='text/plain')


if __name__ == "__main__":   
    ## Exposing local app server to public
    public_url = ngrok.connect(PORT, bind_tls=True).public_url
    number = twilio_client.incoming_phone_numbers.list()[0]  ## Fetching the Twilio incoming number  
    number.update(voice_url=public_url + '/start_voice_call') ## Updating Twilio Webhook url
    logging.info(f'Waiting for calls on {number.phone_number}')

    try:
        if sys.argv[1] == "serve":           
            if DEBUG:
                uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
            else:
                uvicorn.run("main:app", host="0.0.0.0", port=PORT, workers=10)
    except IndexError:
        print("No command line args found..")
        print(
            """Command to pass:
        1. serve : to start the server
        """
        )