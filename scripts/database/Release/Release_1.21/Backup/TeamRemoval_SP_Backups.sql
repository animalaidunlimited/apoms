DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_DeleteTeamById`(IN prm_TeamId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 24/08/2018
Purpose: Used to delete a team by TeamId
*/

-- Check that the user actually exists first.

DECLARE vTeamExists INT;

SELECT COUNT(1) INTO vTeamExists FROM AAU.Team WHERE TeamId = prm_TeamId;

IF vTeamExists = 1 THEN

	UPDATE AAU.Team SET IsDeleted = 1 WHERE TeamId = prm_TeamId;
    SELECT 1 INTO prm_Success;
ELSE 
	SELECT -1 INTO prm_Success;
END IF;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetActiveCases`()
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
        FROM AAU.Emergencycase ec
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



DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetActiveCasesForTeamByDate`(	IN prm_teamId INT,
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
    AND p.TagNumber IS NOT NULL
    AND nv.NextVisit <= IFNULL(c.ClosedDate, DATE_ADD(NOW(), INTERVAL 10 YEAR));
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetActiveCasesForUserTeam`( IN prm_username VARCHAR(64) )
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
        FROM AAU.Emergencycase ec
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

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetActiveCasesForUserTeamByDate`(	IN prm_username VARCHAR(64),
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
        FROM AAU.Emergencycase ec
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

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetActiveCasesWithMissedLastVisitForUserTeam`( IN prm_username VARCHAR(64) )
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
        FROM AAU.Emergencycase ec
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

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetActiveCasesWithNoVisits`()
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
        FROM AAU.Emergencycase ec
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

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetActiveCasesWithVisitByDate`(IN prm_VisitDate DATE)
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
        FROM AAU.Emergencycase ec
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

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetActiveStreetTreatCasesWithNoVisits`( IN prm_Username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;

SELECT o.OrganisationId INTO vOrganisationId
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

/*
Created By: Ankit Singh
Created On: 10/02/2021
Purpose: Used to return active cases for the StreetTreat screen Changed Problem with MainProblem
*/
WITH casesCTE AS
(
	SELECT st.StreetTreatCaseId
	FROM AAU.StreetTreatCase st
	WHERE OrganisationId = vOrganisationId
    AND st.StreetTreatCaseid NOT IN (
		SELECT
			v.StreetTreatCaseid
		FROM AAU.Visit v
		WHERE v.statusid < 3 AND v.date > CURDATE()
    )
),
visitsCTE AS
(
	SELECT
		stc.StreetTreatCaseId,
        stc.PatientId,
		t.TeamId,
		t.TeamName,
        t.TeamColour,
        stc.PriorityId AS CasePriorityId,
        stc.StatusId AS CaseStatusId,
        ec.Latitude,
        ec.Longitude,
        ec.Location,
        p.TagNumber,
        p.Description,
        stc.PriorityId,
        pr.Priority,
        stc.MainProblemId,
        mp.MainProblem,
        ec.EmergencyCaseId,
        pr.Priority AS CasePriority,
        s.Status AS CaseStatus,
        at.AnimalType
	FROM AAU.StreetTreatCase stc
	INNER JOIN AAU.Team t ON t.TeamId = stc.TeamId
    INNER JOIN AAU.Patient p ON p.PatientId = stc.PatientId
    INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
    INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN AAU.Priority pr ON pr.PriorityId = stc.PriorityId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = stc.MainProblemId
    INNER JOIN AAU.Status s ON s.StatusId = stc.StatusId
	WHERE stc.StreetTreatCaseId IN (SELECT StreetTreatCaseId FROM casesCTE)
),
CaseCTE AS
(
SELECT
rawData.TeamId,
rawData.TeamName,
rawData.TeamColour,
rawData.StreetTreatCaseId,
rawData.CasePriorityId,
rawData.CasePriority,
rawData.CaseStatusId,
rawData.CaseStatus,
JSON_ARRAY() AS StreetTreatCases,

        JSON_OBJECT(
          'Latitude', rawData.Latitude,
          'Longitude',rawData.Longitude,
          'Address', rawData.Location

      )AS Position,
      JSON_OBJECT(
          'TagNumber', rawData.TagNumber,
          'AnimalName', rawData.Description,
          'AnimalType', rawData.AnimalType,
          'Priority', rawData.Priority,
          'PatientId',rawData.PatientId,
          'EmergencyCaseId',rawData.EmergencyCaseId
      ) AS AnimalDetails
FROM visitsCTE rawData
GROUP BY rawData.StreetTreatCaseId, rawData.TeamId, rawData.TeamName
)

SELECT

JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("TeamId", cases.TeamId),
JSON_OBJECT("TeamName", cases.TeamName),
JSON_OBJECT("TeamColour", cases.TeamColour),
JSON_OBJECT("StreetTreatCaseVisits", cases.StreetTreatCases)
)) AS Result
FROM
(
SELECT
caseVisits.TeamId,
caseVisits.TeamName,
caseVisits.TeamColour,
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("StreetTreatCaseId", caseVisits.StreetTreatCaseId),
JSON_OBJECT("StreetTreatCasePriorityId",caseVisits.CasePriorityId),
JSON_OBJECT("StreetTreatCasePriority",caseVisits.CasePriority),
JSON_OBJECT("StreetTreatCaseStatusId",caseVisits.CaseStatusId),
JSON_OBJECT("StreetTreatCaseStatus",caseVisits.CaseStatus),
JSON_OBJECT("Visits", caseVisits.StreetTreatCases),
JSON_OBJECT("Position",caseVisits.Position),
JSON_OBJECT("AnimalDetails",caseVisits.AnimalDetails)
)) AS StreetTreatCases
FROM CaseCTE caseVisits
GROUP BY caseVisits.TeamId,caseVisits.TeamName
) AS cases;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetActiveStreetTreatCasesWithVisitByDate`(IN prm_VisitDate DATE)
BEGIN

