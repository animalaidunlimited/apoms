DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertDropdownTableValue !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertDropdownTableValue(IN prm_Username VARCHAR(45), IN prm_TableName VARCHAR(45), IN prm_ElementId INT, IN prm_ElementValue VARCHAR(100), IN prm_IsDeleted INT, IN prm_SortOrder INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 08/05/2019
Purpose: Used to return list of main problems for cases.
*/

	DECLARE vOrganisationId INT;
	SET vOrganisationId = 1;

	SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

	SET @statement = CONCAT('UPDATE AAU.',prm_TableName,' SET ',prm_TableName, 'Id = ', prm_ElementId, ', ',
	prm_TableName, ' = ''', prm_ElementValue, ''', IsDeleted = ', prm_IsDeleted, ', SortOrder = ', prm_SortOrder, ' WHERE OrganisationId = ', OrganisationId, ';' );

    PREPARE stmt FROM @statement;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END;



