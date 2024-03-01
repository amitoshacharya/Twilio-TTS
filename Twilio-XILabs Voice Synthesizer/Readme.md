# Twilio-XILabs Voice Synthesizer
This file contains the steps for executing Twilio-XILabs Voice Synthesizer.

## Requirement
- Twilio Account.
- OpenAI or Azure-OpenAI Account.
- ElevenLabs Account.
- Azure Storage Container.
- Node.JS

## Function Creations
- Open [Twilio Console](https://console.twilio.com/us1/develop/sms/overview?frameUrl=%2Fconsole%2Fsms%2Fdashboard%3Fx-target-region%3Dus1).
- From Develop panel, add **Functions and Assets** from **Explore Products**.
- Create New Service and provide name to the Service.
- Inside Created Service, click "**Add +**" to add function.
    - **Note:** Add "`/`" before Function Name.
- Replicate the code.
    - **Note:** Provide the name of the function as used in the scripts.
- Add the Dependencies with below **Modules**:
    - openai
    - @azure/openai
    - axios
    - @azure/storage-blob
    - elevenlabs-node

- Add the Environment Variables with **Keys** and **Values**:
    - ELEVEN_LABS_API_KEY: *secret key for ElevenLabs.*
    - VOICE_ID: *Voice Id of the speaker.*
    - AZURE_BLOB_CONTAINER_NAME: *name of Azure Blob container.*
    - AZURE_STORAGE_CONNECTION_STRING: *connection string for accessing Azure Storage.*
    - When working with **openai** module:
        - OPENAI_API_KEY: *secret key for Open AI.*
    - When working with **@azure/openai** module:
        - AZURE_OPENAI_API_KEY: *secret key for Azure Open AI.*
        - AZURE_OPENAI_ENDPOINT: *endpoint of Azure Open AI.*
        - AZURE_OPENAI_DEPLOYMENT: *deployment name of Azure Open AI.*

## Twilio Active Phone Number Configuration
The below configuration could be access through **# Phone Numbers/Manage** from **Develop Panel**.

- **Verified Caller Id**
    - For trial period, the incoming and outgoing calls is only possible through Verified Caller Ids.

- **Active numbers**
    - Click on phone number.
    - **Voice Configuration**
        - This configuration is to add the entry-point for the voice call.
            - **Configure with**: Webhook, TwiML Bin, Function, Studio Flow, Proxy Service
            - **A call comes in**: *Function_name*
            - **Service**: *Service_Name*
            - **Environment**: ui
            - **Function Path**: *entry_point of voice call.*

## Limitations
- Limited Tokens available in using Twilio Trial Account for Voice Call Service.
- The incoming and outgoing calls is only possible through Verified Caller Ids during trial period.
- Limited Tokens available in using ElevenLabs Trial Account for voice synthesizing.
- Text-To-Speech processing via ElevenLabs takes longer duration for bigger chat responses (response generated via LLM). 
    - Thus, program exceeds 10 seconds.
    - And, automatically terminates with an error message- ***`"runtime application timed out"`***.


## Future Steps
- To remove ***`"runtime application timed out"`***, following are the process:
    - Chunking out the texts. Use LLM chunking methods.
        - [*RecursiveCharacterTextSplitter*](https://python.langchain.com/docs/modules/data_connection/document_transformers/recursive_text_splitter)
        - Explore other methods also.

    - Batch Processing of chunks.

- Implement the same using python.
    