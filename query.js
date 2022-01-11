// Query
// Represents a query on a Model.
// Example:
/*
/// Imagine a Model called User, with the following fields: username, password, bio, posts (a backref).
/// Imagine the database is populated with lots of users already.

/// A query to get all users with the default bio:
const query = User.where(user => user.bio === "No bio provided.");

/// ::first() returns the first row in the query, or undefined if there are no rows.
/// ::all() returns all rows in the query.
/// ::count() returns the number of rows in the query.
/// ::where(query) returns a new Query that filters the current query even further.
/// ::order(field) returns a new Query that orders the current query by the given field.
/// ::limit(n) returns a new Query that limits the current query to the first n rows.
/// ::at(index) returns the row at the given index, or null if there is no row at that index.
/// ::*[Symbol.iterator] iterates over every item in the query.
const firstUserWithoutBio = query.first(); // UserModel or null
const usersWithoutBios = query.all(); // [UserModel]
const numberOfUsersWithoutBios = query.count(); // number
const queryWithoutBioAndUsernameOfJohn = query.where(user => user.username === "John"); // Query<[UserModel]>
const queryOrderedByUsername = query.order("username"); // Query<[UserModel]>
const queryFirst5Users = query.limit(5); // Query<[UserModel]>
const userAtIndex2 = query.at(2); // UserModel or null
*/

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
}

module.exports = Query;