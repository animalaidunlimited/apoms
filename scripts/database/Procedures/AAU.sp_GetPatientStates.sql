DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientStates!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientStates(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT PatientStatusId, PatientStatus FROM AAU.PatientStatus WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
DELIMITER ;