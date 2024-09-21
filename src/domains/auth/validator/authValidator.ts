export const authValidator = {
  login: {
    email: {
      presence: true,
      email: true,
      length: {
        minimum: 8,
      },
      format: {
        pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
      },
    },
    password: {
      presence: true,
      length: {
        minimum: 8,
      },
      format: {
        pattern:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      },
    },
  },
  register: {
    name: {
      presence: true,
    },
    email: {
      presence: true,
      email: true,
      length: {
        minimum: 8,
      },
      format: {
        pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
      },
    },
    password: {
      presence: true,
      length: {
        minimum: 8,
      },
      format: {
        pattern:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      },
    },
  },
  forgotPassword: {
    email: {
      presence: true,
      email: true,
      length: {
        minimum: 8,
      },
      format: {
        pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
      },
    },
  },
  resetPassword: {
    password: {
      presence: true,
      length: {
        minimum: 8,
      },
      format: {
        pattern:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      },
    },
  },
};
