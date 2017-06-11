const fs = require('fs');

const REGEX_NAME = /(--\s*)(?:name:\s*([a-zA-Z0-9-_]*))?/i;
const REGEX_COMMENT = /--\s*(?:.*)/;

/**
 * Do the request with the given connection
 *
 * @param {query} string The SQL query
 * @param {connection} Object An object representation of a DB connection.
 *                            Must implements a query() function.
 * @param {parameters} array optional -The parameters to pass to the query.
 *
 * @return The return of the connection.query() function
 */
function request(query, connection, parameters) {
  if (connection.query === undefined || typeof connection.query !== 'function') {
    throw new Error('The connection Object must implement a query() function.');
  }

  return connection.query(query, parameters);
}

/*
 * File test.sql:
 *  ... Query
 *  -- name: test_1
 *  ... Query
 *  -- name test_2
 *  ... Query
 *
 *  => Object {
 *    default: (conn, param) => { ... },
 *    test_1: (conn, param) { ... },
 *    test_2: (conn, param) { ... },
 *  }
 */
function load(file) {
  const lines = fs.readFileSync(file, { encoding: 'utf-8' })
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  let current = 'default';
  const queries = lines.reduce((acc, line) => {
    const [, comment, name] = line.match(REGEX_NAME) || [];

    if (comment !== undefined && name === undefined) {
      return acc;
    }

    if (name !== undefined) {
      current = name.replace('-', '_');
    }

    const query = acc[current] || '';
    // eslint-disable-next-line no-param-reassign
    acc[current] = query
      .concat(' ')
      .concat(line.replace(REGEX_COMMENT, ''))
      .trim();

    return acc;
  }, {});

  return Object.keys(queries)
    .reduce((requests, query) => {
      // Partially apply query string to the request
      // eslint-disable-next-line no-param-reassign
      requests[query] = request.bind(null, queries[query]);

      return requests;
    }, {});
}

module.exports = {
  load,
};
