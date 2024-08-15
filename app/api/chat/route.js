import { NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';

export async function POST(req) {
  try {
    // Extract the user's message from the request body
    const { userMessage } = await req.json();
    console.log('Received user message:', userMessage);

    // Set up Azure OpenAI with Bearer Token Provider
    const endpoint = process.env.ENDPOINT_URL || 'https://ai-supportbot.openai.azure.com/';
    const deployment = process.env.DEPLOYMENT_NAME || 'ai-customer-support';
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-05-01-preview';

    console.log('Using endpoint:', endpoint);
    console.log('Deployment name:', deployment);
    console.log('API version:', apiVersion);

    const tokenProvider = getBearerTokenProvider(
      new DefaultAzureCredential(),
      'https://cognitiveservices.azure.com/.default'
    );

    const client = new AzureOpenAI({
      azureEndpoint: endpoint,
      azureAdTokenProvider: tokenProvider,
      apiVersion: apiVersion,
    });

    // Create completion request with retry logic
    const createCompletion = async (retries = 3) => {
      try {
        console.log('Sending request to Azure OpenAI...');
        const completion = await client.chat.completions.create({
          model: deployment,
          messages: [
            {
              role: 'user',
              content: userMessage,
            },
          ],
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
        });
        console.log('Received completion response:', completion);
        return completion;
      } catch (err) {
        console.warn(`Error creating completion: ${err.message}. Retries left: ${retries}`);
        if (retries > 0) {
          await new Promise(res => setTimeout(res, 1000)); // wait 1 second before retrying
          return createCompletion(retries - 1);
        }
        console.error('Final error after retries:', err);
        throw err;
      }
    };

    const completion = await createCompletion();
    const responseMessage = completion.choices[0].message.content;

    console.log('Final response message:', responseMessage);
    return NextResponse.json({ message: responseMessage });
  } catch (err) {
    console.error('The API route encountered an error:', err);
    return NextResponse.json({ error: 'Something went wrong', details: err.message }, { status: 500 });
  }
}