WITH casesCTE AS
(
	SELECT StreetTreatCaseId
	FROM AAU.Visit
	WHERE DATE = prm_VisitDate
),
visitsCTE AS
(
	SELECT
		stc.StreetTreatCaseId,
        stc.PatientId,
		t.TeamId,
		t.TeamName,
        t.TeamColour,
		v.Date,
		v.VisitTypeId,
		v.StatusId AS VisitStatusId,
        stc.PriorityId AS CasePriorityId,
        stc.StatusId AS CaseStatusId,
        ec.Latitude,
        ec.Longitude,
        ec.Location,
        p.TagNumber,
        p.Description,
        stc.PriorityId,
        pr.Priority,
        stc.MainProblemId,
        ec.EmergencyCaseId,
        pr.Priority AS CasePriority,
        s.Status AS CaseStatus,
        at.AnimalType,
        s.Status AS VisitStatus,
	ROW_NUMBER() OVER (PARTITION BY stc.StreetTreatCaseId ORDER BY v.Date DESC) AS RNum
	FROM AAU.Visit v
	INNER JOIN AAU.StreetTreatCase stc ON stc.StreetTreatCaseId = v.StreetTreatCaseId
	INNER JOIN AAU.Team t ON t.TeamId = stc.TeamId
	INNER JOIN AAU.Patient p ON p.PatientId = stc.PatientId
	INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = stc.PriorityId
	INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	WHERE stc.StreetTreatCaseId IN (SELECT StreetTreatCaseId FROM casesCTE)
    AND v.isDeleted = 0
	AND v.Date = prm_VisitDate
),
CaseCTE AS
(
SELECT
rawData.TeamId,
rawData.TeamName,
rawData.TeamColour,
rawData.StreetTreatCaseId,
rawData.CasePriorityId,
rawData.CasePriority,
rawData.CaseStatusId,
rawData.CaseStatus,
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("VisitDate", rawData.Date),
		JSON_OBJECT("VisitStatusId", rawData.VisitStatusId),
		JSON_OBJECT("VisitTypeId", rawData.VisitTypeId),
		JSON_OBJECT("VisitStatus",rawData.VisitStatus)
	)
) AS StreetTreatCases,

JSON_OBJECT(
  'Latitude', rawData.Latitude,
  'Longitude',rawData.Longitude,
  'Address', rawData.Location

)AS Position,
JSON_OBJECT(
  'TagNumber', rawData.TagNumber,
  'AnimalName', rawData.Description,
   "AnimalType", rawData.AnimalType,
  'Priority', rawData.Priority,
  'PatientId',rawData.PatientId,
  'EmergencyCaseId',rawData.EmergencyCaseId
) AS AnimalDetails
FROM visitsCTE rawData
WHERE RNum <= 5
GROUP BY rawData.TeamId,
rawData.TeamName,
rawData.TeamColour,
rawData.StreetTreatCaseId,
rawData.CasePriorityId,
rawData.CasePriority,
rawData.CaseStatusId,
rawData.CaseStatus
)

SELECT
JSON_OBJECT("Cases",
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("TeamId", cases.TeamId),
		JSON_OBJECT("TeamName", cases.TeamName),
		JSON_OBJECT("TeamColour", cases.TeamColour),
		JSON_OBJECT("StreetTreatCaseVisits", cases.StreetTreatCases)
	)
)
)
AS Result
FROM
(
SELECT
caseVisits.TeamId,
caseVisits.TeamName,
caseVisits.TeamColour,
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("StreetTreatCaseId", caseVisits.StreetTreatCaseId),
JSON_OBJECT("StreetTreatCasePriorityId",caseVisits.CasePriorityId),
JSON_OBJECT("StreetTreatCasePriority",caseVisits.CasePriority),
JSON_OBJECT("StreetTreatCaseStatusId",caseVisits.CaseStatusId),
JSON_OBJECT("StreetTreatCaseStatus",caseVisits.CaseStatus),
JSON_OBJECT("Visits", caseVisits.StreetTreatCases),
JSON_OBJECT("Position",caseVisits.Position),
JSON_OBJECT("AnimalDetails",caseVisits.AnimalDetails)
)) AS StreetTreatCases
FROM CaseCTE caseVisits
GROUP BY caseVisits.TeamId,
caseVisits.TeamName,
caseVisits.TeamColour
) AS cases;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetAllTeams`( IN prm_Username VARCHAR(45))
BEGIN
/*
Created By: Jim Mackenzie
Created On: 23/08/2018
Purpose: Used to return a list of the teams

Modified By: Ankit Singh
Modifeid On: 03/02/2021
Purpose: Used to return a list of the teams with colour
*/

DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE UserName = prm_Username LIMIT 1;

SELECT t.TeamId, t.TeamName, t.Capacity, t.TeamColour, COUNT(u.UserId) AS Members, t.IsDeleted
FROM AAU.Team t
LEFT OUTER JOIN AAU.User u ON u.TeamId = t.TeamId
WHERE t.IsDeleted != 1
AND t.OrganisationId = vOrganisationId
GROUP BY t.TeamId, t.TeamName, t.Capacity, t.IsDeleted, t.TeamColour;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetAllVisitsAndDates`( IN prm_Username VARCHAR(45))
BEGIN
/*
Created By: Ankit Singh
Created On: 28/01/2021
Purpose: Used to return all visit in a month Chart.
*/

DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE UserName = prm_Username LIMIT 1;

WITH chart AS (
	SELECT 
		v.Date,
        JSON_OBJECT(
		"name",t.TeamName,
		"value",count(t.TeamName)
        ) AS series
	FROM AAU.Visit v
	LEFT JOIN AAU.StreetTreatCase st ON st.StreetTreatCaseId= v.StreetTreatCaseId 
	LEFT JOIN AAU.Team t ON t.TeamId = st.TeamId
	WHERE v.IsDeleted = 0 AND v.Date BETWEEN DATE(NOW()) - INTERVAL 7 DAY AND DATE(NOW()) + INTERVAL 14 DAY
    AND st.OrganisationId = vOrganisationId
    GROUP BY v.Date,t.TeamName
),
teamColours AS (
	SELECT JSON_ARRAYAGG(JSON_OBJECT("name",t.TeamName,"value", t.TeamColour)) AS teamColours FROM AAU.Team t WHERE t.OrganisationId = vOrganisationId
),
chartData AS (
	SELECT 
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("name",DATE_FORMAT(chart.Date,"%e/%m")),
			JSON_OBJECT("series",JSON_ARRAYAGG(chart.series))
	) AS chartData
	FROM chart GROUP BY chart.Date 
)

