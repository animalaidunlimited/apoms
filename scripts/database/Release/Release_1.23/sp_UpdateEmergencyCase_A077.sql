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
                                    IN prm_Comments VARCHAR(650) CHARACTER SET UTF8MB4,
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DECIMAL(11,8),
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
                                    IN prm_SelfAdmission BOOLEAN)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to update a case.

Modified by: Jim Mackenzie
Modified On: 22/12/2022
Modification: Removing out parameters
*/

DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;
DECLARE vSuccess INT;
DECLARE vSameAsEmergencyCaseId INT;
DECLARE vSocketEndPoint VARCHAR(6);

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.EmergencyCase WHERE EmergencyCaseId <> prm_EmergencyCaseId AND EmergencyNumber = prm_EmergencyNumber;

SELECT IFNULL(MAX(UpdateTime), '1901-01-01') INTO vUpdateTime FROM AAU.EmergencyCase WHERE EmergencyCaseId = prm_EmergencyCaseId;

-- SELECT MAX(EmergencyCaseId) INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsNumber;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists = 0 AND prm_UpdateTime >= vUpdateTime THEN

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

    SELECT 1 INTO vSuccess;

    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_EmergencyCaseId,'EmergencyCase','Update', NOW());  
	

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3 INTO vSuccess; -- Already updated

ELSEIF prm_UpdateTime > vUpdateTime THEN
	SELECT 4 INTO vSuccess; -- Emergency record already updated another time.
    
ELSE
	SELECT 5 INTO vSuccess; -- Other error   
END IF;

SELECT prm_EmergencyCaseId AS `emergencyCaseId`, vSuccess AS `success`, vSocketEndPoint AS `socketEndPoint`;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, NULL, "Rescue");

END$$
DELIMITER ;
