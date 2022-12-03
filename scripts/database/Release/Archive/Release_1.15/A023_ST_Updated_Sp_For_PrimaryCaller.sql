-- StreetTreat Cases Stored procs --

DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCases !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCases()
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return active cases for the Admin screen


Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id and logging.

Modified By: Jim Mackenzie
Modified On: 07/12/2020
Description: Altering to run from new Apoms tables
*/

SELECT
			c.StreetTreatCaseId AS CaseId,
			ec.EmergencyNumber,
            p.TagNumber,
			at.AnimalType,
            at.AnimalTypeId,
            s.Status,
            s.StatusId,
			p.Description AS AnimalName,
			nv.NextVisit,
			pc.PercentComplete,
            pc.VisitList,
			ec.Location AS Address,
			pr.Priority,
            pr.PriorityId,
            t.TeamName,
            t.TeamId,
            ec.Latitude,
            ec.Longitude,
			ec.Name AS ComplainerName,
			ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        c.Name, 
        c.Number, 
        ec.Latitude, 
        ec.Longitude, 
        ec.Location, 
        ec.EmergencyNumber 
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.Team t ON t.TeamId = c.TeamId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
    
	LEFT JOIN
		(
		SELECT v.StreetTreatCaseId AS CaseId,
		SUM(CASE WHEN v.StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete,
        GROUP_CONCAT(s.Status ORDER BY v.Date DESC) AS VisitList
		FROM AAU.Visit v
        INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
        GROUP BY v.StreetTreatCaseId
		) AS pc ON pc.CaseId = c.StreetTreatCaseId

	LEFT JOIN
		(
		SELECT StreetTreatCaseId AS CaseId,
		MIN(Date) AS NextVisit
		FROM AAU.Visit
		WHERE Date >= CURDATE()
		AND StatusId IN (1,2)
        GROUP BY StreetTreatCaseId
		) AS nv ON nv.CaseId = c.StreetTreatCaseId
		
	WHERE c.StatusId <= 3;-- Only get active cases

END$$
DELIMITER ;

DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForTeamByDate !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesForTeamByDate(	IN prm_teamId INT,
														IN prm_visitDate DATE
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 18/11/2020
Purpose: Used to return active cases for the StreetTreat mobile app.

Modified By: Jim Mackenzie
Modified On: 07/12/2020
Description: Altering to run from new Apoms tables
*/

DECLARE prmVisitDate DATE;

	SELECT IFNULL(prm_visitDate, CURDATE()) INTO prmVisitDate;
    -- SELECT CURDATE() INTO prmVisitDate;

	SELECT
			c.StreetTreatCaseId AS CaseId,
			ec.EmergencyNumber,
            p.TagNumber,
			at.AnimalType,
            at.AnimalTypeId,
            s.Status,
            s.StatusId,
			p.Description AS AnimalName,
			nv.NextVisit,
            nv.NextVisitStatusId,
			pc.PercentComplete,
			ec.Location AS Address,
			pr.Priority,
            pr.PriorityId,
            t.TeamName,
            t.TeamId,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            p.PatientStatusDate AS ReleasedDate,
            c.ClosedDate,
            c.EarlyReleaseFlag,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        c.Name, 
        c.Number, 
        ec.Latitude, 
        ec.Longitude, 
        ec.Location, 
        ec.EmergencyNumber 
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.Team t ON c.TeamId = t.TeamId AND (t.TeamId = prm_teamId OR prm_teamId = 1)
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
	LEFT JOIN
		(
		SELECT StreetTreatCaseId,
		SUM(CASE WHEN StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete
		FROM AAU.Visit
        GROUP BY StreetTreatCaseId
		) AS pc ON pc.StreetTreatCaseId = c.StreetTreatCaseId

INNER JOIN
(
   SELECT v.StreetTreatCaseId, v.StatusId AS NextVisitStatusId, fv.NextVisit
   FROM
   (
        SELECT StreetTreatCaseId, MIN(Date) AS NextVisit
        FROM AAU.Visit
        WHERE Date >= prmVisitDate
        AND IsDeleted = FALSE
        GROUP BY StreetTreatCaseId
	) fv

	INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = fv.StreetTreatCaseId
		AND fv.NextVisit = v.Date
        AND v.IsDeleted = 0
) nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId

	WHERE nv.NextVisit = prmVisitDate -- Only get active cases
    AND c.IsDeleted = 0
    AND nv.NextVisit <= IFNULL(c.ClosedDate, DATE_ADD(NOW(), INTERVAL 10 YEAR));
END$$
DELIMITER ;

DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForUserTeam !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesForUserTeam( IN prm_username VARCHAR(64) )
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return active cases for the Admin screen.

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id and logging.

Modified By: Jim Mackenzie
Modified On: 07/12/2020
Description: Altering to run from new Apoms tables
*/

	SELECT
			c.StreetTreatCaseId AS CaseId,
			ec.EmergencyNumber,
            p.TagNumber,
			at.AnimalType,
            at.AnimalTypeId,
            s.Status,
            s.StatusId,
			p.Description AS AnimalName,
			nv.NextVisit,
            nv.NextVisitStatusId,
			pc.PercentComplete,
			ec.Location AS Address,
			pr.Priority,
            pr.PriorityId,
            t.TeamName,
            t.TeamId,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            p.PatientStatusDate AS ReleasedDate,
            c.ClosedDate,
            c.EarlyReleaseFlag,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        c.Name, 
        c.Number, 
        ec.Latitude, 
        ec.Longitude, 
        ec.Location, 
        ec.EmergencyNumber 
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.Team t ON c.TeamId = t.TeamId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
	INNER JOIN AAU.User u ON u.TeamId = t.TeamId AND u.UserName = prm_username
	LEFT JOIN
		(
		SELECT StreetTreatCaseId,
		SUM(CASE WHEN StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete
		FROM AAU.Visit
        GROUP BY StreetTreatCaseId
		) AS pc ON pc.StreetTreatCaseId = c.StreetTreatCaseId

INNER JOIN
(
   SELECT v.StreetTreatCaseId, v.StatusId AS NextVisitStatusId, fv.NextVisit
   FROM
   (
        SELECT StreetTreatCaseId, MIN(Date) AS NextVisit
        FROM AAU.Visit
        WHERE IsDeleted = FALSE
        GROUP BY StreetTreatCaseId
	) fv

	INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = fv.StreetTreatCaseId
		AND fv.NextVisit = v.Date
        AND v.IsDeleted = 0
) nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId

	WHERE c.IsDeleted = 0
    AND nv.NextVisit <= IFNULL(c.ClosedDate, DATE_ADD(NOW(), INTERVAL 10 YEAR));

END$$
DELIMITER ;

DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForUserTeamByDate !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesForUserTeamByDate(	IN prm_username VARCHAR(64),
															IN prm_visitDate DATE
														)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return active cases for the Admin screen.

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id and logging.

Modified By: Jim Mackenzie
Modified On: 07/12/2020
Description: Altering to run from new Apoms tables
*/

DECLARE prmVisitDate DATE;

	SELECT IFNULL(prm_visitDate, CURDATE()) INTO prmVisitDate;
    -- SELECT CURDATE() INTO prmVisitDate;

	SELECT
			c.StreetTreatCaseId AS CaseId,
			ec.EmergencyNumber,
            p.TagNumber,
			at.AnimalType,
            at.AnimalTypeId,
            s.Status,
            s.StatusId,
			p.Description AS AnimalName,
			nv.NextVisit,
            nv.NextVisitStatusId,
			pc.PercentComplete,
			ec.Location AS Address,
			pr.Priority,
            pr.PriorityId,
            t.TeamName,
            t.TeamId,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            p.PatientStatusDate AS ReleasedDate,
            c.ClosedDate,
            c.EarlyReleaseFlag,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        c.Name, 
        c.Number, 
        ec.Latitude, 
        ec.Longitude, 
        ec.Location, 
        ec.EmergencyNumber 
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.Team t ON c.TeamId = t.TeamId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
	INNER JOIN AAU.User u ON u.TeamId = t.TeamId AND u.UserName = prm_username
	LEFT JOIN
		(
		SELECT StreetTreatCaseId,
		SUM(CASE WHEN StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete
		FROM AAU.Visit
        GROUP BY StreetTreatCaseId
		) AS pc ON pc.StreetTreatCaseId = c.StreetTreatCaseId

INNER JOIN
(
   SELECT v.StreetTreatCaseId, v.StatusId AS NextVisitStatusId, fv.NextVisit
   FROM
   (
        SELECT StreetTreatCaseId, MIN(Date) AS NextVisit
        FROM AAU.Visit
        WHERE Date >= prmVisitDate
        AND IsDeleted = FALSE
        GROUP BY StreetTreatCaseId
	) fv

	INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = fv.StreetTreatCaseId
		AND fv.NextVisit = v.Date
        AND v.IsDeleted = 0
) nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId

	WHERE nv.NextVisit = prmVisitDate -- Only get active cases
    AND c.IsDeleted = 0
    AND nv.NextVisit <= IFNULL(c.ClosedDate, DATE_ADD(NOW(), INTERVAL 10 YEAR));

END$$
DELIMITER ;


DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesWithMissedLastVisitForUserTeam !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesWithMissedLastVisitForUserTeam( IN prm_username VARCHAR(64) )
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return active cases for the Admin screen.

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id and logging.

Modified By: Jim Mackenzie
Modified On: 07/12/2020
Description: Altering to run from new Apoms tables
*/

	SELECT
			c.StreetTreatCaseId AS CaseId,
			ec.EmergencyNumber,
            p.TagNumber,
			at.AnimalType,
            at.AnimalTypeId,
            s.Status,
            s.StatusId,
			p.Description AS AnimalName,
			nv.NextVisit,
            nv.NextVisitStatusId,
			pc.PercentComplete,
			ec.Location AS Address,
			pr.Priority,
            pr.PriorityId,
            t.TeamName,
            t.TeamId,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            p.PatientStatusDate AS ReleasedDate,
            c.ClosedDate,
            c.EarlyReleaseFlag,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        c.Name, 
        c.Number, 
        ec.Latitude, 
        ec.Longitude, 
        ec.Location, 
        ec.EmergencyNumber 
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.Team t ON c.TeamId = t.TeamId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
	INNER JOIN AAU.User u ON u.TeamId = t.TeamId AND u.UserName = prm_username
	LEFT JOIN
		(
		SELECT StreetTreatCaseId,
		SUM(CASE WHEN StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete
		FROM AAU.Visit
        GROUP BY StreetTreatCaseId
		) AS pc ON pc.StreetTreatCaseId = c.StreetTreatCaseId

INNER JOIN
(
   SELECT v.StreetTreatCaseId, v.StatusId AS NextVisitStatusId, fv.NextVisit
   FROM
   (
        SELECT StreetTreatCaseId, MIN(Date) AS NextVisit
        FROM AAU.Visit
        WHERE IsDeleted = FALSE
        GROUP BY StreetTreatCaseId
	) fv

	INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = fv.StreetTreatCaseId
		AND fv.NextVisit = v.Date
        AND v.IsDeleted = 0
) nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId
INNER JOIN
(
SELECT v.StreetTreatCaseId
FROM
	(
			SELECT StreetTreatCaseId, MAX(Date) AS LastVisit
			FROM AAU.Visit
			WHERE IsDeleted = FALSE
			AND Date <= CURDATE()
			GROUP BY StreetTreatCaseId
	) lv
    INNER JOIN AAU.Visit v ON lv.StreetTreatCaseId = v.StreetTreatCaseId
    AND v.Date = lv.LastVisit
	AND v.StatusId = 3
) lvm ON lvm.StreetTreatCaseId = c.StreetTreatCaseId

	WHERE c.IsDeleted = 0
    AND c.StatusId < 3
    AND nv.NextVisit <= IFNULL(c.ClosedDate, DATE_ADD(NOW(), INTERVAL 10 YEAR));

END$$
DELIMITER ;


DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesWithNoVisits !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesWithNoVisits()
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return active cases for the Admin screen

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id and logging.

Modified By: Jim Mackenzie
Modified On: 07/12/2020
Description: Altering to run from new Apoms tables
*/

	SELECT
			c.StreetTreatCaseId AS CaseId,
			ec.EmergencyNumber,
            p.TagNumber,
			at.AnimalType,
            at.AnimalTypeId,
            s.Status,
            s.StatusId,
			p.Description AS AnimalName,
			nv.NextVisit,
            nv.NextVisitStatusId,
			pc.PercentComplete,
            pc.VisitList,
			ec.Location AS Address,
			pr.Priority,
            pr.PriorityId,
            t.TeamName,
            t.TeamId,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            p.PatientStatusDate AS ReleasedDate,
            c.ClosedDate,
            c.EarlyReleaseFlag,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        c.Name, 
        c.Number, 
        ec.Latitude, 
        ec.Longitude, 
        ec.Location, 
        ec.EmergencyNumber 
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.Team t ON t.TeamId = c.TeamId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
    
	LEFT JOIN
		(
		SELECT v.StreetTreatCaseId AS CaseId,
		SUM(CASE WHEN v.StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete,
        GROUP_CONCAT(s.Status ORDER BY v.Date DESC) AS VisitList
		FROM AAU.Visit v
        INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
        GROUP BY v.StreetTreatCaseId
		) AS pc ON pc.CaseId = c.StreetTreatCaseId

	LEFT JOIN
		(
		SELECT nvr.StreetTreatCaseId, nvr.NextVisit, v.StatusId AS NextVisitStatusId
		FROM
			(        
			SELECT StreetTreatCaseId,
			MIN(Date) AS NextVisit
			FROM AAU.Visit
			WHERE Date >= CURDATE()
			AND StatusId IN (1,2)
			GROUP BY StreetTreatCaseId
 			) AS nvr
		INNER JOIN AAU.Visit v ON nvr.StreetTreatCaseId = v.StreetTreatCaseId
           AND v.Date = nvr.NextVisit           
            
		) AS nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId
		
	WHERE c.StatusId <= 3
    AND nv.NextVisit IS NULL; -- Only get active `

END$$
DELIMITER ;


DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesWithVisitByDate !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesWithVisitByDate(IN prm_VisitDate DATE)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return active cases for the Admin screen

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id and logging.

Modified By: Jim Mackenzie
Modified On: 07/12/2020
Description: Altering to run from new Apoms tables
*/

	SELECT
			c.StreetTreatCaseId AS CaseId,
			ec.EmergencyNumber,
            p.TagNumber,
			at.AnimalType,
            s.Status,
			p.Description AS AnimalName,
			v.Date AS NextVisit,
            v.StatusId AS VisitStatusId,
            v.VisitTypeId,
			pc.PercentComplete,
            pc.VisitList,
			ec.Location AS Address,
			pr.Priority,
            t.TeamName,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        c.Name, 
        c.Number, 
        ec.Latitude, 
        ec.Longitude, 
        ec.Location, 
        ec.EmergencyNumber 
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.Team t ON t.TeamId = c.TeamId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
    INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = c.StreetTreatCaseId
	LEFT JOIN
		(
		SELECT v.StreetTreatCaseId AS CaseId,
		SUM(CASE WHEN v.StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete,
        GROUP_CONCAT(s.Status ORDER BY v.Date DESC) AS VisitList
		FROM AAU.Visit v
        INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
        GROUP BY v.StreetTreatCaseId
		) AS pc ON pc.CaseId = c.StreetTreatCaseId
		
	WHERE v.Date = prm_VisitDate
    AND v.IsDeleted = 0
    AND c.IsDeleted = 0
    AND v.Date <= IFNULL(c.ClosedDate, DATE_ADD(NOW(), INTERVAL 10 YEAR))
	ORDER BY ec.EmergencyNumber ASC, p.TagNumber ASC;

END$$
DELIMITER ;

DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetCaseById !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCaseById( IN prm_streetTreatCaseId INT, OUT Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return a case by ID.

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id.

Modified By: Jim Mackenzie
Modified On: 07/12/2020
Description: Altering to run from new Apoms tables
*/

SELECT	c.StreetTreatCaseId AS CaseId,
		ec.EmergencyNumber,
		p.TagNumber,
		pc.PercentComplete,
		nv.NextVisit,
		at.AnimalTypeId,
		c.PriorityId,
		c.StatusId,
		c.TeamId,
		p.Description AS AnimalName,
		ec.Name AS ComplainerName,
		ec.Number AS ComplainerNumber,
		ec.Location AS Address,
		ec.Latitude,
		ec.Longitude,
		c.AdminComments AS AdminNotes,
		c.OperatorNotes,
        p.PatientStatusDate AS ReleasedDate,
        c.ClosedDate,
        ce.IsIsolation,
        c.EarlyReleaseFlag,
		c.IsDeleted,
        c.MainProblemId
FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        c.Name, 
        c.Number, 
        ec.Latitude, 
        ec.Longitude, 
        ec.Location, 
        ec.EmergencyNumber 
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN
		(
		SELECT TagNumber, TRUE AS IsIsolation
		FROM AAU.Census c
		INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId
		WHERE ca.Area LIKE '%ISO%'
		) ce ON ce.TagNumber = p.TagNumber
LEFT JOIN
		(
		SELECT StreetTreatCaseId,
		SUM(CASE WHEN StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete
		FROM AAU.Visit
        GROUP BY StreetTreatCaseId
		) AS pc ON pc.StreetTreatCaseId = c.StreetTreatCaseId

	LEFT JOIN
		(
		SELECT StreetTreatCaseId,
		MIN(Date) AS NextVisit
		FROM AAU.Visit
		WHERE Date >= CURDATE()
		AND StatusId IN (1,2)
        GROUP BY StreetTreatCaseId
		) AS nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId
WHERE c.StreetTreatCaseId = prm_streetTreatCaseId;

SELECT 1 INTO Success;


END$$
DELIMITER ;


DELIMITER ;;
CREATE PROCEDURE AAU.sp_GetSearchedCases(
											IN prm_CaseId INT,
											IN prm_EmergencyNumber INT,
											IN prm_TagNumber VARCHAR(64),
											IN prm_AnimalTypeId INT,
                                            IN prm_StatusId INT,
											IN prm_AnimalName VARCHAR(64),
											IN prm_PriorityId INT,
											IN prm_TeamId INT,											
                                            IN prm_EarlyReleaseFlag BOOLEAN)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return active cases for the Admin screen
*/

	SELECT
			c.StreetTreatCaseId AS CaseId,
			ec.EmergencyNumber,
            p.TagNumber,
			at.AnimalType,
            at.AnimalTypeId,
            s.Status,
            s.StatusId,
			p.Description AS AnimalName,
			nv.NextVisit,
            nv.NextVisitStatusId,
			pc.PercentComplete,
            pc.VisitList,
			ec.Location AS Address,
			pr.Priority,
            pr.PriorityId,
            t.TeamName,
			t.TeamId,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            p.PatientStatusDate AS ReleasedDate,
            c.ClosedDate,
            c.EarlyReleaseFlag,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        c.Name, 
        c.Number, 
        ec.Latitude, 
        ec.Longitude, 
        ec.Location, 
        ec.EmergencyNumber 
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.Team t ON t.TeamId = c.TeamId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
	LEFT JOIN
		(
		SELECT v.StreetTreatCaseId,
		SUM(CASE WHEN v.StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete,
        GROUP_CONCAT(s.Status ORDER BY v.Date DESC) AS VisitList
		FROM AAU.Visit v
        INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
        WHERE v.Date < current_date
        GROUP BY v.StreetTreatCaseId
		) AS pc ON pc.StreetTreatCaseId = c.StreetTreatCaseId

	LEFT JOIN
    (
    SELECT nvr.StreetTreatCaseId, nvr.NextVisit, v.StatusId AS NextVisitStatusId
    FROM
		(
		SELECT StreetTreatCaseId,
		MIN(Date) AS NextVisit
		FROM AAU.Visit
		WHERE Date >= CURDATE()
		AND StatusId IN (1,2)
        GROUP BY StreetTreatCaseId
		) AS nvr
	INNER JOIN AAU.visit v ON v.Date = nvr.NextVisit
            AND v.StreetTreatCaseId = nvr.StreetTreatCaseId
	) nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId
		
	WHERE
    (c.StreetTreatCaseId = prm_CaseId OR prm_CaseId IS NULL)
    AND
	(ec.EmergencyNumber = prm_EmergencyNumber OR prm_EmergencyNumber IS NULL)
	AND
	(p.TagNumber = prm_TagNumber OR prm_TagNumber IS NULL)
	AND
	(p.AnimalTypeId = prm_AnimalTypeId OR prm_AnimalTypeId IS NULL)
    AND
    (c.StatusId = prm_StatusId OR prm_StatusId IS NULL)
	AND
	(p.Description = prm_AnimalName OR prm_AnimalName IS NULL)
	AND
	(c.PriorityId = prm_PriorityId OR prm_PriorityId IS NULL)
	AND
	(c.TeamId = prm_TeamId OR prm_TeamId IS NULL)
    AND
    (c.EarlyReleaseFlag = prm_EarlyReleaseFlag OR prm_EarlyReleaseFlag IS NULL);
											

END$$
DELIMITER ;


DELIMITER ;;
CREATE PROCEDURE AAU.sp_GetPatientDetailsbyArea(IN prm_Username VARCHAR(45),
												IN prm_Area VARCHAR(45))
BEGIN

DECLARE IsCensusArea BOOLEAN;
SET IsCensusArea = TRUE;

DROP TEMPORARY TABLE IF EXISTS AnimalTypeIds;

CREATE TEMPORARY TABLE IF NOT EXISTS AnimalTypeIds
(
AnimalTypeId INTEGER,
AnimalType VARCHAR(64)
);

IF prm_Area IN ('Shelter Dogs','Upper Handi Heaven','A-Kennel','Handi Heaven','B-Kennel','Isolation','ABC Centre','Pre-Isolation','Puppy','Blind Dogs') THEN

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType IN ('Dog' , 'Puppy');

SET IsCensusArea = FALSE;

ELSEIF prm_Area = 'Cat area' THEN

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType IN ('Cat' , 'Kitten');

ELSEIF prm_Area = 'Large Animal Hospital' THEN

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType IN ('Bull' , 'Calf' , 'Cow' , 'Donkey' , 'Buffalo' , 'Buffalo Calf' , 'Camel' , 'Horse');

ELSEIF prm_Area = 'Sheep area' THEN

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType IN ('Sheep' , 'Goat' , 'Tortoise');

ELSEIF prm_Area = 'Bird treatment area' THEN

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType IN ('Bird' , 'Chicken' , 'Parrot' , 'Pigeon' , 'Sparrow');

ELSE

INSERT INTO AnimalTypeIds
SELECT AnimalTypeId, AnimalType
FROM AAU.AnimalType
WHERE OrganisationId = 1
AND AnimalType NOT IN ('Cat' , 'Kitten', 'Bull' , 'Calf' , 'Cow' , 'Donkey' , 'Buffalo' , 'Buffalo Calf' , 'Camel' , 'Horse', 'Goat' , 'Sheep' , 'Goat' , 'Tortoise', 'Bird' , 'Chicken' , 'Parrot' , 'Pigeon' , 'Sparrow');

END IF;

IF IsCensusArea = TRUE THEN

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencynumber" , ec.EmergencyNumber),
JSON_OBJECT("tagnumber" , p.TagNumber),
JSON_OBJECT("species" , aty.AnimalType),
JSON_OBJECT("callername" , ec.Name),
JSON_OBJECT("number" , ec.Number),
JSON_OBJECT("calldate" , DATE_Format(ec.CallDatetime,"%Y-%m-%d")),
JSON_OBJECT("treatmentPriority", p.TreatmentPriority),
JSON_OBJECT("abcStatus", p.ABCStatus),
JSON_OBJECT("releaseStatus", p.ReleaseStatus),
JSON_OBJECT("temperament", p.Temperament),
JSON_OBJECT("releaseReady", CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN TRUE ELSE FALSE END)
))patientDetails
FROM AAU.Patient p
INNER JOIN AnimalTypeIds aty ON aty.AnimalTypeId = p.AnimalTypeId AND p.PatientStatusId = 1
INNER JOIN (
	SELECT ec.EmergencyNumber, 
    ec.EmergencyCaseId, 
    c.Name, 
    c.Number,
    ec.CallDatetime
	FROM AAU.EmergencyCase ec
	LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
	LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
	WHERE ecr.PrimaryCaller = 1
) ec ON ec.EmergencyCaseId = p.EmergencyCaseId;

ELSE

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencynumber" , ec.EmergencyNumber),
JSON_OBJECT("tagnumber" , p.TagNumber),
JSON_OBJECT("species" , aty.AnimalType),
JSON_OBJECT("callername" , ec.Name),
JSON_OBJECT("number" , ec.Number),
JSON_OBJECT("calldate" , DATE_Format(ec.CallDatetime,"%Y-%m-%d")),
JSON_OBJECT("treatmentPriority", p.TreatmentPriority),
JSON_OBJECT("abcStatus", p.ABCStatus),
JSON_OBJECT("releaseStatus", p.ReleaseStatus),
JSON_OBJECT("temperament", p.Temperament),
JSON_OBJECT("releaseReady", CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN "Ready for release" ELSE "" END)
))patientDetails
FROM AAU.Patient p
INNER JOIN AnimalTypeIds aty ON aty.AnimalTypeId = p.AnimalTypeId AND p.PatientStatusId = 1
INNER JOIN (
		SELECT ec.EmergencyNumber, 
		ec.EmergencyCaseId, 
		ec.CallDatetime, 
		ec.Name, 
		ec.Number
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
WHERE p.PatientId IN
(
SELECT c.PatientId  
	FROM AAU.Census c
	INNER JOIN AAU.CensusArea ca ON ca.AreaId = c.AreaId  
	INNER JOIN AAU.CensusAction csa ON csa.ActionId = c.ActionId  
	INNER JOIN  
	(  
		SELECT TagNumber, MAX(LatestCount) AS MaxLatestCount  
		FROM AAU.Census c  
		INNER JOIN AAU.CensusAction csa ON csa.ActionId = c.ActionId  
		WHERE SortAction IN (1,3)  
		GROUP BY TagNumber  
	) maxAction ON maxAction.TagNumber = c.TagNumber 
    AND maxAction.MaxLatestCount = c.LatestCount
    AND ca.Area = prm_Area
);

END IF;



END$$
DELIMITER ;

DELIMITER ;;
CREATE PROCEDURE AAU.sp_GetPrintPatientsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to return a Patient by ID.
*/

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
	JSON_OBJECT("patientId", p.PatientId),
    JSON_OBJECT("admissionDate", DATE_FORMAT(ec.AdmissionTime, "%d/%M/%Y")),
    JSON_OBJECT("animalType", aty.AnimalType),
    JSON_OBJECT("location", ec.Location),
    JSON_OBJECT("callerName", c.Name),
    JSON_OBJECT("callerNumber", c.Number),
    JSON_OBJECT("callerAlternativeNumber", c.AlternativeNumber),
    JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
	JSON_OBJECT("rescuer", u.FirstName),
	JSON_OBJECT("tagNumber", p.TagNumber)
    
)) AS Result   
    
FROM AAU.Patient p
INNER JOIN AAU.User u ON u.UserId = ec.Rescuer1Id
INNER JOIN (
		SELECT ec.EmergencyNumber, 
		ec.EmergencyCaseId, 
		ec.AdmissionTime,
		ec.CallDatetime, 
		ec.Name, 
		ec.Number,
		ec.Location
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
WHERE p.EmergencyCaseId = prm_EmergencyCaseId;

END$$
DELIMITER ;



DELIMITER ;;
CREATE PROCEDURE AAU.sp_GetPrintPatientByPatientId( IN prm_PatientId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to return a Patient by ID.
*/

SELECT	    

JSON_MERGE_PRESERVE(
	JSON_OBJECT("patientId", p.PatientId),
    JSON_OBJECT("admissionDate", DATE_FORMAT(ec.AdmissionTime, "%d/%M/%Y")),
    JSON_OBJECT("animalType", aty.AnimalType),
    JSON_OBJECT("location", ec.Location),
    JSON_OBJECT("callerName", ec.Name),
    JSON_OBJECT("callerNumber", ec.Number),
    JSON_OBJECT("callerAlternativeNumber", c.AlternativeNumber),
    JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
	JSON_OBJECT("rescuer", u.FirstName),
	JSON_OBJECT("tagNumber", p.TagNumber)
    
) AS Result   
    
FROM AAU.Patient p
INNER JOIN AAU.User u ON u.UserId = ec.Rescuer1Id
INNER JOIN (
		SELECT ec.EmergencyNumber, 
		ec.AdmissionTime,
		ec.EmergencyCaseId, 
		ec.CallDatetime, 
		ec.Name, 
		ec.Number,
		ec.Location
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
WHERE p.PatientId = prm_PatientId;

END$$
DELIMITER ;





-- Ask before change





