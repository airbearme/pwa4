import apiRouter from './api';

export const onRequest = (context) => {
  return apiRouter.handle(context.request, context.env, context);
};
