DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertDropdownTableValue !!

-- CALL AAU.sp_UpsertDropdownTableValue("Jim","AnimalType",-1,"Crow",0,28);

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

	SET @statement = CONCAT('SET @Id = -1;

SELECT IF(', prm_ElementId, ' = -1, MAX(',prm_TableName,'Id) + 1, ', prm_ElementId,' ) INTO @Id FROM AAU.',prm_TableName,'; 
    
    INSERT INTO AAU.',prm_TableName,' (',prm_TableName, 'Id, OrganisationId, ', prm_TableName,', ',
    'IsDeleted, SortOrder) VALUES (@Id, ', vOrganisationId, ', ''', prm_ElementValue, ''', ', prm_IsDeleted, ', ', prm_SortOrder,') ON DUPLICATE KEY UPDATE ', 
	prm_TableName, ' = ''', prm_ElementValue, ''', IsDeleted = ', prm_IsDeleted, ', SortOrder = ', prm_SortOrder, ';' );
	
    PREPARE stmt FROM @statement;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId,ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId,prm_Username,prm_ElementId,prm_TableName,'Upsert record', NOW());
 
    SELECT 'success' AS `success`;
  
END;


