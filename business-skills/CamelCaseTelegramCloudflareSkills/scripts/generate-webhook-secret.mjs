import { randomBytes } from 'node:crypto';
import { base64url } from 'jose';

const secret = base64url.encode(randomBytes(32));

console.log(secret);
