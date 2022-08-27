DROP PROCEDURE IF EXISTS AAU.sp_GetPatientDetailsbyArea;
DROP PROCEDURE IF EXISTS AAU.sp_GetCensusObject;
DROP PROCEDURE IF EXISTS AAU.sp_GetCensusErrorRecords;
DROP PROCEDURE IF EXISTS AAU.sp_DeleteTeamById;
DROP PROCEDURE IF EXISTS AAU.sp_GetAllTeams;
DROP PROCEDURE IF EXISTS AAU.sp_GetTeamById;
DROP PROCEDURE IF EXISTS AAU.sp_InsertTeam;
DROP PROCEDURE IF EXISTS AAU.sp_UpdateTeamById;
DROP PROCEDURE IF EXISTS AAU.sp_UpdateVisitTeamByTeamId;
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForTeamByDate;
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForUserTeam;
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForUserTeamByDate;
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesWithMissedLastVisitForUserTeam;
DROP PROCEDURE IF EXISTS AAU.sp_InsertCase;
DROP PROCEDURE IF EXISTS AAU.sp_DeleteCaseById;
DELIMITER !!

DROP FUNCTION IF EXISTS AAU.fn_GetRescueStatus!!

DELIMITER $$

CREATE FUNCTION AAU.fn_GetRescueStatus(
	ReleaseDetailsId INT,
	RequestedUser VARCHAR(45),
    RequestedDate Date,
    AssignedReleaseVehicleId INT,
    PickupDate DATE,
    BeginDate DATE,
    EndDate DATE,
	AssignedRescueVehicleId INT,
    AmbulanceArrivalTime DATETIME,
    RescueTime DATETIME,
    AdmissionTime DATETIME,
    CallOutcomeId INT,
    InTreatmentAreaId INT
) RETURNS int
    DETERMINISTIC
BEGIN
    DECLARE rescueReleaseStatus INT;

		IF
			(
            AssignedRescueVehicleId IS NULL AND
            CallOutcomeId IS NULL AND
            ReleaseDetailsId IS NULL AND
            RequestedUser IS NULL AND
            RequestedDate IS NULL
            ) 
            OR
            (
            CallOutcomeId IS NOT NULL AND
			ReleaseDetailsId IS NOT NULL AND
            RequestedUser IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            AssignedReleaseVehicleId IS NULL
            )
			THEN SET rescueReleaseStatus = 1;
            
        ELSEIF
			(
            AssignedRescueVehicleId IS NOT NULL AND
			AmbulanceArrivalTime IS NULL AND
            RescueTime IS NULL AND
            ReleaseDetailsId IS NULL
            ) 
            OR
            (
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND 
            AssignedReleaseVehicleId IS NOT NULL AND
            PickupDate IS NULL
            -- EndDate IS NULL
            )
			THEN SET rescueReleaseStatus = 2;
            
		ELSEIF
			(
            AssignedRescueVehicleId IS NOT NULL AND
            AmbulanceArrivalTime IS NOT NULL AND
            RescueTime IS NULL AND
            ReleaseDetailsId IS NULL
            )
            OR
            (
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND 
            AssignedReleaseVehicleId IS NOT NULL AND
            PickupDate IS NOT NULL AND
            BeginDate IS NULL
            )
			THEN SET rescueReleaseStatus = 3;
		ELSEIF
			(
            AssignedRescueVehicleId IS NOT NULL AND
            RescueTime IS NOT NULL AND
			AdmissionTime IS NULL AND
			ReleaseDetailsId IS NULL
            )
            OR
            (
            ReleaseDetailsId IS NOT NULL AND
            RequestedDate IS NOT NULL AND
            RequestedUser IS NOT NULL AND 
            AssignedReleaseVehicleId IS NOT NULL AND
            PickupDate IS NOT NULL AND 
            BeginDate IS NOT NULL AND
            EndDate IS NULL
            )
			THEN SET rescueReleaseStatus = 4;
            
		ELSEIF
			(
            AssignedRescueVehicleId IS NOT NULL AND
            RescueTime IS NOT NULL AND
            AdmissionTime IS NOT NULL AND
            ReleaseDetailsId IS NULL  AND
				(
				CallOutcomeId IS NULL OR
				InTreatmentAreaId IS NULL
				)
            )
			THEN SET rescueReleaseStatus = 5;        
        
        END IF;
        
	-- return the rescue status
	RETURN (rescueReleaseStatus);
END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeleteItemFromVehicleList !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_DeleteItemFromVehicleList(IN prm_Username VARCHAR(65),
												IN prm_VehicleId INT)
BEGIN

/*
Created By: Arpit Trivedi
Created On: 19/05/2021
Purpose: To delete vehicle from the vehicleList table.
*/

DECLARE vSuccess INT;
DECLARE vOrganisationId INT;
DECLARE VehicleIdCount INT;

SET VehicleIdCount = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User
WHERE UserName = prm_Username;

SELECT COUNT(1) INTO VehicleIdCount FROM AAU.Vehicle WHERE VehicleId = prm_VehicleId;

IF VehicleIdCount = 1 THEN

	UPDATE AAU.Vehicle SET
	IsDeleted = 1,
	DeletedDate = CURDATE()
	WHERE VehicleId = prm_VehicleId;

	SELECT 1 INTO vSuccess;
	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_VehicleId,'VehicleList','Delete', NOW());
 

ELSE 
	SELECT 2 INTO vSuccess;
    
END IF;

SELECT vSuccess AS success;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForUserByDate !!

-- CALL AAU.sp_GetActiveCasesForUserByDate('Jim', '2022-03-03');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesForUserByDate(	IN prm_username VARCHAR(64),
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
Description: Altering to run from new Apoms tables.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

DECLARE prmVisitDate DATE;
DECLARE vUserId INT;
DECLARE vTimeNow DATETIME;

	SELECT IFNULL(prm_visitDate, CURDATE()) INTO prmVisitDate;
    
    SELECT CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset), UserId INTO vTimeNow, vUserId
	FROM AAU.User u
	INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
	WHERE u.UserName = prm_username LIMIT 1;

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
            v.VehicleNumber,
            c.AssignedVehicleId AS `VehicleId`,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            CAST(COALESCE(IF(p.PatientCallOutcomeId = 18, ec.CallDateTime, NULL), p.PatientStatusDate) AS DATE) AS ReleasedDate,
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
        ec.CallDateTime,
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
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
    INNER JOIN AAU.Vehicle v ON v.VehicleId = c.AssignedVehicleId
	INNER JOIN AAU.VehicleShift vs ON vs.VehicleId = c.AssignedVehicleId AND vTimeNow BETWEEN vs.StartDate AND vs.EndDate
    INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId AND vsu.UserId = vUserId
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
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForUser !!

