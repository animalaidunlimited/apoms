DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateEmergencyRegisterOutcome !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateEmergencyRegisterOutcome(
IN prm_Username VARCHAR(128),
IN prm_EmergencyCaseId INT,
IN prm_CallOutcomeId INT,
IN prm_SameAsNumber INT,
IN prm_UpdateTime DATETIME)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 02/05/2020
Purpose: Used to update a Call Outcome Id for a case.

Modified by: Jim Mackenzie
Modified On: 22/12/2022
Modification: Removing out parameters
*/

DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;
DECLARE vEmergencyCaseExists INT;
DECLARE vSameAsEmergencyCaseId INT;
DECLARE vSuccess INT;
DECLARE vSocketEndPoint VARCHAR(6);

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;
SET vEmergencyCaseExists = 0;
SET vSuccess = 0;

SELECT COUNT(1), MAX(EmergencyCaseId) INTO vEmNoExists, vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsNumber;

SELECT IFNULL(MAX(UpdateTime), '1901-01-01'), COUNT(EmergencyCaseId) INTO vUpdateTime, vEmergencyCaseExists FROM AAU.EmergencyCase WHERE EmergencyCaseId = prm_EmergencyCaseId;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists <= 1 AND vEmergencyCaseExists = 1 AND prm_UpdateTime >= vUpdateTime THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET
						CallOutcomeId   		= prm_CallOutcomeId,
                        SameAsEmergencyCaseId	= vSameAsEmergencyCaseId
			WHERE EmergencyCaseId = prm_EmergencyCaseId;

COMMIT;

    SELECT 1 INTO vSuccess;

    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_EmergencyCaseId,'EmergencyCase','Update Outcome', NOW());

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3 INTO vSuccess; -- Already updated
    
ELSE
	SELECT 4 INTO vSuccess; -- Other error   
END IF;
    
	CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, null);
    
    SELECT vSuccess AS `success`, vSocketEndPoint AS `socketEndPoint`;

END$$
DELIMITER ;
