import { ResponseType, ResponseTypeInterface } from '../types';
const responseWrapper = (
  data: ResponseTypeInterface,
  responseType: ResponseType,
): string =>
  JSON.stringify({
    type: responseType,
    data: JSON.stringify(data),
    id: 0,
  });

export default responseWrapper;
