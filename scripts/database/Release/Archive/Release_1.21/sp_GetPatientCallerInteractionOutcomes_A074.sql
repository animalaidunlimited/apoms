DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientCallerInteractionOutcomes !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientCallerInteractionOutcomes (IN prm_Username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT PatientCallInteractionOutcomeId AS `PatientCallOutcomeId`, PatientCallInteractionOutcome AS `PatientCallOutcome`, IsDeleted, SortOrder FROM AAU.PatientCallerInteractionOutcome WHERE OrganisationId = vOrganisationId;

END$$
DELIMITER ;
