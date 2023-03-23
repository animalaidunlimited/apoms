DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetBrokenCases !!

-- CALL AAU.sp_GetBrokenCases('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetBrokenCases( IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/03/2023
Purpose: Used to return the list of currently broken cases

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE Username = prm_Username;

SELECT 
	JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("brokenCaseDetailsId", bcd.BrokenCaseDetailsId),
			JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
			JSON_OBJECT("issue", bcd.Issue),
			JSON_OBJECT("updated",IF(bcd.Updated = 1, CAST(TRUE AS JSON), CAST(FALSE AS JSON)))
		)
    ) AS BrokenCaseDetails
FROM AAU.BrokenCaseDetails bcd
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = bcd.EmergencyCaseId
WHERE ec.OrganisationId = vOrganisationId;

END$$
DELIMITER ;
