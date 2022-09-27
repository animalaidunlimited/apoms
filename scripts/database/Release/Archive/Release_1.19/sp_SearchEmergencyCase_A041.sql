DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_SearchEmergencyCase !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_SearchEmergencyCase( IN prm_Username VARCHAR(45), OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 08/03/2020
Purpose: Used to return search for cases and bring back the required details
*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT	ec.EmergencyCaseId,
		ec.EmergencyNumber,
		ec.CallDateTime,
		ec.CallerId,
        c.Name,
        c.Number,
        at.AnimalTypeId,
        at.AnimalType,
        p.TagNumber,
		p.PatientCallOutcomeId,
		ec.Location,
		ec.Latitude,
		ec.Longitude
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
WHERE ec.OrganisationId = vOrganisationId
LIMIT 20;

SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
