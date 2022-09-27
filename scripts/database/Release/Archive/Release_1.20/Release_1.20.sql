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
		"Releaser1",rd.Releaser1Id, 
		"Releaser2",rd.Releaser2Id, 
		"releaseBeginDate",DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s"), 
		"releaseEndDate",DATE_FORMAT(rd.EndDate, "%Y-%m-%dT%H:%i:%s")
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

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentListByPatientId !!

DELIMITER $$

-- CALL AAU.sp_GetTreatmentList(5, '2021-05-05');

CREATE PROCEDURE AAU.sp_GetTreatmentListByPatientId ( IN prm_Username VARCHAR(45), IN prm_PatientId INT )
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
JSON_OBJECT("Actioned by area", ca.`Area`),
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
    LEFT JOIN AAU.TreatmentArea ca ON ca.AreaId = tl.ActionedByArea
	LEFT JOIN
	(
		SELECT DISTINCT t.PatientId
		FROM AAU.Treatment t
		WHERE CAST(t.TreatmentDateTime AS DATE) = CURDATE()
	) t ON t.PatientId = p.PatientId;

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertTreatmentListRecord !!

DELIMITER $$
-- START TRANSACTION;
-- CALL AAU.sp_InsertTreatmentListRecord(98820, 1, 10, '2021-04-27', NULL, NULL);
-- ROLLBACK TRANSACTION

