DELIMITER $$

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

CREATE PROCEDURE AAU.sp_DeletePatientById(IN prm_PatientId INT, IN prm_Username VARCHAR(64), OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to delete patient by id
*/
DECLARE vOrganisationId INT;

DECLARE vPatientCount INT;
SET vPatientCount = 0;

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
	VALUES (vOrganisationId, prm_Username,prm_CallerId,'Caller','Delete', NOW());
    
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
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEmergencyCaseById( IN prm_EmergencyCaseId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a case by ID.
*/

SELECT	c.EmergencyCaseId,
		c.EmergencyNumber,
		c.CallDateTime,
		c.DispatcherId,
		c.EmergencyCodeId,
		c.CallerId,
		c.CallOutcomeId,
		c.Location,
		c.Latitude,
		c.Longitude,
		c.Rescuer1Id,
		c.Rescuer2Id,
		c.AmbulanceArrivalTime,
		c.RescueTime,
		c.AdmissionTime
FROM AAU.EmergencyCase c
WHERE c.EmergencyCaseId = prm_EmergencyCaseId;

SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientById ( IN prm_PatientId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a Patient by ID.
*/

SELECT	
		PatientId,
		EmergencyCaseId,
		Position,
		AnimalTypeId,
		TagNumber,
		CreatedDate,
		IsDeleted,
		eletedDate
FROM AAU.Patient
WHERE PatientId = prm_PatientId;

SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
DELIMITER $$
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
									OUT prm_EmergencyCaseId INT,
									OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/02/2020
Purpose: Used to insert a new emergency case.
*/
DECLARE vOrganisationId INT;

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_EmergencyNumber;

IF vEmNoExists = 0 THEN

START TRANSACTION;

INSERT INTO AAU.EmergencyCase
(
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
	AdmissionTime
)
VALUES
(
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
	prm_AdmissionTime
);

COMMIT;

	SELECT 1 INTO prm_Success;
    SELECT LAST_INSERT_ID() INTO prm_EmergencyCaseId;
  
	SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_CallerId,'EmergencyCase','Insert', NOW());

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO prm_Success; -- Duplicate

ELSE

	SELECT 3 INTO prm_Success; -- Other error
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
SET vPatientExists = 0;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE EmergencyCaseId = prm_EmergencyCaseId AND Position = prm_Position;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 THEN

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
	VALUES (vOrganisationId, prm_Username,prm_CallerId,'Patient','Insert', NOW());

ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
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
		(OrganisationId, PatientId, ProblemId)
	VALUES
		(vOrganisationId, prm_PatientId, prm_ProblemId);
		
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
									IN prm_IsDeleted BOOLEAN,
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

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT prm_EmergencyCaseId INTO prm_OutEmergencyCaseId;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.EmergencyCase WHERE EmergencyCaseId <> prm_EmergencyCaseId AND EmergencyNumber = prm_EmergencyNumber;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists = 0 THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET
						EmergencyNumber        = prm_EmergencyNumber,
						CallDateTime           = prm_CallDateTime,
						DispatcherId           = prm_DispatcherId,
						EmergencyCodeId        = prm_EmergencyCodeId,
						CallerId           = prm_CallerId,
						CallOutcomeId          = prm_CallOutcomeId,
						Location               = prm_Location,
						Latitude               = prm_Latitude,
						Longitude              = prm_Longitude,
						Rescuer1Id             = prm_Rescuer1Id,
						Rescuer2Id             = prm_Rescuer2Id,
						AmbulanceArrivalTime   = prm_AmbulanceArrivalTime,
						RescueTime             = prm_RescueTime,
						AdmissionTime          = prm_AdmissionTime,
						IsDeleted			   = prm_IsDeleted
			WHERE EmergencyCaseId = prm_EmergencyCaseId;

COMMIT;

    SELECT 1 INTO prm_Success;

    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_EmergencyCaseId,'EmergencyCase','Update', NOW());

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
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
			TagNumber		= prm_TagNumber
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
