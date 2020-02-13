module.exports = {
    "parser": "@typescript-eslint/parser",
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "standard"
    ],
    "plugins": [
        "@typescript-eslint"
    ],
    "env": {
        "node": true,
        "jest": true
    },
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType": "module",
        "project": "./tsconfig.json"
    },
    "globals":{
      "BigInt": true
    },
    "rules": {
        "require-atomic-updates": [
            "off"
        ],
        "camelcase": [
            "off"
        ],
        "@typescript-eslint/camelcase": [
            "error", { "properties": "never" }
        ],
        "@typescript-eslint/indent": [
            "error",
            2
        ],
        "@typescript-eslint/explicit-function-return-type": [
            "off"
        ],
        "@typescript-eslint/explicit-member-accessibility": [
            "off"
        ],
        "@typescript-eslint/no-empty-interface": [
            "off"
        ],
        "@typescript-eslint/member-delimiter-style": [
            "off"
        ]
    }
}
