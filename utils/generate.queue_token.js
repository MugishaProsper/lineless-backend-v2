import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateQueueToken = (userId) => {
  const baseToken = jwt.sign({ userId }, "mugishaprosperoijo", { expiresIn: '24h' });
  const randomNum = crypto.randomInt(10000000, 999999999);
  const token = `${baseToken.slice(-8)}${randomNum.toString().slice(0, 8)}`;
  return token;
};
