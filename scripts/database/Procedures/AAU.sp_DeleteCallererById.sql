DELIMITER $$

DROP PROCEDURE IF EXISTS AAU.sp_DeleteCallerById$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE AAU.sp_DeleteCallerById(IN prm_CallerId INT, IN prm_Username VARCHAR(64), OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to delete Callers by id
*/
DECLARE vOrganisationId INT;

DECLARE vCallerCount INT;
SET vCallerCount = 0;



SELECT COUNT(1) INTO vCallerCount FROM AAU.Caller WHERE CallerId = prm_CallerId;
                                                    
                                                    
IF vCallerCount > 0 THEN

START TRANSACTION;

UPDATE AAU.Caller SET
IsDeleted = 1,
DeletedDate = NOW()
WHERE CallerId = prm_CallerId;
		
COMMIT;
        
SELECT 1 INTO prm_Success;  
   
  SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

  INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_CallerId,'Caller','Delete', NOW());

ELSE

SELECT 3 INTO prm_Success;

END IF;


END$$
DELIMITER ;



