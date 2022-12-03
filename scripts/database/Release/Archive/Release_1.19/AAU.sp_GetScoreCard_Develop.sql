DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetScoreCard!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetScoreCard(IN prm_Username VARCHAR(45))
BEGIN

DECLARE TotalActiveCases INT;
DECLARE CasesWithVisitToday INT;
DECLARE VisitsToday INT;
DECLARE TotalPlannedVisits INT;
DECLARE OutstandingVisitsToday INT;
DECLARE CompleteVisitsToday INT;
DECLARE TotalUrgentCases INT;
DECLARE OutstandingUrgentVisitsToday INT;
DECLARE CompletedUrgentVisitsToday INT;
DECLARE NoVisits INT;
DECLARE vOrganisationId INT;

SET TotalActiveCases = 0;
SET CasesWithVisitToday = 0;
SET VisitsToday = 0;
SET TotalPlannedVisits = 0;
SET OutstandingVisitsToday = 0;
SET CompleteVisitsToday = 0;
SET TotalUrgentCases = 0;
SET OutstandingUrgentVisitsToday = 0;
SET CompletedUrgentVisitsToday = 0;
SET NoVisits = 0;
SET vOrganisationId = 0;

/*
1: Cases with a visit today
1: All Active cases
2: Total planned visits
3: Visits complete today
3: Visits today (same as cases with a visit today)
4: Total active urgent cases
5: Urgent visits complete today
5: Total urgent visits today
6: Cases flagged for early completion today
*/


-- 1: Cases with a visit today
-- 3: Visits today (same as cases with a visit today)
-- 3: Visits complete today
-- 5: Urgent visits complete today
-- 5: Total urgent visits today

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE u.UserName = prm_Username;

SELECT
	COUNT(DISTINCT c.StreetTreatCaseId),
	COUNT(DISTINCT v.VisitId),
	SUM(CASE WHEN c.PriorityId = 4 AND v.StatusId > 2 THEN 1 ELSE 0 END),
	SUM(CASE WHEN c.PriorityId = 4 AND v.StatusId <= 2 THEN 1 ELSE 0 END),
	sum(CASE WHEN v.statusid <= 2 THEN 1 ELSE 0 END),
	sum(CASE WHEN v.statusid > 2 THEN 1 ELSE 0 END)
INTO
	CasesWithVisitToday,
    VisitsToday,
    OutstandingUrgentVisitsToday,
    CompletedUrgentVisitsToday,
    OutstandingVisitsToday,
    CompleteVisitsToday
FROM AAU.StreetTreatCase c
INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = c.StreetTreatCaseId
WHERE v.Date = CURDATE()
AND v.IsDeleted = false
AND c.IsDeleted = false;


-- 1: All Active cases
-- 4: Total active urgent cases
SELECT
	COUNT(1),
	SUM(CASE WHEN c.PriorityId = 4 THEN 1 ELSE 0 END)
INTO
    TotalActiveCases,
    TotalUrgentCases
FROM AAU.StreetTreatCase c
WHERE c.StatusId <= 2; -- Total Cases


-- 2: Total planned visits 
	SELECT 
		SUM(CASE WHEN v.StreetTreatCaseId IS NULL THEN 1 ELSE 0 END) ,
		SUM(CASE WHEN v.StreetTreatCaseId IS NULL THEN 0 ELSE 1 END)
	INTO NoVisits, TotalPlannedVisits
	FROM AAU.StreetTreatCase stc
	LEFT JOIN AAU.Visit v ON v.StreetTreatCaseId = stc.StreetTreatCaseId AND v.StatusId <= 2 AND v.Date >= CURDATE()
	WHERE stc.StatusId <= 2;

SELECT	IFNULL(TotalActiveCases,0) AS TotalActiveCases,
		IFNULL(CasesWithVisitToday,0) AS CasesWithVisitToday,
		IFNULL(VisitsToday,0) AS VisitsToday,
		IFNULL(TotalPlannedVisits,0) AS TotalPlannedVisits,
		IFNULL(OutstandingVisitsToday,0) AS OutstandingVisitsToday,
		IFNULL(CompleteVisitsToday,0) AS CompleteVisitsToday,
		IFNULL(TotalUrgentCases,0) AS TotalUrgentCases,
		IFNULL(OutstandingUrgentVisitsToday,0) AS OutstandingUrgentVisitsToday,
		IFNULL(CompletedUrgentVisitsToday,0) AS CompletedUrgentVisitsToday,
        IFNULL(NoVisits,0) AS NoVisits;

END$$
DELIMITER ;
