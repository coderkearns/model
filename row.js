// Row
// Represents a row in a database, and is created by a Model.
// Example:
/*
/// Imagine a Model called User, with the following fields: username, password, bio, posts (a backref).
/// Imagine the database is populated with lots of users already.

/// Get a row:
const row = User.where(id=>id==4).first();

row.username // John
row.bio // No bio provided.
row.posts // Query<[PostModel]>

const password = getUserInput()
if (row.password != password) throw new Error('Wrong password');

const newBio = getUserInput();
row.bio = newBio;

row.save();
*/
const util = require('util');

class Row {
    constructor(model, data) {
        this.model = model;
        this.data = data;
        return new Proxy(this, {
            get: (target, key) => {
                if (key in target) return target[key];
                if (key in target.data) return target.data[key];
                return undefined;
            },
            set: (target, key, value) => {
                target.data[key] = value;
                return true;
            }
        })
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
    }

    save() {
        this.model.save(this.data);
    }

    toString() {
        return `Row<${this.model.name}>`;
    }

    [util.inspect.custom](depth, options) {
        return `Row(${this.data.id})`
    }

    toJSON() {
        // For each key in the data, if is has a toJSON method, call it. Otherwise, return the value.
        return Object.keys(this.data).reduce((obj, key) => {
            obj[key] = this.data[key].toJSON ? this.data[key].toJSON() : this.data[key];
            return obj;
        }, {});
    }
}

module.exports = Row;