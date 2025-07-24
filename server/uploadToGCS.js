import { Storage } from '@google-cloud/storage';
import fs from 'fs/promises';

const storage = new Storage({
  keyFilename: '/mnt/data/earnest-dogfish-465606-t5-59a06feaf075.json',
});
const bucketName = 'mazlabz-sandbox-7431';

export async function uploadToGCS(file, folder = 'session-uploads') {
  const destPath = `${folder}/${file.originalname}`;
  const bucket = storage.bucket(bucketName);
  await bucket.upload(file.path, {
    destination: destPath,
    metadata: {
      contentType: file.mimetype,
      cacheControl: 'no-cache',
    },
  });
  await fs.unlink(file.path);
}
