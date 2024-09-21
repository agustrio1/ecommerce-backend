enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER",
}

export const userValidator = {
    update: {
      name: {
        presence: { allowEmpty: false },
        type: "string",
      },
      email: {
        presence: { allowEmpty: false },
        email: true,
      },
      password: {
        type: "string",
        length: { minimum: 6 },
      },
      role: {
        inclusion: {
          within: Object.values(UserRole),
          message: "^%{value} is not a valid role",
        },
      },
    },
  };