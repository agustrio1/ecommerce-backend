export const DiscountValidator = {
    create: {
        code: {
            presence: { allowEmpty: false },
            type: "string",
        },
        description: {
            presence: { allowEmpty: false },
            type: "string",
        },
        discountType: {
            presence: { allowEmpty: false },
            type: "string",
        },
        value: {
            presence: { allowEmpty: false },
            type: "number",
        },
        minPurchase: {
            presence: { allowEmpty: false },
            type: "number",
        },
        maxUsage: {
            presence: { allowEmpty: false },
            type: "number",
        }
    },
    update: {
        code: {
            presence: { allowEmpty: false },
            type: "string",
        },
        description: {
            presence: { allowEmpty: false },
            type: "string",
        },
        discountType: {
            presence: { allowEmpty: false },
            type: "string",
        },
        value: {
            presence: { allowEmpty: false },
            type: "number",
        },
        minPurchase: {
            presence: { allowEmpty: false },
            type: "number",
        },
        maxUsage: {
            presence: { allowEmpty: false },
            type: "number",
        }
    }
}