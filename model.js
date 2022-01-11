// Represents a database model.
/* Example:
/// Each Model is provided with a name and a collection of fields.
/// Each type is provided with any aguments it requires, and a default value.

// API Reference: CRUD
/*
Create:
::create(data: {}) creates a new row in the database, and returns a Row object.

Read:
::get(id: number) returns a Row object for the given id.
::where(query: (row: Row) => boolean) returns a Query object with all the rows that match the query.
::query() returns a Query object that with all the rows in the database.

Update:
::save(row: Row) saves the given row in the database.
::update(id, modify: (row: Row) => void) modifies the row with the given id.
::updateWhere(query: (row: Row) => boolean, modify: (row: Row) => void) modifies all rows that match the given query.
::updateAll(modify: (row: Row) => void) modifies all rows in the database.

Delete:
::delete(id: number) deletes the row with the given id.
::deleteWhere(query: (row: Row) => boolean) deletes all rows that match the given query.
::clear() deletes all rows in the database.

Other:
.count returns the number of rows in the database.
::exists(id: number) returns true if a row with the given id exists in the database.
*/

const types = require('./types');
const Row = require('./row');
const Query = require('./query');

/**
 * @typedef {Function} UpdateFunction
 * @param {Row} row
 * @returns {void}
 * @see {@link Model#update}
 * @see {@link Model#updateWhere}
 * @see {@link Model#updateAll}
 */

/**
 * Represents a database model.
 * @class Model
 * @param {string} name
 * @param {Object} fields
 */
class Model {
    /**
     * @constructor
     * @param {string} name
     * @param {Object} fields
     * @see {@link Model}
     */
    constructor(name, fields) {
        this.name = name;
        this.fields = fields;
        this.data = []
    }

    /**
     * A object with all the possible types of item keys in a Model.
     * @static
     * @see {@link types}
     * @see {@link Type}
     */
    static types = types;

    /**
     * Creates a new Row object.
     * @param {Object} data
     * @returns {Row}
     */
    create(data) {
        const row = new Row(this, data);
        this._createObject(row);
        this.save(row);
        return row;
    }

    /**
     * Creates the internal state of a row.
     * @param {Row} row
     * @private
     */
    _createObject(row) {
        if (!row.id) {
            const id = this.nextId();
            row.data.id = id;
        }
        for (const key in this.fields) {
            const type = this.fields[key];
            if (row.data.hasOwnProperty(key)) {
                row.data[key] = type(row.data[key]);
            } else {
                row.data[key] = type.default()
            }
        }
    }

    /**
     * Returns a single row from the database matching the given ID. Helper for {@link Model#where} with IDs.
     * @param {number} id
     * @returns {Row|undefined}
     * @see {@link Model#where}
     */
    get(id) {
        return this.where(row => row.id == id).first();
    }

    /**
     * Returns a Query object with all rows matching a given query function.
     * @param {QueryFunction} query
     * @returns {Query}
     * @see {@link Query}
     * @see {@link QueryFunction}
     */
    where(queryFunction) {
        const items = this.data.filter(queryFunction);
        return new Query(this, items);
    }

    /**
     * Returns a Query object with all rows in the database.
     * @returns {Query}
     * @see {@link Query}
     */
    query() {
        return new Query(this, this.data);
    }

    /**
     * Saves a row in the database by replacing the row with the same ID, or adding it if it doesn't exist.
     * @param {Row} row
     */
    save(row) {
        const index = this.data.findIndex(r => r.id == row.id);
        if (index == -1) {
            this.data.push(row);
        } else {
            this.data[index] = row;
        }
    }

    /**
     * Updates a row in the database with the given ID.
     * @param {number} id
     * @param {UpdateFunction} modify
     * @returns {Row}
     * @see {@link UpdateFunction}
     */
    update(id, modify) {
        const row = this.get(id);
        if (row) {
            modify(row);
            this.save(row);
        }
        return row;
    }

    /**
     * Updates all rows in the database that match the given query.
     * @param {QueryFunction} query
     * @param {UpdateFunction} modify
     * @see {@link QueryFunction}
     * @see {@link UpdateFunction}
     */
    updateWhere(query, modify) {
        this.where(query).all().forEach((row) => {
            modify(row);
            this.save(row);
        })
    }

    /**
     * Updates all rows in the database.
     * @param {UpdateFunction} modify
     * @see {@link UpdateFunction}
     */
    updateAll(modify) {
        this.query().all().forEach((row) => {
            modify(row);
            this.save(row);
        })
    }

    /**
     * Deletes a row from the database with the given ID.
     * @param {number} id
     * @returns {Row | undefined}
     */
    delete(id) {
        const row = this.get(id);
        if (row) {
            this.data = this.data.filter(r => r.id != id);
        }
        return row;
    }

    /**
     * Deletes all rows from the database that match the given query.
     * @param {QueryFunction} query
     * @see {@link QueryFunction}
     * @see {@link Model#delete}
     */
    deleteWhere(query) {
        this.where(query).all().forEach((row) => {
            this.delete(row.id);
        })
    }

    /**
     * Deletes all rows from the database.
     */
    clear() {
        this.data = [];
    }

    /**
     * Returns the number of rows in the database.
     * @memberof Model
     * @returns {number}
     */
    get count() {
        return this.data.length;
    }

    /**
     * Returns true if a row with the given ID exists in the database.
     * @param {number} id
     * @returns {boolean}
     */
    exists(id) {
        return this.get(id) != undefined;
    }

    /**
     * Returns the next ID for a new row.
     * @returns {number}
     */
    nextId() {
        if (this.count == 0) return 1;
        return this.data.at(-1).id + 1;
    }

    /**
     * Converts the Model to a JSON object that can be saved to a file.
     * @returns {Object}
     */
    toJSON() {
        // call toJSON on each field
        const fields = {};
        for (const key in this.fields) {
            fields[key] = this.fields[key].toJSON();
        }
        return {
            name: this.name,
            fields,
            data: this.data.map(row => row.toJSON())
        }
    }

    /**
     * Loads a Model from a JSON object.
     * @param {Object} json
     * @returns {Model}
     * @static
     * @see {@link Model#toJSON}
     */
    static fromJSON(json, args = {}) {
        const fields = Object.keys(json.fields).reduce((fields, key) => {
            const fieldJson = json.fields[key];
            const field = types[fieldJson.name];
            const customArgs = fieldJson.args.map(arg => args[arg])
            const type = field(fieldJson.defaultValue, ...customArgs)
            fields[key] = type;
            return fields;
        }, {});
        const model = new Model(json.name, fields);
        model.data = json.data.map(obj => {
            const row = new Row(model, obj);
            model._createObject(row);
            return row;
        })
        return model;
    }

}

module.exports = Model;