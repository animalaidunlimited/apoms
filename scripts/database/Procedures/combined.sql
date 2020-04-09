DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_CheckEmergencyNumberExists!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_CheckEmergencyNumberExists (
IN prm_EmergencyNumber INT,
IN prm_EmergencyCaseId INT,
IN prm_Username VARCHAR(45),
OUT prm_Success INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 02/03/2020
Purpose: Used to check the existance of a emergency number
*/

DECLARE vOrganisationId INT;

DECLARE vEmergencyNumberCount INT;
SET vEmergencyNumberCount = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1; 

SELECT COUNT(1) INTO vEmergencyNumberCount FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_EmergencyNumber
													AND OrganisationId = vOrganisationId
                                                    AND EmergencyCaseId != IFNULL(prm_EmergencyCaseId,-1);
                                                  
                                                    
IF vEmergencyNumberCount = 0 THEN
        
SELECT 0 INTO prm_Success;

ELSEIF vEmergencyNumberCount = 1 THEN

SELECT 1 INTO prm_Success;

ELSEIF vEmergencyNumberCount > 1 THEN

SELECT 2 INTO prm_Success;

ELSE

SELECT 3 INTO prm_Success;

END IF;



END$$
DELIMITER ;DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_CheckTagNumberExists!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_CheckTagNumberExists (
IN prm_TagNumber VARCHAR(64),
IN prm_EmergencyCaseId INT,
IN prm_PatientId INT,
IN prm_Username VARCHAR(45),
OUT prm_Success INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 02/03/2020
Purpose: Used to check the existance of a tag number
*/

DECLARE vOrganisationId INT;
DECLARE vEmergencyCaseId INT;
DECLARE vTagNumber VARCHAR(5);
DECLARE vTagNumberCount INT;

DECLARE vNewTagNumberCount INT;

SET vTagNumberCount = 0;



SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1; 

-- Get the existing tag number for this patient, so we can check that they're not switching to another tag
-- number on the same emergency case
SELECT EmergencyCaseId, TagNumber INTO vEmergencyCaseId, vTagNumber FROM AAU.Patient WHERE PatientId = IFNULL(prm_PatientId,0);

SELECT COUNT(1) INTO vNewTagNumberCount FROM AAU.Patient WHERE TagNumber = prm_TagNumber
													AND OrganisationId = vOrganisationId
                                                    AND EmergencyCaseId = prm_EmergencyCaseId
                                                    AND PatientId <> IFNULL(prm_PatientId,0);

SELECT COUNT(1) INTO vTagNumberCount FROM AAU.Patient WHERE TagNumber = prm_TagNumber
													AND OrganisationId = vOrganisationId
                                                    AND (EmergencyCaseId != IFNULL(prm_EmergencyCaseId,-1)
                                                    OR vNewTagNumberCount = 1);
                                                  
                                                    
IF vTagNumberCount = 0 AND vNewTagNumberCount = 0 THEN
        
SELECT 0 INTO prm_Success;

ELSEIF vTagNumberCount = 1 THEN

SELECT 1 INTO prm_Success;

ELSEIF vTagNumberCount > 1 THEN

SELECT 2 INTO prm_Success;

ELSE

SELECT 3 INTO prm_Success;

END IF;



END$$
DELIMITER ;DELIMITER $$

DROP PROCEDURE IF EXISTS AAU.sp_DeleteCallerById$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE AAU.sp_DeleteCallerById(IN prm_CallerId INT, IN prm_Username VARCHAR(64), OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to delete Callers by id
*/
DECLARE vOrganisationId INT;

DECLARE vCallerCount INT;
SET vCallerCount = 0;



SELECT COUNT(1) INTO vCallerCount FROM AAU.Caller WHERE CallerId = prm_CallerId;
                                                    
                                                    
IF vCallerCount > 0 THEN

START TRANSACTION;

UPDATE AAU.Caller SET
IsDeleted = 1,
DeletedDate = NOW()
WHERE CallerId = prm_CallerId;
		
COMMIT;
        
SELECT 1 INTO prm_Success;  
   
  SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

  INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_CallerId,'Caller','Delete', NOW());

ELSE

SELECT 3 INTO prm_Success;

END IF;


END$$
DELIMITER ;



DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeleteEmergencyCaseById!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_DeleteEmergencyCaseById(IN prm_EmergencyCaseId INT, IN prm_Username VARCHAR(64), OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to delete a case by EmergencyCaseId
*/

-- Check that the case actually exists first.
DECLARE vOrganisationId INT;

DECLARE vCaseExists INT;
SET vCaseExists = 0;

SELECT COUNT(1) INTO vCaseExists FROM AAU.EmergencyCase WHERE EmergencyCaseId = prm_EmergencyCaseId;

IF vCaseExists = 1 THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET
	IsDeleted = 1,
	DeletedDate = NOW()	
	WHERE EmergencyCaseId = prm_EmergencyCaseId;

COMMIT;

  SELECT 1 INTO prm_Success;
  
  SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

  INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_CallerId,'EmergencyCase','Delete', NOW());

ELSE 
	SELECT -1 INTO prm_Success;
END IF;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeletePatientById!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_DeletePatientById(IN prm_Username VARCHAR(64), IN prm_PatientId INT, OUT prm_OutPatientId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to delete patient by id
*/
DECLARE vOrganisationId INT;

DECLARE vPatientCount INT;
SET vPatientCount = 0;

SELECT prm_PatientId INTO prm_OutPatientId;

SELECT COUNT(1) INTO vPatientCount FROM AAU.Patient WHERE PatientId = prm_PatientId;
                                                    
                                                    
IF vPatientCount > 0 THEN

START TRANSACTION;

UPDATE AAU.Patient SET
IsDeleted = 1,
DeletedDate = NOW()
WHERE PatientId = prm_PatientId;
		
COMMIT;
        
SELECT 1 INTO prm_Success;

  SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

  INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId,prm_Username,prm_PatientId,'Patient','Delete', NOW());
    
ELSE

SELECT 3 INTO prm_Success;

END IF;


END$$
DELIMITER ;



DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeletePatientProblems!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_DeletePatientProblems(IN prm_PatientId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to delete all animal problems by AnimalId
*/

DECLARE vPatientProblemCount INT;
SET vPatientProblemCount = 0;

SELECT COUNT(1) INTO vPatientProblemCount FROM AAU.PatientProblem WHERE PatientId = prm_PatientId;                                                    
                                                    
IF vPatientProblemCount > 0 THEN

START TRANSACTION;

DELETE FROM AAU.PatientProblem WHERE PatientId = prm_PatientId;
		
COMMIT;
        
SELECT 1 INTO prm_Success;

ELSE

SELECT 3 INTO prm_Success;

END IF;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAnimalTypes!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetAnimalTypes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT AnimalTypeId, AnimalType FROM AAU.AnimalType WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAnimalTypesST!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetAnimalTypesST()
BEGIN

SELECT AnimalTypeId, AnimalType FROM AAU.AnimalType WHERE OrganisationId = 1
AND StreetTreatOnly = 1;

END$$
DELIMITER ;

CALL AAU.sp_GetAnimalTypesST()DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerByEmergencyCaseId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a call by CallerId by ID.
*/

SELECT 


JSON_OBJECT("callerDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("callerId", c.CallerId),
JSON_OBJECT("callerName", c.Name),
JSON_OBJECT("callerNumber", c.Number),
JSON_OBJECT("callerAlternativeNumber", c.AlternativeNumber)
)) AS Result
			
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;

END$$
DELIMITER ;

-- CALL AAU.sp_GetCallerByEmergencyCaseId(34);DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerById!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerById ( IN prm_CallerId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a Caller by ID.
*/

SELECT	
	CallerId,
	Name,
	PreferredName,
	Number,
	AlternativeNumber,
	Email,
	Address,
	CreatedDate,
	IsDeleted,
	DeletedDate
FROM AAU.Caller
WHERE CallerId = prm_CallerId;

SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerByNameAndNumber!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerByNameAndNumber ( IN prm_UserName VARCHAR(45), IN prm_CallerName VARCHAR(45), IN prm_CallerNumber VARCHAR(45), OUT prm_Success INT)
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


SELECT COUNT(1) INTO vCallerExists FROM AAU.Caller WHERE Name = prm_CallerName
AND Number = prm_CallerNumber;

SELECT	
	CallerId,
	Name,
	PreferredName,
	Number,
	AlternativeNumber,
	Email,
	Address,
	CreatedDate,
	IsDeleted,
	DeletedDate
FROM AAU.Caller
WHERE Name = prm_CallerName
AND Number = prm_CallerNumber
AND OrganisationId = vOrganisationId
LIMIT 1;

SELECT 1 INTO prm_Success;

IF vCallerExists > 1 THEN

SELECT 2 INTO prm_Success;

END IF;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerByNumber!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetCallerByNumber(IN prm_Number VARCHAR(45))

BEGIN
/*
Created By: Jim Mackenzie
Created On: 24/02/2020
Purpose: Used to return a Caller by Number.
*/

SELECT CallerId, Name, Number, AlternativeNumber
FROM AAU.Caller
WHERE Number LIKE CONCAT(prm_Number, '%')
LIMIT 10;

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetDispatcher!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetDispatcher(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT DispatcherId, Dispatcher FROM AAU.Dispatcher WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
DELIMITER ;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEmergencyCaseById!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEmergencyCaseById( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a case by ID.
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
JSON_OBJECT("callOutcome", ec.CallOutcomeId))

) AS Result
			
FROM AAU.EmergencyCase ec
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;


END$$
DELIMITER ;

-- CALL AAU.sp_GetEmergencyCaseById(34);DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEmergencyCodes!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEmergencyCodes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT EmergencyCodeId, EmergencyCode FROM AAU.EmergencyCode WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLocationDetailsByEmergencyCaseId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLocationDetailsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a call by CallerId by ID.
*/

SELECT 


JSON_OBJECT("locationDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("location", ec.Location),
JSON_OBJECT("latitude", ec.Latitude),
JSON_OBJECT("longitude", ec.Longitude)
)) AS Result
			
FROM AAU.EmergencyCase ec
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;

END$$
DELIMITER ;

-- CALL AAU.sp_GetLocationDetailsByEmergencyCaseId(34);
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutcomes!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOutcomes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT CallOutcomeId, CallOutcome FROM AAU.CallOutcome WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
DELIMITER ;

CALL AAU.sp_GetOutcomes("Jim")
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientByPatientId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientByPatientId ( IN prm_PatientId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to return a Patient by ID.
*/

SELECT	    

JSON_MERGE_PRESERVE(
	JSON_OBJECT("PatientId", p.PatientId),
	JSON_OBJECT("position", p.Position),
	JSON_OBJECT("animalTypeId", p.AnimalTypeId),
	JSON_OBJECT("tagNumber", p.TagNumber),
    JSON_OBJECT("createdDate", DATE_FORMAT(p.CreatedDate,"%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("patientStatusId", p.PatientStatusId),
	JSON_OBJECT("patientStatusDate", DATE_FORMAT(p.PatientStatusDate, "%Y-%m-%d")),
	JSON_OBJECT("isDeleted", p.IsDeleted),
    JSON_OBJECT("PN", p.PN),
    JSON_OBJECT("suspectedRabies", p.SuspectedRabies),
    JSON_OBJECT("currentLocation", ps.PatientStatus)
) AS Result   
    
FROM AAU.Patient p
INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
WHERE p.PatientId = prm_PatientId;



END$$
DELIMITER ;

-- CALL AAU.sp_GetPatientByPatientId(200)DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientProblems(IN prm_PatientId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to get all patient problems by PatientId
*/

	SELECT PatientId, ProblemId FROM AAU.PatientProblem WHERE PatientId = prm_PatientId;
    
    SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientsByEmergencyCaseId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return all patients for a case by EmergencyCaseId
*/

SELECT 

JSON_OBJECT(
	"patients",
	 JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("patientId", p.PatientId),
			JSON_OBJECT("position", p.Position),
			JSON_OBJECT("tagNumber", p.TagNumber),
			JSON_OBJECT("animalTypeId", p.AnimalTypeId),
			JSON_OBJECT("animalType", at.AnimalType),
			JSON_OBJECT("updated", false),
			JSON_OBJECT("deleted", p.IsDeleted),
			JSON_OBJECT("duplicateTag", false),
            pp.problemsJSON,
            ps.problemsString
				
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
		) AS problemsJSON
	FROM AAU.PatientProblem pp
	INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
	GROUP BY pp.patientId
	) pp ON pp.patientId = p.patientId
INNER JOIN (
SELECT pp.patientId, JSON_OBJECT("problemsString", GROUP_CONCAT(pr.Problem)) AS ProblemsString
FROM AAU.PatientProblem pp
INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
GROUP BY pp.patientId
) ps ON ps.PatientId = p.PatientId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
WHERE p.EmergencyCaseId = prm_emergencyCaseId
GROUP BY p.EmergencyCaseId;

END$$
DELIMITER ;

-- CALL AAU.sp_GetPatientsByEmergencyCaseId(34);DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientStates!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientStates(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT PatientStatusId, PatientStatus FROM AAU.PatientStatus WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
DELIMITER ;DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetProblem!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetProblem(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT ProblemId, Problem FROM AAU.Problem WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
DELIMITER ;DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRescueDetailsByEmergencyCaseId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRescueDetailsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a case by ID.
*/

SELECT 

JSON_OBJECT("rescueDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("rescuer1", ec.Rescuer1Id),
JSON_OBJECT("rescuer2", ec.Rescuer2Id),
JSON_OBJECT("ambulanceArrivalTime", DATE_FORMAT(ec.AmbulanceArrivalTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("admissionTime", DATE_FORMAT(ec.AdmissionTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescueTime", DATE_FORMAT(ec.RescueTime, "%Y-%m-%dT%H:%i:%s"))

)) AS Result
			
FROM AAU.EmergencyCase ec
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;


END$$
DELIMITER ;

-- CALL AAU.sp_GetRescueDetailsByEmergencyCaseId(34);DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRescuers!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRescuers(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT RescuerId, Rescuer FROM AAU.Rescuer WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
DELIMITER ;DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertCaller!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertCaller(
IN prm_Username VARCHAR(64),
IN prm_Name VARCHAR(128),
IN prm_PreferredName VARCHAR(128),
IN prm_Number VARCHAR(128),
IN prm_AlternativeNumber VARCHAR(128),
IN prm_Email VARCHAR(128),
IN prm_Address VARCHAR(512),
OUT prm_CallerId INT,
OUT prm_Success INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to insert a new Caller.
*/
DECLARE vOrganisationId INT;

DECLARE vCallerExists INT;
SET vCallerExists = 0;

SELECT COUNT(1) INTO vCallerExists FROM AAU.Caller WHERE Name = prm_Name AND Number = prm_Number;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vCallerExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.Caller
		(
        OrganisationId,
		Name,
		PreferredName,
		Number,
		AlternativeNumber,
		Email,
		Address
		)
		VALUES
		(
        vOrganisationId,
		prm_Name,
		prm_PreferredName,
		prm_Number,
		prm_AlternativeNumber,
		prm_Email,
		prm_Address
		);
        
COMMIT;

	SELECT 1 INTO prm_Success;
    SELECT LAST_INSERT_ID() INTO prm_CallerId;	

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_CallerId,'Caller','Insert', NOW());

ELSEIF vCallerExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;




END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertEmergencyCase!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertEmergencyCase(
									IN prm_UserName VARCHAR(64),
									IN prm_EmergencyNumber INT,
									IN prm_CallDateTime DATETIME,
									IN prm_DispatcherId INT,
									IN prm_EmergencyCodeId INT,
									IN prm_CallerId INT,
									IN prm_CallOutcomeId INT,
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DOUBLE(11,8),
									IN prm_Longitude DECIMAL(11,8),
									IN prm_Rescuer1Id INT,
									IN prm_Rescuer2Id INT,
									IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME,
									OUT prm_EmergencyCaseId INT,
									OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/02/2020
Purpose: Used to insert a new emergency case.
*/
DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;
DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SET vOrganisationId = 0;

SELECT COUNT(1), IFNULL(MAX(UpdateTime), '1901-01-01') INTO vEmNoExists, vUpdateTime FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_EmergencyNumber;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

START TRANSACTION;

IF vEmNoExists = 0 AND prm_UpdateTime > vUpdateTime THEN

INSERT INTO AAU.EmergencyCase
(
	OrganisationId,
	EmergencyNumber,
	CallDateTime,
	DispatcherId,
	EmergencyCodeId,
	CallerId,
	CallOutcomeId,
	Location,
	Latitude,
	Longitude,
	Rescuer1Id,
	Rescuer2Id,
	AmbulanceArrivalTime,
	RescueTime,
	AdmissionTime,
    UpdateTime
)
VALUES
(
	vOrganisationId,
	prm_EmergencyNumber,
	prm_CallDateTime,
	prm_DispatcherId,
	prm_EmergencyCodeId,
	prm_CallerId,
	prm_CallOutcomeId,
	prm_Location,
	prm_Latitude,
	prm_Longitude,
	prm_Rescuer1Id,
	prm_Rescuer2Id,
	prm_AmbulanceArrivalTime,
	prm_RescueTime,
	prm_AdmissionTime,
    prm_UpdateTime
);

COMMIT;

	SELECT 1 INTO prm_Success;
    SELECT LAST_INSERT_ID() INTO prm_EmergencyCaseId;	

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_CallerId,'EmergencyCase','Insert', NOW());

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO prm_Success; -- Duplicate
    
ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3 INTO prm_Success; -- Already updated

ELSE 
	SELECT 4 INTO prm_Success; -- Other error
END IF;




END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatient!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatient(
IN prm_Username VARCHAR(128),
IN prm_EmergencyCaseId int(11),
IN prm_Position int(11),
IN prm_AnimalTypeId int(11),
IN prm_TagNumber varchar(5),
OUT prm_OutPatientId INT,
OUT prm_Success INT)

BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to insert a new Patient.
*/
DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;
DECLARE vTagExists INT;

SET vPatientExists = 0;
SET vTagExists = 0;


SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE EmergencyCaseId = prm_EmergencyCaseId AND Position = prm_Position;

SELECT COUNT(1) INTO vTagExists FROM AAU.Patient WHERE TagNumber = prm_TagNumber;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 AND vTagExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.Patient
		(
        OrganisationId,        
        EmergencyCaseId,
		Position,
		AnimalTypeId,
		TagNumber
		)
		VALUES
		(
        vOrganisationId,        
        prm_EmergencyCaseId,
		prm_Position,
		prm_AnimalTypeId,
		prm_TagNumber
		);
        
COMMIT;

	SELECT 1 INTO prm_Success;
    SELECT LAST_INSERT_ID() INTO prm_OutPatientId;      

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_OutPatientId,'Patient','Insert', NOW());

ELSEIF vPatientExists > 0 THEN

	SELECT 2 INTO prm_Success;

ELSEIF vTagExists > 0 THEN

	SELECT 3 INTO prm_Success;
    
ELSE

	SELECT 4 INTO prm_Success;
END IF;




END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientProblem!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatientProblem (
IN prm_UserName VARCHAR(64),
IN prm_PatientId INT,
IN prm_ProblemId INT,
OUT prm_Success INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 24/02/2020
Purpose: Used to insert patient problems
*/

DECLARE vOrganisationId INT;

DECLARE vPatientProblemCount INT;
SET vPatientProblemCount = 0;

SELECT COUNT(1) INTO vPatientProblemCount FROM AAU.PatientProblem WHERE PatientId = prm_PatientId
													AND ProblemId = prm_ProblemId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;                                                    
                                                    
IF vPatientProblemCount = 0 THEN

START TRANSACTION;

INSERT INTO AAU.PatientProblem
		(PatientId, OrganisationId, ProblemId)
	VALUES
		(prm_PatientId, vOrganisationId, prm_ProblemId);
		
COMMIT;
        
SELECT 1 INTO prm_Success;

ELSEIF vPatientProblemCount > 0 THEN

SELECT 2 INTO prm_Success;

ELSE

SELECT 3 INTO prm_Success;

END IF;



END$$
DELIMITER ;DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateCaller!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateCaller(
									IN prm_CallerId INT,
									IN prm_Name VARCHAR(128),
									IN prm_PreferredName VARCHAR(128),
									IN prm_Number VARCHAR(128),
									IN prm_AlternativeNumber VARCHAR(128),
									IN prm_Email VARCHAR(128),
									IN prm_Address VARCHAR(512),
                                    IN prm_UserName VARCHAR(64),
									OUT prm_OutCallerId INT,
									OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to update a Caller.
*/
DECLARE vOrganisationId INT;

DECLARE vCallerExists INT;
SET vCallerExists = 0;

SELECT prm_CallerId INTO prm_OutCallerId;

SELECT COUNT(1) INTO vCallerExists FROM AAU.Caller WHERE CallerId <> prm_CallerId
AND Name = prm_Name
AND Number = prm_Number;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vCallerExists = 0 THEN

START TRANSACTION;

	UPDATE AAU.Caller SET
			Name              =	prm_Name,
			PreferredName     =	prm_PreferredName,
			Number            =	prm_Number,
			AlternativeNumber =	prm_AlternativeNumber,
			Email             =	prm_Email,
			Address           =	prm_Address
			WHERE CallerId = prm_CallerId;
   
COMMIT;         
            
    SELECT 1 INTO prm_Success;
    
    
    
    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_CallerId,'Caller','Update', NOW());

ELSEIF vCallerExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateEmergencyCase!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateEmergencyCase(
									IN prm_EmergencyCaseId INT,
									IN prm_EmergencyNumber INT,
									IN prm_CallDateTime DATETIME,
									IN prm_DispatcherId INT,
									IN prm_EmergencyCodeId INT,
									IN prm_CallerId INT,
									IN prm_CallOutcomeId INT,
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DOUBLE(11,8),
									IN prm_Longitude DECIMAL(11,8),
									IN prm_Rescuer1Id INT,
									IN prm_Rescuer2Id INT,
									IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME,
									IN prm_IsDeleted BOOLEAN,
                                    IN prm_DeletedDate DATETIME,
									IN prm_UserName VARCHAR(64),
									OUT prm_OutEmergencyCaseId INT,
									OUT prm_Success VARCHAR(64))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to update a case.
*/

DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT prm_EmergencyCaseId INTO prm_OutEmergencyCaseId;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.EmergencyCase WHERE EmergencyCaseId <> prm_EmergencyCaseId AND EmergencyNumber = prm_EmergencyNumber;

SELECT IFNULL(MAX(UpdateTime), '1901-01-01') INTO vUpdateTime FROM AAU.EmergencyCase WHERE EmergencyCaseId = prm_EmergencyCaseId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists = 0 AND prm_UpdateTime > vUpdateTime THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET
						EmergencyNumber        = prm_EmergencyNumber,
						CallDateTime           = prm_CallDateTime,
						DispatcherId           = prm_DispatcherId,
						EmergencyCodeId        = prm_EmergencyCodeId,
						CallerId           	   = prm_CallerId,
						CallOutcomeId          = prm_CallOutcomeId,
						Location               = prm_Location,
						Latitude               = prm_Latitude,
						Longitude              = prm_Longitude,
						Rescuer1Id             = prm_Rescuer1Id,
						Rescuer2Id             = prm_Rescuer2Id,
						AmbulanceArrivalTime   = prm_AmbulanceArrivalTime,
						RescueTime             = prm_RescueTime,
						AdmissionTime          = prm_AdmissionTime,
						IsDeleted			   = prm_IsDeleted,
                        DeletedDate			   = prm_DeletedDate,
                        UpdateTime			   = prm_UpdateTime
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

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatient!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdatePatient(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
									IN prm_EmergencyCaseId INT,
									IN prm_Position INT,
									IN prm_AnimalTypeId INT,
									IN prm_TagNumber varchar(5),
                                    IN prm_IsDeleted boolean,
                                    OUT prm_OutPatientId INT,
									OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to update a patient.
*/

DECLARE vOrganisationId INT;

DECLARE vPatientExists INT;
SET vPatientExists = 0;

SELECT prm_PatientId INTO prm_OutPatientId;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE PatientId <> prm_PatientId
AND EmergencyCaseId = prm_EmergencyCaseId
AND Position = prm_Position;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 THEN

START TRANSACTION;

	UPDATE AAU.Patient SET
			Position		= prm_Position,
			AnimalTypeId	= prm_AnimalTypeId,
			TagNumber		= prm_TagNumber,
            IsDeleted		= prm_IsDeleted,
            DeletedDate		= CASE
								WHEN prm_IsDeleted = FALSE THEN NULL
                                WHEN prm_IsDeleted = TRUE AND DeletedDate IS NULL THEN NOW()
							  END
								
	WHERE PatientId = prm_PatientId;
   
COMMIT;         
            
    SELECT 1 INTO prm_Success;
    
    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_PatientId,'Patient','Update', NOW());

ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientStatus!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatientStatus(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
                                    IN prm_PatientStatusId INT,
                                    IN prm_PatientStatusDate DATETIME,
                                    IN prm_PN CHAR(1),
                                    IN prm_SuspectedRabies TINYINT,
									OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to update the status of a patient.
*/

DECLARE vOrganisationId INT;

DECLARE vPatientExists INT;
SET vPatientExists = 0;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE PatientId = prm_PatientId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 1 THEN

START TRANSACTION;

	UPDATE AAU.Patient SET
			PatientStatusId = prm_PatientStatusId,
            PatientStatusDate = prm_PatientStatusDate,
            PN = prm_PN,
            SuspectedRabies = prm_SuspectedRabies
	WHERE PatientId = prm_PatientId;
   
COMMIT;         
            
    SELECT 1 INTO prm_Success;
    
    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_PatientId,'Patient',CONCAT('Update Status Id: ', prm_PatientStatusId), NOW());

ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;

END$$
DELIMITER ;