-- CALL AAU.sp_GetActiveCasesForUser('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesForUser( IN prm_username VARCHAR(45) )
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
Description: Altering to run from new Apoms tables.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
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
            v.VehicleNumber,
            c.AssignedVehicleId AS `VehicleId`,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            CAST(COALESCE(IF(p.PatientCallOutcomeId = 18, ec.CallDateTime, NULL), p.PatientStatusDate) AS DATE) AS ReleasedDate,
            c.ClosedDate,
            c.EarlyReleaseFlag,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        ec.CallDateTime,
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
	INNER JOIN AAU.Vehicle v ON v.VehicleId = c.AssignedVehicleId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
	INNER JOIN AAU.VehicleShift vs ON vs.VehicleId = c.AssignedVehicleId
    INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
    INNER JOIN AAU.User u ON u.UserName = prm_UserName AND u.UserId = vsu.UserId
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

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForAssignedVehicleByDate !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForVehicleByDate !!

-- CALL AAU.sp_GetActiveCasesForVehicleByDate(23, '2022-03-03');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesForVehicleByDate(	IN prm_assignedVehicleId INT,
														IN prm_visitDate DATE
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 18/11/2020
Purpose: Used to return active cases for the StreetTreat mobile app.

Modified By: Jim Mackenzie
Modified On: 07/12/2020
Description: Altering to run from new Apoms tables.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
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
            v.VehicleNumber,
            c.AssignedVehicleId AS `VehicleId`,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            CAST(COALESCE(IF(p.PatientCallOutcomeId = 18, ec.CallDateTime, NULL), p.PatientStatusDate) AS DATE) AS ReleasedDate,
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
        ec.CallDateTime,
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
	INNER JOIN AAU.Vehicle v ON v.VehicleId = c.AssignedVehicleId AND (c.AssignedVehicleId = prm_assignedVehicleId OR prm_assignedVehicleId = 1)
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
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesWithMissedLastVisitForUser !!

-- CALL AAU.sp_GetActiveCasesWithMissedLastVisitForUser('Jim')

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesWithMissedLastVisitForUser ( IN prm_UserName VARCHAR(45) )
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
Description: Altering to run from new Apoms tables.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

	DECLARE vTimeNow DATETIME;

    SELECT CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vTimeNow
	FROM AAU.User u
	INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
	WHERE u.UserName = prm_UserName LIMIT 1;

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
            v.VehicleNumber,
            c.AssignedVehicleId AS `VehicleId`,
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
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
    INNER JOIN AAU.User u ON u.UserName = prm_UserName
    INNER JOIN AAU.Vehicle v ON v.VehicleId = c.AssignedVehicleId
	INNER JOIN AAU.VehicleShift vs ON vs.VehicleId = c.AssignedVehicleId AND vTimeNow BETWEEN vs.StartDate AND vs.EndDate
    INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId AND vsu.UserId = u.UserId
    
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
			AND Date <= CAST(vTimeNow AS DATE)
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
CREATE PROCEDURE AAU.sp_GetActiveCasesWithNoVisits ()
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
Description: Altering to run from new Apoms tables.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
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
            v.VehicleNumber,
            c.AssignedVehicleId AS `VehicleId`,
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
	INNER JOIN AAU.Vehicle v ON v.VehicleId = c.AssignedVehicleId
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

-- CALL AAU.sp_GetActiveCasesWithVisitByDate('2022-03-03');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesWithVisitByDate (IN prm_VisitDate DATE)
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
Description: Altering to run from new Apoms tables.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
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
            ve.VehicleNumber,
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
	INNER JOIN AAU.Vehicle ve ON ve.VehicleId = c.AssignedVehicleId
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
Description: Altering to run from new Apoms tables.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
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
            v.VehicleNumber,
            c.AssignedVehicleId AS `VehicleId`,
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
	INNER JOIN AAU.Vehicle v ON v.VehicleId = c.AssignedVehicleId
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

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveStreetTreatCasesWithNoVisits !!

-- CALL AAU.sp_GetActiveStreetTreatCasesWithNoVisits( 'Jim' );

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveStreetTreatCasesWithNoVisits ( IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Ankit Singh
Created On: 10/02/2021
Purpose: Used to return active cases for the StreetTreat screen Changed Problem with MainProblem.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

DECLARE vOrganisationId INT;

SELECT o.OrganisationId INTO vOrganisationId
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

WITH casesCTE AS
(
	SELECT st.StreetTreatCaseId
	FROM AAU.StreetTreatCase st
	WHERE OrganisationId = vOrganisationId
	AND st.StatusId < 3
    AND st.IsDeleted = 0
    AND st.StreetTreatCaseid NOT IN (
		SELECT
			v.StreetTreatCaseid
		FROM AAU.Visit v
		WHERE v.statusid < 3 AND v.date > CURDATE()
        AND v.IsDeleted = 0
    )
),
visitsCTE AS
(
	SELECT
		stc.StreetTreatCaseId,
        stc.PatientId,
		v.VehicleId,
		v.VehicleNumber,
        v.VehicleColour,
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
	INNER JOIN AAU.Vehicle v ON v.VehicleId = stc.AssignedVehicleId
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
rawData.VehicleId,
rawData.VehicleNumber,
rawData.VehicleColour,
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
GROUP BY rawData.StreetTreatCaseId, rawData.VehicleId, rawData.VehicleNumber
)

SELECT

JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("VehicleId", cases.VehicleId),
JSON_OBJECT("VehicleNumber", cases.VehicleNumber),
JSON_OBJECT("VehicleColour", cases.VehicleColour),
JSON_OBJECT("StreetTreatCaseVisits", cases.StreetTreatCases)
)) AS Result
FROM
(
SELECT
caseVisits.VehicleId,
caseVisits.VehicleNumber,
caseVisits.VehicleColour,
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
GROUP BY caseVisits.VehicleId, caseVisits.VehicleNumber
) AS cases;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveStreetTreatCasesWithVisitByDate !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveStreetTreatCasesWithVisitByDate (IN prm_VisitDate DATE)
BEGIN

/*
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

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
		ve.VehicleId,
		ve.VehicleNumber,
        ve.VehicleColour,
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
	INNER JOIN AAU.Vehicle ve ON ve.VehicleId = stc.AssignedVehicleId
	INNER JOIN AAU.Patient p ON p.PatientId = stc.PatientId
	INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = stc.PriorityId
	INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	WHERE stc.StreetTreatCaseId IN (SELECT StreetTreatCaseId FROM casesCTE)
    AND v.isDeleted = 0
),
CaseCTE AS
(
SELECT
rawData.VehicleId,
rawData.VehicleNumber,
rawData.VehicleColour,
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
GROUP BY rawData.VehicleId,
rawData.VehicleNumber,
rawData.VehicleColour,
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
		JSON_OBJECT("VehicleId", cases.VehicleId),
		JSON_OBJECT("VehicleNumber", cases.VehicleNumber),
		JSON_OBJECT("VehicleColour", cases.VehicleColour),
		JSON_OBJECT("StreetTreatCaseVisits", cases.StreetTreatCases)
	)
)
)
AS Result
FROM
(
SELECT
caseVisits.VehicleId,
caseVisits.VehicleNumber,
caseVisits.VehicleColour,
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
GROUP BY caseVisits.VehicleId,
caseVisits.VehicleNumber,
caseVisits.VehicleColour
) AS cases;
END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveVehicleLocations!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetActiveVehicleLocations(IN prm_UserName VARCHAR(45))
BEGIN

/*

Created By: Jim Mackenzie
Created On: 2021-07-05
Purpose: Used to retrieve location history for a particular vehicle.

*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;


WITH vehicleListCTE AS 
(
SELECT
v.VehicleId,
JSON_OBJECT(
"vehicleId", v.VehicleId,
"vehicleRegistrationNumber", v.VehicleRegistrationNumber,
"vehicleNumber", v.VehicleNumber,
"smallAnimalCapacity", v.SmallAnimalCapacity,
"largeAnimalCapacity", v.LargeAnimalCapacity,
"vehicleImage", v.VehicleImage,
"vehicleTypeId", v.VehicleTypeId) AS `vehicleDetails`,
JSON_OBJECT(
"speed", vl.Speed,
"heading", vl.Heading,
"accuracy", vl.Accuracy,
"altitude", vl.Altitude,
"altitudeAccuracy", vl.AltitudeAccuracy,
"latLng",
JSON_MERGE_PRESERVE(
JSON_OBJECT("lat", IFNULL(vl.Latitude, 0.0)),
JSON_OBJECT("lng", IFNULL(vl.Longitude, 0.0)))) AS `vehicleLocation`
FROM AAU.Vehicle v
LEFT JOIN
(
	SELECT	VehicleId, Latitude, Longitude, Speed, Heading, Accuracy, Altitude, AltitudeAccuracy,
			ROW_NUMBER() OVER (PARTITION BY VehicleId ORDER BY Timestamp DESC) AS `RNum`
	FROM AAU.VehicleLocation
	WHERE CAST(Timestamp AS DATE) = CURDATE()
	AND OrganisationId = vOrganisationId
) vl ON vl.VehicleId = v.VehicleId AND vl.RNum = 1
WHERE v.VehicleStatusId = 1
),
RescuerCTE AS
(
SELECT vs.VehicleId,
JSON_ARRAYAGG(
JSON_OBJECT(
"firstName", u.FirstName,
"surname", u.Surname,
"initials", u.Initials,
"colour", u.Colour)) AS `vehicleStaff`
FROM AAU.VehicleShift vs
LEFT JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE vs.VehicleId IN (SELECT VehicleId FROM vehicleListCTE)
AND NOW() BETWEEN vs.StartDate AND vs.EndDate
GROUP BY vs.VehicleId
)

SELECT
JSON_ARRAYAGG(
JSON_OBJECT(
"vehicleDetails", vl.vehicleDetails,
"vehicleLocation", vl.vehicleLocation,
"vehicleStaff", r.vehicleStaff
)
) AS `vehicleList`
FROM vehicleListCTE vl
LEFT JOIN RescuerCTE r ON r.VehicleId = vl.VehicleId;

END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveVehicleLocations !!

-- CALL AAU.sp_GetActiveVehicleLocations('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveVehicleLocations(IN prm_UserName VARCHAR(45))
BEGIN

/*

Created By: Jim Mackenzie
Created On: 2021-07-05
Purpose: Used to retrieve location history for a particular vehicle.

*/

DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;
SET vOrganisationId = 1;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE u.UserName = prm_Username LIMIT 1;

WITH vehicleListCTE AS 
(
SELECT
v.VehicleId,
JSON_OBJECT(
"vehicleId", v.VehicleId,
"vehicleRegistrationNumber", v.VehicleRegistrationNumber,
"vehicleNumber", v.VehicleNumber,
"smallAnimalCapacity", v.SmallAnimalCapacity,
"largeAnimalCapacity", v.LargeAnimalCapacity,
"vehicleImage", v.VehicleImage,
"vehicleTypeId", v.VehicleTypeId) AS `vehicleDetails`,
JSON_OBJECT(
"speed", vl.Speed,
"heading", vl.Heading,
"accuracy", vl.Accuracy,
"altitude", vl.Altitude,
"altitudeAccuracy", vl.AltitudeAccuracy,
"latLng",
JSON_MERGE_PRESERVE(
JSON_OBJECT("lat", IFNULL(vl.Latitude, 0.0)),
JSON_OBJECT("lng", IFNULL(vl.Longitude, 0.0)))) AS `vehicleLocation`
FROM AAU.Vehicle v
LEFT JOIN
(
	SELECT	VehicleId, Latitude, Longitude, Speed, Heading, Accuracy, Altitude, AltitudeAccuracy,
			ROW_NUMBER() OVER (PARTITION BY VehicleId ORDER BY Timestamp DESC) AS `RNum`
	FROM AAU.VehicleLocation
	WHERE CAST(Timestamp AS DATE) = CAST(vTimeNow AS DATE)
	AND OrganisationId = vOrganisationId
) vl ON vl.VehicleId = v.VehicleId AND vl.RNum = 1
WHERE v.VehicleStatusId = 1
),
RescuerCTE AS
(
SELECT vs.VehicleId,
JSON_ARRAYAGG(
JSON_OBJECT(
"firstName", u.FirstName,
"surname", u.Surname,
"initials", u.Initials,
"colour", u.Colour)) AS `vehicleStaff`
FROM AAU.VehicleShift vs
LEFT JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE vs.VehicleId IN (SELECT VehicleId FROM vehicleListCTE)
AND vTimeNow BETWEEN vs.StartDate AND vs.EndDate
GROUP BY vs.VehicleId
)

SELECT
JSON_ARRAYAGG(
JSON_OBJECT(
"vehicleDetails", vl.vehicleDetails,
"vehicleLocation", vl.vehicleLocation,
"vehicleStaff", r.vehicleStaff
)
) AS `vehicleList`
FROM vehicleListCTE vl
LEFT JOIN RescuerCTE r ON r.VehicleId = vl.VehicleId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAllVisitsAndDates !!

-- CALL AAU.sp_GetAllVisitsAndDates ('Jim')

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetAllVisitsAndDates ( IN prm_Username VARCHAR(45))
BEGIN
/*
Created By: Ankit Singh
Created On: 28/01/2021
Purpose: Used to return all visit in a month Chart.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE UserName = prm_Username LIMIT 1;

WITH chart AS (
	SELECT 
		v.Date,
        JSON_OBJECT(
		"name",ve.VehicleNumber,
		"value",count(ve.VehicleId)
        ) AS series
	FROM AAU.Visit v
	LEFT JOIN AAU.StreetTreatCase st ON st.StreetTreatCaseId= v.StreetTreatCaseId 
	INNER JOIN AAU.Vehicle ve ON ve.VehicleId = st.AssignedVehicleId
	WHERE v.IsDeleted = 0 AND v.Date BETWEEN DATE(NOW()) - INTERVAL 7 DAY AND DATE(NOW()) + INTERVAL 14 DAY
    AND st.OrganisationId = vOrganisationId
    GROUP BY v.Date, ve.VehicleId
),
vehicleColours AS (
	SELECT JSON_ARRAYAGG(JSON_OBJECT("name",v.VehicleNumber,"value", v.VehicleColour)) AS vehicleColours FROM AAU.Vehicle v WHERE v.OrganisationId = vOrganisationId
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
	JSON_OBJECT("vehicleColours",vehicleColours.vehicleColours),
    JSON_OBJECT("chartData",JSON_ARRAYAGG(chartData.chartData))
    ) AS Result
FROM vehicleColours, chartData GROUP BY vehicleColours.vehicleColours;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAnimalTypes !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetAnimalTypes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT AnimalTypeId, AnimalType, IsDeleted, SortOrder FROM AAU.AnimalType WHERE OrganisationId = vOrganisationId;

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerByNameAndNumber !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerByNameAndNumber( IN prm_UserName VARCHAR(45), IN prm_CallerName VARCHAR(45), IN prm_CallerNumber VARCHAR(45), OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a Caller by Name and Number.
*/

DECLARE vOrganisationId INT;
DECLARE vCallerExists INT;

SET vCallerExists = 0;


SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_UserName;


SELECT COUNT(1) INTO vCallerExists 
FROM AAU.Caller c
INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
WHERE c.Name = prm_CallerName
AND c.Number = prm_CallerNumber AND ecr.IsDeleted = 0
AND c.OrganisationId = vOrganisationId;

SELECT	
	ecr.CallerId,
	c.Name,
	c.PreferredName,
	c.Number,
	c.AlternativeNumber,
	IF(ecr.PrimaryCaller = FALSE , 0 , 1) AS PrimaryCaller,
	c.Email,
	c.Address,
	c.CreatedDate,
	c.IsDeleted,
	c.DeletedDate
FROM AAU.Caller c
INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
WHERE c.Name = prm_CallerName
AND c.Number = prm_CallerNumber
AND ecr.IsDeleted = 0
AND c.OrganisationId = vOrganisationId
LIMIT 1;

SELECT 1 INTO prm_Success;

IF vCallerExists > 1 THEN

SELECT 2 INTO prm_Success;

END IF;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallTypes !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallTypes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT CallTypeId, CallType, IsDeleted, SortOrder FROM AAU.CallType WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCaseById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCaseById ( IN prm_streetTreatCaseId INT, OUT Success INT)
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
Description: Altering to run from new Apoms tables.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

SELECT	c.StreetTreatCaseId AS CaseId,
		ec.EmergencyNumber,
		p.TagNumber,
		pc.PercentComplete,
		nv.NextVisit,
		at.AnimalTypeId,
		c.PriorityId,
		c.StatusId,
		c.AssignedVehicleId,
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
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusByTagNumber !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCensusByTagNumber(IN prm_UserName VARCHAR(45), IN prm_TagNumber VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 10/08/2020
Purpose: Fetches census data for census table in hospital manager tab
*/

SELECT
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE
		(
			JSON_OBJECT("date" ,tl.InDate),
			JSON_OBJECT("area" ,ta.TreatmentArea),
			JSON_OBJECT("action" , "Moved in"),
			JSON_OBJECT("days" , DATEDIFF(IFNULL(OutDate, CURDATE()), InDate)),
			JSON_OBJECT("order" , tl.TreatmentListId)
		)
) AS Census
FROM AAU.TreatmentList tl
INNER JOIN AAU.Patient p ON p.PatientId = tl.PatientId AND p.TagNumber = prm_TagNumber
INNER JOIN AAU.TreatmentArea ta ON ta.TreatmentAreaId = tl.InTreatmentAreaId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_getCurrentPatientsByEmergencyCaseId !!
DROP PROCEDURE IF EXISTS AAU.sp_GetCurrentPatientsByEmergencyCaseId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCurrentPatientsByEmergencyCaseId( IN prm_EmergencyCaseId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a patients by Emergency Case Id.

Modified By: Jim Mackenzie
Modified On: 28/02/2022
Modification: Replacing Position with GUID.
*/

SELECT
p.PatientId,
p.EmergencyCaseId,
p.GUID,
p.AnimalTypeId,
p.TagNumber
FROM AAU.Patient p
WHERE p.EmergencyCaseId = prm_EmergencyCaseId;

SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetDriverViewDetails !!

-- CALL AAU.sp_GetDriverViewDetails('2022-03-01T11:23','jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetDriverViewDetails(IN prm_Date DATETIME, IN prm_Username VARCHAR(45))
BEGIN


DECLARE vVehicleId INT;
DECLARE vUserId INT;
DECLARE vTimeNow DATETIME;
DECLARE vDateNow DATETIME;

SELECT u.UserId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset), CAST(CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) AS DATE) INTO vUserId, vTimeNow, vDateNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE u.UserName = prm_Username LIMIT 1;


WITH VehicleIdCTE AS
(
	SELECT v.VehicleId
    FROM AAU.Vehicle v
	INNER JOIN AAU.VehicleShift vs ON vs.VehicleId = v.VehicleId
	INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
	WHERE vsu.UserId = vUserId AND (vs.StartDate <= prm_Date AND vs.EndDate >= prm_Date)
	AND IFNULL(vs.IsDeleted,0) = 0
),

RescueReleaseST AS
(SELECT p.PatientId, 'Rescue' AmbulanceAction
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
WHERE ( CAST(prm_Date AS DATE) >= CAST(ec.AmbulanceAssignmentTime AS DATE) AND (CAST(prm_Date AS DATE) <=  COALESCE(CAST(ec.AdmissionTime AS DATE), vDateNow)) )
AND ec.AssignedVehicleId IN (SELECT VehicleId FROM VehicleIdCTE)
AND p.PatientCallOutcomeId IS NULL
AND p.IsDeleted = 0

UNION

SELECT rd.PatientId ,IF(rd.IsStreetTreatRelease = 1, 'STRelease','Release')
FROM AAU.ReleaseDetails rd
WHERE ( CAST(prm_Date AS DATE) >= CAST(rd.AmbulanceAssignmentTime AS DATE) AND CAST(prm_Date AS DATE) <= IFNULL(DATE_ADD(CAST(rd.EndDate AS DATE), INTERVAL 1 DAY), vDateNow) )
AND rd.AssignedVehicleId IN (SELECT VehicleId FROM VehicleIdCTE)

UNION

SELECT st.PatientId , IF(rd.ReleaseDetailsId IS NOT NULL,'STRelease','StreetTreat')
FROM AAU.StreetTreatCase st
INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = st.StreetTreatCaseId
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = st.PatientId AND (rd.IsStreetTreatRelease = 1 AND rd.AssignedVehicleId = st.AssignedVehicleId)
WHERE ( CAST(v.Date AS DATE) = CAST(prm_Date AS DATE) AND st.AmbulanceAssignmentTime IS NOT NULL AND v.VisitId IS NOT NULL )
AND st.AssignedVehicleId IN (SELECT VehicleId FROM VehicleIdCTE)
AND v.IsDeleted = 0
AND st.IsDeleted = 0
)
,
EmergencyCaseIds AS
(
SELECT EmergencyCaseId
FROM AAU.Patient
WHERE PatientId IN (SELECT PatientId FROM RescueReleaseST)
AND IsDeleted = 0
),
CallerCTE AS
(
SELECT ecr.EmergencyCaseId,
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT('callerId', c.CallerId),
	JSON_OBJECT('callerName', c.Name),
	JSON_OBJECT('callerNumber', c.Number),
    JSON_OBJECT('callerAlternativeNumber', c.AlternativeNumber)
	)) AS callerDetails
	FROM AAU.Caller c
	INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
    WHERE ecr.IsDeleted = 0
    AND ecr.EmergencyCaseId IN (SELECT EmergencyCaseId FROM EmergencyCaseIds)
	GROUP BY ecr.EmergencyCaseId
),
UserCTE AS
(
	SELECT UserId, Initials
	FROM AAU.User
),
PatientsCTE AS
(

    SELECT DISTINCT
		p.EmergencyCaseId,
        p.PatientCallOutcomeId AS `PatientCallOutcomeId`,        
		COALESCE(rd.PatientId, std.PatientId, p.EmergencyCaseId) AS `PatientId`, -- Tricking the query to group rescues together, but keep releases apart.
        MIN(rrst.AmbulanceAction) AS `AmbulanceAction`,
        MAX(COALESCE(rd.PatientId, std.PatientId, 0)) AS `IsReleased`,
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("animalType", ant.AnimalType),
            JSON_OBJECT("animalTypeId", p.AnimalTypeId),
            JSON_OBJECT("patientId", p.PatientId),
            JSON_OBJECT("GUID", p.GUID),
            JSON_OBJECT("tagNumber", p.TagNumber),
            JSON_OBJECT("largeAnimal", ant.LargeAnimal),
            JSON_OBJECT("admissionAccepted", tl.InAccepted),
            JSON_OBJECT("admissionArea", tl.InTreatmentAreaId),
            JSON_OBJECT("callOutcome",
				JSON_MERGE_PRESERVE(
					JSON_OBJECT("CallOutcome",
						JSON_MERGE_PRESERVE(
						JSON_OBJECT("CallOutcomeId",p.PatientCallOutcomeId),
						JSON_OBJECT("CallOutcome",co.CallOutcome))
					),
					JSON_OBJECT("sameAsNumber",p.SameAsEmergencyCaseId)
                )
            ),
            JSON_OBJECT("mediaCount", IFNULL(pmi.mediaCount,0)),
            pp.PatientProblems,
            pp.problemsJSON
		)) AS Patients
    FROM AAU.Patient p
    INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
    INNER JOIN (
		SELECT pp.PatientId,JSON_OBJECT("problems",
		 JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
				JSON_OBJECT("problemId", pp.ProblemId),
				JSON_OBJECT("problem", pr.Problem)
				)
			 )
		) AS problemsJSON,
		JSON_OBJECT("problemsString", GROUP_CONCAT(pr.Problem)) AS PatientProblems
		FROM AAU.PatientProblem pp
		INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
        WHERE pp.PatientId IN (SELECT PatientId FROM RescueReleaseST)
		GROUP BY pp.PatientId
    ) pp ON pp.PatientId = p.PatientId
    LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
    LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.Admission = 1
    LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
    LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = p.PatientId
    LEFT JOIN RescueReleaseST rrst ON rrst.PatientId = p.PatientId
	LEFT JOIN
    (
		SELECT	pmi.PatientId,
				COUNT(pmi.PatientId) as mediaCount
		FROM AAU.PatientMediaItem pmi
        WHERE pmi.PatientId IN (SELECT PatientId FROM RescueReleaseST)
        AND pmi.IsDeleted = 0
		GROUP BY pmi.PatientId
    ) pmi ON pmi.PatientId = p.PatientId
    WHERE p.PatientId IN (SELECT PatientId FROM RescueReleaseST)
    GROUP BY p.EmergencyCaseId,
		p.PatientCallOutcomeId,
        COALESCE(rd.PatientId, std.PatientId, p.EmergencyCaseId)   
),
DriverViewCTE AS
(
SELECT

			p.AmbulanceAction,
            rd.ReleaseDetailsId,
            rd.AssignedVehicleId AS ReleaseAssignedVehicleId,
            rd.AmbulanceAssignmentTime AS ReleaseAmbulanceAssignmentTime,
            rd.RequestedDate,
            rd.ComplainerNotes,
			ec.Comments,
            rd.Releaser1Id,
            std.StreetTreatCaseId,
            std.AssignedVehicleId AS StreetTreatAssignedVehicleId,
            std.AmbulanceAssignmentTime AS StreetTreatAmbulanceAssignmentTime,
            std.MainProblemId,
            ec.AssignedVehicleId,
            ec.AmbulanceAssignmentTime,
            ec.Admissiontime,
            mp.MainProblem,
            std.PriorityId,
            p.Priority,
            tl.InTreatmentAreaId,
            p.PatientCallOutcomeId,
            rd.PickupDate,
            p.PatientId,
            rd.BeginDate,
            rd.EndDate,
			v.VisitId,
            v.VisitBeginDate,
            v.VisitEndDate,
            v.VisitTypeId,
			v.Date,
			v.StatusId,
			v.AdminNotes,
			v.OperatorNotes,
            ec.AmbulanceArrivalTime,
            ec.RescueTime,
			ec.EmergencyCaseId,
            ec.EmergencyNumber,
            ec.EmergencyCodeId,
            ec.DispatcherId,
            ecd.EmergencyCode,
            ec.CallDateTime,
            ec.Location,
            JSON_MERGE_PRESERVE(
            JSON_OBJECT("lat",IFNULL(ec.Latitude, 0.0)),
            JSON_OBJECT("lng",IFNULL(ec.Longitude, 0.0))
            ) AS latLngLiteral,
            JSON_OBJECT("callerDetails",c.callerDetails) AS callerDetails,
            JSON_OBJECT("patients",p.Patients) AS Patients
FROM PatientsCTE p
LEFT JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
LEFT JOIN CallerCTE c ON c.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.Admission = 1 AND p.IsReleased > 0
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId AND p.IsReleased > 0
LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = p.PatientId AND p.IsReleased > 0 AND std.IsDeleted = 0
LEFT JOIN AAU.Priority p ON p.PriorityId = std.PriorityId
LEFT JOIN AAU.MainProblem mp ON mp.MainProblemId = std.MainProblemId
LEFT JOIN AAU.Visit v ON v.StreetTreatCaseId = std.StreetTreatCaseId AND v.Date = vDateNow AND v.IsDeleted = 0
LEFT JOIN AAU.EmergencyCode ecd ON ecd.EmergencyCodeId = ec.EmergencyCodeId)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("actionStatus", null),
JSON_OBJECT("ambulanceAction", AmbulanceAction),
JSON_OBJECT("releaseDetailsId", ReleaseDetailsId),
JSON_OBJECT("releaseRequestDate", RequestedDate),
JSON_OBJECT("releaseComplainerNotes", ComplainerNotes),
JSON_OBJECT("streetTreatCaseId", StreetTreatCaseId),
JSON_OBJECT("streetTreatMainProblemId", MainProblemId),
JSON_OBJECT("streetTreatMainProblem", MainProblem),
JSON_OBJECT("streetTreatPriorityId", PriorityId),
JSON_OBJECT("streetTreatPriority", Priority),
JSON_OBJECT("patientCallOutcomeId", PatientCallOutcomeId),
JSON_OBJECT("releasePickupDate", DATE_Format(PickupDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("patientId", PatientId),
JSON_OBJECT("releaseBeginDate", DATE_Format(BeginDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("releaseEndDate", DATE_Format(EndDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("visitBeginDate", DATE_Format(VisitBeginDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("visitEndDate", DATE_Format(VisitEndDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("ambulanceArrivalTime", DATE_Format(AmbulanceArrivalTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescueTime", DATE_Format(RescueTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("emergencyCaseId", EmergencyCaseId),
JSON_OBJECT("dispatcher", DispatcherId),
JSON_OBJECT("visitTypeId", VisitTypeId),
JSON_OBJECT("visitDate", Date),
JSON_OBJECT("visitStatusId", StatusId),
JSON_OBJECT("visitAdminNotes", AdminNotes),
JSON_OBJECT("visitOperatorNotes", OperatorNotes),
JSON_OBJECT("rescueAmbulanceId", AssignedVehicleId),
JSON_OBJECT("rescueAmbulanceAssignmentDate", DATE_Format(AmbulanceAssignmentTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("releaseAmbulanceId", ReleaseAssignedVehicleId),
JSON_OBJECT("releaseAmbulanceAssignmentDate", DATE_Format(ReleaseAmbulanceAssignmentTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("streetTreatAmbulanceId", StreetTreatAssignedVehicleId),
JSON_OBJECT("streetTreatAmbulanceAssignmentDate", DATE_Format(StreetTreatAmbulanceAssignmentTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("admissionTime", DATE_Format(AdmissionTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("inTreatmentAreaId", InTreatmentAreaId),
JSON_OBJECT("emergencyNumber", EmergencyNumber),
JSON_OBJECT("emergencyCodeId", EmergencyCodeId),
JSON_OBJECT("emergencyCode", EmergencyCode),
JSON_OBJECT("caseComments", Comments),
JSON_OBJECT("visitId", VisitId),
JSON_OBJECT("callDateTime", DATE_Format(CallDateTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("location", Location),
JSON_OBJECT("latLngLiteral", latLngLiteral),
JSON_OBJECT("isUpdated", FALSE),
callerDetails,
Patients))AS DriverViewData
FROM DriverViewCTE;

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetDriverViewQuestions !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetDriverViewQuestions(In prm_Username VARCHAR(45))
BEGIN

/*
CreatedDate:09/07/2021
CreatedBy: Arpit Trivedi
Purpose: To create the driver view form dynamically
*/

SELECT 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT('actionStatus', ActionStatus),
JSON_OBJECT('subAction', SubAction),
JSON_OBJECT('formControlName', FormControlName),
JSON_OBJECT('type', FormControlType),
JSON_OBJECT('sortOrder', SortOrder),
JSON_OBJECT('label', Label)
)) questionList
FROM AAU.DriverViewQuestions;


END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetDropdownByAssignmentDate !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetDropdownByAssignmentDate (IN prm_Username VARCHAR(45),
IN prm_AssignmentDate DATETIME)
BEGIN

/*
Created by: Arpit Trivedi
Created Date: 09-09-2021
Purpose: To get the vehicle list by assigned date 
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT vs.VehicleId AS `vehicleId` ,
vs.VehicleShiftId AS `vehicleShiftId`,
CONCAT(v.VehicleNumber,vsu.VehicleStaff) AS `vehicleNumber`,
v.VehicleRegistrationNumber AS `vehicleRegistrationNumber`
FROM AAU.VehicleShift vs
INNER JOIN AAU.Vehicle v ON v.VehicleId = vs.VehicleId
LEFT JOIN
(
	SELECT VehicleShiftId, CONCAT(" - (",GROUP_CONCAT(u.Initials),")") AS `VehicleStaff`
	FROM AAU.VehicleShiftUser vsu
	LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
	GROUP BY VehicleShiftId
) vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
WHERE v.OrganisationId = vOrganisationId
AND prm_AssignmentDate > vs.StartDate AND prm_AssignmentDate < vs.EndDate
AND vs.IsDeleted IS NULL;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEditableDropdowns !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEditableDropdowns ()
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2022-01-19
Description: Procedure for getting dropdowns that are editable for the organisation settings page.
*/

SELECT
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("dropdown", Dropdown),
	JSON_OBJECT("displayName", DisplayName),
    JSON_OBJECT("request", Request),
    JSON_OBJECT("tableName", TableName)
	)) EditableDropdowns
FROM AAU.EditableDropdown;

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEmergencyCaseByDate !!

DELIMITER $$


CREATE PROCEDURE AAU.sp_GetEmergencyCaseByDate (IN prm_UserName VARCHAR(45),
												IN prm_Date DATETIME,
												IN prm_Outcome INT)
BEGIN

/*
CreatedDate: 20/01/2021
CreatedBy: Arpit Trivedi
Purpose: To get the emergencycase count on date
*/

DECLARE vOrganisationId INT;

SELECT o.OrganisationId INTO vOrganisationId
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT
ec.EmergencyNumber as "emergencyNumber",
DATE_Format(ec.CallDateTime,"%Y-%m-%dT%H:%i:%s") as "callDateTime",
at.AnimalType as "animalType",
p.TagNumber as "tagNumber",
ec.Location as "location",
u.FirstName as "dispatcher",
v.`staff1`,
v.`staff2`,
co.CallOutcome as "callOutcome"
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
INNER JOIN AAU.User u ON u.UserId = ec.DispatcherId
INNER JOIN AAU.PatientProblem pp ON pp.PatientId = p.PatientId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
LEFT JOIN
(
SELECT vs.VehicleId, MIN(u.FirstName) as `staff1`, MAX(u.FirstName) as `staff2`
FROM AAU.VehicleShift vs
INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
INNER JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE NOW() BETWEEN vs.StartDate AND vs.EndDate
GROUP BY vs.VehicleId
) v ON v.VehicleId = ec.AssignedVehicleId
WHERE CAST(ec.CallDateTime AS DATE) = prm_Date
AND ec.OrganisationId = vOrganisationId
AND (p.PatientCallOutcomeId = prm_Outcome OR prm_Outcome IS NULL);

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEmergencyCodes !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEmergencyCodes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT EmergencyCodeId, EmergencyCode, IsDeleted, SortOrder FROM AAU.EmergencyCode WHERE OrganisationId = vOrganisationId;

END$$

DELIMITER ;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetMainProblem !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetMainProblem(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 08/05/2019
Purpose: Used to return list of main problems for cases.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT MainProblemId, MainProblem, IsDeleted, SortOrder
FROM AAU.MainProblem
WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetMediaItemsByPatientId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetMediaItemsByPatientId(IN prm_PatientId INT)
BEGIN

/*****************************************
Author: Jim Mackenzie
Date: 23/07/2020
Purpose: To retrieve Media items for a patient


Modified By: Ankit Singh
Date: 25-04-2021
Purpose: Comment with User

*****************************************/

/*
Updated By: Arpit Trivedi
Date: 9-11-20
Purpose: Added the date format in the datetime field.
*/

SELECT 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("mediaItemId", PatientMediaItemId),
JSON_OBJECT("mediaType", MediaType),
JSON_OBJECT("localURL", NULL),
JSON_OBJECT("isPrimary" , isPrimary),
JSON_OBJECT("remoteURL", URL),
JSON_OBJECT("datetime", DATE_FORMAT(DateTime , "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("patientId", PatientId),
JSON_OBJECT("heightPX", HeightPX),
JSON_OBJECT("widthPX", WidthPX),
Tags
)
) AS Result
FROM AAU.PatientMediaItem pmi
WHERE pmi.PatientId = prm_PatientId
AND pmi.IsDeleted = false;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOrganisationDetail !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOrganisationDetail(IN prm_OrganisationId INT)
BEGIN
	SELECT 
		JSON_OBJECT(
		'logoUrl', om.LogoURL,
		'address', om.Address,
		'name', o.Organisation,
        'driverViewDeskNumber', om.DriverViewDeskNumber
		) AS Organisation
	FROM 
		AAU.OrganisationMetadata om
		INNER JOIN AAU.Organisation o ON o.OrganisationId = om.OrganisationId
	WHERE o.OrganisationId = prm_OrganisationId;
	
END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutcomes !!

-- CALL AAU.sp_GetOutcomes('Haris')

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOutcomes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT CallOutcomeId, CallOutcome, IsDeleted, SortOrder FROM AAU.CallOutcome WHERE OrganisationId = vOrganisationId OR CallOutcomeId IN (1,18);

END$$
DELIMITER ;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescueByEmergencyCaseId !!

-- CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(104161,null,"Rescue");

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOutstandingRescueByEmergencyCaseId( IN prm_EmergencyCaseId INT,
 IN prm_PatientId INT,
 IN prm_AmbulanceAction VARCHAR(45))
BEGIN


/**************************************************************************
Author: Jim Mackenzie
Date: 16/04/2020
Purpose: To retrieve outstanding rescues for display in the rescue board.

Updated By: Arpit Trivedi
Date: 29/11/2020
Purpose: To retrieve outstanding rescues and releases for display on board.

Updated By: Arpit Trivedi
Date: 28/04/2021
Purpose: Moved the Outcome to the patient level so now it will retrieve the rescues and releases on the patient call outcome.

Updated By: Jim Mackenzie
Date: 28/04/2021
Purpose: Altering status based upon whether the admission area has been added

***************************************************************************/

DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;
SET vOrganisationId = 1;

SELECT CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vTimeNow
FROM  AAU.Organisation o
INNER JOIN AAU.EmergencyCase ec ON ec.OrganisationId = o.OrganisationId
WHERE ec.EmergencyCaseId = prm_EmergencyCaseId LIMIT 1;

 WITH RescueReleaseSTPatientId AS (
	SELECT PatientId
    FROM AAU.Patient
    WHERE EmergencyCaseId = prm_EmergencyCaseId
    AND IFNULL(prm_PatientId, PatientId) = PatientId
),

EmergencyCaseIds AS
(
SELECT EmergencyCaseId
FROM AAU.Patient
WHERE PatientId IN (SELECT PatientId FROM RescueReleaseSTPatientId)
),
CallerCTE AS
(
SELECT ecr.EmergencyCaseId,
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT('callerId', c.CallerId),
	JSON_OBJECT('callerName', c.Name),
	JSON_OBJECT('callerNumber', c.Number),
    JSON_OBJECT('callerAlternativeNumber', c.AlternativeNumber)
	)) AS callerDetails
	FROM AAU.Caller c
	INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
    WHERE ecr.IsDeleted = 0
    AND ecr.EmergencyCaseId IN (SELECT EmergencyCaseId FROM EmergencyCaseIds)
	GROUP BY ecr.EmergencyCaseId
),
UserCTE AS
(
	SELECT UserId, Initials
	FROM AAU.User
),
PatientsCTE AS
(
    SELECT DISTINCT
		p.EmergencyCaseId,
        MAX(p.PatientCallOutcomeId) AS `PatientCallOutcomeId`,
        MAX(COALESCE(rd.PatientId, std.PatientId, 0)) AS `IsReleased`,
        COALESCE(rd.PatientId, std.PatientId, p.EmergencyCaseId) AS `PatientId`, -- Tricking the query to group rescues together, but keep releases apart.
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("animalType", ant.AnimalType),
            JSON_OBJECT("animalTypeId", p.AnimalTypeId),
            JSON_OBJECT("patientId", IFNULL(rd.PatientId, p.PatientId)),
            JSON_OBJECT("GUID", p.GUID),
            JSON_OBJECT("tagNumber", p.TagNumber),
            JSON_OBJECT("largeAnimal", ant.LargeAnimal),
            JSON_OBJECT("admissionAccepted", tl.InAccepted),
            JSON_OBJECT("admissionArea", tl.InTreatmentAreaId),
            JSON_OBJECT("callOutcome",
				JSON_MERGE_PRESERVE(
					JSON_OBJECT("CallOutcome",
						JSON_MERGE_PRESERVE(
						JSON_OBJECT("CallOutcomeId",p.PatientCallOutcomeId),
						JSON_OBJECT("CallOutcome",co.CallOutcome))
					),
					JSON_OBJECT("sameAsNumber",p.SameAsEmergencyCaseId)
                )
            ),
            JSON_OBJECT("mediaCount", IFNULL(pmi.mediaCount,0)),
            pp.PatientProblems,
            pp.problemsJSON
		)) AS Patients
    FROM AAU.Patient p
    INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
    INNER JOIN (
		SELECT pp.PatientId,JSON_OBJECT("problems",
		 JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
				JSON_OBJECT("problemId", pp.ProblemId),
				JSON_OBJECT("problem", pr.Problem)
				)
			 )
		) AS problemsJSON,
		JSON_OBJECT("problemsString", GROUP_CONCAT(pr.Problem)) AS PatientProblems
		FROM AAU.PatientProblem pp
		INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
        WHERE pp.PatientId IN (SELECT PatientId FROM RescueReleaseSTPatientId)
		GROUP BY pp.PatientId
    ) pp ON pp.PatientId = p.PatientId
    LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
    LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.Admission = 1
    LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
    LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = p.PatientId
	LEFT JOIN
    (
		SELECT	pmi.PatientId,
				COUNT(pmi.PatientId) as mediaCount
		FROM AAU.PatientMediaItem pmi
        WHERE pmi.PatientId IN (SELECT PatientId FROM RescueReleaseSTPatientId)
        AND pmi.IsDeleted = 0
		GROUP BY pmi.PatientId
    ) pmi ON pmi.PatientId = p.PatientId
    WHERE p.PatientId IN (SELECT PatientId FROM RescueReleaseSTPatientId)
    GROUP BY p.EmergencyCaseId,
    COALESCE(rd.PatientId, std.PatientId, p.EmergencyCaseId)
)
,
DriverViewObject AS
(
	SELECT CASE
            WHEN rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NULL AND rd.IsStreetTreatRelease = 0 THEN 'Release'
            WHEN rd.ReleaseDetailsId IS NULL AND std.StreetTreatCaseId IS NOT NULL THEN 'StreetTreat'
            WHEN rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NOT NULL AND rd.IsStreetTreatRelease = 1 THEN 'STRelease'
            WHEN rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NOT NULL AND rd.EndDate IS NOT NULL
            AND prm_AmbulanceAction = 'StreetTreat' THEN 'StreetTreat'
            WHEN rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NOT NULL AND rd.EndDate IS NOT NULL
            AND prm_AmbulanceAction = 'Release' THEN 'Release'
           -- WHEN rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NOT NULL AND rd.IsStreetTreatRelease = 0 THEN 'Release'
            ELSE 'Rescue' END
            AS AmbulanceAction,
            			AAU.fn_GetRescueStatus(
						rd.ReleaseDetailsId,
						rd.RequestedUser,
						rd.RequestedDate,
						rd.AssignedVehicleId,
						rd.PickupDate,
						rd.BeginDate,
						rd.EndDate,
						ec.AssignedVehicleId,
						ec.AmbulanceArrivalTime,
						ec.RescueTime,
						ec.AdmissionTime,
						p.PatientCallOutcomeId,
						tl.InTreatmentAreaId
					) AS `ActionStatusId`,
			IF((rd.AssignedVehicleId IS NULL AND std.AssignedVehicleId IS NULL),ec.AssignedVehicleId,
				IF((rd.AssignedVehicleId IS NOT NULL AND std.AssignedVehicleId IS NULL),rd.AssignedVehicleId,
				IF((rd.AssignedVehicleId IS NULL AND std.AssignedVehicleId IS NOT NULL),std.AssignedVehicleId,
				IF((rd.AssignedVehicleId IS NOT NULL AND std.AssignedVehicleId IS NOT NULL),std.AssignedVehicleId,NULL)
				))) AS driverAssignedVehicleId,
            rd.ReleaseDetailsId,
            rd.AssignedVehicleId AS ReleaseAssignedVehicleId,
            rd.AmbulanceAssignmentTime AS ReleaseAmbulanceAssignmentTime,
            rd.RequestedDate,
            rd.ComplainerNotes,
			ec.Comments,
            rd.Releaser1Id,
            std.StreetTreatCaseId,
            std.AssignedVehicleId AS StreetTreatAssignedVehicleId,
            std.AmbulanceAssignmentTime AS StreetTreatAmbulanceAssignmentTime,
            std.MainProblemId,
            ec.AssignedVehicleId,
            ec.AmbulanceAssignmentTime,
            ec.Admissiontime,
            mp.MainProblem,
            std.PriorityId,
            p.Priority,
            tl.InTreatmentAreaId,
            p.PatientCallOutcomeId,
            rd.PickupDate,
            p.PatientId,
            rd.BeginDate,
            rd.EndDate,
			v.VisitId,
            v.VisitBeginDate,
            v.VisitEndDate,
            v.VisitTypeId,
			v.Date,
			v.StatusId,
			v.AdminNotes,
			v.OperatorNotes,
            ec.AmbulanceArrivalTime,
            ec.RescueTime,
			ec.EmergencyCaseId,
            ec.EmergencyNumber,
            ec.EmergencyCodeId,
            ec.DispatcherId,
            ecd.EmergencyCode,
            ec.CallDateTime,
            ec.Location,
            JSON_MERGE_PRESERVE(
            JSON_OBJECT("lat",IFNULL(ec.Latitude, 0.0)),
            JSON_OBJECT("lng",IFNULL(ec.Longitude, 0.0))
            ) AS latLngLiteral,
            JSON_OBJECT("callerDetails",c.callerDetails) AS callerDetails,
            JSON_OBJECT("patients",p.Patients) AS Patients
FROM PatientsCTE p
LEFT JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
LEFT JOIN CallerCTE c ON c.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND p.IsReleased > 0 AND Admission = 1
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId AND p.IsReleased > 0
LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = p.PatientId AND p.IsReleased > 0
LEFT JOIN AAU.Priority p ON p.PriorityId = std.PriorityId
LEFT JOIN AAU.MainProblem mp ON mp.MainProblemId = std.MainProblemId
LEFT JOIN AAU.Visit v ON v.StreetTreatCaseId = std.StreetTreatCaseId AND v.Date = CAST(vTimeNow AS DATE)
LEFT JOIN AAU.EmergencyCode ecd ON ecd.EmergencyCodeId = ec.EmergencyCodeId

),

DriverVehicleUserListCTE AS (
SELECT JSON_ARRAYAGG(u.UserId) rescuerList,
vs.VehicleId
FROM AAU.VehicleShift vs
INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
INNER JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE vs.VehicleId IN (SELECT driverAssignedVehicleId FROM DriverViewObject )
AND vs.StartDate<= vTimeNow AND vs.EndDate >= vTimeNow AND IFNULL(vs.IsDeleted,0) = 0
GROUP BY vs.VehicleId
),
DriverViewCTE AS (
	SELECT *
    FROM DriverViewObject dvo
    LEFT JOIN DriverVehicleUserListCTE dvuc ON dvuc.VehicleId = dvo.driverAssignedVehicleId
   -- WHERE IF(AmbulanceAction = 'StreetTreat', VisitBeginDate <= NOW() AND IFNULL(VisitEndDate, NOW()) >= NOW(), VisitBeginDate IS NULL AND VisitEndDate IS NULL)
)


SELECT
JSON_MERGE_PRESERVE(
JSON_OBJECT("actionStatus", null),
JSON_OBJECT("actionStatusId", ActionStatusId),
JSON_OBJECT("ambulanceAction", AmbulanceAction),
JSON_OBJECT("releaseDetailsId", ReleaseDetailsId),
JSON_OBJECT("releaseRequestDate", RequestedDate),
JSON_OBJECT("releaseComplainerNotes", ComplainerNotes),
JSON_OBJECT("streetTreatCaseId", StreetTreatCaseId),
JSON_OBJECT("streetTreatMainProblemId", MainProblemId),
JSON_OBJECT("streetTreatMainProblem", MainProblem),
JSON_OBJECT("streetTreatPriorityId", PriorityId),
JSON_OBJECT("streetTreatPriority", Priority),
JSON_OBJECT("patientCallOutcomeId", PatientCallOutcomeId),
JSON_OBJECT("releasePickupDate", DATE_Format(PickupDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("patientId", PatientId),
JSON_OBJECT("releaseBeginDate", DATE_Format(BeginDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("releaseEndDate", DATE_Format(EndDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("visitBeginDate", DATE_Format(VisitBeginDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("visitEndDate", DATE_Format(VisitEndDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("ambulanceArrivalTime", DATE_Format(AmbulanceArrivalTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescueTime", DATE_Format(RescueTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("emergencyCaseId", EmergencyCaseId),
JSON_OBJECT("dispatcher", DispatcherId),
JSON_OBJECT("visitTypeId", VisitTypeId),
JSON_OBJECT("visitDate", Date),
JSON_OBJECT("visitStatusId", StatusId),
JSON_OBJECT("visitAdminNotes", AdminNotes),
JSON_OBJECT("visitOperatorNotes", OperatorNotes),
JSON_OBJECT("rescueAmbulanceId", AssignedVehicleId),
JSON_OBJECT("rescueAmbulanceAssignmentDate", DATE_Format(AmbulanceAssignmentTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("releaseAmbulanceId", ReleaseAssignedVehicleId),
JSON_OBJECT("releaseAmbulanceAssignmentDate", DATE_Format(ReleaseAmbulanceAssignmentTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("streetTreatAmbulanceId", StreetTreatAssignedVehicleId),
JSON_OBJECT("streetTreatAmbulanceAssignmentDate", DATE_Format(StreetTreatAmbulanceAssignmentTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("admissionTime", DATE_Format(AdmissionTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("inTreatmentAreaId", InTreatmentAreaId),
JSON_OBJECT("emergencyNumber", EmergencyNumber),
JSON_OBJECT("emergencyCodeId", EmergencyCodeId),
JSON_OBJECT("emergencyCode", EmergencyCode),
JSON_OBJECT("caseComments", Comments),
JSON_OBJECT("visitId", VisitId),
JSON_OBJECT("callDateTime", DATE_Format(CallDateTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("location", Location),
JSON_OBJECT("latLngLiteral", latLngLiteral),
JSON_OBJECT("isUpdated", FALSE),
JSON_OBJECT('rescuerList',rescuerList),
callerDetails,
Patients)AS DriverViewData
FROM DriverViewCTE;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescues !!

DELIMITER $$

-- CALL AAU.sp_GetOutstandingRescues('Jim');

CREATE PROCEDURE AAU.sp_GetOutstandingRescues(IN prm_UserName VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId
FROM AAU.User u
WHERE UserName = prm_Username LIMIT 1;

WITH RescuesReleases AS
(
SELECT PatientId
FROM  AAU.Patient p
WHERE p.OrganisationId = vOrganisationId
AND p.PatientCallOutcomeId IS NULL
AND p.IsDeleted = 0

UNION

SELECT PatientId
FROM AAU.ReleaseDetails rd
WHERE rd.OrganisationId = vOrganisationId
AND rd.EndDate IS NULL

),
EmergencyCaseIds AS
(
SELECT EmergencyCaseId
FROM AAU.Patient
WHERE PatientId IN (SELECT PatientId FROM RescuesReleases)
),
EmergencyCaseCTE AS
(
SELECT  
ec.EmergencyCaseId,
ec.AssignedVehicleId,
ec.EmergencyNumber,
ec.AmbulanceArrivalTime,
ec.RescueTime,
ec.AdmissionTime,
ec.EmergencyCodeId,
ec.CallDateTime,
ecd.EmergencyCode,
ec.Location,
ec.Latitude,
ec.Longitude,
ec.ambulanceAssignmentTime
FROM AAU.EmergencyCase ec
LEFT JOIN AAU.EmergencyCode ecd ON ecd.EmergencyCodeId = ec.EmergencyCodeId
WHERE ec.EmergencyCaseId IN (SELECT EmergencyCaseId FROM EmergencyCaseIds) AND ec.IsDeleted = 0 OR ec.IsDeleted IS Null 
),

PatientsCTE AS
(
    SELECT
		p.EmergencyCaseId,
        MAX(p.PatientCallOutcomeId) AS `PatientCallOutcomeId`,
        IFNULL(rd.PatientId, p.EmergencyCaseId) AS `PatientId`, -- Tricking the query to group rescues together, but keep releases apart.
        		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("animalType", ant.AnimalType),
            JSON_OBJECT("animalTypeId", p.AnimalTypeId),
            JSON_OBJECT("patientId", p.PatientId),
            JSON_OBJECT("GUID", p.GUID),
            JSON_OBJECT("tagNumber", p.TagNumber),
            JSON_OBJECT("largeAnimal", ant.LargeAnimal),
            JSON_OBJECT("admissionAccepted", tl.InAccepted),
            JSON_OBJECT("admissionArea", tl.InTreatmentAreaId),
            JSON_OBJECT("callOutcome",
				JSON_MERGE_PRESERVE(
					JSON_OBJECT("CallOutcome",
						JSON_MERGE_PRESERVE(
						JSON_OBJECT("CallOutcomeId",p.PatientCallOutcomeId),
						JSON_OBJECT("CallOutcome",co.CallOutcome))
					),
					JSON_OBJECT("sameAsNumber",p.SameAsEmergencyCaseId)
                )
            ),
            JSON_OBJECT("mediaCount", IFNULL(pmi.mediaCount,0)),
            pp.PatientProblems,
            pp.problemsJSON
		)) AS Patients
    FROM AAU.Patient p
    
    INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
    INNER JOIN (
		SELECT pp.PatientId,JSON_OBJECT("problems",
		 JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
				JSON_OBJECT("problemId", pp.ProblemId),
				JSON_OBJECT("problem", pr.Problem)
				)
			 )
		) AS problemsJSON,
		JSON_OBJECT("problemsString", GROUP_CONCAT(pr.Problem)) AS PatientProblems
		FROM AAU.PatientProblem pp
		INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
        WHERE pp.PatientId IN (SELECT PatientId FROM RescuesReleases)
		GROUP BY pp.PatientId
    ) pp ON pp.PatientId = p.PatientId
    LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
    LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.Admission = 1
	LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
    LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = p.PatientId
    LEFT JOIN
    (
		SELECT	pmi.PatientId,
				COUNT(pmi.PatientId) as mediaCount
		FROM AAU.PatientMediaItem pmi
        WHERE pmi.PatientId IN (SELECT PatientId FROM RescuesReleases)
        AND pmi.IsDeleted = 0
		GROUP BY pmi.PatientId
    ) pmi ON pmi.PatientId = p.PatientId
    WHERE p.EmergencyCaseId IN (SELECT EmergencyCaseId FROM EmergencyCaseCTE) AND p.IsDeleted != 1
	 GROUP BY p.EmergencyCaseId,
    IFNULL(rd.PatientId, p.EmergencyCaseId)
)



SELECT  
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
	JSON_OBJECT('patients', p.Patients),
    JSON_OBJECT('patientId',p.PatientId),
	JSON_OBJECT('emergencyCaseId',ec.EmergencyCaseId),
	JSON_OBJECT('rescueAmbulanceId',ec.AssignedVehicleId),
    JSON_OBJECT('releaseAmbulanceId',rd.AssignedVehicleId),
	JSON_OBJECT('emergencyNumber',ec.EmergencyNumber),
    JSON_OBJECT('emergencyCode',ec.EmergencyCode),
    JSON_OBJECT('emergencyCodeId',ec.EmergencyCodeId),
    JSON_OBJECT('rescueTime',ec.RescueTime),
    JSON_OBJECT('ambulanceAssignmentTime',DATE_FORMAT(IF(rd.ReleaseDetailsId IS NULL, ec.ambulanceAssignmentTime, rd.ambulanceAssignmentTime), "%Y-%m-%dT%H:%i:%s") ),
	JSON_OBJECT('actionStatusId',
    AAU.fn_GetRescueStatus(
				rd.ReleaseDetailsId,
				rd.RequestedUser,
				rd.RequestedDate,
				rd.AssignedVehicleId,
				rd.PickupDate,
				rd.BeginDate,
				rd.EndDate,
                ec.AssignedVehicleId,
				ec.AmbulanceArrivalTime,
				ec.RescueTime,
				ec.AdmissionTime,
                p.PatientCallOutcomeId,
                tl.InTreatmentAreaId
            )
		),
	JSON_OBJECT('callerDetails', ca.CallerDetails),
    JSON_OBJECT("callDateTime", ec.CallDateTime),
    JSON_OBJECT("location", ec.Location),
    JSON_OBJECT("latLngLiteral",
		JSON_MERGE_PRESERVE(
				JSON_OBJECT("lat",IFNULL(ec.Latitude, 0.0)),
				JSON_OBJECT("lng",IFNULL(ec.Longitude, 0.0))
		) 
    ),
	
	JSON_OBJECT("releaseDetailsId", rd.ReleaseDetailsId),
	JSON_OBJECT("releaseRequestDate", DATE_FORMAT(rd.RequestedDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releasePickupDate", DATE_FORMAT(rd.PickupDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseBeginDate", DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseEndDate", DATE_FORMAT(rd.EndDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseType", CONCAT(IF(rd.ReleaseDetailsId IS NULL,"","Normal"), IF(IFNULL(rd.ComplainerNotes,"") <> ""," + Complainer special instructions",""), IF(rd.SpecificStaff IS NULL,"",CONCAT(" + Specific staff", rd.SpecificStaff)), IF(std.StreetTreatCaseId IS NULL,""," + StreetTreat release"))),
	JSON_OBJECT("ambulanceAction", IF(rd.ReleaseDetailsId IS NULL, 'Rescue', 'Release'))
)  )
AS Result

FROM  EmergencyCaseCTE ec 
LEFT JOIN PatientsCTE p  ON p.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN 
(
	SELECT rd.PatientId,
					rd.ReleaseDetailsId,
					rd.RequestedUser,
					rd.RequestedDate,
					rd.AssignedVehicleId,
                    rd.AmbulanceAssignmentTime,
					rd.PickupDate,
					rd.BeginDate,
					rd.EndDate,
					rd.ComplainerNotes,
					CONCAT(" (", r1.Initials, ", ", r2.Initials, ")") AS `SpecificStaff`
	FROM AAU.ReleaseDetails rd
	LEFT JOIN AAU.User r1 ON r1.UserId = rd.Releaser1Id
	LEFT JOIN AAU.User r2 ON r2.UserId = rd.Releaser2Id
) rd ON rd.PatientId = p.PatientId

LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.OutTreatmentAreaId IS NULL
LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = rd.PatientId
INNER JOIN (
	SELECT 
    ecr.EmergencyCaseId,
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT('callerId', c.CallerId),
	JSON_OBJECT('callerName',c.Name),
	JSON_OBJECT('callerNumber', c.Number),
    JSON_OBJECT('callerAlternativeNumber', c.AlternativeNumber)
	)) AS callerDetails
    FROM AAU.Caller c
    INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
    WHERE ecr.IsDeleted = 0
    AND ecr.EmergencyCaseId IN (SELECT EmergencyCaseId FROM EmergencyCaseIds)
    GROUP BY ecr.EmergencyCaseId
) ca ON  ca.EmergencyCaseId = ec.EmergencyCaseId ;

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientByPatientId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientByPatientId(IN prm_PatientId INT )
BEGIN


/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to return a Patient by ID.

Modfied By: Jim Mackenzie
Modfied On: 07/10/2020
Purpose: Adding patient detail columns

Modfied By: Jim Mackenzie
Modfied On: 16/02/2021
Purpose: Adding patient age column
*/

SELECT	    

JSON_MERGE_PRESERVE(
	JSON_OBJECT("PatientId", p.PatientId),
	JSON_OBJECT("GUID", p.GUID),
	JSON_OBJECT("animalTypeId", p.AnimalTypeId),
	JSON_OBJECT("tagNumber", p.TagNumber),
    JSON_OBJECT("createdDate", DATE_FORMAT(ec.CallDateTime,"%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("patientStatusId", p.PatientStatusId),
	JSON_OBJECT("patientStatusDate", DATE_FORMAT(p.PatientStatusDate, "%Y-%m-%d")),
	JSON_OBJECT("isDeleted", p.IsDeleted),
    JSON_OBJECT("PN", p.PN),
    JSON_OBJECT("suspectedRabies", p.SuspectedRabies),
    JSON_OBJECT("currentLocation", ps.PatientStatus),    
    JSON_OBJECT("mainProblems", p.MainProblems),
    JSON_OBJECT("description", p.Description),
    JSON_OBJECT("sex", p.Sex),
    JSON_OBJECT("treatmentPriority", p.TreatmentPriority),
    JSON_OBJECT("abcStatus", p.ABCStatus),
    JSON_OBJECT("releaseStatus", p.ReleaseStatus),
    JSON_OBJECT("age", p.Age),
    JSON_OBJECT("temperament", p.Temperament),
    JSON_OBJECT("knownAsName", p.KnownAsName)
    
) AS Result   
    
FROM AAU.Patient p
INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
WHERE p.PatientId = prm_PatientId;



END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientCallerInteractionOutcomes !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientCallerInteractionOutcomes (IN prm_Username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT PatientCallInteractionOutcomeId AS `PatientCallOutcomeId`, PatientCallInteractionOutcome AS `PatientCallOutcome`, IsDeleted, SortOrder FROM AAU.PatientCallerInteractionOutcome WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientsByEmergencyCaseId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return all patients for a case by EmergencyCaseId

Modified By: Jim Mackenzie
Modified On: 27/04/2021
Purpose: Moving the check for call outcome to patient and adding in admission acceptance flag.

Modified By: Jim Mackenzie
Modified On: 28/02/2022
Purpose: Replacing Position with GUID
*/


With PatientCTE AS (
	SELECT PatientId FROM AAU.Patient WHERE EmergencyCaseId = prm_emergencyCaseId AND IsDeleted = 0
)

SELECT 
JSON_OBJECT(
	"patients",
	 JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("patientId", p.PatientId),
			JSON_OBJECT("GUID", p.GUID),
			JSON_OBJECT("tagNumber", p.TagNumber),
			JSON_OBJECT("animalTypeId", p.AnimalTypeId),
			JSON_OBJECT("animalType", at.AnimalType),
			JSON_OBJECT("updated", false),
			JSON_OBJECT("deleted", p.IsDeleted),
			JSON_OBJECT("duplicateTag", false),
            JSON_OBJECT("admissionAccepted", tl.InAccepted),
            JSON_OBJECT("admissionArea", tl.InTreatmentAreaId),
            JSON_OBJECT("callOutcome",
				JSON_MERGE_PRESERVE(
					JSON_OBJECT("CallOutcome",
						JSON_MERGE_PRESERVE(
						JSON_OBJECT("CallOutcomeId",p.PatientCallOutcomeId),
						JSON_OBJECT("CallOutcome",co.CallOutcome))
					),
					JSON_OBJECT("sameAsNumber",saec.EmergencyNumber)
                )
            ),
            pp.problemsJSON,
            pp.problemsString				
			)
		 )
) AS Result
			
FROM  AAU.Patient p
INNER JOIN
	(
	SELECT pp.patientId, JSON_OBJECT("problems",
		 JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(                    
				JSON_OBJECT("problemId", pp.ProblemId),                        
				JSON_OBJECT("problem", pr.Problem) 
				)
			 )
		) AS problemsJSON,
        JSON_OBJECT("problemsString", GROUP_CONCAT(pr.Problem)) AS ProblemsString
	FROM AAU.PatientProblem pp
	INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
    WHERE pp.PatientId IN (SELECT PatientId FROM PatientCTE)
	GROUP BY pp.patientId
	) pp ON pp.patientId = p.patientId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN AAU.EmergencyCase saec ON saec.EmergencyCaseId = p.SameAsEmergencyCaseId
LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.Admission = 1
LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
GROUP BY p.EmergencyCaseId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientStates !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientStates(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT PatientStatusId, PatientStatus, IsDeleted, SortOrder FROM AAU.PatientStatus WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPrintPatientByPatientId !!

DELIMITER $$
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
    JSON_OBJECT("callerAlternativeNumber", ec.AlternativeNumber),
    JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
	JSON_OBJECT("rescuer", v.VehicleNumber),
	JSON_OBJECT("tagNumber", p.TagNumber)
    
) AS Result   
    
FROM AAU.Patient p
INNER JOIN (
		SELECT ec.EmergencyNumber, 
		ec.AdmissionTime,
		ec.EmergencyCaseId, 
		ec.CallDatetime, 
		c.Name, 
		c.Number,
        c.AlternativeNumber,
		ec.Location,
        ec.AssignedVehicleId
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
LEFT JOIN AAU.Vehicle v ON v.VehicleId = ec.AssignedVehicleId
WHERE p.PatientId = prm_PatientId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS  AAU.sp_GetProblems !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetProblems(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT ProblemId, Problem, IsDeleted, SortOrder
FROM AAU.Problem
WHERE OrganisationId = vOrganisationId AND ProblemId > -1;

END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetReleaseDetailsById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetReleaseDetailsById(IN prm_PatientId INT)
BEGIN
/*
Created By: Arpit Trivedi
Created On: 21/11/2020
Purpose: To fetch release details of a patient.


Modified By: Ankit Singh
Modified On: 28/01/2021
Purpose: To seperate visit data

Modified By: Ankit Singh
Modified On: 18/04/2021
Purpose: For Null Data Checking
*/


DECLARE vReleaseDetailsIdExists INT;
DECLARE vStreetTreatCaseIdExists INT;

SELECT COUNT(ReleaseDetailsId) INTO vReleaseDetailsIdExists FROM AAU.ReleaseDetails WHERE PatientId=prm_PatientId;


IF vReleaseDetailsIdExists > 0 THEN
SELECT
	JSON_OBJECT(
		"releaseId",rd.ReleaseDetailsId,
		"patientId",rd.PatientId,
		"releaseRequestForm",
			JSON_OBJECT(
				"requestedUser",u.UserName,
				"requestedDate",DATE_FORMAT(rd.RequestedDate, "%Y-%m-%dT%H:%i:%s")
			),
		"complainerNotes",rd.ComplainerNotes,
		"complainerInformed",rd.ComplainerInformed,
        "IsStreetTreatRelease",rd.IsStreetTreatRelease,
        "isStreetTreat", IF(s.StreetTreatCaseId IS NOT NULL, TRUE, FALSE),
		"Releaser1",rd.Releaser1Id,
		"Releaser2",rd.Releaser2Id,
        "releaseAmbulanceId", rd.AssignedVehicleId,
        "ambulanceAssignmentTime", DATE_FORMAT(rd.AmbulanceAssignmentTime, "%Y-%m-%dT%H:%i:%s"),
        "releaseBeginDate", DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s"),
		"releaseBeginDate", DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s"),
		"releaseEndDate", DATE_FORMAT(rd.EndDate, "%Y-%m-%dT%H:%i:%s")
	)
AS Result
	FROM
        AAU.ReleaseDetails rd
        INNER JOIN AAU.User u ON u.UserId = rd.RequestedUser
        LEFT JOIN AAU.StreetTreatCase s ON rd.PatientID = s.PatientId
        LEFT JOIN AAU.Visit v  ON s.StreetTreatCaseId = v.StreetTreatCaseId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0)
	WHERE
		rd.PatientId =  prm_PatientId
	GROUP BY rd.ReleaseDetailsId;
ELSE
	SELECT null AS Result;
END IF;

END$$
DELIMITER ;
DELIMITER !!

-- CALL AAU.sp_GetRescueDetailsByEmergencyCaseId(69474)


DROP PROCEDURE IF EXISTS AAU.sp_GetRescueDetailsByEmergencyCaseId!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetRescueDetailsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a case by ID.

Modifed By: Jim Mackenzie
Modified On: 27/06/2021
Modification: Altered to return Vehicle ID and rescuer details array
*/

SELECT 
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencyDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencyCaseId", ec.EmergencyCaseId),
JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
JSON_OBJECT("callDateTime", DATE_FORMAT(ec.CallDateTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("dispatcher", ec.DispatcherId),
JSON_OBJECT("code", ec.EmergencyCodeId),
JSON_OBJECT("updateTime", DATE_FORMAT(ec.UpdateTime, "%Y-%m-%dT%H:%i:%s"))
)),
JSON_OBJECT("callOutcome",
JSON_MERGE_PRESERVE(
JSON_OBJECT("CallOutcomeId", p.PatientCallOutcomeId),
JSON_OBJECT("callOutcome", c.CallOutcome)
)
),
JSON_OBJECT("latLngLiteral",
JSON_MERGE_PRESERVE(
JSON_OBJECT("lat", ec.Latitude),
JSON_OBJECT("lng", ec.Longitude)
)
),
JSON_OBJECT("rescueDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("ambulanceArrivalTime", DATE_FORMAT(ec.AmbulanceArrivalTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("admissionTime", DATE_FORMAT(ec.AdmissionTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescueTime", DATE_FORMAT(ec.RescueTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("assignedVehicleId", ec.assignedVehicleId),
JSON_OBJECT("selfAdmission", ec.SelfAdmission),
JSON_OBJECT("ambulanceAssignmentTime", DATE_FORMAT(ec.AmbulanceAssignmentTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescuers", RescuerDetails)
))

) AS Result

FROM AAU.EmergencyCase ec
LEFT JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id
LEFT JOIN AAU.CallOutcome c ON c.CallOutcomeId = p.PatientCallOutcomeId
LEFT JOIN
	(
		SELECT
		v.VehicleId,
        vs.StartDate,
        vs.EndDate,
		JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE(
        JSON_OBJECT("rescuerId", u.UserId),
		JSON_OBJECT("rescuerFirstName", u.FirstName),
        JSON_OBJECT("rescuerSurname", u.Surname),        
		JSON_OBJECT("rescuerInitials", u.Initials),
		JSON_OBJECT("rescuerColour", u.Colour))
		) AS `RescuerDetails`
		FROM AAU.Vehicle v
		INNER JOIN AAU.VehicleShift vs ON vs.VehicleId = v.VehicleId
		INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
		INNER JOIN AAU.User u ON u.UserId = vsu.UserId
		GROUP BY v.VehicleId,
        vs.StartDate,
        vs.EndDate
	) vdt ON ec.AmbulanceAssignmentTime >= vdt.StartDate
    AND CURDATE() <= IFNULL(vdt.EndDate, CURDATE())
	AND vdt.VehicleId = ec.AssignedVehicleId
WHERE ec.EmergencyCaseId = prm_EmergencyCaseId;

END$$

DELIMITER ;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetSearchedCases !!

-- CALL AAU.sp_GetDriverViewDetails('2022-03-01T11:23','jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetSearchedCases(
											IN prm_CaseId INT,
											IN prm_EmergencyNumber INT,
											IN prm_TagNumber VARCHAR(64),
											IN prm_AnimalTypeId INT,
                                            IN prm_StatusId INT,
											IN prm_AnimalName VARCHAR(64),
											IN prm_PriorityId INT,
											IN prm_VehicleId INT,											
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
            v.VehicleNumber,
			v.VehicleId,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            CAST(COALESCE(IF(p.PatientCallOutcomeId = 18, ec.CallDateTime, NULL), p.PatientStatusDate) AS DATE) AS ReleasedDate,
            c.ClosedDate,
            c.EarlyReleaseFlag,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId,
        ec.CallDateTime,
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
	INNER JOIN AAU.Vehicle v ON v.VehicleId = c.AssignedVehicleId
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
	INNER JOIN AAU.Visit v ON v.Date = nvr.NextVisit
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
	(c.AssignedVehicleId = prm_VehicleId OR prm_VehicleId IS NULL)
    AND
    (c.EarlyReleaseFlag = prm_EarlyReleaseFlag OR prm_EarlyReleaseFlag IS NULL);
											

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetStreetTreatCaseById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetStreetTreatCaseById ( IN prm_streetTreatCaseId INT)
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

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/


SELECT	c.StreetTreatCaseId AS CaseId,
		ec.EmergencyNumber,
		p.TagNumber,
		pc.PercentComplete,
		nv.NextVisit,
		at.AnimalTypeId,
		c.PriorityId,
		c.StatusId,
		c.AssignedVehicleId,
        c.AmbulanceAssignmentTime,
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
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetStreetTreatCaseByPatientId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetStreetTreatCaseByPatientId (
							IN prm_PatientId INT
)
BEGIN

/*
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

DECLARE vSuccess INT;
DECLARE visitExists INT;
DECLARE vStreetTreatCaseIdExists INT;

SELECT COUNT(StreetTreatCaseId) INTO vStreetTreatCaseIdExists FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;

SELECT COUNT(DISTINCT s.StreetTreatCaseId) INTO visitExists
FROM AAU.StreetTreatCase s
INNER JOIN AAU.Visit v ON s.PatientId = prm_PatientId 
WHERE (v.IsDeleted IS NULL OR v.IsDeleted = 0);

IF visitExists > 0 AND vStreetTreatCaseIdExists> 0 THEN
SELECT
	JSON_MERGE_PRESERVE(
			JSON_OBJECT("streetTreatCaseId",s.StreetTreatCaseId),
			JSON_OBJECT("patientId",s.PatientId),
			JSON_OBJECT("casePriority",s.PriorityId),
			JSON_OBJECT("assignedVehicleId",s.assignedVehicleId),
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
	FROM AAU.Visit v
        INNER JOIN AAU.StreetTreatCase s ON s.StreetTreatCaseId = v.StreetTreatCaseId AND s.PatientId = prm_PatientId
	WHERE IFNULL(v.IsDeleted,0) = 0;
        
ELSEIF visitExists = 0  AND vStreetTreatCaseIdExists > 0 THEN 
	SELECT
	JSON_MERGE_PRESERVE(
			JSON_OBJECT("streetTreatCaseId",s.StreetTreatCaseId),
			JSON_OBJECT("patientId",s.PatientId),
			JSON_OBJECT("casePriority",s.PriorityId),
			JSON_OBJECT("assignedVehicleId",s.AssignedVehicleId),
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
	FROM AAU.StreetTreatCase s
	WHERE s.PatientId = prm_PatientId ;
ELSE
	SELECT null AS Result;
END IF;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetStreetTreatWithVisitDetailsByPatientId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetStreetTreatWithVisitDetailsByPatientId (IN prm_PatientId INT)
BEGIN
DECLARE vStreetTreatCaseIdExists INT;
/*
Created By: Ankit Singh
Created On: 23/02/2020
Purpose: Used to fetch streettreat case with visits by patient id.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
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
				    "assignedVehicleId", s.AssignedVehicleId,
                    "autoAdded", IF(p.PatientCallOutcomeId = 18, true, false),
					"assignedVehicleId",s.AssignedVehicleId,
					"ambulanceAssignmentTime",DATE_FORMAT(s.AmbulanceAssignmentTime, "%Y-%m-%dT%H:%i:%s"),
				    "mainProblem",s.MainProblemId,
				    "adminNotes",s.AdminComments,
				    "streetTreatCaseStatus",s.StatusId,
                    "patientReleaseDate",IF(p.PatientStatusId IN (2,8), p.PatientStatusDate, null),
					"visits",
					IF(MAX(v.VisitId) IS NOT NULL, JSON_ARRAYAGG(
						JSON_OBJECT(
								"visitId",v.VisitId,
								"visit_day",v.Day,
								"visit_status",v.StatusId,
								"visit_type",v.VisitTypeId,
								"visit_comments",v.AdminNotes,
                                "visit_date",v.Date,
                                "operator_notes",v.OperatorNotes
						 )
					), JSON_ARRAY())
                    
				)
		) 
AS Result
	FROM AAU.StreetTreatCase s
        INNER JOIN AAU.Patient p ON p.PatientId = s.PatientId
        INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
        LEFT JOIN AAU.Visit v ON s.StreetTreatCaseId = v.StreetTreatCaseId AND IFNULL(v.IsDeleted,0) = 0
	WHERE 
		s.PatientId =  prm_PatientId
	GROUP BY s.StreetTreatCaseId;
ELSE
	SELECT null AS Result;
END IF;
END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetSurgerySite !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetSurgerySite(IN prm_UserName VARCHAR(45))
BEGIN
/*
Created By: Arpit Trivedi
Created On: 22/04/2020
Purpose: For SurgerySite Dropdown.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT SurgerySiteId, SurgerySite, IsDeleted, SortOrder FROM AAU.SurgerySite WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetSurgeryType !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetSurgeryType(IN prm_UserName VARCHAR(45))
BEGIN
/*
Created By: Arpit Trivedi
Created On: 22/04/2020
Purpose: For SurgeryType Dropdown.
*/
DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT SurgeryTypeId, SurgeryType, IsDeleted, SortOrder FROM AAU.SurgeryType WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentAreaPatientCount !!

-- CALL AAU.sp_GetTreatmentAreaPatientCount('Jim');


DELIMITER $$
CREATE PROCEDURE AAU.sp_GetTreatmentAreaPatientCount(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 09/09/2020
Purpose: Get the total count of animals in each area.

Modified By: Jim Mackenzie
Modified On: 07/Feb/2021
Modification: Altered to use function to return current area.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

WITH TotalAreaCount
AS
(
SELECT
DataCount.TreatmentArea,
SUM(LowPriority) AS LowPriority,
SUM(NormalPriority) AS NormalPriority,
SUM(HighPriority) AS HighPriority,
SUM(Infants) AS Infants,
SUM(Adults) AS Adults,
COUNT(1) AS TotalCount
FROM
(
SELECT
	COALESCE(LatestArea.TreatmentArea, AAU.fn_GetAreaForAnimalType(vOrganisationId, p.AnimalTypeId), 'Other') AS TreatmentArea,
	IF(p.TreatmentPriority = 4,1,0) AS LowPriority,
	IF(p.TreatmentPriority = 3,1,0) AS NormalPriority,
	IF(IFNULL(p.TreatmentPriority, 2) = 2,1,0) AS HighPriority,
	IF(p.Age = 1, 1, 0) AS Infants,
	IF(p.Age <> 1, 1, 0) AS Adults
FROM AAU.Patient p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId AND ec.OrganisationId = vOrganisationId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN
(
	SELECT
		tl.PatientId,
		ta.TreatmentArea
	FROM AAU.TreatmentList tl
	INNER JOIN AAU.TreatmentArea ta ON  (ta.TreatmentAreaId = tl.InTreatmentAreaId AND InAccepted = 1) OR
										(ta.TreatmentAreaId = tl.OutTreatmentAreaId AND NULLIF(InAccepted, 0) IS NULL)
    WHERE NULLIF(OutOfHospital,0) IS NULL
    AND OutDate IS NULL
) LatestArea ON LatestArea.PatientId = p.PatientId
WHERE p.PatientStatusId IN (1,7)
AND p.IsDeleted = 0
AND p.PatientCallOutcomeId = 1
 )
DataCount
GROUP BY DataCount.TreatmentArea)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("area" , data.TreatmentArea),
JSON_OBJECT("sortArea" , data.SortArea),
JSON_OBJECT("lowPriority" , LowPriority),
JSON_OBJECT("normalPriority" , NormalPriority),
JSON_OBJECT("highPriority" , HighPriority),
JSON_OBJECT("infants" , Infants),
JSON_OBJECT("adults" , Adults),
JSON_OBJECT("count" , data.TotalCount))) as PatientCountData
FROM
(
SELECT tc.TreatmentArea, IFNULL(ta.SortOrder,999) AS `SortArea`, tc.LowPriority, tc.NormalPriority, tc.HighPriority, tc.Infants, tc.Adults, tc.TotalCount
FROM TotalAreaCount tc
LEFT JOIN AAU.TreatmentArea ta ON ta.TreatmentArea = tc.TreatmentArea
UNION ALL
SELECT "Total", 999, 0, 0, 0, 0, 0, SUM(TotalCount) FROM TotalAreaCount
) data;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentAreas !!

-- CALL  AAU.sp_GetTreatmentAreas('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetTreatmentAreas(IN prm_UserName VARCHAR(45))
BEGIN

/*
Developer: Jim Mackenzie
Development Date: 28/Mar/2021
Purpose: This procedure brings back the Treatment areas for the treatment list. The lists 
		 are split into main areas and areas that will display in the 'other' section.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("areaId", TreatmentAreaId),
	JSON_OBJECT("areaName", TreatmentArea),
    JSON_OBJECT("deleted", isDeleted),
    JSON_OBJECT("sortArea", SortOrder),
    JSON_OBJECT("abbreviation", Abbreviation),
    JSON_OBJECT("mainArea", TreatmentListMain)
	)) TreatmentAreas
FROM AAU.TreatmentArea
WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentListByPatientId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetTreatmentListByPatientId( IN prm_Username VARCHAR(45), IN prm_PatientId INT )
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for inserting admission and moved in records to the treatment list.
*/

DECLARE vMaxTreatmentListId INT;
DECLARE vSocketEndpoint VARCHAR(64);

SELECT SocketEndPoint INTO vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT MAX(TreatmentListId) INTO vMaxTreatmentListId FROM AAU.TreatmentList WHERE PatientId = prm_PatientId;

WITH PatientCTE AS (
SELECT p.EmergencyCaseId, p.PatientId, p.PatientStatusId, ps.PatientStatus, p.TagNumber, p.AnimalTypeId, p.TreatmentPriority, p.ABCStatus, p.ReleaseStatus, p.Temperament, p.Age,
p.Sex, p.Description, p.KnownAsName, p.MainProblems,
CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN "Ready for release" ELSE "" END AS `ReleaseReady`
FROM AAU.Patient p
INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
WHERE p.PatientId = prm_PatientId
),
EmergencyCaseCTE AS (
SELECT ec.EmergencyCaseId, ec.EmergencyNumber, DATE_Format(ec.CallDatetime,"%Y-%m-%d") AS `CallDatetime`
FROM AAU.EmergencyCase ec
WHERE ec.EmergencyCaseId IN (SELECT EmergencyCaseId FROM PatientCTE)
)

SELECT 
vSocketEndpoint AS `socketEndPoint`,
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("recordType",
CASE
WHEN tl.InAccepted IS NULL AND tl.Admission = 1 THEN 'admissions'
WHEN tl.InAccepted IS NULL AND tl.Admission = 0 THEN 'moved in from'
WHEN tl.OutAccepted = 0 THEN 'rejected from'
ELSE 'accepted' END),
JSON_OBJECT("currentAreaId", tl.InTreatmentAreaId),
JSON_OBJECT("treatmentPatient",
JSON_MERGE_PRESERVE(
JSON_OBJECT("treatmentListId" , tl.TreatmentListId),
JSON_OBJECT("Emergency number" , ec.EmergencyNumber),
JSON_OBJECT("PatientId" , p.PatientId),
JSON_OBJECT("PatientStatusId" , p.PatientStatusId),
JSON_OBJECT("PatientStatus" , p.PatientStatus),
JSON_OBJECT("Tag number" , p.TagNumber),
JSON_OBJECT("Species" , aty.AnimalType),
JSON_OBJECT("Age" , p.Age),
JSON_OBJECT("Sex" , p.Sex),
JSON_OBJECT("Description" , p.Description),
JSON_OBJECT("Main Problems" , p.MainProblems),
JSON_OBJECT("animalTypeId" , p.animalTypeId),
JSON_OBJECT("Caller name" , c.Name),
JSON_OBJECT("Number" , c.Number),
JSON_OBJECT("Call date" , ec.CallDateTime),
JSON_OBJECT("Temperament", p.Temperament),
JSON_OBJECT("Treatment priority", p.TreatmentPriority),
JSON_OBJECT("ABC status", p.ABCStatus),
JSON_OBJECT("Release status", p.ReleaseStatus),
JSON_OBJECT("Known as name", p.KnownAsName),
JSON_OBJECT("Release ready", p.ReleaseReady),
JSON_OBJECT("Actioned by area", ca.TreatmentArea),
JSON_OBJECT("Moved to", IF(tl.OutAccepted IS NULL AND tl.OutTreatmentAreaId IS NOT NULL, tl.OutTreatmentAreaId, NULL)),
JSON_OBJECT("Admission", IF(tl.Admission = 1 AND InAccepted IS NULL, 1, 0)), -- This prevents records showing up in new admissions the first move.
JSON_OBJECT("Move accepted", tl.InAccepted),
JSON_OBJECT("treatedToday", IF(t.PatientId IS NULL,FALSE,TRUE))
)))) patientDetails		
FROM PatientCTE p	
	INNER JOIN EmergencyCaseCTE ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN
    (
		SELECT InAccepted, Admission, PatientId, TreatmentListId, OutOfHospital, InTreatmentAreaId, InDate,
        OutTreatmentAreaId, OutAccepted, OutDate,
		IF(OutAccepted = 0, OutTreatmentAreaId,IFNULL(LAG(InTreatmentAreaId, 1) OVER (PARTITION BY PatientId ORDER BY TreatmentListId), OutTreatmentAreaId)) as `ActionedByArea`
		FROM AAU.TreatmentList tld
        WHERE PatientId = prm_PatientId AND OutAccepted IS NULL
    ) tl ON tl.PatientId = p.PatientId AND NULLIF(OutAccepted, 0) IS NULL
	INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId AND ecr.PrimaryCaller = 1
	INNER JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
    LEFT JOIN AAU.TreatmentArea ca ON ca.TreatmentAreaId = tl.ActionedByArea
	LEFT JOIN
	(
		SELECT DISTINCT t.PatientId
		FROM AAU.Treatment t
		WHERE CAST(t.TreatmentDateTime AS DATE) = CURDATE()
	) t ON t.PatientId = p.PatientId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentList !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetTreatmentList( IN prm_TreatmentAreaId INT, IN prm_TreatmentListDate DATE )
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for inserting admission and moved in records to the treatment list.
*/

WITH PatientCTE AS (
	SELECT p.EmergencyCaseId, p.PatientId, p.PatientStatusId, ps.PatientStatus, p.PatientStatusDate, p.TagNumber, p.AnimalTypeId, p.TreatmentPriority, p.ABCStatus, p.ReleaseStatus, p.Temperament, p.Age,
	p.Sex, p.Description, p.KnownAsName, p.MainProblems,
	CASE WHEN p.ABCStatus IN (1, 3) AND p.ReleaseStatus = 3 THEN "Ready for release" ELSE "" END AS `ReleaseReady`
	FROM AAU.Patient p
	INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
	WHERE p.PatientId IN (SELECT PatientId FROM AAU.TreatmentList WHERE NULLIF(OutAccepted,0) IS NULL AND InTreatmentAreaId = prm_TreatmentAreaId)
	AND IFNULL(p.PatientStatusDate, prm_TreatmentListDate) >= IF(p.PatientStatusId > 1, prm_TreatmentListDate, IFNULL(p.PatientStatusDate, prm_TreatmentListDate))
	AND p.PatientCallOutcomeId = 1
	AND (
		p.PatientStatusId IN (1,7)
		OR
		p.PatientStatusDate >= prm_TreatmentListDate
    )
    AND p.IsDeleted = 0
),
EmergencyCaseCTE AS (
	SELECT ec.EmergencyCaseId, ec.EmergencyNumber, DATE_Format(ec.CallDatetime,"%Y-%m-%d") AS `CallDatetime`
	FROM AAU.EmergencyCase ec
	WHERE ec.EmergencyCaseId IN (SELECT EmergencyCaseId FROM PatientCTE)
),
RecordSplitCTE AS
(
SELECT
CASE
WHEN tl.InAccepted IS NULL AND tl.Admission = 1 THEN 'admissions'
WHEN tl.InAccepted IS NULL AND tl.Admission = 0 THEN 'moved in from'
WHEN tl.OutAccepted = 0 THEN 'rejected from'
ELSE 'accepted' END AS `RecordType`,
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("treatmentListId" , tl.TreatmentListId),
JSON_OBJECT("Emergency number" , ec.EmergencyNumber),
JSON_OBJECT("PatientId" , p.PatientId),
JSON_OBJECT("PatientStatusId" , p.PatientStatusId),
JSON_OBJECT("PatientStatus" , p.PatientStatus),
JSON_OBJECT("Tag number" , p.TagNumber),
JSON_OBJECT("Species" , aty.AnimalType),
JSON_OBJECT("Age" , p.Age),
JSON_OBJECT("Sex" , p.Sex),
JSON_OBJECT("Description" , p.Description),
JSON_OBJECT("Main Problems" , p.MainProblems),
JSON_OBJECT("animalTypeId" , p.animalTypeId),
JSON_OBJECT("Caller name" , c.Name),
JSON_OBJECT("Number" , c.Number),
JSON_OBJECT("Call date" , ec.CallDateTime),
JSON_OBJECT("Temperament", p.Temperament),
JSON_OBJECT("Treatment priority", p.TreatmentPriority),
JSON_OBJECT("ABC status", p.ABCStatus),
JSON_OBJECT("Release status", p.ReleaseStatus),
JSON_OBJECT("Known as name", p.KnownAsName),
JSON_OBJECT("Release ready", p.ReleaseReady),
JSON_OBJECT("Actioned by area", ca.TreatmentArea),
JSON_OBJECT("Moved to", IF(tl.OutAccepted IS NULL AND tl.OutTreatmentAreaId IS NOT NULL, tl.OutTreatmentAreaId, NULL)),
JSON_OBJECT("Admission", IF(tl.Admission = 1 AND InAccepted IS NULL, 1, 0)), -- This prevents records showing up in new admissions the first move.
JSON_OBJECT("Move accepted", tl.InAccepted),
JSON_OBJECT("treatedToday", IF(t.PatientId IS NULL,FALSE,TRUE))
))patientDetails		
FROM PatientCTE p	
	INNER JOIN EmergencyCaseCTE ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN
    (
		SELECT InAccepted, Admission, PatientId, TreatmentListId, OutOfHospital, InTreatmentAreaId, InDate,
        OutTreatmentAreaId, OutAccepted, OutDate,
		IF(OutAccepted = 0, OutTreatmentAreaId,IFNULL(LAG(InTreatmentAreaId, 1) OVER (PARTITION BY PatientId ORDER BY TreatmentListId), OutTreatmentAreaId)) as `ActionedByArea`
		FROM AAU.TreatmentList tld
        WHERE (prm_TreatmentListDate <= IFNULL(CAST(IF(OutAccepted IS NULL, NULL, OutDate) AS DATE), prm_TreatmentListDate)
        AND CAST(InDate AS DATE) <= prm_TreatmentListDate)
    ) tl ON tl.PatientId = p.PatientId
    AND NULLIF(OutAccepted, 0) IS NULL
    AND InTreatmentAreaId = prm_TreatmentAreaId
    AND
		(
			NULLIF(OutOfHospital,0) IS NULL
			OR
			CAST(p.PatientStatusDate AS DATE) = prm_TreatmentListDate
		)
	INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId AND ecr.PrimaryCaller = 1
	INNER JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
    LEFT JOIN AAU.TreatmentArea ca ON ca.TreatmentAreaId = tl.ActionedByArea
	LEFT JOIN
	(
		SELECT DISTINCT t.PatientId
		FROM AAU.Treatment t
		WHERE CAST(t.TreatmentDateTime AS DATE) = CURDATE()
        AND t.IsDeleted = false
	) t ON t.PatientId = p.PatientId
GROUP BY CASE
WHEN tl.InAccepted IS NULL AND tl.Admission = 1 THEN 'admissions'
WHEN tl.InAccepted IS NULL AND tl.Admission = 0 THEN 'moved in from'
WHEN tl.OutAccepted = 0 THEN 'rejected from'
ELSE 'accepted' END
)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("treatmentListType",RecordType),
JSON_OBJECT("treatmentList",patientDetails)
)) AS `TreatmentList`
FROM RecordSplitCTE;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUserById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetUserById (IN prm_userId INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to return a single user from the database. Initially
		 for edit purposes.         
         
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Removing SreetTreat team
*/

	-- Dont really need to do much here, just return the user record
    -- for the moment
	SELECT	u.UserId, 
			u.FirstName,
			u.Surname,
			u.UserName,
			u.Password,
			u.Telephone,
			r.RoleId,
			r.RoleName,
			IF(u.IsDeleted, 'Yes', 'No') AS IsDeleted    
    FROM AAU.User u
    LEFT JOIN AAU.Role r ON r.RoleId = u.RoleId
    WHERE u.UserId = prm_userId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUserByUsername !!

-- CALL AAU.sp_GetUserByUsername('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetUserByUsername (IN UserName VARCHAR(64))
BEGIN

/*
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Removing StreetTreat team.
*/

DECLARE vUserId INT;
DECLARE vOrganisationId INT;
DECLARE vUserName VARCHAR(64);
DECLARE vFirstName VARCHAR(128);
DECLARE vLastName VARCHAR(128);
DECLARE vInitials CHAR(2);
DECLARE vPermissions VARCHAR(512);
DECLARE vPreferences JSON;
DECLARE vPassword VARCHAR(255);
DECLARE vSocketEndPoint VARCHAR(20);
DECLARE vTimeZoneOffset VARCHAR(10);
DECLARE vVehicleId INT;
DECLARE vVehicleNumber VARCHAR(100);

	SELECT u.UserId,u.OrganisationId, u.UserName, u.FirstName, u.Surname, u.Initials, u.PermissionArray, u.Preferences, u.Password , o.SocketEndPoint, o.TimeZoneOffset
		INTO
		   vUserId, vOrganisationId, vUserName, vFirstName, vLastName, vInitials, vPermissions, vPreferences, vPassword, vSocketEndPoint, vTimeZoneOffset          
           
    FROM AAU.User u
    INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
    WHERE u.UserName = UserName;   
    
    SELECT v.VehicleId, v.VehicleNumber INTO vVehicleId, vVehicleNumber
    FROM
    (
    SELECT v.VehicleId, v.VehicleNumber, ROW_NUMBER() OVER (ORDER BY v.StreetTreatDefaultVehicle, v.VehicleId DESC) AS `RNum` 
    FROM AAU.Vehicle v
    INNER JOIN AAU.VehicleShift vs ON vs.VehicleId = v.VehicleId AND CONVERT_TZ(NOW(),'+00:00',vTimeZoneOffset) BETWEEN vs.StartDate AND vs.EndDate
    INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId AND vsu.UserId = vUserId
    ) v
    WHERE v.RNum = 1;
    
    
	SELECT vUserId AS UserId, vOrganisationId AS OrganisationId, vUserName AS UserName, vFirstName AS FirstName, vLastName AS LastName,
    vInitials AS Initials, vPermissions AS Permissions, vPreferences AS Preferences, vPassword AS Password, vSocketEndPoint AS SocketEndPoint, vVehicleId AS VehicleId, vVehicleNumber AS VehicleNumber;
    
END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUserPermissionsByUsername !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetUserPermissionsByUsername(IN prm_Username VARCHAR(45))
BEGIN

SELECT PermissionArray FROM AAU.User
WHERE Username = prm_Username;

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUsersByIdRange !!

-- CALL AAU.sp_GetUsersByIdRange('Jim')

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetUsersByIdRange(IN prm_UserName VARCHAR(64))
BEGIN
/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to return a single user from the database. Initially
		 for edit purposes.
         
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Removing StreetTreat team
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
JSON_OBJECT("roleId",UserDetails.RoleId),
JSON_OBJECT("role",UserDetails.RoleName),
JSON_OBJECT("jobTitleId",UserDetails.JobTypeId),
JSON_OBJECT("jobTitle",UserDetails.JobTitle),
JSON_OBJECT("isDeleted",UserDetails.IsDeleted),
JSON_OBJECT("permissionArray",UserDetails.PermissionArray)
))  AS userDetails
FROM (SELECT u.UserId, u.FirstName, u.Surname, u.PermissionArray, u.Initials, u.Colour, u.Telephone,
			u.UserName, u.Password, r.RoleId , r.RoleName,jobTitle.JobTypeId, jobTitle.JobTitle, IF(u.IsDeleted, 'Yes', 'No') 
            AS IsDeleted
		FROM AAU.User u		
		LEFT JOIN AAU.Role r ON r.RoleId = u.RoleId
		LEFT JOIN (SELECT 
					ujt.UserId,
					GROUP_CONCAT(jt.JobTypeId) AS JobTypeId,
					GROUP_CONCAT(jt.Title) AS JobTitle
					FROM AAU.UserJobType ujt
					INNER JOIN AAU.JobType jt ON jt.JobTypeId = ujt.JobTypeId
					WHERE ujt.IsDeleted = 0
                    GROUP BY ujt.UserId
					ORDER BY UserId ASC) jobTitle
	ON jobTitle.UserId = u.UserId
    WHERE u.UserId <> -1
    AND u.OrganisationId = vOrganisationId) UserDetails;
        
-- WHERE UserDetails.UserId BETWEEN prm_userIdStart AND prm_UserIdEnd;


END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUsersByJobTypeId !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetUsersByJobTypeId(IN prm_Username VARCHAR(45), IN prm_JobTypeId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to return user 
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT jt.UserId AS `userId`, u.FirstName AS `firstName`, u.Surname AS `surname`, u.initials AS `initials`, u.Colour AS `Colour`
FROM AAU.UserJobType jt
INNER JOIN AAU.User u ON u.UserId = jt.UserId
WHERE jt.JobTypeId = prm_JobTypeId
AND u.OrganisationId = vOrganisationId
AND u.isDeleted = 0;

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleLocationHistory !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVehicleLocationHistory(IN prm_UserName VARCHAR(45), IN prm_VehicleId INT)
BEGIN

/*

Created By: Jim Mackenzie
Created On: 2021-07-05
Purpose: Used to retrieve location history for a particular vehicle.

*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_UserName LIMIT 1;

WITH LocationHistoryCTE AS
(
SELECT
vl.VehicleId,
	JSON_ARRAYAGG(
		JSON_OBJECT(
		"timestamp", vl.Timestamp,
		"speed", vl.Speed,
		"heading", vl.Heading,
		"accuracy", vl.Accuracy,
		"altitude", vl.Altitude,
		"altitudeAccuracy", vl.AltitudeAccuracy,
		"latLng",
		JSON_MERGE_PRESERVE(
		JSON_OBJECT("lat", vl.Latitude),
		JSON_OBJECT("lng", vl.Longitude))
	)) AS `locationByVehicleId`
FROM AAU.VehicleLocation vl
WHERE vl.`Timestamp` >= CURDATE()
AND OrganisationId = vOrganisationId
AND VehicleId = prm_VehicleId
GROUP BY vl.VehicleId
)

SELECT
JSON_MERGE_PRESERVE(
JSON_OBJECT(
"vehicleDetails",
	JSON_OBJECT(
	"vehicleId", v.VehicleId,
	"vehicleRegistrationNumber", v.VehicleRegistrationNumber,
	"vehicleNumber", v.VehicleNumber,
	"smallAnimalCapacity", v.SmallAnimalCapacity,
	"largeAnimalCapacity", v.LargeAnimalCapacity,
	"vehicleImage", v.VehicleImage,
	"vehicleTypeId", v.VehicleTypeId)),
JSON_OBJECT(
"vehicleLocation",
	JSON_OBJECT("locationHistory", lh.locationByVehicleId))) AS `vehicleLocationHistory`
FROM AAU.Vehicle v
INNER JOIN LocationHistoryCTE lh ON lh.VehicleId = v.VehicleId;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleLocationMessage!!

-- CALL AAU.sp_GetVehicleLocationMessage(1, CURDATE(), 24.1, 73.1, 22, 76.3, 99, 100, 99)

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetVehicleLocationMessage (
													IN prm_VehicleId INT,
													IN prm_Timestamp DATETIME,
													IN prm_Latitude DECIMAL(11,8),
													IN prm_Longitude DECIMAL(11,8),
													IN prm_Speed DOUBLE,
													IN prm_Heading DOUBLE,
													IN prm_Accuracy DOUBLE,
													IN prm_Altitude DOUBLE,
													IN prm_AltitudeAccuracy DOUBLE)
BEGIN

/*

Created By: Jim Mackenzie
Created On: 2021-07-07
Purpose: This procedure is used to create the message content to be sent via Firebase Cloud Messaging to
update the current location and rescuers for a specific vehicle.

*/

WITH rescuersCTE AS
(
SELECT vs.VehicleId,
JSON_ARRAYAGG(
JSON_OBJECT(
"firstName", u.FirstName,
"surname", u.Surname,
"initials", u.Initials,
"colour", u.Colour)) AS `vehicleStaff`
FROM AAU.VehicleShift vs
LEFT JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE vs.VehicleId = prm_VehicleId
	AND NOW() >= vs.StartDate
	AND NOW() <= IFNULL(vs.EndDate, CURDATE())
GROUP BY vs.VehicleId
)

SELECT
JSON_MERGE_PRESERVE(
JSON_OBJECT("vehicleDetails",
JSON_OBJECT(
"vehicleId", v.VehicleId,
"vehicleRegistrationNumber", v.VehicleRegistrationNumber,
"vehicleNumber", v.VehicleNumber,
"smallAnimalCapacity", v.SmallAnimalCapacity,
"largeAnimalCapacity", v.LargeAnimalCapacity,
"vehicleImage", v.VehicleImage,
"vehicleTypeId", v.VehicleTypeId)),
JSON_OBJECT(
    "vehicleLocation",
    JSON_OBJECT(
	"speed", prm_Speed,
	"heading", prm_Heading,
	"accuracy", prm_Accuracy,
	"altitude", prm_Altitude,
	"altitudeAccuracy", prm_AltitudeAccuracy,
	"latLng",    
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("lat", prm_Latitude),
	JSON_OBJECT("lng", prm_Longitude)))),
    JSON_OBJECT("vehicleStaff", r.vehicleStaff)) AS `locationMessage`
FROM AAU.Vehicle v
INNER JOIN rescuersCTE r ON r.VehicleId = v.VehicleId;


END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleLocationHistory!!

DELIMITER $$

-- CALL AAU.sp_GetVehicleLocationHistory('Jim', 1);

CREATE PROCEDURE AAU.sp_GetVehicleLocationHistory(IN prm_UserName VARCHAR(45), IN prm_VehicleId INT)
BEGIN

/*

Created By: Jim Mackenzie
Created On: 2021-07-05
Purpose: Used to retrieve location history for a particular vehicle.

*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

WITH LocationHistoryCTE AS
(
SELECT
vl.VehicleId,
	JSON_ARRAYAGG(
		JSON_OBJECT(
		"timestamp", vl.Timestamp,
		"speed", vl.Speed,
		"heading", vl.Heading,
		"accuracy", vl.Accuracy,
		"altitude", vl.Altitude,
		"altitudeAccuracy", vl.AltitudeAccuracy,
		"latLng",
		JSON_MERGE_PRESERVE(
		JSON_OBJECT("lat", vl.Latitude),
		JSON_OBJECT("lng", vl.Longitude))
	)) AS `locationByVehicleId`
FROM AAU.VehicleLocation vl
WHERE CAST(vl.`Timestamp` AS DATE) = '2021-07-04'
AND OrganisationId = vOrganisationId
AND VehicleId = prm_VehicleId
GROUP BY vl.VehicleId
)

SELECT
JSON_MERGE_PRESERVE(
JSON_OBJECT(
"vehicleDetails",
	JSON_OBJECT(
	"vehicleId", v.VehicleId,
	"vehicleRegistrationNumber", v.VehicleRegistrationNumber,
	"vehicleNumber", v.VehicleNumber,
	"smallAnimalCapacity", v.SmallAnimalCapacity,
	"largeAnimalCapacity", v.LargeAnimalCapacity,
	"vehicleImage", v.VehicleImage,
	"vehicleTypeId", v.VehicleTypeId)),
JSON_OBJECT(
"vehicleLocation",
	JSON_OBJECT("locationHistory", lh.locationByVehicleId))) AS `vehicleLocationHistory`
FROM AAU.Vehicle v
INNER JOIN LocationHistoryCTE lh ON lh.VehicleId = v.VehicleId;


END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicles !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVehicles(IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 19/05/2021
Purpose: To get the list of Vehicle To display them in a table.
*/

DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId
FROM AAU.User u
WHERE u.UserName = prm_Username LIMIT 1;

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE( 
	JSON_OBJECT("vehicleId", vehicleDetails.VehicleId),
	JSON_OBJECT("registrationNumber", vehicleDetails.VehicleRegistrationNumber),
	JSON_OBJECT("vehicleNumber", vehicleDetails.VehicleNumber),
	JSON_OBJECT("vehicleTypeId", vehicleDetails.VehicleTypeId),
	JSON_OBJECT("vehicleType", vehicleDetails.VehicleType),
	JSON_OBJECT("largeAnimalCapacity", vehicleDetails.LargeAnimalCapacity),
	JSON_OBJECT("smallAnimalCapacity", vehicleDetails.SmallAnimalCapacity),
    JSON_OBJECT("minRescuerCapacity", vehicleDetails.MinRescuerCapacity),
	JSON_OBJECT("maxRescuerCapacity", vehicleDetails.MaxRescuerCapacity),
	JSON_OBJECT("vehicleStatusId", vehicleDetails.VehicleStatusId),
	JSON_OBJECT("vehicleStatus", vehicleDetails.VehicleStatus),
    JSON_OBJECT("imageURL", vehicleDetails.VehicleImage),
    JSON_OBJECT("streetTreatDefaultVehicle", vehicleDetails.streetTreatDefaultVehicle),
    JSON_OBJECT("streetTreatVehicle", IFNULL(vehicleDetails.streetTreatVehicle, 0)),
    JSON_OBJECT("vehicleColour", IFNULL(vehicleDetails.vehicleColour,"#000000"))
)) AS vehicleList
FROM
(SELECT vl.VehicleId,
	vl.VehicleRegistrationNumber,
	vl.VehicleNumber,
	vl.VehicleTypeId,
	vt.VehicleType,
	vl.LargeAnimalCapacity,
	vl.SmallAnimalCapacity,
    vl.MinRescuerCapacity,
    vl.MaxRescuerCapacity,
	vl.VehicleStatusId,
	vs.VehicleStatus,
    vl.VehicleImage,
    vl.StreetTreatDefaultVehicle,
    vl.StreetTreatVehicle,
    vl.VehicleColour
FROM AAU.Vehicle vl
INNER JOIN AAU.VehicleType vt ON vt.VehicleTypeId = vl.VehicleTypeId
INNER JOIN AAU.VehicleStatus vs ON vs.VehicleStatusId = vl.VehicleStatusId
WHERE vl.isDeleted = 0
AND vl.OrganisationId = vOrganisationId
) vehicleDetails;

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleShiftDetails !!

DELIMITER $$

-- CALL AAU.sp_GetVehicleShiftDetails('Jim', '2021-07-17');

CREATE PROCEDURE AAU.sp_GetVehicleShiftDetails(IN prm_Username VARCHAR(45), IN prm_ShiftDate DATE ) 
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-07-17
Purpose: Procedure to bring back the details of shifts by vehicle
*/

WITH ShiftCTE AS
(
SELECT
vs.VehicleShiftId,
JSON_OBJECT(
"vehicleId", vs.VehicleId,
"vehicleShiftId", vs.VehicleShiftId,
"shiftStartTime", DATE_FORMAT(vs.StartDate, "%Y-%m-%dT%H:%i:%s"),
"shiftEndTime", DATE_FORMAT(vs.EndDate, "%Y-%m-%dT%H:%i:%s"),
"isDeleted", vs.IsDeleted) AS `shiftDetails`

FROM AAU.VehicleShift vs
WHERE prm_ShiftDate BETWEEN CAST(vs.StartDate AS DATE) AND CAST(IFNULL(vs.EndDate, NOW()) AS DATE)
AND IFNULL(vs.IsDeleted,0) = 0
),
UserCTE AS
(
SELECT	vsu.VehicleShiftId,
		JSON_ARRAYAGG(
		JSON_OBJECT("userId", u.UserId,
		"firstName", u.FirstName,
		"surname", u.Surname,
		"initials", u.Initials,
		"colour", u.Colour)) AS `userDetails`
FROM AAU.VehicleShiftUser vsu
LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE vsu.VehicleShiftId IN (SELECT VehicleShiftId FROM ShiftCTE)
AND IFNULL(vsu.IsDeleted,0) = 0
GROUP BY vsu.VehicleShiftId
)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
s.shiftDetails,
JSON_OBJECT("vehicleStaff", u.userDetails)
)) AS `vehicleShiftDetails`
FROM ShiftCTE s
LEFT JOIN UserCTE u ON u.VehicleShiftId = s.VehicleShiftId;

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleListDropdown!!

-- CALL AAU.p_GetVehiclesListDropdown('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVehicleListDropdown(IN prm_Username VARCHAR(65))
BEGIN

/* 
Created By: Arpit Trivedi
CreatedDate: 07/06/2021
Purpose: To get the list of vehicle for dropdown

Modified By: Jim Mackenzie
Modified On: 2021/07/04
Purpose: Adding current rescuers to the ambulance name
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId
FROM AAU.User
WHERE UserName = prm_Username LIMIT 1;



SELECT
	v.VehicleId AS vehicleId,
	v.VehicleRegistrationNumber AS vehicleRegistrationNumber,
	CONCAT(v.VehicleNumber, IFNULL(vsu.VehicleStaff,' UNK')) AS vehicleNumber
	FROM AAU.Vehicle v
	LEFT JOIN AAU.VehicleShift vs ON vs.VehicleId = v.VehicleId AND
	NOW() >= vs.StartDate AND
	NOW() <= IFNULL(vs.EndDate, NOW()) AND
    v.VehicleStatusId = 1
LEFT JOIN
(
	SELECT VehicleShiftId, CONCAT(" - (",GROUP_CONCAT(IFNULL(u.Initials,"UNK")),")") AS VehicleStaff
	FROM AAU.VehicleShiftUser vsu
	LEFT JOIN AAU.User u ON u.UserId = vsu.UserId
	GROUP BY VehicleShiftId
) vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
WHERE v.OrganisationId = vOrganisationId;

END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVehicleType !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVehicleType(IN prm_Username VARCHAR(45))
BEGIN

/*
CreatedBy: Arpit Trivedi
CreatedDate:17/05/2021
Purpose: To get the list of vehicle type list.
*/

SELECT VehicleTypeId, VehicleType FROM AAU.VehicleType;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetVisits !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVisits (	IN prm_StreetTreatCaseId INT,
									IN prm_AssignedVehicleId INT,
									IN prm_VisitDateStart DATE,
									IN prm_VisitDateEnd DATE)
BEGIN

/*
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Removing StreetTreat team
*/


IF (prm_StreetTreatCaseId IS NOT NULL OR
prm_AssignedVehicleId IS NOT NULL OR
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
		c.AssignedVehicleId = prm_AssignedVehicleId
    OR    
		prm_AssignedVehicleId IS NULL
	OR
		prm_AssignedVehicleId = -1
    );
END IF;
END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertEmergencyCase !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertEmergencyCase(
									IN prm_UserName VARCHAR(64),
                                    IN prm_GUID VARCHAR(128),
                                    IN prm_EmergencyNumber INT,
									IN prm_CallDateTime DATETIME,
									IN prm_DispatcherId INT,
									IN prm_EmergencyCodeId INT,
                                    IN prm_Comments NVARCHAR(650),
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DECIMAL(11,8),
									IN prm_Longitude DECIMAL(11,8),
									IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME,
									IN prm_AssignedAmbulanceId INT,
                                    IN prm_AmbulanceAssignmentTime DATETIME,
                                    IN prm_SelfAdmission BOOLEAN)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/02/2020
Purpose: Used to insert a new emergency case.
*/
DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;
DECLARE vSameAsEmergencyCaseId INT;
DECLARE vEmNoExists INT;
DECLARE vCurrentCaseId INT;
DECLARE DummyEmNo INT;
-- DECLARE vEmergencyNumber INT;
DECLARE vEmergencyCaseId INT;
DECLARE vSocketEndpoint VARCHAR(64);
DECLARE vSuccess INT;
SET vEmNoExists = 0;
SET vOrganisationId = 0;

IF prm_EmergencyNumber = -1 THEN

	SELECT (MIN(EmergencyNumber) - 1) INTO DummyEmNo 
    FROM AAU.EmergencyCase WHERE EmergencyNumber < 0;
    
ELSE 
	SELECT Prm_EmergencyNumber INTO DummyEmNo;

END IF;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1), IFNULL(MAX(UpdateTime), '1901-01-01'), MAX(EmergencyCaseId) INTO 
vEmNoExists, vUpdateTime, vCurrentCaseId
FROM AAU.EmergencyCase
WHERE EmergencyNumber = prm_EmergencyNumber
AND OrganisationId = vOrganisationId;

START TRANSACTION ;

IF vEmNoExists = 0 THEN

-- SELECT MAX(EmergencyCaseId) INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsNumber;

-- LOCK TABLES AAU.EmergencyCase WRITE;

-- SELECT MAX(EmergencyNumber + 1) INTO vEmergencyNumber FROM AAU.EmergencyCase
-- WHERE OrganisationId = vOrganisationId FOR UPDATE;

INSERT INTO AAU.EmergencyCase
(
	OrganisationId,
	EmergencyNumber,
	CallDateTime,
	DispatcherId,
	EmergencyCodeId,
	Location,
	Latitude,
	Longitude,
    AssignedVehicleId,
    AmbulanceAssignmentTime,
	AmbulanceArrivalTime,
	RescueTime,
	AdmissionTime,
    UpdateTime,
    Comments,
    GUID,
	SelfAdmission
)
VALUES
(
	vOrganisationId,
	DummyEmNo,
	prm_CallDateTime,
	prm_DispatcherId,
	prm_EmergencyCodeId,
	prm_Location,
	prm_Latitude,
	prm_Longitude,
	prm_AssignedAmbulanceId,
    prm_AmbulanceAssignmentTime,
	prm_AmbulanceArrivalTime,
	prm_RescueTime,
	prm_AdmissionTime,
    prm_UpdateTime,
    prm_Comments,
    prm_GUID,
    prm_SelfAdmission 

);

-- UNLOCK TABLES;

COMMIT;
	
    SELECT LAST_INSERT_ID(),1 INTO vEmergencyCaseId,vSuccess;
    
	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId,ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId,prm_Username,vEmergencyCaseId,'EmergencyCase','Insert', NOW());
    
ELSEIF vEmNoExists >= 1 THEN

	SELECT 2, vCurrentCaseId INTO vSuccess, vEmergencyCaseId; -- Duplicate
    -- SELECT MAX(EmergencyNumber) INTO vEmergencyNumber FROM AAU.EmergencyCase;
    
ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3, vCurrentCaseId INTO vSuccess, vEmergencyCaseId; -- Already updated

ELSE 
	SELECT 4 INTO vSuccess; -- Other error
    SELECT vCurrentCaseId INTO vEmergencyCaseId;
END IF;


SELECT vSuccess as success, vEmergencyCaseId, prm_EmergencyNumber AS vEmergencyNumber,vSocketEndPoint;  

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientMedia !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatientMedia(
IN prm_Username VARCHAR(64),
IN prm_MediaType VARCHAR(45),
IN prm_URL VARCHAR(1000),
IN prm_IsPrimary BOOLEAN,
IN prm_DateTime VARCHAR(45),
IN prm_PatientId INT,
IN prm_HeightPX INT,
IN prm_WidthPX INT,
IN prm_Tags VARCHAR(1000)
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/07/2020
Purpose: Used to insert a new media item for a patient.


Modified By: Ankit
Created On:02/05/2021
Purpose: Removed comment column

*/

DECLARE vMediaItemExists INT DEFAULT 0;
DECLARE vMediaItemItemId INT;
DECLARE vOrganisationId INT;
DECLARE vSuccess INT;

SELECT COUNT(1) INTO vMediaItemExists FROM AAU.PatientMediaItem WHERE URL = prm_URL;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vMediaItemExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.PatientMediaItem
		(
        OrganisationId,
        PatientId,
        DateTime,
        URL,
        IsPrimary,
        HeightPX,
        WidthPX,
        Tags,
        MediaType   
		)
		VALUES
		(
        vOrganisationId,
        prm_PatientId,
        STR_TO_DATE(LEFT(prm_DateTime,19), '%Y-%m-%dT%H:%i:%s'),        
        prm_URL,
        prm_IsPrimary, 
        prm_HeightPX,
		prm_WidthPX,
		prm_Tags,
		prm_MediaType
		);
        
COMMIT;

	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID() INTO vMediaItemItemId;	

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, vMediaItemItemId,'Media Item','Insert', NOW());

ELSEIF vMediaItemExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vSuccess AS `success`, vMediaItemItemId AS `mediaItemId`;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatient !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatient(
IN prm_Username VARCHAR(128),
IN prm_EmergencyCaseId INT,
IN prm_GUID VARCHAR(128),
IN prm_AnimalTypeId INT,
IN prm_TagNumber VARCHAR(45),
IN prm_PatientCallOutcomeId  INT,
IN prm_SameAsEmergencyNumber INT,
IN prm_TreatmentPriority INT,
IN prm_PatientStatusId INT,
IN prm_PatientStatusDate DATETIME
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;
DECLARE vPatientId INT;
DECLARE vTagExists INT;
DECLARE vSuccess INT;
DECLARE vTagNumber VARCHAR(20);
DECLARE vSameAsEmergencyCaseId INT;

SET vPatientExists = 0;
SET vTagExists = 0;
SET vTagNumber = NULL;
SET vSameAsEmergencyCaseId = NULL;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE EmergencyCaseId = prm_EmergencyCaseId AND GUID = prm_GUID AND IsDeleted = 0;

SELECT COUNT(1) INTO vTagExists FROM AAU.Patient WHERE TagNumber = prm_TagNumber AND OrganisationId = vOrganisationId;

SELECT EmergencyCaseId INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsEmergencyNumber AND OrganisationId = vOrganisationId;

IF vPatientExists = 0 AND vTagExists = 0 THEN

	INSERT INTO AAU.Patient
		(
			OrganisationId,
			EmergencyCaseId,
			GUID,
			AnimalTypeId,
			TagNumber,
            PatientCallOutcomeId,
            SameAsEmergencyCaseId,
            TreatmentPriority,
			PatientStatusId,
            PatientStatusDate
		)
		VALUES
		(
			vOrganisationId,
			prm_EmergencyCaseId,
			prm_GUID,
			prm_AnimalTypeId,
			UPPER(prm_TagNumber),
            prm_PatientCallOutcomeId,
            vSameAsEmergencyCaseId,
            prm_TreatmentPriority,
			prm_PatientStatusId,
            prm_PatientStatusDate 
		);

	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID(),prm_TagNumber INTO vPatientId,vTagNumber;

/*
    IF IFNULL(prm_TagNumber,'') <> '' THEN
		UPDATE AAU.Census SET PatientId = vPatientId WHERE TagNumber = vTagNumber;
    END IF;
*/


	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vPatientId,'Patient','Insert', NOW());

ELSEIF vPatientExists > 0 THEN

	SELECT 2 INTO vSuccess;

ELSEIF vTagExists > 0 THEN

	SELECT 3 INTO vSuccess;

ELSE

	SELECT 4 INTO vSuccess;
END IF;

SELECT vPatientId AS patientId, vSuccess AS success , vTagNumber;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertReleaseDetails !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertReleaseDetails(IN prm_UserName NVARCHAR(45),
												IN prm_PatientId INT,
												IN prm_ComplainerNotes NVARCHAR(450),
												IN prm_ComplainerInformed TINYINT,
												IN prm_Releaser1Id INT,
												IN prm_Releaser2Id INT,
												IN prm_IsStreetTreatRelease TINYINT,
												IN prm_RequestedUser NVARCHAR(45),
												IN prm_RequestedDate DATETIME,
                                                IN prm_AssignedVehicleId INT,
                                                IN prm_AmbulanceAssignmentTime DATETIME
											)
BEGIN

/*
Created By: Arpit Trivedi
Created On: 21/11/20
Purpose: Used to insert a release of a patient.
*/

DECLARE vSuccess INT;
DECLARE vReleaseCount INT;
DECLARE vReleaseId INT;
DECLARE vOrganisationId INT;
DECLARE vUserId INT;
DECLARE vSocketEndPoint CHAR(3);
DECLARE vEmergencyCaseId INT;

SET vReleaseCount = 0;
SET vOrganisationId = 1;
SET vReleaseId = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vReleaseCount FROM AAU.ReleaseDetails WHERE PatientId = prm_PatientId;

SELECT o.OrganisationId, u.UserId, o.SocketEndPoint INTO vOrganisationId, vUserId, vSocketEndPoint
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_RequestedUser LIMIT 1;

IF vReleaseCount = 0 THEN

INSERT INTO AAU.ReleaseDetails (OrganisationId,
								PatientId,
                                RequestedUser,
                                RequestedDate,
                                ComplainerNotes,
                                ComplainerInformed,
                                Releaser1Id,
                                Releaser2Id,
                                AssignedVehicleId,
								IsStreetTreatRelease,
                                AmbulanceAssignmentTime)
								VALUES
                                (vOrganisationId,
                                prm_PatientId,
                                vUserId,
                                prm_RequestedDate,
                                prm_ComplainerNotes,
                                IF(prm_ComplainerInformed,1,0),
                                prm_Releaser1Id,
                                prm_Releaser2Id,
                                prm_AssignedVehicleId,
								prm_IsStreetTreatRelease,
                                prm_AmbulanceAssignmentTime
                                );

SELECT LAST_INSERT_ID() INTO vReleaseId;
SELECT 1 INTO vSuccess;

INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_UserName,vReleaseId,'Release','Insert', NOW());

ELSEIF vReleaseCount > 0 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;

SELECT EmergencyCaseId INTO vEmergencyCaseId FROM AAU.Patient WHERE PatientId = prm_PatientId;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(vEmergencyCaseId, prm_PatientId, 'Release');

SELECT vReleaseId, vSuccess AS success, vSocketEndPoint AS socketEndPoint;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertStreetTreatCase !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertStreetTreatCase (
									IN prm_EmergencyNumber INT,
                                    IN prm_TagNumber VARCHAR(64),
									IN prm_AnimalTypeId INT,
									IN prm_PriorityId INT,
									IN prm_StatusId INT,
									IN prm_AssignedVehicleId INT,
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

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

DECLARE vEmNoExists INT;
DECLARE vPatientId INT;
SET vEmNoExists = 0;

SELECT COUNT(1) INTO vEmNoExists
FROM AAU.StreetTreatCase stc
INNER JOIN AAU.Patient p ON p.PatientId = stc.PatientId
WHERE TagNumber = prm_TagNumber;

SELECT PatientId INTO vPatientId FROM AAU.Patient WHERE TagNumber = prm_tagNumber;

IF vEmNoExists = 0 THEN

INSERT INTO AAU.StreetTreatCase
						(
                        PatientId,
						PriorityId,
						StatusId,
						AssignedVehicleId,
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
						prm_AssignedVehicleId,
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
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertUser !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertUser (IN prm_User VARCHAR(45),
									IN prm_FirstName NVARCHAR(64),
									IN prm_Surname NVARCHAR(64),
									IN prm_Initials NVARCHAR(64),
									IN prm_Colour NVARCHAR(64),
									IN prm_Telephone NVARCHAR(64),								
									IN prm_UserName NVARCHAR(64),
									IN prm_Password NVARCHAR(255),
									IN prm_RoleId INTEGER,
									IN prm_PermissionArray JSON
									)
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: To insert a new user

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Removing StreetTreat team

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
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertVehicleListItem !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertVehicle !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertVehicle(
												IN prm_Username VARCHAR(65),
												IN prm_VehicleRegistrationNumber VARCHAR(100),
												IN prm_VehicleNumber VARCHAR(100),
												IN prm_VehicleTypeId INT,
												IN prm_LargeAnimalCapacity INT,
												IN prm_SmallAnimalCapacity INT,
                                                IN prm_MinRescuerCapacity INT,
												IN prm_MaxRescuerCapacity INT,
												IN prm_VehicleStatusId INT,
                                                IN prm_StreetTreatVehicle INT,
                                                IN prm_StreetTreatDefaultVehicle INT,
                                                IN prm_VehicleColour VARCHAR(64),
                                                IN prm_VehicleImage VARCHAR(650)
                                            )
BEGIN

/*
CreatedBy: Arpit Trivedi
CreatedDate: 18/05/2021
Purpose: To insert the vehicle record
*/

DECLARE	vVehicleCount INT;
DECLARE vSuccess INT;
DECLARE vVehicleId INT;
DECLARE vOrganisationId INT;

SELECT COUNT(1) INTO vVehicleCount
FROM AAU.Vehicle
WHERE VehicleNumber = prm_VehicleNumber 
AND VehicleRegistrationNumber = prm_VehicleRegistrationNumber;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username;

IF vVehicleCount = 0 THEN

	IF prm_StreetTreatDefaultVehicle = 1 THEN
    
    UPDATE AAU.Vehicle SET prm_StreetTreatDefaultVehicle = 0 WHERE OrganisationId = vOrganisationId;
    
    END IF;
	
    INSERT INTO AAU.Vehicle (
		VehicleRegistrationNumber,
		VehicleNumber,
		VehicleTypeId,
		LargeAnimalCapacity,
		SmallAnimalCapacity,
        MinRescuerCapacity,
        MaxRescuerCapacity,
		VehicleStatusId,
        StreetTreatVehicle,
        StreetTreatDefaultVehicle,
        VehicleColour,
		OrganisationId,
        VehicleImage
	)
	VALUES(
		prm_VehicleRegistrationNumber,
        prm_VehicleNumber,
        prm_VehicleTypeId,
        prm_LargeAnimalCapacity,
        prm_SmallAnimalCapacity,
        prm_MinRescuerCapacity,
        prm_MaxRescuerCapacity,
        prm_VehicleStatusId,
        prm_StreetTreatVehicle,
        prm_StreetTreatDefaultVehicle,
        prm_VehicleColour,
		vOrganisationId,
        prm_VehicleImage
	);
    
	SELECT LAST_INSERT_ID(), 1 INTO vVehicleId, vSuccess;
    
ELSEIF vVehicleCount > 0 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;

END IF; 

SELECT vVehicleId AS vehicleId, vSuccess AS success;
	
END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertVehicleLocation !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertVehicleLocation (
IN prm_Username VARCHAR(45),
IN prm_Timestamp DATETIME,
IN prm_Latitude DECIMAL(11,8),
IN prm_Longitude DECIMAL(11,8),
IN prm_Speed DOUBLE,
IN prm_Heading DOUBLE,
IN prm_Accuracy DOUBLE,
IN prm_Altitude DOUBLE,
IN prm_AltitudeAccuracy DOUBLE
)

BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-06-04
Purpose: This procedure is used to insert the location, heading, speed and altitude of vehicles
*/

DECLARE vUnique INT;
DECLARE vUserId INT;
DECLARE vVehicleId INT;
DECLARE vOrganisationId INT;
DECLARE vSuccess INT;
DECLARE prm_SocketEndPoint VARCHAR(20);

SET vUnique = 0;
SET vUserId = 0;
SET vVehicleId = 0;
SET vSuccess = 0;

SELECT o.OrganisationId, o.SocketEndPoint, u.UserId INTO vOrganisationId, prm_SocketEndPoint, vUserId
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT vs.VehicleId INTO vVehicleId
FROM AAU.VehicleShift vs
INNER JOIN VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId AND vsu.UserId = vUserId AND NOW() >= vs.StartDate AND NOW() <= vs.EndDate
LIMIT 1;

SELECT COUNT(1) INTO vUnique FROM AAU.VehicleLocation WHERE OrganisationId = vOrganisationId AND VehicleId = vVehicleId AND Timestamp = prm_Timestamp;

IF vUnique = 0 AND vVehicleId <> 0 THEN

INSERT INTO AAU.VehicleLocation
(
`OrganisationId`,
`VehicleId`,
`Timestamp`,
`Latitude`,
`Longitude`,
`Speed`,
`Heading`,
`Accuracy`,
`Altitude`,
`AltitudeAccuracy`
)
VALUES
(
vOrganisationId,
vVehicleId,
prm_Timestamp,
prm_Latitude,
prm_Longitude,
prm_Speed,
prm_Heading,
prm_Accuracy,
prm_Altitude,
prm_AltitudeAccuracy);

SELECT 1 INTO vSuccess;

END IF;

CALL AAU.sp_GetVehicleLocationMessage(
										vVehicleId,
										prm_Timestamp,
										prm_Latitude,
										prm_Longitude,
										prm_Speed,
										prm_Heading,
										prm_Accuracy,
										prm_Altitude,
										prm_AltitudeAccuracy);

SELECT vSuccess AS `success`, prm_SocketEndPoint AS `socketEndPoint`;

END $$









DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertVehicleShift!!

DELIMITER $$

-- CALL AAU.sp_InsertVehicleShift('Jim', '2021-07-17');

CREATE PROCEDURE AAU.sp_InsertVehicleShift(IN prm_Username VARCHAR(45), IN prm_VehicleShiftId INT, IN prm_VehicleId INT, IN prm_StartDate DATETIME, IN prm_EndDate DATETIME ) 
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-07-17
Purpose: Procedure to insert a new shift for a vehicle
*/

DECLARE vOrganisationId INT;
DECLARE vVehicleShiftIdCount INT;
DECLARE vSuccess INT;

SET vSuccess = 0;
SET vVehicleShiftIdCount = 0;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE u.UserName = prm_Username;

SELECT COUNT(1) INTO vVehicleShiftIdCount FROM AAU.VehicleShift WHERE VehicleShiftId = prm_VehicleShiftId;

IF vVehicleShiftIdCount = 0 THEN

INSERT INTO AAU.VehicleShift (
		OrganisationId,
		VehicleId,
		StartDate,
		EndDate
	)
	VALUES (
		vOrganisationId,
		prm_VehicleId,
		prm_StartDate,
		prm_EndDate
	);
    
    SELECT LAST_INSERT_ID() INTO prm_VehicleShiftId;
    SELECT 1 INTO vSuccess;
    
ELSE
    SELECT 0 INTO vSuccess;
END IF;
    
SELECT prm_VehicleShiftId AS vehicleShiftId, vSuccess AS 'success';

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_MigrateMissedVisits !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_MigrateMissedVisits ()
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/04/2020
Purpose: Used to update all missed cases to tomorrow.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing Case with StreetTreatCase table
*/

DECLARE vSuccess INT;

SET vSuccess = 0;

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
		
FROM AAU.StreetTreatCase c
INNER JOIN Visit v1 ON v1.StreetTreatCaseId = c.StreetTreatCaseId
LEFT JOIN
(
SELECT StreetTreatCaseId, MAX(Date) MaxVisitDate
FROM AAU.Visit
WHERE Date <= DATE_ADD( CURRENT_DATE(), INTERVAL 1 DAY)
AND IsDeleted = 0
AND StatusId = 1
GROUP BY StreetTreatCaseId
) v2 ON v1.StreetTreatCaseId = v2.StreetTreatCaseId
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
UPDATE AAU.StreetTreatCase c
INNER JOIN Visit v1 ON v1.StreetTreatCaseId = c.StreetTreatCaseId
LEFT JOIN
(
SELECT StreetTreatCaseId, MAX(Date) MaxVisitDate
FROM AAU.Visit
WHERE Date <= DATE_ADD( CURRENT_DATE(), INTERVAL 1 DAY)
AND IsDeleted = 0
AND StatusId = 1
GROUP BY StreetTreatCaseId
) v2 ON v1.StreetTreatCaseId = v2.StreetTreatCaseId
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

SELECT 1 INTO vSuccess;

SELECT vSuccess;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_MoveMissedVisits !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_MoveMissedVisits ()
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/04/2020
Purpose: Used to update all missed cases to tomorrow

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing Case with StreetTreatCase table
*/


UPDATE AAU.Visit v
INNER JOIN AAU.StreetTreatCase c ON c.StreetTreatCaseId = v.StreetTreatCaseId
SET v.Date = DATE_ADD( CURRENT_DATE(), INTERVAL 1 DAY)
WHERE c.StatusId = 1
AND v.StatusId = 1
AND Date < CURRENT_DATE();


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateCaseById !!

DELIMITER $$
CREATE PROCEDURE  AAU.sp_UpdateCaseById (
									IN prm_CaseId INT,
									IN prm_EmergencyNumber INT,
                                    IN prm_TagNumber VARCHAR(64),
									IN prm_AnimalTypeId INT,
									IN prm_PriorityId INT,
									IN prm_StatusId INT,
									IN prm_AssignedVehicleId INT,
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

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing Team with Assigned Vehicle
*/

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT prm_caseId INTO prm_OutCaseId;

SELECT COUNT(1) INTO vEmNoExists 
FROM AAU.StreetTreatCase c
INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
WHERE c.StreetTreatCaseId <> prm_CaseId AND p.TagNumber = prm_TagNumber;

IF vEmNoExists = 0 THEN

	UPDATE AAU.StreetTreatCase SET						
						PriorityId			= prm_PriorityId,
						StatusId			= prm_StatusId,
						AssignedVehicleId	= prm_AssignedVehicleId,
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
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateEmergencyCase !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateEmergencyCase(
									IN prm_EmergencyCaseId INT,
									IN prm_EmergencyNumber INT,
									IN prm_CallDateTime DATETIME,
									IN prm_DispatcherId INT,
									IN prm_EmergencyCodeId INT,
									-- IN prm_CallOutcomeId INT,
                                    -- IN prm_SameAsNumber INT,
                                    IN prm_Comments NVARCHAR(650),
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DOUBLE(11,8),
									IN prm_Longitude DECIMAL(11,8),
									-- IN prm_Rescuer1Id INT,
									-- IN prm_Rescuer2Id INT,
									IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME,
									IN prm_IsDeleted BOOLEAN,
                                    IN prm_DeletedDate DATETIME,
									IN prm_UserName VARCHAR(64),
                                    IN prm_AssignedAmbulanceId INT,
                                    IN prm_AmbulanceAssignmentTime DATETIME,
                                    IN prm_SelfAdmission BOOLEAN,
									OUT prm_OutEmergencyCaseId INT,
                                    OUT prm_SocketEndPoint CHAR(3),
									OUT prm_Success VARCHAR(64))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to update a case.
*/

DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;
DECLARE vSameAsEmergencyCaseId INT;

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT prm_EmergencyCaseId INTO prm_OutEmergencyCaseId;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.EmergencyCase WHERE EmergencyCaseId <> prm_EmergencyCaseId AND EmergencyNumber = prm_EmergencyNumber;

SELECT IFNULL(MAX(UpdateTime), '1901-01-01') INTO vUpdateTime FROM AAU.EmergencyCase WHERE EmergencyCaseId = prm_EmergencyCaseId;

-- SELECT MAX(EmergencyCaseId) INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsNumber;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, prm_SocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists = 0 AND prm_UpdateTime >= vUpdateTime THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET
						EmergencyNumber        = prm_EmergencyNumber,
						CallDateTime           = prm_CallDateTime,
						DispatcherId           = prm_DispatcherId,
						EmergencyCodeId        = prm_EmergencyCodeId,
						-- CallOutcomeId          = prm_CallOutcomeId,
                        -- SameAsEmergencyCaseId  = vSameAsEmergencyCaseId,
						Location               = prm_Location,
						Latitude               = prm_Latitude,
						Longitude              = prm_Longitude,
						-- Rescuer1Id             = prm_Rescuer1Id,
						-- Rescuer2Id             = prm_Rescuer2Id,
						AmbulanceArrivalTime   = prm_AmbulanceArrivalTime,
						RescueTime             = prm_RescueTime,
						AdmissionTime          = prm_AdmissionTime,
						IsDeleted			   = prm_IsDeleted,
                        DeletedDate			   = prm_DeletedDate,
                        UpdateTime			   = prm_UpdateTime,
                        Comments			   = prm_Comments,
                        AssignedVehicleId    = prm_AssignedAmbulanceId,
                        AmbulanceAssignmentTime = prm_AmbulanceAssignmentTime,
						selfAdmission           = prm_SelfAdmission
			WHERE EmergencyCaseId = prm_EmergencyCaseId
            AND OrganisationId = vOrganisationId;

COMMIT;

    SELECT 1 INTO prm_Success;

    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_EmergencyCaseId,'EmergencyCase','Update', NOW());  
	

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3 INTO prm_Success; -- Already updated

ELSEIF prm_UpdateTime > vUpdateTime THEN
	SELECT 4 INTO prm_Success; -- Emergency record already updated another time.
    
ELSE
	SELECT 5 INTO prm_Success; -- Other error   
END IF;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, NULL);

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateEmergencyCase !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateEmergencyCase(
									IN prm_EmergencyCaseId INT,
									IN prm_EmergencyNumber INT,
									IN prm_CallDateTime DATETIME,
									IN prm_DispatcherId INT,
									IN prm_EmergencyCodeId INT,
									-- IN prm_CallOutcomeId INT,
                                    -- IN prm_SameAsNumber INT,
                                    IN prm_Comments NVARCHAR(650),
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DOUBLE(11,8),
									IN prm_Longitude DECIMAL(11,8),
									-- IN prm_Rescuer1Id INT,
									-- IN prm_Rescuer2Id INT,
									IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME,
									IN prm_IsDeleted BOOLEAN,
                                    IN prm_DeletedDate DATETIME,
									IN prm_UserName VARCHAR(64),
                                    IN prm_AssignedAmbulanceId INT,
                                    IN prm_AmbulanceAssignmentTime DATETIME,
                                    IN prm_SelfAdmission BOOLEAN,
									OUT prm_OutEmergencyCaseId INT,
                                    OUT prm_SocketEndPoint CHAR(3),
									OUT prm_Success VARCHAR(64))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to update a case.
*/

DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;
DECLARE vSameAsEmergencyCaseId INT;

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT prm_EmergencyCaseId INTO prm_OutEmergencyCaseId;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.EmergencyCase WHERE EmergencyCaseId <> prm_EmergencyCaseId AND EmergencyNumber = prm_EmergencyNumber;

SELECT IFNULL(MAX(UpdateTime), '1901-01-01') INTO vUpdateTime FROM AAU.EmergencyCase WHERE EmergencyCaseId = prm_EmergencyCaseId;

-- SELECT MAX(EmergencyCaseId) INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsNumber;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, prm_SocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists = 0 AND prm_UpdateTime >= vUpdateTime THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET
						EmergencyNumber        = prm_EmergencyNumber,
						CallDateTime           = prm_CallDateTime,
						DispatcherId           = prm_DispatcherId,
						EmergencyCodeId        = prm_EmergencyCodeId,
						-- CallOutcomeId          = prm_CallOutcomeId,
                        -- SameAsEmergencyCaseId  = vSameAsEmergencyCaseId,
						Location               = prm_Location,
						Latitude               = prm_Latitude,
						Longitude              = prm_Longitude,
						-- Rescuer1Id             = prm_Rescuer1Id,
						-- Rescuer2Id             = prm_Rescuer2Id,
						AmbulanceArrivalTime   = prm_AmbulanceArrivalTime,
						RescueTime             = prm_RescueTime,
						AdmissionTime          = prm_AdmissionTime,
						IsDeleted			   = prm_IsDeleted,
                        DeletedDate			   = prm_DeletedDate,
                        UpdateTime			   = prm_UpdateTime,
                        Comments			   = prm_Comments,
                        AssignedVehicleId    = prm_AssignedAmbulanceId,
                        AmbulanceAssignmentTime = prm_AmbulanceAssignmentTime,
						selfAdmission           = prm_SelfAdmission
			WHERE EmergencyCaseId = prm_EmergencyCaseId;

COMMIT;

    SELECT 1 INTO prm_Success;

    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_EmergencyCaseId,'EmergencyCase','Update', NOW());  
	

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3 INTO prm_Success; -- Already updated

ELSEIF prm_UpdateTime > vUpdateTime THEN
	SELECT 4 INTO prm_Success; -- Emergency record already updated another time.
    
ELSE
	SELECT 5 INTO prm_Success; -- Other error   
END IF;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, NULL, "Rescue");

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateOperatorNotesByCaseId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateOperatorNotesByCaseId(
									IN prm_StreetTreatCaseId INT,
									IN prm_OperatorNotes TEXT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to update a operator notes for a case
*/

DECLARE vEmNoExists INT;
DECLARE vSuccess INT;
SET vEmNoExists = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.StreetTreatCase WHERE CaseId = prm_CaseId;

IF vEmNoExists = 1 THEN

	UPDATE AAU.StreetTreatCase SET OperatorNotes		= prm_OperatorNotes
			WHERE CaseId = StreetTreatCase;
            
            
    SELECT 1 INTO vSuccess;

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vSuccess;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientMedia !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdatePatientMedia(
IN prm_Username VARCHAR(45),
IN prm_PatientMediaItemId INT,
IN prm_MediaType VARCHAR(45),
IN prm_isPrimary BOOLEAN,
IN prm_DateTime VARCHAR(45),
IN prm_HeightPX INT,
IN prm_WidthPX INT,
IN prm_Tags VARCHAR(1000),
IN prm_Deleted BOOLEAN)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to update an existing PatientMediaItem record.


Modified By: Ankit Singh
Modified On: 04/05/2021
Purpose: removed comment column
*/

DECLARE vPatientMediaItemExists INT;
DECLARE vOrganisationId INT;
DECLARE vPatientId INT;
DECLARE vSuccess INT;

SET vPatientMediaItemExists = 0;
SET vOrganisationId = 0;
SET vPatientId = 0;
SET vSuccess = 0;

SELECT COUNT(1), MAX(OrganisationId), MAX(PatientId) INTO vPatientMediaItemExists, vOrganisationId, vPatientId FROM AAU.PatientMediaItem WHERE PatientMediaItemId = prm_PatientMediaItemId;

IF vPatientMediaItemExists = 1 THEN

START TRANSACTION;

		-- Unset the current primary image if the new one is primary
		IF prm_IsPrimary = 1 THEN
			UPDATE AAU.PatientMediaItem SET IsPrimary = 0 WHERE PatientId = vPatientId AND IsPrimary = 1;
		END IF;

		UPDATE AAU.PatientMediaItem
			SET 
			DateTime  = DATE_FORMAT(prm_DateTime,'%Y-%m-%dT%H:%i:%s'),
			IsPrimary = prm_IsPrimary,
			HeightPX  = prm_HeightPX,
			WidthPX   = prm_WidthPX,
			Tags      = prm_Tags,
			MediaType = prm_MediaType,
			IsDeleted = prm_Deleted,
			DeletedDateTime = IF(prm_Deleted = 1, CURRENT_TIMESTAMP(), NULL)
		WHERE PatientMediaItemId = prm_PatientMediaItemId;
        
COMMIT;



	SELECT 1 INTO vSuccess; 

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientMediaItemId, 'PatientMediaItem', 'Update', NOW());

ELSEIF vPatientMediaItemExists = 0 THEN

	SELECT 2 INTO vSuccess;
    
ELSEIF vPatientMediaItemExists > 1 THEN

	SELECT 3 INTO vSuccess;
    
ELSE

	SELECT 4 INTO vSuccess;
END IF;
-- STR_TO_DATE(LEFT(prm_DateTime,19), '%Y-%m-%dT%H:%i:%s'),

SELECT vSuccess AS `success`, prm_PatientMediaItemId AS `mediaItemId`;

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatient !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatient(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
									IN prm_EmergencyCaseId INT,
									IN prm_GUID VARCHAR(128),
									IN prm_AnimalTypeId INT,
                                    IN prm_IsDeleted INT,
                                    IN prm_TagNumber VARCHAR(45),
                                    IN prm_PatientCallOutcomeId INT,
                                    IN prm_SameAsEmergencyNumber INT,
									IN prm_PatientStatusDate DATETIME
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;
DECLARE vPatientId INT;
DECLARE vTagNumber VARCHAR(45);
DECLARE vExistingTagNumber VARCHAR(45);
DECLARE vSameAsEmergencyCaseId INT;
DECLARE vSuccess INT;

SET vTagNumber = NULL;
SET vSameAsEmergencyCaseId = NULL;

SELECT COUNT(1) INTO vPatientExists
FROM AAU.Patient WHERE PatientId <> prm_PatientId
AND EmergencyCaseId = prm_EmergencyCaseId
AND GUID = prm_GUID AND IsDeleted = 0;

SELECT TagNumber INTO vExistingTagNumber FROM AAU.Patient WHERE PatientId = prm_PatientId;

SELECT EmergencyCaseId INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsEmergencyNumber;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 THEN

	UPDATE AAU.Patient SET
			GUID		= prm_GUID,
			AnimalTypeId	= prm_AnimalTypeId,
			TagNumber		= IF(prm_IsDeleted = 1, NULL, UPPER(prm_TagNumber)),
            PatientCallOutcomeId = prm_PatientCallOutcomeId,
            SameAsEmergencyCaseId = vSameAsEmergencyCaseId,
            IsDeleted		= prm_IsDeleted,
            PatientStatusDate = prm_PatientStatusDate,
            DeletedDate		= CASE
								WHEN prm_IsDeleted = FALSE THEN NULL
                                WHEN prm_IsDeleted = TRUE AND DeletedDate IS NULL THEN NOW()
							  END
	WHERE PatientId = prm_PatientId;

    -- Now update the Census in case there were records entered there early.
    IF IFNULL(prm_TagNumber, '') <> '' AND vExistingTagNumber <> prm_TagNumber THEN
		UPDATE AAU.Census SET TagNumber = prm_TagNumber WHERE PatientId = prm_PatientId;
    END IF;

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientId,'Patient','Update', NOW());

    SELECT 1,prm_TagNumber,prm_PatientId INTO vSuccess,vTagNumber,vPatientId;

ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vPatientId AS patientId, vTagNumber, vSuccess AS success;

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateReleaseDetails !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateReleaseDetails (IN prm_Username VARCHAR(45),
											IN prm_ReleaseId INT,
											IN prm_EmergencyCaseId INT,
											IN prm_AssignedAmbulanceId INT,
											IN prm_AmbulanceAssignmentTime DATETIME,
											IN prm_Pickupdate DATETIME,
											IN prm_BeginDate DATETIME,
											IN prm_EndDate DATETIME)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 21/11/20
Purpose: Used to update a release of a patient.
*/

DECLARE vUpdateSuccess INT;
DECLARE vReleaseCount INT;
DECLARE vPatientId INT;
DECLARE vSocketEndPoint CHAR(3);

SELECT SocketEndPoint INTO vSocketEndPoint
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1), MAX(PatientId) INTO vReleaseCount, vPatientId FROM AAU.ReleaseDetails WHERE ReleaseDetailsId = prm_ReleaseId;

IF vReleaseCount = 1 THEN

UPDATE AAU.ReleaseDetails
				SET -- Releaser1Id = prm_Releaser1Id,
                    -- Releaser2Id = prm_Releaser2Id,
                    AssignedVehicleId = prm_AssignedAmbulanceId,
                    AmbulanceAssignmentTime = prm_AmbulanceAssignmentTime,
                    Pickupdate = prm_PickupDate,
                    BeginDate = prm_BeginDate,
                    EndDate = prm_EndDate
WHERE ReleaseDetailsId = prm_ReleaseId;

SELECT 1 INTO vUpdateSuccess;

ELSEIF vReleaseCount = 0 THEN

SELECT 2 INTO vUpdateSuccess; -- Release Doesn't exist

ELSEIF vReleaseCount > 1 THEN

SELECT 3 INTO vUpdateSuccess; -- Multiple records, we have duplicates

END IF;

SELECT vUpdateSuccess AS updateSuccess, vSocketEndPoint AS socketEndPoint;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, vPatientId, 'Release');

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateReleaseRequest !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateReleaseRequest(IN prm_UserName VARCHAR(45),
											IN prm_EmergencyCaseId INT,
											IN prm_ReleaseId INT,
											IN prm_ComplainerNotes NVARCHAR(450),
											IN prm_ComplainerInformed TINYINT,
											IN prm_Releaser1Id INT,
											IN prm_Releaser2Id INT,
											IN prm_IsStreetTreatRelease TINYINT,
											IN prm_RequestedUser NVARCHAR(45),
											IN prm_RequestedDate DATE,
                                            IN prm_AssignedVehicleId INT,
                                            IN prm_AmbulanceAssignmentTime DATETIME
											)
BEGIN

/*
Created By: Arpit Trivedi
Created On: 21/11/20
Purpose: Used to update a release of a patient.
*/

DECLARE vUpdateSuccess INT;
DECLARE vReleaseCount INT;
DECLARE vPatientId INT;
DECLARE vUserId INT;
DECLARE vSocketEndPoint CHAR(3);

SELECT COUNT(1), MAX(PatientId) INTO vReleaseCount, vPatientId FROM AAU.ReleaseDetails WHERE ReleaseDetailsId = prm_ReleaseId;

SELECT u.UserId, o.SocketEndPoint INTO vUserId, vSocketEndPoint
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_RequestedUser LIMIT 1;

IF vReleaseCount = 1 THEN

UPDATE AAU.ReleaseDetails
				SET	ComplainerNotes = prm_ComplainerNotes,
                    ComplainerInformed = IF(prm_ComplainerInformed,1,0),
                    Releaser1Id = prm_Releaser1Id,
                    Releaser2Id = prm_Releaser2Id,
                    RequestedUser = vUserId,
                    RequestedDate = prm_RequestedDate,
                    AssignedVehicleId = prm_AssignedVehicleId,
                    AmbulanceAssignmentTime = prm_AmbulanceAssignmentTime,
					IsStreetTreatRelease = prm_IsStreetTreatRelease
WHERE ReleaseDetailsId = prm_ReleaseId;

SELECT 1 INTO vUpdateSuccess;

INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_UserName,prm_ReleaseId,'Release','Update', NOW());

ELSEIF vReleaseCount = 0 THEN

SELECT 2 INTO vUpdateSuccess; -- Release Doesn't exist

ELSEIF vReleaseCount > 1 THEN

SELECT 3 INTO vUpdateSuccess; -- Multiple records, we have duplicates

END IF;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, vPatientId, 'Release');

SELECT vUpdateSuccess AS success, vSocketEndPoint AS socketEndPoint;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateRescueDetails !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateRescueDetails(
									IN prm_UserName VARCHAR(64),
									IN prm_EmergencyCaseId INT,
                                    IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME,
                                    IN prm_EmergencyCodeId INT,
                                    IN prm_AmbulanceAssignmentTime DATETIME,
                                    IN prm_AssignedAmbulanceId INT,
                                    IN prm_lat DECIMAL(11,8),
                                    IN prm_lng DECIMAL(11,8))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to update the status of a patient.
*/

DECLARE vUpdateTime DATETIME;
DECLARE vOrganisationId INT;
DECLARE vSuccess INT;
DECLARE vSocketEndPoint VARCHAR(3);

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT COUNT(1), IFNULL(MAX(UpdateTime), '1901-01-01') INTO vEmNoExists, vUpdateTime
FROM AAU.EmergencyCase 
WHERE EmergencyCaseId = prm_EmergencyCaseId;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists = 1 AND prm_UpdateTime >= vUpdateTime THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET						
						AmbulanceArrivalTime   = prm_AmbulanceArrivalTime,
						RescueTime             = prm_RescueTime,
						AdmissionTime          = prm_AdmissionTime,						
                        UpdateTime			   = prm_UpdateTime,
                        EmergencyCodeId        = prm_EmergencyCodeId,
                        Latitude               = prm_lat,
						Longitude              = prm_lng,
                        AssignedVehicleId    = prm_AssignedAmbulanceId,
                        AmbulanceAssignmentTime = prm_AmbulanceAssignmentTime
			WHERE EmergencyCaseId = prm_EmergencyCaseId;

COMMIT;

    SELECT 1 INTO vSuccess;
    
	CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, null, 'Rescue');

    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_EmergencyCaseId,'EmergencyCase RescueDetails',CONCAT('Update ', prm_UpdateTime, ' ', vUpdateTime), NOW());    
       

ELSEIF vEmNoExists > 1 THEN

	SELECT 2 INTO vSuccess;

ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3 INTO vSuccess; -- Already updated

ELSEIF vUpdateTime > prm_UpdateTime THEN
	SELECT 4 INTO vSuccess; -- Emergency record already updated another time.
    
ELSE
	SELECT 5 INTO vSuccess; -- Other error   
END IF;

SELECT vSocketEndPoint AS socketEndPoint, vSuccess AS success; 


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_AcceptRejectMoveIn !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateTreatmentList_AcceptRejectMoveIn(
													IN prm_UserName VARCHAR(45),
													IN prm_TreatmentListId INT,
                                                    IN prm_PatientId INT,
                                                    IN prm_Accepted TINYINT
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for updating accepting a moved in record from another area. This procedure also updates the moved out flag on the previous record.
*/

DECLARE vSuccess INT;
DECLARE vSocketEndpoint VARCHAR(64);
DECLARE vRejectedFrom VARCHAR(100);
DECLARE vRejectedFromTreatmentAreaId INT;
SET vSuccess = 0;

SELECT SocketEndPoint INTO vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT ta.TreatmentAreaId, ta.TreatmentArea INTO vRejectedFromTreatmentAreaId, vRejectedFrom FROM AAU.TreatmentList tl
INNER JOIN AAU.TreatmentArea ta ON ta.TreatmentAreaId = tl.InTreatmentAreaId WHERE tl.TreatmentListId = prm_TreatmentListId;

IF prm_Accepted = TRUE THEN

UPDATE AAU.TreatmentList
	SET InAccepted = prm_Accepted,
    OutTreatmentAreaId = IF(OutAccepted = 0, NULL, OutAccepted),
    OutDate = IF(OutAccepted = 0, NULL, OutDate),
    OutAccepted = IF(OutAccepted = 0, NULL, OutAccepted)
WHERE TreatmentListId = prm_TreatmentListId;

SELECT IF(ROW_COUNT() > 0, 1, 0) INTO vSuccess;

ELSE

DELETE FROM AAU.TreatmentList WHERE TreatmentListId = prm_TreatmentListId;

SELECT IF(ROW_COUNT() > 0, 1, 0) INTO vSuccess;

END IF;

UPDATE AAU.TreatmentList
	SET OutAccepted = prm_Accepted
WHERE	PatientId = prm_PatientId AND
		OutAccepted IS NULL AND
		OutTreatmentAreaId IS NOT NULL;

SELECT vSuccess AS success, vSocketEndPoint as socketEndPoint, vRejectedFrom as actionedByArea, vRejectedFromTreatmentAreaId as actionedByAreaId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateUserById !!

DELIMITER $$
CREATE PROCEDURE  AAU.sp_UpdateUserById (IN prm_UserId INT,
										IN prm_FirstName NVARCHAR(64),
										IN prm_Surname NVARCHAR(64),
                                        IN prm_Initials NVARCHAR(64),
                                        IN prm_Colour NVARCHAR(64),
										IN prm_Telephone NVARCHAR(64),
                                        IN prm_UserName NVARCHAR(64),
                                        IN prm_Password NVARCHAR(255),
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
SELECT COUNT(1) INTO vUsernameCount FROM AAU.User WHERE UserId <> prm_UserId AND UserName = prm_UserName;

-- Check that the incoming first name, surname and telephone don't already exist
SELECT COUNT(1) INTO vComboKeyCount FROM AAU.User WHERE UserId <> prm_UserId	AND	FirstName	= prm_FirstName
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
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateUserPreferences !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateUserPreferences(IN prm_UserId INT,
                                        IN prm_Preferences JSON
										)
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to update a user's preferences
*/

DECLARE vUserCount INT;
DECLARE vUpdateSuccess INT;

SET vUserCount = 0;
SET vUpdateSuccess = 0;

-- Check that the user exists
SELECT COUNT(1) INTO vUserCount FROM AAU.User WHERE UserId = prm_UserId;

IF vUserCount = 1  THEN

	UPDATE AAU.User
		SET	Preferences = prm_Preferences
	WHERE UserId = prm_UserId;

SELECT 1 INTO vUpdateSuccess; -- User update OK.

ELSEIF vUserCount = 0 THEN

SELECT 2 INTO vUpdateSuccess; -- User Doesn't exist

ELSEIF vUserCount > 1 THEN

SELECT 3 INTO vUpdateSuccess; -- Multiple records, we have duplicates

ELSE

SELECT 4 INTO vUpdateSuccess; -- Return misc 

END IF;

SELECT vUpdateSuccess as success;



END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVehicleListItem !!
DROP PROCEDURE IF EXISTS AAU.sp_UpdateVehicle !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateVehicle(IN prm_Username VARCHAR(65),
												 IN prm_VehicleId INT,
												 IN prm_VehicleRegistrationNumber VARCHAR(100),
												 IN prm_VehicleNumber VARCHAR(100),
												 IN prm_VehicleTypeId INT,
												 IN prm_LargeAnimalCapacity INT,
												 IN prm_SmallAnimalCapacity INT,
												 IN prm_MinRescuerCapacity INT,
												 IN prm_MaxRescuerCapacity INT,
												 IN prm_VehicleStatusId INT,
												 IN prm_StreetTreatVehicle INT,
												 IN prm_StreetTreatDefaultVehicle INT,
                                                 IN prm_VehicleColour VARCHAR(64),
												 IN prm_VehicleImage VARCHAR(650))
BEGIN

/*
CreatedBy: Arpit Trivedi
CreatedDate: 18/05/2021
Purpose: To update the vehicle record
*/

DECLARE vSuccess INT;
DECLARE vVehicleCount INT;

SET vSuccess = 0;
SET vVehicleCount = 0;

SELECT COUNT(1) INTO vVehicleCount FROM AAU.Vehicle
WHERE VehicleId = prm_VehicleId;

IF vVehicleCount = 1 THEN

	IF prm_StreetTreatDefaultVehicle = 1 THEN
    
    UPDATE AAU.Vehicle v
    INNER JOIN AAU.User u ON u.OrganisationId = v.OrganisationId AND u.username = prm_Username
    SET StreetTreatDefaultVehicle = 0;
    
    END IF;

	UPDATE AAU.Vehicle SET
		VehicleRegistrationNumber = prm_VehicleRegistrationNumber,
		VehicleNumber = prm_VehicleNumber,
		VehicletypeId = prm_VehicleTypeId,
		LargeAnimalCapacity = prm_LargeAnimalCapacity,
		SmallAnimalCapacity = prm_SmallAnimalCapacity,
        MinRescuerCapacity = prm_MinRescuerCapacity,
		MaxRescuerCapacity = prm_MaxRescuerCapacity,
		VehicleStatusId = prm_VehicleStatusId,
        StreetTreatVehicle = prm_StreetTreatVehicle,
        StreetTreatDefaultVehicle = prm_StreetTreatDefaultVehicle,
        VehicleColour = prm_VehicleColour,
        VehicleImage = prm_VehicleImage
	WHERE VehicleId = prm_VehicleId;    
   
    SELECT 1 INTO vSuccess;

ELSE 
	
    SELECT 2 INTO vSuccess;
    
END IF;

SELECT prm_VehicleId AS vehicleId, vSuccess AS success;
    

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVehicleShiftStaff!!

DELIMITER $$

-- CALL AAU.sp_UpdateVehicleShiftStaff('Jim', '2021-07-17');

CREATE PROCEDURE AAU.sp_UpdateVehicleShiftStaff(IN prm_VehicleShiftId INT, IN prm_UserList VARCHAR(1000) ) 
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-07-17
Purpose: Procedure to insert users for a shift. This procedures also soft deletes any existing users on the shift.
*/

DECLARE vUpdated INT;
DECLARE vInserted INT;
DECLARE vSuccess INT;

SET vUpdated = -1;
SET vInserted = -1;
SET vSuccess = 0;

WITH IncomingUserCTE AS
(
SELECT prm_VehicleShiftId, UserId
FROM
  JSON_TABLE(
    prm_UserList,
    "$[*]" COLUMNS(
      UserId VARCHAR(100) PATH "$.userId"
    )
  ) shiftUser
)

  -- Set all of the missing users to deleted
UPDATE AAU.VehicleShiftUser vsu
LEFT JOIN IncomingUserCTE iu ON vsu.vehicleShiftId = prm_VehicleShiftId AND iu.UserId = vsu.UserId
SET IsDeleted = 1, DeletedDate = NOW()
WHERE iu.UserId IS NULL
AND vsu.vehicleShiftId = prm_VehicleShiftId;

  SELECT ROW_COUNT() INTO vUpdated;
  
-- Now only insert the records that don't already exist
INSERT INTO AAU.VehicleShiftUser (VehicleShiftId, UserId) 
SELECT prm_VehicleShiftId, UserId
FROM
  JSON_TABLE(
    prm_UserList,
    "$[*]" COLUMNS(
      UserId VARCHAR(100) PATH "$.userId"
    )
  ) shiftUser
WHERE shiftUser.UserId NOT IN (SELECT UserId FROM AAU.VehicleShiftUser WHERE VehicleShiftId = prm_VehicleShiftId AND IFNULL(IsDeleted,0) = 0);
  
  SELECT ROW_COUNT() INTO vInserted;
  
  IF vInserted >= 0 OR vUpdated >= 0 THEN
	SET vSuccess = 1;
  END IF;
  
  
SELECT prm_VehicleShiftId AS vehicleShiftId, vSuccess AS 'success';
		

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVehicleShift!!

DELIMITER $$

-- CALL AAU.sp_UpdateVehicleShift('Jim', '2021-07-17');

CREATE PROCEDURE AAU.sp_UpdateVehicleShift(IN prm_Username VARCHAR(45),
IN prm_VehicleShiftId INT,
IN prm_VehicleId INT,
IN prm_StartDate DATETIME,
IN prm_EndDate DATETIME,
IN prm_IsDeleted TINYINT) 
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-07-17
Purpose: Procedure to update an existing shift for a vehicle
*/

DECLARE vOrganisationId INT;
DECLARE vVehicleShiftId INT;
DECLARE vVehicleShiftIdCount INT;
DECLARE vSuccess INT;

SET vSuccess = 0;

SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE u.UserName = prm_Username;

SELECT COUNT(1) INTO vVehicleShiftId FROM AAU.VehicleShift WHERE VehicleShiftId = prm_VehicleShiftId;

IF vVehicleShiftId = 1 THEN

UPDATE AAU.VehicleShift SET
		OrganisationId = vOrganisationId,
		VehicleId = prm_VehicleId,
		StartDate = prm_StartDate,
		EndDate = prm_EndDate,
        UpdateDate = NOW(),
        IsDeleted = prm_IsDeleted,
        DeletedDate = IF(prm_IsDeleted = 1, NOW(), NULL)
	WHERE VehicleShiftId = prm_VehicleShiftId;
    
    SELECT 1 INTO vSuccess;
    
ELSE
    SELECT 0 INTO vSuccess;
END IF;
    
SELECT prm_VehicleShiftId AS vehicleShiftId, vSuccess AS 'success';

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVisitAssignedVehicleId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateVisitAssignedVehicleId(
	IN prm_StreetTreatCaseId INT,
    IN prm_AssignedVehicleId INT
)
BEGIN
/*

Created By: Ankit Singh
Created On: 28/01/2021
Purpose: Update Visit AssignedVehicle.

*/
DECLARE vStreetTreatCaseIdExists INT;
DECLARE vSuccess INT;

SELECT COUNT(1) INTO vStreetTreatCaseIdExists FROM AAU.StreetTreatCase WHERE StreetTreatCaseId = prm_StreetTreatCaseId;

IF vStreetTreatCaseIdExists > 0 THEN

	UPDATE AAU.StreetTreatCase
	SET
	AssignedVehicleId = prm_AssignedVehicleId
	WHERE StreetTreatCaseId = prm_StreetTreatCaseId;
    SELECT 1 INTO vSuccess;
    
ELSE
	SELECT 3 INTO vSuccess;
    
END IF;

SELECT vSuccess AS success;
END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UploadOrganisationLogo !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UploadOrganisationLogo( 
			IN prm_remoteURL VARCHAR(500),
			IN prm_organisationId INT
)
BEGIN

DECLARE vSuccess INT;

	INSERT INTO AAU.OrganisationMetadata(LogoURL,OrganisationId) 
	VALUES (prm_remoteURL, prm_organisationId) 
	ON DUPLICATE KEY UPDATE LogoURL = prm_remoteURL;

SELECT 1 INTO vSuccess;
SELECT vSuccess;

END$$
DELIMITER ;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertDropdownTableValue !!

-- CALL AAU.sp_UpsertDropdownTableValue("Haris","EmergencyCode",-1,"Green",0,1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertDropdownTableValue(IN prm_Username VARCHAR(45), IN prm_TableName VARCHAR(45), IN prm_ElementId INT, IN prm_ElementValue VARCHAR(100), IN prm_IsDeleted INT, IN prm_SortOrder INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 08/05/2019
Purpose: Used to return list of main problems for cases.
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

	SET @Id = 0;

	SET @statement = CONCAT('SELECT IF(', prm_ElementId, ' = -1, MAX(',prm_TableName,'Id) + 1, ', prm_ElementId,' ) INTO @Id FROM AAU.',prm_TableName,';');
	        
    PREPARE stmt FROM @statement;
    EXECUTE stmt;    
    
    SET @upsertStatement = CONCAT('INSERT INTO AAU.',prm_TableName,' (',prm_TableName, 'Id, OrganisationId, ', prm_TableName,', ',
    'IsDeleted, SortOrder) VALUES (',@Id,', ', vOrganisationId, ', ''', prm_ElementValue, ''', ', prm_IsDeleted, ', ', prm_SortOrder,') ON DUPLICATE KEY UPDATE ', 
	prm_TableName, ' = ''', prm_ElementValue, ''', IsDeleted = ', prm_IsDeleted, ', SortOrder = ', prm_SortOrder, ';' );
    
	PREPARE upsert FROM @upsertStatement;
    EXECUTE upsert;
    
    DEALLOCATE PREPARE stmt;
    DEALLOCATE PREPARE upsert;    

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId,ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId,prm_Username,IFNULL(prm_ElementId, @Id),prm_TableName,'Upsert record', NOW());
 
    SELECT 'success' AS `success`;
  
END;


DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertOrganisationDetail !!

DELIMITER $$

-- CALL AAU.sp_UpsertOrganisationDetail('{"Address": "123 Tree Street"}', 'Sarvoham', 2);

CREATE PROCEDURE AAU.sp_UpsertOrganisationDetail (
    IN prm_Address JSON,
	IN prm_Organisation VARCHAR(100),
    IN prm_DriverViewDeskNumber VARCHAR(20),
	IN prm_OrganisationId INT
)
BEGIN
DECLARE vSuccess INT DEFAULT 0;

UPDATE AAU.Organisation SET Organisation = prm_Organisation WHERE OrganisationId = prm_OrganisationId;

INSERT INTO AAU.OrganisationMetadata (Address, OrganisationId, DriverViewDeskNumber)
VALUES (prm_Address, prm_OrganisationId, prm_DriverViewDeskNumber) ON DUPLICATE KEY UPDATE
			Address = prm_Address,
            DriverViewDeskNumber = prm_DriverViewDeskNumber;
	
	SELECT 1 INTO vSuccess;
	SELECT vSuccess;
END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertStreetTreatCase!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertStreetTreatCase(
		IN prm_Username VARCHAR(45),
		IN prm_PatientId INT,
		IN prm_PriorityId INT,
		IN prm_StatusId INT,		
		IN prm_MainProblemId INT,
		IN prm_AdminComments VARCHAR(256),
		IN prm_OperatorNotes VARCHAR(256),
		IN prm_ClosedDate DATE,
		IN prm_EarlyReleaseFlag BOOLEAN,
		IN prm_AnimalDescription VARCHAR(256),
        IN prm_AssignedVehicleId INT,
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
                        prm_MainProblemId,
						prm_AdminComments,
						prm_OperatorNotes,
                        prm_ClosedDate,
                        prm_EarlyReleaseFlag,
                        vOrganisationId,
                        prm_AssignedVehicleId,
                        prm_AmbulanceAssignmentTime
						);
                        
SELECT 1 INTO vSuccess;

ELSEIF vCaseExists = 1 THEN

 UPDATE AAU.StreetTreatCase SET
                        PriorityId				= prm_PriorityId,
						StatusId				= prm_StatusId,
						AssignedVehicleId		= prm_AssignedVehicleId,
						MainProblemId			= prm_MainProblemId,
						AdminComments			= prm_AdminComments,
						OperatorNotes			= prm_OperatorNotes,
						ClosedDate				= prm_ClosedDate,
						EarlyReleaseFlag		= prm_EarlyReleaseFlag,
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
    
END $$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertStreetTreatPatient !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertStreetTreatPatient (IN prm_Username VARCHAR(20),
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
DECLARE vAssignedVehicleId INT;
DECLARE vStreetTreatCaseExists INT;
DECLARE vPatientExists INT;
DECLARE vCaseId INT;
DECLARE stTagNumber VARCHAR(20);
DECLARE vTagNumber VARCHAR(20);
DECLARE vOrganisationId INT;
SET vStreetTreatCaseExists = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF prm_AddToStreetTreat = 1 THEN    
    
		SELECT VehicleId INTO vAssignedVehicleId FROM AAU.Vehicle WHERE StreetTreatDefaultVehicle = 1;
		
		SELECT CONCAT('ST',CONVERT(IFNULL(MAX(CONVERT(REPLACE(UPPER(TagNumber), 'ST',''), SIGNED)), 0) + 1, CHAR)) INTO stTagNumber
		FROM AAU.Patient
		WHERE TagNumber LIKE 'ST%';
		
		SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.Patient WHERE TagNumber = stTagNumber;        
		SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient p LEFT JOIN AAU.StreetTreatCase st ON st.PatientId = p.PatientId WHERE st.PatientId = prm_PatientId;
        
		IF vStreetTreatCaseExists = 0 AND vPatientExists < 1 THEN
        
        INSERT INTO AAU.StreetTreatCase (PatientId, PriorityId, StatusId, AssignedVehicleId, AmbulanceAssignmentTime, MainProblemId, AdminComments, OrganisationId)
			VALUES(prm_PatientId, 4, 1, vAssignedVehicleId, NOW(), 6, 'Added by Apoms',vOrganisationId);
            
			SELECT LAST_INSERT_ID(),stTagNumber INTO vCaseId,vTagNumber;
            
			INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
			VALUES (vOrganisationId, prm_Username, vCaseId,'Case','Insert - Via ER', NOW());
            
            UPDATE AAU.Patient SET TagNumber = vTagNumber WHERE PatientId = prm_PatientId;
			
		END IF;

ELSEIF prm_AddToStreetTreat = 0 THEN

	SELECT COUNT(1) INTO vStreetTreatCaseExists FROM AAU.StreetTreatCase WHERE PatientId = prm_PatientId;  
 
	IF vStreetTreatCaseExists = 1 THEN
		UPDATE AAU.Patient SET TagNumber = NULL, UpdateTime = NOW(), PatientStatusId = 1, PatientStatusDate = NULL WHERE PatientId = prm_PatientId;
		
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
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertVisit !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertVisit(
	IN prm_Username VARCHAR(45), 
	IN prm_StreetTreatCaseId INT,
    IN prm_VisitId INT,
	IN prm_VisitDate DATE,
	IN prm_VisitTypeId INT,
	IN prm_StatusId INT,
	IN prm_AdminNotes TEXT,
	IN prm_OperatorNotes TEXT,
	IN prm_IsDeleted INT,
    IN prm_Day TINYINT,
    IN prm_VisitBeginDate DATETIME,
    IN prm_VisitEndDate DATETIME
)
BEGIN

DECLARE vVisitExisits INT;
DECLARE vVisitDateExists INT;
DECLARE vSuccess TINYINT;
DECLARE vVisitIdExisits boolean;
DECLARE vEmergencyCaseId INT;
DECLARE vSocketEndPoint CHAR(3);

SET vVisitExisits = 0;
SET vVisitDateExists = 0;
SET vSuccess = -1;

SELECT COUNT(1) INTO vVisitExisits
FROM AAU.Visit
WHERE VisitId = prm_VisitId
AND StreetTreatCaseId = prm_StreetTreatCaseId
AND (IsDeleted = 0 OR IsDeleted IS NULL);

SELECT COUNT(1) INTO vVisitDateExists
FROM AAU.Visit
WHERE StreetTreatCaseId = prm_StreetTreatCaseId AND
VisitId != prm_VisitId AND
Date = prm_VisitDate AND
isDeleted = 0;

SELECT o.SocketEndPoint INTO vSocketEndPoint FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE u.UserName = prm_Username;

SELECT ec.EmergencycaseId INTO vEmergencyCaseId
FROM AAU.StreetTreatCase sc
INNER JOIN AAU.Patient p ON p.PatientId = sc.PatientId
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
WHERE sc.StreetTreatCaseId = prm_StreetTreatCaseId;

IF prm_VisitId IS NULL THEN

	INSERT INTO AAU.Visit (
			StreetTreatCaseId,
			VisitTypeId,
			Date,
			StatusId,
			AdminNotes,
			OperatorNotes,
			IsDeleted,
            Day,
            VisitBeginDate,
            VisitEndDate
			
		) VALUES (
			prm_StreetTreatCaseId,
			prm_VisitTypeId,
			prm_VisitDate,
			prm_StatusId,
			prm_AdminNotes,
			prm_OperatorNotes,
			prm_IsDeleted,
			prm_Day,
            prm_VisitBeginDate,
            prm_VisitEndDate
		);

    SELECT LAST_INSERT_ID() INTO prm_VisitId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,prm_VisitId,'Visit','Insert', NOW());


ELSEIF vVisitExisits = 1 AND vVisitDateExists = 0 THEN

	UPDATE AAU.Visit
		SET
			VisitTypeId		= prm_VisitTypeId,
            Date			= prm_VisitDate,
            StatusId		= prm_StatusId,
            AdminNotes		= prm_AdminNotes,
            OperatorNotes	= prm_OperatorNotes,
            IsDeleted		= prm_IsDeleted,
            Day				= prm_Day,
            VisitBeginDate = prm_VisitBeginDate,
            VisitEndDate  = prm_VisitEndDate
		WHERE
			VisitId = prm_VisitId;

    INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,prm_VisitId,'Visit','Update', NOW());

    SELECT 2 INTO vSuccess;

ELSEIF vVisitDateExists > 0 THEN
    SELECT 3 INTO vSuccess;
ELSE
	SELECT 4 INTO vSuccess;

END IF;

SELECT vSuccess AS success, prm_VisitId AS visitId, DATE_FORMAT(prm_VisitDate, '%Y-%m-%d') AS visitDate, vSocketEndPoint AS SocketEndPoint, 
vEmergencyCaseId AS EmergencyCaseId;


CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(vEmergencyCaseId, null, 'StreetTreat');

END$$
DELIMITER ;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientDetails !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatientDetails(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
                                    IN prm_AnimalTypeId INT,
                                    IN prm_MainProblems VARCHAR(256),
                                    IN prm_Description VARCHAR(256),
                                    IN prm_Sex INT,
                                    IN prm_TreatmentPriority INT,
                                    IN prm_ABCStatus INT,
                                    IN prm_ReleaseStatus INT,
                                    IN prm_Temperament INT,
                                    IN prm_Age INT,
                                    IN prm_KnownAsName VARCHAR(256))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to update the status of a patient.
*/

DECLARE vOrganisationId INT;
DECLARE vSuccess INT;

DECLARE vPatientExists INT;
SET vPatientExists = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE PatientId = prm_PatientId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 1 THEN

START TRANSACTION;

	UPDATE AAU.Patient SET
				AnimalTypeId		= prm_AnimalTypeId,
				MainProblems		= prm_MainProblems,
				Description			= prm_Description,
				Sex					= prm_Sex,
				TreatmentPriority	= prm_TreatmentPriority,
				ABCStatus			= prm_ABCStatus,
				ReleaseStatus		= prm_ReleaseStatus,
				Temperament			= prm_Temperament,		
				Age					= prm_Age,		
				KnownAsName			= prm_KnownAsName /*,
				UpdateTime					= NOW()*/
				
	WHERE PatientId = prm_PatientId;
   
COMMIT;         
            
    SELECT 1 INTO vSuccess;
    
    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_PatientId,'Patient',CONCAT('Update patient details'), NOW());

ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vSuccess AS `success`;

CALL AAU.sp_GetTreatmentListByPatientId(prm_UserName, prm_PatientId);

END$$

