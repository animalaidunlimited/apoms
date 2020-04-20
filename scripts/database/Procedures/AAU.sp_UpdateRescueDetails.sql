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
									OUT prm_Success INT,
                                    OUT prm_SocketEndPoint CHAR(3),
                                    OUT prm_RescueStatus INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to update the status of a patient.
*/

DECLARE vUpdateTime DATETIME;
DECLARE vOrganisationId INT;
DECLARE vCallOutcomeId INT;

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT COUNT(1), IFNULL(MAX(UpdateTime), '1901-01-01'), MAX(CallOutcomeId) INTO vEmNoExists, vUpdateTime, vCallOutcomeId FROM AAU.EmergencyCase WHERE EmergencyCaseId = prm_EmergencyCaseId;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, prm_SocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists = 1 AND prm_UpdateTime > vUpdateTime THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET						
						Rescuer1Id             = prm_Rescuer1Id,
						Rescuer2Id             = prm_Rescuer2Id,
						AmbulanceArrivalTime   = prm_AmbulanceArrivalTime,
						RescueTime             = prm_RescueTime,
						AdmissionTime          = prm_AdmissionTime,						
                        UpdateTime			   = prm_UpdateTime
			WHERE EmergencyCaseId = prm_EmergencyCaseId;

COMMIT;

    SELECT 1 INTO prm_Success;
    
        SET prm_RescueStatus = AAU.fn_GetRescueStatus(prm_Rescuer1Id, prm_Rescuer2Id, prm_AmbulanceArrivalTime, prm_RescueTime, prm_AdmissionTime, vCallOutcomeId);


    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_EmergencyCaseId,'EmergencyCase RescueDetails','Update ' & CAST(prm_RescueStatus AS CHAR(1)), NOW());    
       

ELSEIF vEmNoExists > 1 THEN

	SELECT 2 INTO prm_Success;

ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3 INTO prm_Success; -- Already updated

ELSEIF vUpdateTime > prm_UpdateTime THEN
	SELECT 4 INTO prm_Success; -- Emergency record already updated another time.
    
ELSE
	SELECT 5 INTO prm_Success; -- Other error   
END IF;

END$$
DELIMITER ;













