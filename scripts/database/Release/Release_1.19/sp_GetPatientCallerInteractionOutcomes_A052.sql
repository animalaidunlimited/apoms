DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientCallerInteractionOutcomes !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientCallOutcomes !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientCallerInteractionOutcomes(IN prm_Username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT PatientCallerInteractionOutcomeId, PatientCallerInteractionOutcome FROM AAU.PatientCallerInteractionOutcome WHERE OrganisationId = vOrganisationId AND IsDeleted = 0;

END$$
DELIMITER ;
