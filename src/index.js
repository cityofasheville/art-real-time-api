export const handler = async(event) => {
    // console.log(event);
    let url;
    if (event.rawPath == '/vehiclepositions') {
      url = 'https://api.goswift.ly/real-time/art-asheville/gtfs-rt-vehicle-positions';
    } else if (event.rawPath == '/tripupdates') {
      url = 'https://api.goswift.ly/real-time/art-asheville/gtfs-rt-trip-updates';
    } else {
      throw new Error(`Invalid Path!`);
    }

    const options = {
      method: 'GET',
      headers: {
        Authorization: process.env.apikey,
        Accept: 'application/json, text/csv; charset=utf-8, text/plain',
      }
    };
    
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log(response);

      const reader = response.body.getReader();
      const chunks = [];
      let totalLength = 0;
      // console.log(reader);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        chunks.push(value);
        totalLength += value.length
      }

      const fullBuffer = Buffer.concat(chunks,totalLength)

      const returnResponse = {
        statusCode: 200,
        headers: {
          "Content-Type": "application/octet-stream"
        },
        body: fullBuffer.toString('base64'),
        isBase64Encoded: true
      }

      return returnResponse;

    } catch (error) {
      console.error(error);
    }
}