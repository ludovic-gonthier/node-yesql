-- query all examples
-- name: all_examples
SELECT *
FROM example;

-- query examples by name
-- name: examples_by_name
SELECT *
FROM example
WHERE name = :name
;
