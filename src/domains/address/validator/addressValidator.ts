import { kMaxLength } from "buffer";

export const AddressValidator = {
  create: {
    addres1: {
      presence: { allowEmpty: false },
      type: "string",
      maxLength: 100,
    },
    addres2: {
      type: "string",
      maxLength: 100,
    },
    city: {
      presence: { allowEmpty: false },
      type: "string",
      maxLength: 20,
    },
    state: {
      presence: { allowEmpty: false },
      type: "string",
    },
    country: {
      presence: { allowEmpty: false },
      type: "string",
    },
    postalCode: {
      presence: { allowEmpty: false },
      type: "string",
    },
    phone: {
      presence: { allowEmpty: false },
      type: "string",
    },
  },
};