CREATE PROCEDURE AAU.sp_InsertTreatmentListRecord (
													IN prm_Username VARCHAR(45),
													IN prm_PatientId INT,
													IN prm_Admission TINYINT,
													IN prm_InTreatmentAreaId INT,
													IN prm_InDate DATETIME,
													IN prm_InAccepted TINYINT,
                                                    IN prm_PreviousArea INT
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for inserting admission and moved in records to the treatment list.
*/

DECLARE vUnaccepted INT;
DECLARE vTotalRecords INT;
DECLARE vPreviousTreatmentId INT;
SET vPreviousTreatmentId = 0;
SET vUnaccepted = 0;
SET vTotalRecords = 0;

SELECT COUNT(1), IFNULL(SUM(IF(InAccepted IS NULL, 1, 0)),0) INTO vTotalRecords, vUnaccepted FROM AAU.TreatmentList WHERE PatientId = prm_PatientId;

IF prm_InTreatmentAreaId IS NOT NULL AND NOT (prm_Admission = 1 AND vTotalRecords > 0) AND vUnaccepted = 0 THEN
	INSERT INTO AAU.TreatmentList	(PatientId, Admission, InTreatmentAreaId, InDate)
									VALUES
									(prm_PatientId, prm_Admission, prm_InTreatmentAreaId, prm_InDate);
                                    
	SELECT LAST_INSERT_ID() AS `TreatmentListId`, 1 AS `success`;

-- ELSEIF vAdmissionExists = 0 AND prm_InTreatmentAreaId IS NOT NULL THEN

-- 	UPDATE AAU.TreatmentList SET InTreatmentAreaId = prm_InTreatmentAreaId WHERE PatientId = prm_PatientId AND Admission = 1;
--     SELECT 1 AS `success`;

-- We can't insert an admission for a patient that already has one.
ELSEIF prm_InTreatmentAreaId IS NOT NULL AND prm_Admission = 1 AND vTotalRecords > 0 THEN
 
	UPDATE AAU.TreatmentList SET InTreatmentAreaId = prm_InTreatmentAreaId WHERE PatientId = prm_PatientId AND Admission = 1;

 	SELECT -1 AS `TreatmentListId`, 0 AS `success`;
    
ELSEIF prm_InTreatmentAreaId IS NULL THEN

	DELETE FROM AAU.TreatmentList WHERE PatientId = prm_PatientId AND OutAccepted IS NULL AND InAccepted IS NULL;
    UPDATE AAU.TreatmentList SET OutTreatmentAreaId = NULL, OutDate = NULL WHERE PatientId = prm_PatientId AND OutAccepted IS NULL;
    SELECT -1 AS `TreatmentListId`, 2 AS `success`;
    
ELSEIF vUnaccepted > 0 THEN

		SELECT -1 AS `TreatmentListId`, 0 AS `success`;
		
ELSE

	SELECT -1 AS `TreatmentListId`, -1 AS `success`;

END IF;

CALL AAU.sp_GetTreatmentListByPatientId(prm_Username, prm_PatientId);

END $$







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
				KnownAsName			= prm_KnownAsName,
				UpdateTime			= NOW()
				
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
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_AcceptRejectMoveIn !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateTreatmentList_AcceptRejectMoveIn (
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

SELECT ta.AreaId, ta.Area INTO vRejectedFromTreatmentAreaId, vRejectedFrom FROM AAU.TreatmentList tl
INNER JOIN AAU.TreatmentArea ta ON ta.AreaId = tl.InTreatmentAreaId WHERE tl.TreatmentListId = prm_TreatmentListId;

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

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_MoveOut !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateTreatmentList_MoveOut (
													IN prm_Username VARCHAR(45),		
													IN prm_PatientId INT,
													IN prm_TreatmentListId INT,
													IN prm_OutTreatmentAreaId INT,
													IN prm_OutDate DATETIME
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for updating the treatment list to move a patient out of an area. A moved in record can only be added with sp_InsertTreatmentListRecord .
*/

UPDATE AAU.TreatmentList SET
			InTreatmentAreaId = IF(Admission = 1 AND InAccepted != 1, prm_OutTreatmentAreaId, InTreatmentAreaId),
			OutTreatmentAreaId = IF(InAccepted = 1, prm_OutTreatmentAreaId, NULL),
			OutDate = IF(InAccepted = 1, prm_OutDate, NULL),
            OutAccepted = NULL
            -- OutTreatmentAreaId = prm_OutTreatmentAreaId,
            -- OutDate = prm_OutDate
WHERE TreatmentListId = prm_TreatmentListId;

-- We also need to update any outstanding unaccepted moved in records
UPDATE AAU.TreatmentList SET InTreatmentAreaId = prm_OutTreatmentAreaId WHERE PatientId = prm_PatientId AND InAccepted IS NULL;

SELECT IF(ROW_COUNT() > 0, 1, 0) AS `success`;

CALL AAU.sp_GetTreatmentListByPatientId(prm_Username, prm_PatientId);

END $$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_Resolve !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateTreatmentList_Resolve ( IN prm_Username VARCHAR(45), IN prm_PatientId INT, IN prm_OutOfHospital TINYINT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for updating the treatment list to set the OutOfHospital flag when the patient is released from the hospital.
*/

UPDATE AAU.TreatmentList SET OutOfHospital = prm_OutOfHospital WHERE PatientId = prm_PatientId;

SELECT IF(ROW_COUNT() > 0, 1, 0) AS `success`;

CALL AAU.sp_GetTreatmentListByPatientId(prm_Username, prm_PatientId);

END $$


DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateRescueDetails!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateRescueDetails(
									IN prm_UserName VARCHAR(64),
									IN prm_EmergencyCaseId INT,
                                    IN prm_Rescuer1Id INT,
                                    IN prm_Rescuer2Id INT,
                                    IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME,
                                    In prm_EmergencyCodeId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to update the status of a patient.
*/

DECLARE vUpdateTime DATETIME;
DECLARE vOrganisationId INT;
DECLARE vCallOutcomeId INT;
DECLARE vSuccess INT;
DECLARE vSocketEndPoint VARCHAR(3);

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT COUNT(1), IFNULL(MAX(UpdateTime), '1901-01-01'), MAX(CallOutcomeId) INTO vEmNoExists, vUpdateTime, vCallOutcomeId 
FROM AAU.EmergencyCase 
WHERE EmergencyCaseId = prm_EmergencyCaseId;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists = 1 AND prm_UpdateTime >= vUpdateTime THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET						
						Rescuer1Id             = prm_Rescuer1Id,
						Rescuer2Id             = prm_Rescuer2Id,
						AmbulanceArrivalTime   = prm_AmbulanceArrivalTime,
						RescueTime             = prm_RescueTime,
						AdmissionTime          = prm_AdmissionTime,						
                        UpdateTime			   = prm_UpdateTime,
                        EmergencyCodeId = prm_EmergencyCodeId
			WHERE EmergencyCaseId = prm_EmergencyCaseId;

COMMIT;

    SELECT 1 INTO vSuccess;
    
	CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, null);

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
