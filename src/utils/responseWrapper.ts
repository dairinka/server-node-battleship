import { ResponceType, ResponceTypeInterface } from '../types';
const responseWrapper = (
  data: ResponceTypeInterface,
  responceType: ResponceType,
): string =>
  JSON.stringify({
    type: responceType,
    data: JSON.stringify(data),
    id: 0,
  });

export { responseWrapper };
