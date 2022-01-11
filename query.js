// Query
// Represents a query on a Model.
const util = require('util');

/**
 * Returns a boolean indicating whether a given row should be included in the query.
 * @typedef {Function} QueryFunction
 * @param {Row} row
 * @returns {boolean}
 * @see {@link Query}
 */

class Query {
    constructor(model, items) {
        this.model = model;
        this.items = items;
    }

    first() {
        return this.items[0] || undefined;
    }

    all() {
        return this.items;
    }

    count() {
        return this.items.length;
    }

    where(query) {
        return new Query(this.model, this.items.filter(query));
    }

    order(field) {
        return new Query(this.model, this.items.sort((a, b) => a[field] < b[field] ? -1 : 1));
    }

    limit(n) {
        return new Query(this.model, this.items.slice(0, n));
    }

    at(index) {
        return this.items.at(index) || null;
    }

    [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
    }

    toString() {
        return `Query<${this.model.name}>`;
    }

    [util.inspect.custom]() {
        return `Query<${this.model.name}>`;
    }
}

module.exports = Query;