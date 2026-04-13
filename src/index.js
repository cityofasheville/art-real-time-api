import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';


export const handler = async(event) => {
    // console.log(event);
    const secret = await getSecrets('swiftly_api');
    const baseUrl = secret.baseUrl;
    const apikey = secret.apikey;
    const agencyKey = secret.agencyKey;
    let url;

    if (event.rawPath == '/vehiclepositions') {
      url = `${baseUrl}/real-time/${agencyKey}/gtfs-rt-vehicle-positions`;
    } else if (event.rawPath == '/tripupdates') {
      url = `${baseUrl}/real-time/${agencyKey}/gtfs-rt-trip-updates`;
    } else if (event.rawPath == '/alerts') {
      url = `${baseUrl}/real-time/${agencyKey}/gtfs-rt-alerts/v2`
    } else {
      throw new Error(`Invalid Path!`);
    }
    
    try {
      const response = await fetchWithApiKey(url,apikey);
      // console.log(response);

      const fullBuffer = await readStream(response);

      const returnResponse = {
        statusCode: 200,
        headers: {
          "Content-Type": "application/octet-stream"
        },
        body: fullBuffer.toString('base64'),
        isBase64Encoded: true
      }
      // console.log(returnResponse);
      return returnResponse;

    } catch (error) {
      console.error(error);
    }
}

async function readStream(stream) {
  const reader = stream.body.getReader();
  const chunks = [];
  let totalLength = 0;
  // console.log(reader);

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    chunks.push(value);
    totalLength += value.length;
  }

  const fullBuffer = Buffer.concat(chunks,totalLength);
  return fullBuffer
}

async function fetchWithApiKey(url,apikey) {
  const options = {
    method: 'GET',
    headers: {
      Authorization: apikey,
      Accept: 'application/json, text/csv; charset=utf-8, text/plain',
    }
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response;

  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}

async function getSecrets(secretName) {
  const client = new SecretsManagerClient({
    region: 'us-east-1',
  });

  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    }),
  );

  const secrets = JSON.parse(response.SecretString);
  return secrets;
}