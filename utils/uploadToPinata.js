const pinataSDK = require('@pinata/sdk');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;
const pinata = pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

const storeImages = async (imgFilePath) => {
  const imgDir = path.resolve(__dirname, imgFilePath);
  const files = fs.readdirSync(imgDir);
  console.log(files);
  let result = [];

  console.log('>>>>>> Uploading to IPFS...');

  for (index in files) {
    const fileName = files[index];
    const filePath = path.resolve(imgDir, fileName);
    const readableStreamForFile = fs.createReadStream(filePath);

    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile);
      result.push(response);

      console.log('>>>>>> Upload to IPFS success!');
    } catch (error) {
      console.error(error);
    }
  }

  return { result, files };
};

module.exports = storeImages;
