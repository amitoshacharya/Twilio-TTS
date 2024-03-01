# Twilio-SMS
This file contains the steps for executing Twilio-SMS.

## Requirements
- Twilio Account.
- OpenAI or Azure-OpenAI Account.
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

- Add the Environment Variables with **Keys** and **Values**:
    - When working with **openai** module:
        - OPENAI_API_KEY: *secret key for Open AI.*
    - When working with **@azure/openai** module:
        - AZURE_OPENAI_API_KEY: *secret key for Azure Open AI.*
        - AZURE_OPENAI_ENDPOINT: *endpoint of Azure Open AI.*
        - AZURE_OPENAI_DEPLOYMENT: *deployment name of Azure Open AI.*

## Twilio Active Phone Number Configuration
The below configuration could be access through **# Phone Numbers/Manage** from **Develop Panel**.

- **`A2P 10DLC registration required for US messaging`**
    - Trial Account need to be upgraded to PAID Subscription.
    - A mandatory step to implement ***Messaging Services***.

- **Active numbers**
    - Click on your Twilio phone number.
    - **Messaging Configuration**
        - This configuration is to add the entry-point for the messaging service. 
        - Select the parameters with below values:
            - **Configure with**: Webhook, TwiML Bin, Function, Studio Flow, Proxy Service
            - **A message comes in**: *Function_name*
            - **Service**: *Service_Name*
            - **Environment**: ui
            - **Function Path**: *entry_point of messaging service.*

## Limitations
- Limited Tokens available in using Twilio Trial Account for Messaging Service.