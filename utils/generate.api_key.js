import crypto from 'crypto';

export const generateApiKey = (userId) => {
  const randomBytes = crypto.randomBytes(8);
  
  const randomPart = randomBytes.toString('hex').slice(0, 8);
  
  const userIdPart = userId.toString().slice(-8).padStart(8, '0');
  
  const apiKey = `${userIdPart}${randomPart}`;
  
  return apiKey;
};
