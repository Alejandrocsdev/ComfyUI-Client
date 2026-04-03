// Custom Functions
import { axiosPublic, axiosPrivate } from './axios';
// Utilities
import { devLog, devErr } from '../utils';

const api = async (request, handlers = {}) => {
  const { onSuccess, onError, onFinally } = handlers;
  try {
    devLog('Sending request...');
    const { data } = await request;
    devLog('Response:', data);
    if (onSuccess) onSuccess(data);
  } catch (error) {
    devErr(error.response?.data?.message || error.message || 'Unknown error');
    if (onError) onError(error);
  } finally {
    if (onFinally) onFinally();
  }
};

export { api, axiosPublic, axiosPrivate };
