DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_MigrateMissedVisits!!

DELIMITER $$



CREATE PROCEDURE AAU.sp_MigrateMissedVisits(OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/04/2020
Purpose: Used to update all missed cases to tomorrow
*/

START TRANSACTION;

-- Enter some logging details so we can retrieve these later if needed.
INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction,DateTime)
SELECT 1, 'AUTO_USER', v1.VisitId, 'Visit',
CONCAT(
CASE 	WHEN v1.Date = v2.MaxVisitDate THEN CONCAT('Date changed from: ', v2.MaxVisitDate)
ELSE ''
		END,
		CASE	WHEN v1.Date < v2.MaxVisitDate THEN CONCAT('Marked as missed')
        ELSE ''
		END)
, CURRENT_TIMESTAMP
		
FROM AAU.Case c
INNER JOIN Visit v1 ON v1.CaseId = c.CaseId
LEFT JOIN
(
SELECT CaseId, MAX(Date) MaxVisitDate
FROM AAU.Visit
WHERE Date <= DATE_ADD( CURRENT_DATE(), INTERVAL 1 DAY)
AND IsDeleted = 0
AND StatusId = 1
GROUP BY CaseId
) v2 ON v1.CaseId = v2.CaseId
WHERE v1.StatusId = 1
AND v1.IsDeleted = 0
AND c.StatusId < 3
AND c.IsDeleted = 0
AND v1.Date < CURRENT_DATE();

/*
Update status for missed visits or date for last outstanding visit.

When a case has a visit tomorrow, all previous To Do visits will be marked as missed.

When a case has no visit tomorrow, the most recent To Do visit will be moved to tomorrow
and all previous To Do visits will be marked as Missed


*/
UPDATE AAU.Case c
INNER JOIN Visit v1 ON v1.CaseId = c.CaseId
LEFT JOIN
(
SELECT CaseId, MAX(Date) MaxVisitDate
FROM AAU.Visit
WHERE Date <= DATE_ADD( CURRENT_DATE(), INTERVAL 1 DAY)
AND IsDeleted = 0
AND StatusId = 1
GROUP BY CaseId
) v2 ON v1.CaseId = v2.CaseId
SET
	v1.Date =
		CASE 	WHEN v1.Date = v2.MaxVisitDate THEN DATE_ADD( CURRENT_DATE(), INTERVAL 1 DAY)
				ELSE v1.Date
		END,
	v1.StatusId =
		CASE	WHEN v1.Date < v2.MaxVisitDate THEN 3
				WHEN v1.Date >= v2.MaxVisitDate THEN v1.StatusId
                ELSE v1.StatusId
		END
WHERE v1.StatusId = 1
AND v1.IsDeleted = 0
AND c.StatusId < 3
AND c.IsDeleted = 0
AND v1.Date < CURRENT_DATE();

COMMIT;

SELECT 1 INTO prm_Success;

END$$
DELIMITER ;
