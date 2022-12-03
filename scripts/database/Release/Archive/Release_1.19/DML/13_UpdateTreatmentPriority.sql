SELECT pr.Priority, 'Low' AS `Required`
FROM AAU.Patient p
INNER JOIN AAU.Priority pr ON pr.PriorityId = p.TreatmentPriority
WHERE p.TagNumber = 'A233';

SELECT pr.Priority, 'Medium' AS `Required`
FROM AAU.Patient p
INNER JOIN AAU.Priority pr ON pr.PriorityId = p.TreatmentPriority
WHERE p.TagNumber = 'GEHNA';

SELECT pr.Priority, 'High' AS `Required`
FROM AAU.Patient p
INNER JOIN AAU.Priority pr ON pr.PriorityId = p.TreatmentPriority
WHERE p.TagNumber = 'TANUJA';

SELECT TreatmentPriority, COUNT(1)
FROM AAU.Patient p
GROUP BY TreatmentPriority;

SELECT * FROM AAU.Patient WHERE TreatmentPriority = 4 LIMIT 10;
SELECT * FROM AAU.Patient WHERE TreatmentPriority = 3 LIMIT 10;
SELECT * FROM AAU.Patient WHERE TreatmentPriority = 2 LIMIT 10;

-- Before and after running let's do a check to see that we're getting it right.

START TRANSACTION;

UPDATE AAU.Priority SET Priority = 'Medium' WHERE Priority = 'Normal';

UPDATE AAU.Patient SET TreatmentPriority = 12 WHERE TreatmentPriority = 2;
UPDATE AAU.Patient SET TreatmentPriority = 13 WHERE TreatmentPriority = 3;
UPDATE AAU.Patient SET TreatmentPriority = 14 WHERE TreatmentPriority = 4;

UPDATE AAU.Patient SET TreatmentPriority = 3 WHERE TreatmentPriority = 12;
UPDATE AAU.Patient SET TreatmentPriority = 2 WHERE TreatmentPriority = 13;
UPDATE AAU.Patient SET TreatmentPriority = 1 WHERE TreatmentPriority = 14;

SELECT pr.Priority, 'Low' AS `Required`
FROM AAU.Patient p
INNER JOIN AAU.Priority pr ON pr.PriorityId = p.TreatmentPriority
WHERE p.TagNumber = 'A233';

SELECT pr.Priority, 'Medium' AS `Required`
FROM AAU.Patient p
INNER JOIN AAU.Priority pr ON pr.PriorityId = p.TreatmentPriority
WHERE p.TagNumber = 'GEHNA';

SELECT pr.Priority, 'High' AS `Required`
FROM AAU.Patient p
INNER JOIN AAU.Priority pr ON pr.PriorityId = p.TreatmentPriority
WHERE p.TagNumber = 'TANUJA';

ROLLBACK

-- COMMIT
