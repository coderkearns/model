// Represents a field type in a Model.
const util = require('util');

class Type {
    // Returns a function (the field) that returns a function to create rows.
    constructor(name, { default: typeDefault, behavior = (value) => value }) {
        this.name = name;

        function field(defaultValue = typeDefault, ...fieldArgs) {
            function type(...args) {
                return behavior.bind(this)(...args, ...fieldArgs);
            }
            type.default = () => defaultValue;
            type.toJSON = () => ({
                name, args: fieldArgs.map(item => {
                    if (typeof item === "object") {
                        return item.name
                    }
                    return item
                }), defaultValue
            });
            type[util.inspect.custom] = () => `Type<${name}>`;
            Object.defineProperty(type, 'name', { value: name });
            return type;
        }
        field.behavior = behavior
        return field
    }

    toJSON() {
        return this.name
    }

    toString() {
        return `Type<${this.name}>`
    }
}

const types = {
    ID: new Type('ID', { default: 0 }),
    STRING: new Type('STRING', { default: '' }),
    NUMBER: new Type('NUMBER', { default: 0, behavior: (value) => Number(value) }),
    BOOLEAN: new Type('BOOLEAN', { default: false, behavior: (value) => Boolean(value) }),
    REF: new Type('REF', {
        default: null,
        behavior: (id, Model) => {
            if (id === null) return null;
            const get = () => {
                return Model.get(id)
            }
            get.toJSON = () => id;
            Object.defineProperty(get, 'name', { value: `_REF_${Model.name}` });
            Object.defineProperty(get, "value", { get: () => id, set: () => false });
            return get
        }
    })
}

types.fromJSON = (json) => {
    return types[json]
}

module.exports = types;
