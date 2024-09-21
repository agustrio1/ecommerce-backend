export const categoryValidator = {
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
    },
}