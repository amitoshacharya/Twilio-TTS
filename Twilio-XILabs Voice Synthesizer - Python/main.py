import logging
import os
import sys
import time
import boto3
import openai
from dotenv import load_dotenv
from elevenlabs import generate, set_api_key
from fastapi import FastAPI, Request, WebSocket, HTTPException
from fastapi.responses import Response
from starlette.responses import FileResponse
from twilio.twiml.voice_response import Gather, VoiceResponse

logging.basicConfig(level=logging.INFO)

load_dotenv()
# Set your API keys and endpoints here
# AZURE_SPEECH_KEY = os.environ.get('AZURE_SPEECH_KEY')
# AZURE_SPEECH_ENDPOINT = os.environ.get('AZURE_SPEECH_ENDPOINT')
LABS11_API_KEY = os.environ.get('LABS11_API_KEY')
# AZURE_BLOB_SAS_URL = os.environ.get('AZURE_BLOB_SAS_URL')
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
# aws_access_key_id = os.environ.get('aws_access_key_id')
# aws_secret_access_key = os.environ.get('aws_secret_access_key')
TWILIO_ACCOUNT_SID=os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN=os.environ.get('TWILIO_AUTH_TOKEN')

bucket_name = "11lab-voices"
DEBUG = True

set_api_key(LABS11_API_KEY)

app = FastAPI()

messages = [
    {
        "role": "system",
        "content": "You are an AI assistant that helps people please respond under 50 words."
    }
]

openai.api_key = OPENAI_API_KEY
client = openai.OpenAI(
    api_key=OPENAI_API_KEY
)


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
    start_time = time.time()
    logging.info("Generating chat response started.")
    chat_completion = client.chat.completions.create(
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


def generate_synthesize_voice_audio_upload_to_s3(text, bucket_name):
    """
    Generates synthesized voice audio from text using the ElevenLabs API, saves it as an MP3 file,
    and uploads it to an AWS S3 bucket.

    Args:
    text (str): Text to be converted to speech.
    bucket_name (str): Name of the S3 bucket where the file will be uploaded.

    Returns:
    str: URL of the uploaded MP3 file in the S3 bucket. Returns an error message if upload fails.
    """

    logging.info("Synthesizing voice and uploading to S3 started.")
    start_time = time.time()
    audio = generate(
        voice="Daniel",
        text=text,
        model='eleven_monolingual_v1'
    )
    end_time = time.time()
    logging.info(f"generating audio from text {end_time - start_time} seconds.")

    start_time = time.time()

    filename = "audio_files/voice.mp3"
    with open(filename, "wb") as file:
        file.write(audio)
    end_time = time.time()
    logging.info(f"converting 11lab audio object into mp3 {end_time - start_time} seconds.")

    # Upload to S3
    # try:
    #     start_time = time.time()
    #     s3 = boto3.client('s3', aws_access_key_id=aws_access_key_id, aws_secret_access_key=aws_secret_access_key)
    #     s3.upload_file(filename, bucket_name, filename, ExtraArgs={'ContentType': 'audio/mpeg'})
    #     file_url = f"https://{bucket_name}.s3.amazonaws.com/{filename}"
    #     end_time = time.time()
    #     # logging.info(f"Synthesizing voice and uploading to S3 completed in {end_time - start_time} seconds.")
    #     logging.info(f"uploading to S3 completed in {end_time - start_time} seconds.")
    #     return file_url
    # except Exception as e:
    #     return f"Error uploading to S3: {e}"


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
    logging.info(f"pre recorded greeting Voice {end_time - start_time} seconds.")

    start_time = time.time()
    twiml.gather(
        input='speech',
        action='/continue_call',
        timeout=0.2,
        transcribe=True,
        interruptOnSpeech=True
    )
    end_time = time.time()
    logging.info(f"Text to speach and redirect on continue_call {end_time - start_time} seconds.")

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

    try:
        # Send text to ChatGPT for processing
        # chat_response = get_chatgpt_response(transcribed_text)
        # Respond with the voice file URL or text response
        twiml = VoiceResponse()
        if user_input:
            messages.append({"role": "user", "content": user_input})
            txt = generate_chat_response(messages)
            messages.append({"role": "assistant", "content": txt})
            # Synthesize voice response
            generate_synthesize_voice_audio_upload_to_s3(text=txt,
                                                         bucket_name=bucket_name)
            twiml.play("http://18.191.179.55:8000/audio/voice.mp3")

        gather = Gather(input="speech", action="/continue_call", timeout=2)
        twiml.append(gather)
        end_time = time.time()
        logging.info(f"Voice call continued and response generated in {end_time - start_time} seconds.")
        return Response(content=str(twiml), media_type="text/xml")
    except Exception as e:
        # Handle exceptions
        return Response(content=str(e), media_type='text/plain')


@app.get("/audio/{file_name}")
async def get_audio_file(file_name: str):
    file_path = f'./audio_files/{file_name}'
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)


if __name__ == "__main__":
    import uvicorn
    try:
        if sys.argv[1] == "serve":
            if DEBUG:
                uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
            else:
                uvicorn.run("main:app", host="0.0.0.0", port=8000, workers=10)
    except IndexError:
        print("No command line args found..")
        print(
            """Command to pass:
        1. serve : to start the server
        """
        )
        