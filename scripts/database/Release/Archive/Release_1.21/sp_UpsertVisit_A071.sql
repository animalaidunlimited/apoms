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