SELECT 
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("teamColours",teamColours.teamColours),
    JSON_OBJECT("chartData",JSON_ARRAYAGG(chartData.chartData))
    ) AS Result
FROM teamColours, chartData GROUP BY teamColours.teamColours;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetCaseById`( IN prm_streetTreatCaseId INT, OUT Success INT)
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
        te.IsIsolation,
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
        FROM AAU.Emergencycase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN
		(
		SELECT TagNumber, TRUE AS IsIsolation
		FROM AAU.TreatmentList t
		INNER JOIN AAU.TreatmentArea ta ON ta.TreatmentAreaId = t.TreatmentAreaId
		WHERE ta.TreatmentArea LIKE '%ISO%'
		) te ON te.TagNumber = p.TagNumber
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

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetStreetTreatCaseById`( IN prm_streetTreatCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return a case by ID.

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id.

Modified By: Ankit Singh
Modified On: 23/12/2020
Description: Adding Primary Caller Name and Number. 

Modified By: Ankit Singh
Modified On: 28/01/2021
Description: Adding Case END and Begin Date. 
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
        ec.EmergencyCaseId,
		p.Description AS AnimalName,
		caller.Name AS ComplainerName,
		caller.Number AS ComplainerNumber,
		ec.Location AS Address,
		ec.Latitude,
		ec.Longitude,
		c.AdminComments AS AdminNotes,
		c.OperatorNotes,
        DATE_FORMAT(CAST( 
        ( CASE 
			WHEN p.PatientCallOutcomeId = 18 THEN
				ec.CallDateTime
            ELSE
				IFNULL(rd.EndDate,p.PatientStatusDate)
            END
		) AS Date),"%Y-%m-%d") AS BeginDate,
        DATE_FORMAT(CAST(c.ClosedDate AS Date),"%Y-%m-%d") AS EndDate,
        IFNULL(ce.IsIsolation,0) AS IsIsolation,
        c.EarlyReleaseFlag,
		c.IsDeleted,
        c.MainProblemId
FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN AAU.EmergencyCaller ecall ON ecall.EmergencyCaseId = ec.EmergencyCaseId AND ecall.PrimaryCaller = 1
    INNER JOIN AAU.Caller caller ON caller.CallerId = ecall.CallerId 
    INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
    LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
LEFT JOIN
		(
		SELECT TagNumber, TRUE AS IsIsolation
		FROM AAU.TreatmentList tl
        INNER JOIN AAU.Patient p ON p.PatientId = tl.PatientId        
		INNER JOIN AAU.TreatmentArea ta ON ta.TreatmentAreaId = tl.InTreatmentAreaId
		WHERE ta.TreatmentArea LIKE '%ISO%'
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
		DATE_FORMAT(MIN(Date),"%Y-%m-%d") AS NextVisit
		FROM AAU.Visit
		WHERE Date >= CURDATE()
		AND StatusId IN (1,2)
        GROUP BY StreetTreatCaseId
		) AS nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId
WHERE c.StreetTreatCaseId = prm_streetTreatCaseId;

SELECT 1 AS Success;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetStreetTreatCaseByPatientId`(
							IN prm_PatientId INT
)
BEGIN
DECLARE vSuccess INT;
DECLARE visitExists INT;
DECLARE vStreetTreatCaseIdExists INT;

SELECT count(StreetTreatCaseId) INTO vStreetTreatCaseIdExists FROM AAU.Streettreatcase WHERE PatientId=prm_PatientId;

SELECT count(1) INTO visitExists FROM AAU.Visit WHERE StreetTreatCaseId = (SELECT DISTINCT s.StreetTreatCaseId FROM AAU.Streettreatcase s, AAU.Visit v WHERE s.PatientId=prm_PatientId  AND (v.IsDeleted IS NULL OR v.IsDeleted = 0));

IF visitExists > 0 AND vStreetTreatCaseIdExists> 0 THEN
SELECT
	JSON_MERGE_PRESERVE(
			JSON_OBJECT("streetTreatCaseId",s.StreetTreatCaseId),
			JSON_OBJECT("patientId",s.PatientId),
			JSON_OBJECT("casePriority",s.PriorityId),
			JSON_OBJECT("teamId",s.TeamId),
			JSON_OBJECT("mainProblem",s.MainProblemId),
            JSON_OBJECT("adminNotes",s.AdminComments),
            JSON_OBJECT("streetTreatCaseStatus",s.StatusId),
            JSON_OBJECT("visits",
				JSON_ARRAYAGG(
					JSON_MERGE_PRESERVE(
						JSON_OBJECT("visitId",v.VisitId),
						JSON_OBJECT("visit_day",v.Day),
						JSON_OBJECT("visit_status",v.StatusId),
						JSON_OBJECT("visit_type",v.VisitTypeId),
						JSON_OBJECT("visit_comments",v.AdminNotes)
					)
				)
            )
	) 
AS Result
	FROM
		AAU.Visit v
        LEFT JOIN AAU.Streettreatcase s ON s.StreetTreatCaseId = v.StreetTreatCaseId
	WHERE 
		s.PatientId = prm_PatientId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0);
        
ELSEIF visitExists = 0  AND vStreetTreatCaseIdExists > 0 THEN 
	SELECT
	JSON_MERGE_PRESERVE(
			JSON_OBJECT("streetTreatCaseId",s.StreetTreatCaseId),
			JSON_OBJECT("patientId",s.PatientId),
			JSON_OBJECT("casePriority",s.PriorityId),
			JSON_OBJECT("teamId",s.TeamId),
			JSON_OBJECT("mainProblem",s.MainProblemId),
            JSON_OBJECT("adminNotes",s.AdminComments),
            JSON_OBJECT("streetTreatCaseStatus",s.StatusId),
            JSON_OBJECT("visits",
				JSON_ARRAYAGG(
					JSON_MERGE_PRESERVE(
						JSON_OBJECT("visitId",null),
						JSON_OBJECT("visit_day",null),
						JSON_OBJECT("visit_status",null),
						JSON_OBJECT("visit_type",null),
						JSON_OBJECT("visit_comments",null)
					)
				)
            )
		)
	AS Result
		FROM
			AAU.Streettreatcase s
	WHERE
		s.PatientId = prm_PatientId ;
ELSE
	SELECT null AS Result;
END IF;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetStreetTreatWithVisitDetailsByPatientId`(IN prm_PatientId INT)
BEGIN
DECLARE vStreetTreatCaseIdExists INT;
/*
Created By: Ankit Singh
Created On: 23/02/2020
Purpose: Used to fetch streettreat case with visits by patient id
*/



SELECT COUNT(StreetTreatCaseId) INTO vStreetTreatCaseIdExists FROM AAU.StreetTreatCase WHERE PatientId=prm_PatientId;


IF vStreetTreatCaseIdExists > 0 THEN
SELECT
	JSON_OBJECT( 
	"streetTreatForm",
				JSON_OBJECT(
					"streetTreatCaseId", s.StreetTreatCaseId,
				    "patientId",s.PatientId,
                    "callDateTime", ec.CallDateTime,
				    "casePriority",s.PriorityId,
				    "teamId",s.TeamId,
                    "autoAdded", IF(p.PatientCallOutcomeId = 18, true, false),
					"assignedVehicleId",s.AssignedVehicleId,
					"ambulanceAssignmentTime",DATE_FORMAT(s.AmbulanceAssignmentTime, "%Y-%m-%dT%H:%i:%s"),
				    "mainProblem",s.MainProblemId,
				    "adminNotes",s.AdminComments,
				    "streetTreatCaseStatus",s.StatusId,
                    "patientReleaseDate",IF(p.PatientStatusId = 8, p.PatientStatusDate, null),
					"visits",
					JSON_ARRAYAGG(
						JSON_OBJECT(
								"visitId",v.VisitId,
								"visit_day",v.Day,
								"visit_status",v.StatusId,
								"visit_type",v.VisitTypeId,
								"visit_comments",v.AdminNotes,
                                "visit_date",v.Date,
                                "operator_notes",v.OperatorNotes
						 )
					)
				)
		) 
AS Result
	FROM AAU.StreetTreatCase s
        INNER JOIN AAU.Patient p ON p.PatientId = s.PatientId
        INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
        LEFT JOIN AAU.Visit v  ON s.StreetTreatCaseId = v.StreetTreatCaseId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0)
	WHERE 
		s.PatientId =  prm_PatientId
	GROUP BY s.StreetTreatCaseId;
