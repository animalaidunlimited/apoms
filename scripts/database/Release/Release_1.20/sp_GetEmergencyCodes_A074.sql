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

