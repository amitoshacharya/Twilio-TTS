const {BlobServiceClient} = require('@azure/storage-blob');

async function uploadToAzureBlobStorage(audioStream, containerName, blobName, connectionString) {
    /*
    This function uploads the ElevenLabs Audio to Azure Storage.
    */
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const uploadOptions = {
        blobHTTPHeaders: { blobContentType: 'audio/mp3' }
    };

    try {
        // await blockBlobClient.uploadData(audioBuffer, audioBuffer.length, undefined, uploadOptions);
        await blockBlobClient.uploadStream(audioStream, undefined, undefined, uploadOptions);
        console.log('Blob pushed to Azure Blob Storage');
    } catch (error) {
        console.log('Error in Uploading Stream in Azure Blob');
        throw error;
    }

    return blockBlobClient.url;
    
}

//uploading to cloud storage
exports.upload = async (CONTAINER_NAME, CONNECTION_STRING, audioStreams, Append_File_Name) => {
    // Upload the audio stream to Azure Blob Storage
    const azureBlobContainer = CONTAINER_NAME;
    const azureConnectionString = CONNECTION_STRING;
    console.log('upload function working');
    
        // Upload the audio streams to a Azure
        // const azureBlobUrls_array = [];
        // for (let fileNum = 0; fileNum < audiStreams.length; fileNum++){
        //     if (audiStreams[fileNum]){
        //     console.log('uploading.......');
        //     // Audio filename
        //     const audioFileName = `xi-labs-audio${Append_File_Name}-${fileNum}.mp3`;

        //     // Azure blob urls
        //     const azureBlobUrl = await uploadToAzureBlobStorage(audiStreams[fileNum], azureBlobContainer, audioFileName, azureConnectionString);
        //     azureBlobUrls_array.push(azureBlobUrl);
        //     console.log(`${audioFileName} uploaded successfully.`);
        //     }
        // }        
        // console.log(`${azureBlobUrls_array} returned successfully.`);
        // // return the Azure Blob Url
        // return azureBlobUrls_array;
        
        //Upload each audio stream to Azure Blob Storage
    const azureBlobUrls = await Promise.all(audioStreams.map(async (audioStream, index) => {
        try{
            if (audioStream){
                const audioFileName = `xi-labs-audio${Append_File_Name}-${index + 1}.mp3`;
                console.log(`uploading......    ${audioFileName}`);
                const azureBlobUrl = await uploadToAzureBlobStorage(audioStream, azureBlobContainer, audioFileName, azureConnectionString);
                return azureBlobUrl;
            }
        } catch (error){
            console.error("Error uploading audio stream: ", error);
            return null;
        }
    }));
    return azureBlobUrls;   
}