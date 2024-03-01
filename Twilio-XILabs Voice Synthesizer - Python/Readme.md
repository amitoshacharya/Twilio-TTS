# ProjectHollywood
Multi-Modal LLM using visual + audio feeds 


## Description
This FastAPI Voice Assistant application integrates with Twilio for voice calls and uses OpenAI's GPT-4 for generating
conversational responses.
The project is designed to provide a seamless and interactive voice response experience for various applications.

## Prerequisites

Before you begin, ensure you have the following:

- Python 3.8 or higher
- A Twilio account with a configured phone number
- An OpenAI API key

## Installation

### Clone the Repository

Clone the project to your local machine:

```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```

### Set Up a Virtual Environment

Create a virtual environment for project dependencies:

```bash
# For Windows
python -m venv venv
.\venv\Scripts\activate

# For Unix or MacOS
python3 -m venv venv
source venv/bin/activate
```

### Install Dependencies

Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Configuration

Create a \`.env\` file in the root of your project and set your environment variables:

```plaintext
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_ENDPOINT=your_azure_speech_endpoint
OPENAI_API_KEY=your_openai_api_key
```

## Running the Application

To start the FastAPI server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Usage

Once the server is running, access it at \`http://localhost:8000\`. Use the following endpoints:

- `\start_voice_call` to initiate a voice call
- `\continue_call` to continue the conversation

For API documentation, visit \`http://localhost:8000/docs\`.

## Contributing

Contributions are welcome. Please ensure you follow the project's contribution guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

```angular2html
rm ~/.docker/config.json
```