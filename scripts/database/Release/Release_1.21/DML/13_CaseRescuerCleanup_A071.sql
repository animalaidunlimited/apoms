

-- Check which user is the self user
SELECT * FROM AAU.User WHERE FirstName = 'Self';

START TRANSACTION;

SELECT *
FROM AAU.EmergencyCase
WHERE AdmittedByUserId IS NOT NULL
AND AdmittedByUserId <> DispatcherId

UPDATE AAU.EmergencyCase SET SelfAdmission = 1 WHERE Rescuer1Id = 28 OR Rescuer2Id = 28;
UPDATE AAU.EmergencyCase SET Rescuer1Id = IF(Rescuer1Id = 28, NULL, Rescuer1Id), Rescuer2Id = IF(Rescuer2Id = 28, NULL, Rescuer2Id);

UPDATE AAU.EmergencyCase SET Rescuer1Id = Rescuer2Id, Rescuer2Id = NULL WHERE Rescuer1Id IS NULL AND Rescuer2Id IS NOT NULL;
UPDATE AAU.EmergencyCase SET Rescuer2Id = NULL WHERE Rescuer1Id = Rescuer2Id;

UPDATE AAU.EmergencyCase SET AdmittedByUserId = Rescuer1Id, Rescuer1Id = NULL, SelfAdmission = 1 WHERE Rescuer1Id IS NOT NULL AND Rescuer2Id IS NULL;

-- COMMIT;

/*
ALTER TABLE `AAU`.`EmergencyCase` DROP FOREIGN KEY `FK_EmergencyCaseAdmittedByUserId_UserUserId`;
ALTER TABLE `AAU`.`EmergencyCase` DROP INDEX `FK_EmergencyCaseAdmittedByUserId_UserUserId_idx`;
ALTER TABLE `AAU`.`EmergencyCase` DROP COLUMN `AdmittedByUserId`;
*/

DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;

ALTER TABLE `AAU`.`EmergencyCase` 
ADD COLUMN `AdmittedByUserId` INT(11) NULL AFTER `AmbulanceAssignmentTime`,
ADD COLUMN `SelfAdmission` TINYINT NULL AFTER `AdmittedByUserId`,
ADD INDEX `FK_EmergencyCaseAdmittedByUserId_UserUserId_idx` (`AdmittedByUserId` ASC) VISIBLE;

ALTER TABLE `AAU`.`EmergencyCase` 
ADD CONSTRAINT `FK_EmergencyCaseAdmittedByUserId_UserUserId`
  FOREIGN KEY (`AdmittedByUserId`)
  REFERENCES `AAU`.`User` (`Userid`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	

SELECT *
FROM AAU.Emer