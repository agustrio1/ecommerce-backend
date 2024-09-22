export const cartValidator = {
    update: {
        quantity: {
            presence: { allowEmpty: false },
            type: "number",
        },
        price:{
            presence: { allowEmpty: false },
            type: "number",
        },
    },
}