export const ProductValidator = {
    create: {
        name: {
            presence: { allowEmpty: false },
            type: "string",
            length: {
                minimum: 3,
            },
            format: {
                pattern: /^[a-zA-Z0-9]+$/,
            },
        },
        description: {
            presence: { allowEmpty: false },
            type: "string",
            length: {
                minimum: 3,
            },
            format: {
                pattern: /^[a-zA-Z0-9]+$/,
            },
        },
        price: {
            presence: { allowEmpty: false },
            type: "number",
        },
    },
    update: {
        name: {
            presence: { allowEmpty: false },
            type: "string",
            length: {
                minimum: 3,
            },
            format: {
                pattern: /^[a-zA-Z0-9]+$/,
            },
        },
        description: {
            presence: { allowEmpty: false },
            type: "string",
            length: {
                minimum: 3,
            },
            format: {
                pattern: /^[a-zA-Z0-9]+$/,
            },
        },
        price: {
            presence: { allowEmpty: false },
            type: "number",
        },
    },
}