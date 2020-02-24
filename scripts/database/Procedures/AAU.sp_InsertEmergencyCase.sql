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
