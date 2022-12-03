DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEditableDropdowns !!

-- CALL AAU.sp_GetEditableDropdowns('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEditableDropdowns( IN prm_UserName VARCHAR(45))

BEGIN

/*
Created By: Jim Mackenzie
Created On: 2022-01-19
Description: Procedure for getting dropdowns that are editable for the organisation settings page.
*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("dropdown", Dropdown),
	JSON_OBJECT("displayName", DisplayName),
    JSON_OBJECT("request", Request),
    JSON_OBJECT("tableName", TableName)
	)) EditableDropdowns
FROM AAU.EditableDropdown;

END$$
DELIMITER ;
