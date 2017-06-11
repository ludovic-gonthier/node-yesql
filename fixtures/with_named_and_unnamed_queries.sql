-- query all examples
SELECT *
FROM example;

-- query examples by id
-- name: examples_by_id
SELECT *
FROM example
WHERE id = :id
;

-- name: examples_by_name
-- query examples by name
SELECT *
FROM example
WHERE name = :name
;