ELSE
	SELECT null AS Result;
END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetTeamById`(IN prm_TeamId INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 24/08/2018
Purpose: Used to return a team by ID.
*/

SELECT
		CASE WHEN prm_TeamId = -1 THEN -1 ELSE t.TeamId END AS TeamId,
		CASE WHEN prm_TeamId = -1 THEN 'All Teams' ELSE t.TeamName END AS TeamName,
		SUM(t.Capacity) AS Capacity
FROM AAU.Team t
WHERE (t.TeamId = prm_TeamId OR prm_TeamId = -1)
GROUP BY 	t.TeamId;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetUserById`(IN prm_userId INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to return a single user from the database. Initially
		 for edit purposes.
*/

	-- Dont really need to do much here, just return the user record
    -- for the moment
	SELECT u.UserId, u.FirstName, u.Surname, u.UserName,
    u.Password, u.Telephone, t.TeamId, t.TeamName, r.RoleId, r.RoleName,
    IF(u.IsDeleted, 'Yes', 'No') AS IsDeleted
    
    FROM AAU.User u
    LEFT JOIN AAU.Team t ON t.TeamId = u.TeamId
    LEFT JOIN AAU.Role r ON r.RoleId = u.RoleId
    WHERE u.UserId = prm_userId;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_getUserByUsername`(IN UserName VARCHAR(64))
BEGIN

	SELECT u.UserId,u.OrganisationId, u.UserName, u.FirstName, u.Surname, u.Initials, u.preferences, u.Password , t.TeamName, t.TeamId, o.SocketEndPoint
    FROM AAU.User u
    LEFT JOIN AAU.Team t ON t.TeamId = u.TeamId
    INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
    WHERE u.UserName = UserName;
END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetUsersByIdRange`(IN prm_UserName VARCHAR(64))
BEGIN
/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to return a single user from the database. Initially
		 for edit purposes.
*/

DECLARE vOrganisationId INT;

SET vOrganisationId = 0;

SELECT OrganisationId INTO vOrganisationId
FROM AAU.User u 
WHERE UserName = prm_Username LIMIT 1;

SELECT 

JSON_ARRAYAGG(
JSON_MERGE_PRESERVE( 
JSON_OBJECT("userId",UserDetails.UserId),
JSON_OBJECT("firstName",UserDetails.FirstName),
JSON_OBJECT("surName",UserDetails.Surname),
JSON_OBJECT("initials",UserDetails.Initials),
JSON_OBJECT("colour",UserDetails.Colour),
JSON_OBJECT("telephone",UserDetails.Telephone),
JSON_OBJECT("userName",UserDetails.UserName),
JSON_OBJECT("teamId",UserDetails.TeamId),
JSON_OBJECT("team",UserDetails.TeamName),
JSON_OBJECT("roleId",UserDetails.RoleId),
JSON_OBJECT("role",UserDetails.RoleName),
JSON_OBJECT("jobTitleId",UserDetails.JobTypeId),
JSON_OBJECT("jobTitle",UserDetails.JobTitle),
JSON_OBJECT("isDeleted",UserDetails.IsDeleted),
JSON_OBJECT("permissionArray",userDetails.PermissionArray)
))  AS userDetails
FROM (SELECT u.UserId, u.FirstName, u.Surname, u.PermissionArray, u.Initials, u.Colour, u.Telephone,
			u.UserName, u.Password, t.TeamId, t.TeamName, r.RoleId , r.RoleName,jobTitle.JobTypeId, jobTitle.JobTitle, IF(u.IsDeleted, 'Yes', 'No') 
            AS IsDeleted
		FROM AAU.User u
		LEFT JOIN AAU.Team t ON t.TeamId = u.TeamId
		LEFT JOIN AAU.Role r ON r.RoleId = u.RoleId
		LEFT JOIN (SELECT 
					ujt.UserId,
					GROUP_CONCAT(jt.JobTypeId) AS JobTypeId,
					GROUP_CONCAT(jt.Title) AS JobTitle
					FROM AAU.UserJobType ujt
					INNER JOIN AAU.JobType jt ON jt.JobTypeId = ujt.JobTypeId
					Where ujt.IsDeleted = 0
                    GROUP BY ujt.UserId
					ORDER BY UserId ASC) jobTitle
	ON jobTitle.UserId = u.UserId
    WHERE u.UserId <> -1
    AND u.OrganisationId = vOrganisationId
    ORDER BY u.UserId ASC) UserDetails;
        
-- WHERE UserDetails.UserId BETWEEN prm_userIdStart AND prm_UserIdEnd;


END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetVisits`(	IN prm_StreetTreatCaseId INT,
									IN prm_TeamId INT,
									IN prm_VisitDateStart DATE,
									IN prm_VisitDateEnd DATE)
BEGIN


IF (prm_StreetTreatCaseId IS NOT NULL OR
prm_TeamId IS NOT NULL OR
(
prm_VisitDateStart IS NOT NULL AND
prm_VisitDateEnd IS NOT NULL
))
THEN

SELECT 						v.VisitId,
							v.StreetTreatCaseId,
							v.VisitTypeId,
                            vt.VisitType,
							v.Date,
							v.StatusId,
                            s.Status,
							IFNULL(v.AdminNotes,'') AS AdminNotes,
							IFNULL(v.OperatorNotes,'') AS OperatorNotes,
							v.IsDeleted
FROM AAU.Visit v
INNER JOIN AAU.VisitType vt ON vt.VisitTypeId = v.VisitTypeId
INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
INNER JOIN AAU.StreetTreatCase c ON c.StreetTreatCaseId = v.StreetTreatCaseId
WHERE
	v.isDeleted = 0
    AND c.IsDeleted = 0
    AND
    v.Date <= IFNULL(c.ClosedDate,DATE_ADD(NOW(), INTERVAL 100 DAY))
    AND
	(
		c.StreetTreatCaseId = prm_StreetTreatCaseId
    OR
		prm_StreetTreatCaseId IS NULL
    )
	AND
    (
		v.Date BETWEEN prm_VisitDateStart AND prm_VisitDateEnd
	OR 
		(prm_VisitDateStart IS NULL AND prm_VisitDateEnd IS NULL)
	)
    AND
    (
		c.TeamId = prm_TeamId
    OR    
		prm_TeamId IS NULL
	OR
		prm_TeamId = 1
    );
END IF;
END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_InsertCase`(
									IN prm_EmergencyNumber INT,
                                    IN prm_TagNumber VARCHAR(64),
									IN prm_AnimalTypeId INT,
									IN prm_PriorityId INT,
									IN prm_StatusId INT,
									IN prm_TeamId INT,
                                    IN prm_MainProblemId INT,
									IN prm_AnimalName NVARCHAR(128),
									IN prm_ComplainerName NVARCHAR(128),
									IN prm_ComplainerNumber NVARCHAR(128),
									IN prm_Address NVARCHAR(128),
									IN prm_Latitude DECIMAL(15,9),
									IN prm_Longitude DECIMAL(15,9),
									IN prm_AdminNotes TEXT,
									IN prm_OperatorNotes TEXT,
                                    IN prm_ReleasedDate DATE,
                                    IN prm_ClosedDate DATE,
                                    IN prm_IsIsolation BOOLEAN,
                                    IN prm_EarlyReleaseFlag BOOLEAN,
									IN prm_IsDeleted BOOLEAN,
									OUT prm_StreetTreatCaseId INT,
									OUT prm_Success INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to insert a new case.

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id and logging.
*/

DECLARE vEmNoExists INT;
DECLARE vPatientId INT;
SET vEmNoExists = 0;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.StreetTreatCase stc
INNER JOIN AAU.Patient p ON p.PatientId = stc.PatientId
WHERE TagNumber = prm_TagNumber;

SELECT PatientId INTO vPatientId FROM AAU.Patient WHERE TagNumber = prm_tagNumber;

IF vEmNoExists = 0 THEN

INSERT INTO AAU.StreetTreatCase
						(
                        PatientId,
						PriorityId,
						StatusId,
						TeamId,
                        MainProblemId,
						AdminComments,
						OperatorNotes,
                        ClosedDate,
                        EarlyReleaseFlag
						)
				VALUES
						(
                        vPatientId,
						prm_PriorityId,
						prm_StatusId,
						prm_TeamId,
                        prm_MainProblemId,
						prm_AdminNotes,
						prm_OperatorNotes,
                        prm_ClosedDate,
                        prm_EarlyReleaseFlag
						);
                        
	SELECT 1 INTO prm_Success;
    SELECT LAST_INSERT_ID() INTO prm_StreetTreatCaseId;
    
    UPDATE AAU.Patient SET Description = prm_AnimalName WHERE TagNumber = prm_TagNumber;
    
	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,prm_StreetTreatCaseId,'StreetTreatCase','Insert', NOW());

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;




END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_InsertTeam`(
IN prm_Username VARCHAR(45),
IN prm_TeamName varchar(64),
IN prm_Colour varchar(7),
IN prm_Capacity INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/08/2018
Purpose: Used to inseret a team

Modified By: Ankit Singh
Created On: 11/04/2021
Purpose: Used to inseret a team with colour with organisation id
*/
DECLARE vTeamExists INT;
DECLARE vTeamId INT;
DECLARE vSuccess INT;
DECLARE vOrganisationId INT;

SET vTeamId = 0;
SET vTeamExists = 0;

SELECT COUNT(1) INTO vTeamExists FROM AAU.Team WHERE TeamName = prm_TeamName;
SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE UserName = prm_Username LIMIT 1;

IF vTeamExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.Team 
		(
	TeamName, 
	Capacity,
    TeamColour,
    OrganisationId
		) 
		VALUES (
	prm_TeamName, 
	prm_Capacity,
    prm_Colour,
    vOrganisationId
		);

    	SELECT LAST_INSERT_ID() INTO vTeamId;
    	SELECT 1 INTO vSuccess;

COMMIT;

	ELSEIF vTeamExists > 0 THEN
		SELECT 2 INTO vSuccess;
	ELSE
		SELECT 3 INTO vSuccess;
	END IF;
SELECT vTeamId, vSuccess;
END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_InsertUser`(IN prm_User VARCHAR(45),
									IN prm_FirstName NVARCHAR(64),
									IN prm_Surname NVARCHAR(64),
									IN prm_Initials NVARCHAR(64),
									IN prm_Colour NVARCHAR(64),
									IN prm_Telephone NVARCHAR(64),								
									IN prm_UserName NVARCHAR(64),
									IN prm_Password NVARCHAR(255),
									IN prm_TeamId INTEGER,
									IN prm_RoleId INTEGER,
									IN prm_PermissionArray JSON
									)
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: To insert a new user
*/
DECLARE vOrganisationId INT;
DECLARE vUserCount INT;
DECLARE vUserId INT;
DECLARE vSuccess INT;

DECLARE StatementVariable INT;

SET vUserCount = 0;
SET vOrganisationId = 1;

SET StatementVariable = 1;

SELECT COUNT(1) INTO vUserCount FROM AAU.User WHERE FirstName = prm_FirstName
													AND Surname = prm_Surname
                                                    AND Telephone = prm_Telephone;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_User LIMIT 1;
                                                    
                                                    
IF vUserCount = 0 THEN

INSERT INTO AAU.User (OrganisationId,
					   FirstName,
                       Surname,
                       Initials,
                       Colour,
                       Telephone,
                       UserName,
                       Password,
                       TeamId,
                       RoleId,
                       PermissionArray)
				VALUES
						(
                        vOrganisationId,
						prm_FirstName,
						prm_Surname,
                        prm_Initials,
                        prm_Colour,
						prm_Telephone,
                        prm_UserName,
                        prm_Password,
						prm_TeamId,
						prm_RoleId,
                        prm_PermissionArray
						);


SELECT LAST_INSERT_ID() INTO vUserId;
SELECT 1 INTO vSuccess;

ELSEIF vUserCount > 0 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;


SELECT vUserId, vSuccess;


END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UpdateCaseById`(
									IN prm_CaseId INT,
									IN prm_EmergencyNumber INT,
                                    IN prm_TagNumber VARCHAR(64),
									IN prm_AnimalTypeId INT,
									IN prm_PriorityId INT,
									IN prm_StatusId INT,
									IN prm_TeamId INT,
                                    IN prm_MainProblemId INT,
									IN prm_AnimalName NVARCHAR(128),
									IN prm_ComplainerName NVARCHAR(128),
									IN prm_ComplainerNumber NVARCHAR(128),
									IN prm_Address NVARCHAR(128),
									IN prm_Latitude DECIMAL(15,9),
									IN prm_Longitude DECIMAL(15,9),
									IN prm_AdminNotes TEXT,
									IN prm_OperatorNotes TEXT,
                                    IN prm_ReleasedDate DATE,
                                    IN prm_ClosedDate DATE,
                                    IN prm_IsIsolation BOOLEAN,
                                    IN prm_EarlyReleaseFlag BOOLEAN,
									IN prm_IsDeleted BOOLEAN,
                                    OUT prm_OutCaseId INT,
									OUT prm_Success INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to update a case.

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id and logging.
*/

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT prm_caseId INTO prm_OutCaseId;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.StreetTreatCase c
INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
WHERE c.StreetTreatCaseId <> prm_CaseId AND p.TagNumber = prm_TagNumber;

IF vEmNoExists = 0 THEN

	UPDATE AAU.StreetTreatCase SET						
						PriorityId			= prm_PriorityId,
						StatusId			= prm_StatusId,
						TeamId				= prm_TeamId,
                        MainProblemId		= IF(prm_MainProblemId = -1, 6, prm_MainProblemId),						
						AdminComments		= prm_AdminNotes,
						OperatorNotes		= prm_OperatorNotes,
                        ClosedDate			= prm_ClosedDate,
                        EarlyReleaseFlag	= prm_EarlyReleaseFlag,
						IsDeleted			= prm_IsDeleted
			WHERE StreetTreatCaseId = prm_CaseId;
            
            
    SELECT 1 INTO prm_Success;
    
    INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,prm_CaseId,'Street Treat Case','Update', NOW());
    
    UPDATE AAU.Patient p
    INNER JOIN AAU.StreetTreatCase stc ON stc.PatientId = p.PatientId
    SET p.Description = prm_AnimalName,
    p.TagNumber = prm_TagNumber
    WHERE stc.StreetTreatCaseId = prm_CaseId;
    
    UPDATE AAU.Caller c
    INNER JOIN AAU.EmergencyCaller ec ON ec.CallerId = c.CallerId AND ec.PrimaryCaller = 1
    INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
    INNER JOIN AAU.StreetTreatCase stc ON stc.PatientId = p.PatientId AND stc.StreetTreatCaseId = prm_CaseId
    SET c.Number = prm_ComplainerNumber,
    c.Name = prm_ComplainerName;


ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;

END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UpdateTeamById`(
										IN prm_TeamId INT,
										IN prm_TeamName NVARCHAR(64),
										IN prm_Capacity NVARCHAR(64),
                                        IN prm_Colour NVARCHAR(7),
                                        IN prm_IsDeleted TINYINT(1)
                                        )
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 24/08/2018
Purpose: Used to update a team by id.
*/

DECLARE vTeamCount INT;
DECLARE vTeamNameCount INT;
DECLARE vSuccess INT;

SET vTeamCount = 0;
SET vTeamNameCount = 0;

SELECT COUNT(1) INTO vTeamCount FROM AAU.Team WHERE TeamId = prm_TeamId;

SELECT COUNT(1) INTO vTeamNameCount FROM AAU.Team WHERE TeamId <> prm_TeamId AND TeamName = prm_TeamName;

IF vTeamCount = 1 AND vTeamNameCount = 0 THEN

	UPDATE AAU.Team
		SET	TeamName	= prm_TeamName,
			Capacity	= prm_Capacity,
            TeamColour	= prm_Colour,
            IsDeleted   = prm_IsDeleted
	WHERE TeamId = prm_TeamId;

	SELECT 1 INTO vSuccess; -- Team update OK.

	ELSEIF vTeamCount = 0 THEN

	SELECT 2 INTO vSuccess; -- Team Doesn't exist

	ELSEIF vTeamCount > 1 THEN

	SELECT 3 INTO vSuccess; -- Multiple records, we have duplicates
    
    ELSEIF vTeamNameCount >= 1 THEN
    
    SELECT 4 INTO vSuccess; -- Team name already exists

	ELSE

	SELECT 4 INTO vSuccess; -- Return misc 

	END IF;
	
SELECT vSuccess;

END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UpdateUserById`(IN prm_UserId INT,
										IN prm_FirstName NVARCHAR(64),
										IN prm_Surname NVARCHAR(64),
                                        IN prm_Initials NVARCHAR(64),
                                        IN prm_Colour NVARCHAR(64),
										IN prm_Telephone NVARCHAR(64),
                                        IN prm_UserName NVARCHAR(64),
                                        IN prm_Password NVARCHAR(255),
										IN prm_TeamId INTEGER,
										IN prm_RoleId INTEGER,
                                        IN prm_PermissionArray JSON
										)
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to update a user by id.
*/

DECLARE vUserCount INT;
DECLARE vPassword NVARCHAR(255);
DECLARE vUsernameCount INT;
DECLARE vComboKeyCount INT;
DECLARE vUpdateSuccess INT;
SET vUserCount = 0;
SET vUsernameCount = 0;
SET vComboKeyCount = 0;
SET vUpdateSuccess = 0;

-- Check that the user exists
SELECT COUNT(1), Password INTO vUserCount, vPassword FROM AAU.User WHERE UserId = prm_UserId;

-- Check that the incoming username doesn't exist
SELECT COUNT(1) INTO vUsernameCount FROM AAU.user WHERE UserId <> prm_UserId AND UserName = prm_UserName;

-- Check that the incoming first name, surname and telephone don't already exist
SELECT COUNT(1) INTO vComboKeyCount FROM AAU.user WHERE UserId <> prm_UserId	AND	FirstName	= prm_FirstName
																				AND	Surname		= prm_Surname
																				AND	Telephone	= prm_Telephone;


IF vUserCount = 1 AND vUsernameCount = 0 AND vComboKeyCount = 0 THEN

	UPDATE AAU.User
		SET	FirstName	= prm_FirstName,
			Surname		= prm_Surname,
            Initials    = prm_Initials,
            Colour      = prm_Colour,
			Telephone	= prm_Telephone,
            UserName	= prm_UserName,
            Password	= IFNULL(prm_Password , vPassword),
			TeamId		= prm_TeamId,
			RoleId		= prm_RoleId,
            PermissionArray = prm_PermissionArray
	WHERE UserId = prm_UserId;


SELECT 1 INTO vUpdateSuccess; -- User update OK.

ELSEIF vUserCount = 0 THEN

SELECT 2 INTO vUpdateSuccess; -- User Doesn't exist

ELSEIF vUserCount > 1 THEN

SELECT 3 INTO vUpdateSuccess; -- Multiple records, we have duplicates

ELSEIF vUsernameCount >= 1 THEN

SELECT 4 INTO vUpdateSuccess; -- The username already exists

ELSEIF vComboKeyCount >= 1 THEN

SELECT 5 INTO vUpdateSuccess; -- The first name + surname + telephone number already exists

ELSE

SELECT 6 INTO vUpdateSuccess; -- Return misc 

END IF;

SELECT vUpdateSuccess;



END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UpdateVisitTeamByTeamId`(
	IN prm_StreetTreatCaseId INT,
    IN prm_TeamId INT
)
BEGIN
/*

Created By: Ankit Singh
Created On: 28/01/2021
Purpose: Update Visit Team.

*/
DECLARE vStreetTreatCaseIdExists INT;
DECLARE vSuccess INT;

SELECT count(1) INTO vStreetTreatCaseIdExists FROM AAU.StreetTreatCase WHERE StreetTreatCaseId = prm_StreetTreatCaseId;

IF vStreetTreatCaseIdExists > 0 THEN

	UPDATE AAU.StreetTreatCase
	SET
	TeamId = prm_TeamId
	WHERE StreetTreatCaseId = prm_StreetTreatCaseId;
    SELECT 1 INTO vSuccess;
    
ELSE
	SELECT 3 INTO vSuccess;
    
END IF;

SELECT vSuccess AS success;
END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UpsertStreetTreatCase`(
		IN prm_Username VARCHAR(45),
		IN prm_PatientId INT,
		IN prm_PriorityId INT,
		IN prm_StatusId INT,
		IN prm_TeamId INT,
		IN prm_MainProblemId INT,
		IN prm_AdminComments VARCHAR(256),
		IN prm_OperatorNotes VARCHAR(256),
		IN prm_ClosedDate DATE,
		IN prm_EarlyReleaseFlag BOOLEAN,
		IN prm_AnimalDescription VARCHAR(256),
        In prm_AssignedAmbulanceId INT,
        IN prm_AmbulanceAssignmentTime DATETIME
)
BEGIN
/*
Created By: Ankit Singh
Created On: 02/12/2020
Purpose: Used to insert a new case.


Created By: Ankit Singh
Created On: 27/04/2021
Purpose: ON DUPLICATE KEY UPDATE Added

Created By: Jim Mackenzie
Created On: 19/09/2021
Purpose: Removed ON DUPLICATE KEY UPDATE as it would have never worked without a Unique key which is impossible to add.
*/

DECLARE vStreetTreatCaseId INT;
DECLARE vCaseExists INT;
DECLARE vSuccess INT;
DECLARE vOrganisationId INT;

SET vCaseExists = 0;

SELECT u.OrganisationId INTO vOrganisationId
FROM AAU.User u
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vCaseExists FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId AND IsDeleted = 0;

IF vCaseExists = 0 THEN

INSERT INTO AAU.StreetTreatCase(
                        PatientId,
						PriorityId,
						StatusId,
						TeamId,
                        MainProblemId,
						AdminComments,
						OperatorNotes,
                        ClosedDate,
                        EarlyReleaseFlag,
                        OrganisationId,
                        AssignedVehicleId,
                        AmbulanceAssignmentTime
					) VALUES (
                        prm_PatientId,
						prm_PriorityId,
						prm_StatusId,
						prm_TeamId,
                        prm_MainProblemId,
						prm_AdminComments,
						prm_OperatorNotes,
                        prm_ClosedDate,
                        prm_EarlyReleaseFlag,
                        vOrganisationId,
                        prm_AssignedAmbulanceId,
                        prm_AmbulanceAssignmentTime
						);
                        
SELECT 1 INTO vSuccess;

ELSEIF vCaseExists = 1 THEN

 UPDATE AAU.StreetTreatCase SET
                        PriorityId			= prm_PriorityId,
						StatusId			= prm_StatusId,
						TeamId				= prm_TeamId,
						MainProblemId		= prm_MainProblemId,
						AdminComments		= prm_AdminComments,
						OperatorNotes		= prm_OperatorNotes,
						ClosedDate			= prm_ClosedDate,
						EarlyReleaseFlag	= prm_EarlyReleaseFlag,
                        AssignedVehicleId = prm_AssignedAmbulanceId,
                        AmbulanceAssignmentTime = prm_AmbulanceAssignmentTime
	WHERE PatientId = prm_PatientId AND IsDeleted = 0;

SELECT 1 INTO vSuccess;

ELSE

SELECT 2 INTO vSuccess;

END IF;	

	SELECT StreetTreatCaseId INTO vStreetTreatCaseId FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;

    UPDATE AAU.Patient SET Description = IFNULL(prm_AnimalDescription,'') WHERE PatientId = prm_PatientId;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,vStreetTreatCaseId,'ST Case','Upsert', NOW());
    
	SELECT vStreetTreatCaseId AS streetTreatCaseId, vSuccess AS success;
    
END$$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UpsertStreetTreatPatient`(IN prm_Username VARCHAR(20),
													 IN prm_EmergencyCaseId INT,
                                                     IN prm_AddToStreetTreat INT,
                                                     IN prm_PatientId INT
													)
BEGIN
/*
Modified By: Ankit Singh
Modified On: 15/04/2021
Purpose: Check for case already in patients table and streettreatcase table by patienid.
*/
DECLARE vTeamId INT;
DECLARE vStreetTreatCaseExists INT;
DECLARE vPatientExists INT;
DECLARE vCaseId INT;
DECLARE stTagNumber VARCHAR(20);
DECLARE vTagNumber VARCHAR(20);
DECLARE vOrganisationId INT;
SET vStreetTreatCaseExists = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF prm_AddToStreetTreat = 1 THEN
    
    
		SELECT TeamId INTO vTeamId FROM AAU.Team WHERE TeamName = 'Team Vinod';
		
		SELECT CONCAT('ST',CONVERT(IFNULL(MAX(CONVERT(REPLACE(UPPER(TagNumber), 'ST',''), SIGNED)), 0) + 1, CHAR)) INTO stTagNumber
		FROM AAU.Patient
		WHERE TagNumber LIKE 'ST%';
		
		SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.Patient WHERE TagNumber = stTagNumber;        
		SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient p LEFT JOIN AAU.StreetTreatCase st ON st.PatientId = p.PatientId WHERE st.PatientId = prm_PatientId;
        
		IF vStreetTreatCaseExists = 0 AND vPatientExists < 1 THEN
        
        INSERT INTO AAU.StreetTreatCase (PatientId,PriorityId,StatusId,TeamId,MainProblemId,AdminComments,OrganisationId)
			VALUES(prm_PatientId, 4, 1, vTeamId, 6, 'Added by Apoms',vOrganisationId);
            
			SELECT LAST_INSERT_ID(),stTagNumber INTO vCaseId,vTagNumber;
            
			INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
			VALUES (vOrganisationId, prm_Username, vCaseId,'Case','Insert - Via ER', NOW());
            
            UPDATE AAU.Patient SET TagNumber = vTagNumber WHERE PatientId = prm_PatientId;
			
		END IF;

ELSEIF prm_AddToStreetTreat = 0 THEN

	SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;  
 
	IF vStreetTreatCaseExists = 1 THEN
		UPDATE AAU.Patient SET TagNumber = NULL, UpdateTime = now() WHERE PatientId = prm_PatientId;
		
		DELETE FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId 
		AND StreetTreatCaseId NOT IN (
			SELECT StreetTreatCaseId FROM AAU.Visit
		);
	
	END IF;
    
	SELECT NULL,0 INTO vTagNumber,vCaseId;

END IF;

SELECT vTagNumber, vCaseId;

END$$
DELIMITER ;
