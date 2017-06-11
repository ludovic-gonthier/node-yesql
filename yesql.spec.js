const yesql = require('./yesql');

const connection = {
  query: jest.fn(),
};

describe('yesql', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('load()', () => {
    describe('file with no named query', () => {
      it('should return the query in the default key', () => {
        const queries = yesql.load('./fixtures/unnamed_query.sql');

        expect(queries)
          .toHaveProperty('default');

        connection.query
          .mockImplementationOnce(() => 42);

        const result = queries.default(connection, ['test']);

        expect(connection.query)
          .toHaveBeenCalledWith(
            'SELECT * FROM example;',
            ['test'],
          );
        expect(result)
          .toBe(42);
      });
    });
    describe('file with named queries', () => {
      it('should return the queries in an object with keys corresponding to their name', () => {
        const queries = yesql.load('./fixtures/with_named_queries.sql');

        expect(queries)
          .not
          .toHaveProperty('default');
        expect(queries)
          .toHaveProperty('all_examples');
        expect(queries)
          .toHaveProperty('examples_by_name');

        connection.query
          .mockImplementationOnce(() => 42);
        connection.query
          .mockImplementationOnce(() => 21);

        const allExamples = queries.all_examples(connection, []);
        const examplesByName = queries.examples_by_name(connection, { name: 'test' });

        expect(connection.query)
          .toHaveBeenCalledWith(
            'SELECT * FROM example;',
            [],
          );
        expect(allExamples)
          .toBe(42);

        expect(connection.query)
          .toHaveBeenCalledWith(
            'SELECT * FROM example WHERE name = :name ;',
            { name: 'test' },
          );
        expect(examplesByName)
          .toBe(21);
      });
    });
    describe('file with named queries and unnamed query', () => {
      it('should return the queries in an object with keys corresponding to their name and the default query', () => {
        const queries = yesql.load('./fixtures/with_named_and_unnamed_queries.sql');

        expect(queries)
          .toHaveProperty('default');
        expect(queries)
          .toHaveProperty('examples_by_id');
        expect(queries)
          .toHaveProperty('examples_by_name');

        connection.query
          .mockImplementationOnce(() => 84);
        connection.query
          .mockImplementationOnce(() => 42);
        connection.query
          .mockImplementationOnce(() => 21);

        const allExamples = queries.default(connection, []);
        const examplesById = queries.examples_by_id(connection, { id: 32 });
        const examplesByName = queries.examples_by_name(connection, { name: 'test' });

        expect(connection.query)
          .toHaveBeenCalledWith(
            'SELECT * FROM example;',
            [],
          );
        expect(allExamples)
          .toBe(84);

        expect(connection.query)
          .toHaveBeenCalledWith(
            'SELECT * FROM example WHERE id = :id ;',
            { id: 32 },
          );
        expect(examplesById)
          .toBe(42);

        expect(connection.query)
          .toHaveBeenCalledWith(
            'SELECT * FROM example WHERE name = :name ;',
            { name: 'test' },
          );
        expect(examplesByName)
          .toBe(21);
      });
    });
  });

  describe('connection interface', () => {
    describe('should implement a query() function', () => {
      it('should throw error when query key undefined', () => {
        const queries = yesql.load('./fixtures/unnamed_query.sql');

        expect(() => {
          queries.default({});
        }).toThrow();
      });

      it('should throw error when query key is not a function', () => {
        const queries = yesql.load('./fixtures/unnamed_query.sql');

        expect(() => {
          queries.default({ query: 'test' });
        }).toThrow();
      });
    });
  });
});
