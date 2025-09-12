import { GraphQLError } from 'graphql';

// Create validation error
export const createValidationError = (message: string) => {
  return new GraphQLError(message, {
    extensions: {
      code: 'VALIDATION_ERROR',
      http: { status: 400 },
    },
  });
};

// Create auth error
export const createAuthError = (message: string = 'Please log in to continue') => {
  return new GraphQLError(message, {
    extensions: {
      code: 'UNAUTHENTICATED',
      http: { status: 401 },
    },
  });
};

// Format the error for client
export const formatError = (error: GraphQLError) => {
  // Always log errors to help with debugging
  console.error('Error:', {
    message: error.message,
    path: error.path,
    details: error.extensions,
  });

  // For unknown errors (no code), return a generic message
  if (!error.extensions?.code) {
    return {
      message: 'Something went wrong, please try again',
      status: 500,
    };
  }

  // Return user-friendly error
  return {
    message: error.message,
    status: (error.extensions?.http as { status?: number })?.status || 500,
  };
};

// Check if user input is valid
export const checkInput = (value: any, errorMessage: string) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    throw createValidationError(errorMessage);
  }
};

// Check if user is logged in
export const checkUserLoggedIn = (user: any) => {
  if (!user) {
    throw createAuthError();
  }
};

// Wrap async functions to handle errors
export const handleAsync = (fn: Function) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error: any) {
      // Log the error to help with debugging
      console.error('Error in async function:', error);

      // If it's already a GraphQL error, throw it as is
      if (error instanceof GraphQLError) {
        throw error;
      }

      // Create a general error for other cases
      throw new GraphQLError(error.message || 'Something went wrong, please try again');
    }
  };
};
