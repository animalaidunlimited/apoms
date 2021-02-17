-- ADD COLUMN GUIS TO THE TABLE
DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
ALTER TABLE AAU.EmergencyCase ADD COLUMN `GUID` VARCHAR(128) NOT NULL AFTER `EmergencyCaseId`;
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	

-- WE NEED TO MANUALLY SET THE LAST GUID TO ANY DUMMY STRING
-- GUID = 'XYZ123'


-- To make EmergencyCodeId to be null first update the values where EmergencyCodeId is -1

UPDATE AAU.EmergencyCase
SET EmergencyCodeId = NULL
WHERE EmergencyCodeId = 4;

-- SET EMERGENCYCODEID TO BE NULL 
ALTER TABLE AAU.EmergencyCase 
DROP FOREIGN KEY `FK_EmergencyCaseEmergencyCodeId_EmergencyCodeEmergencyCodeId`;
ALTER TABLE AAU.EmergencyCase 
CHANGE COLUMN `EmergencyCodeId` `EmergencyCodeId` INT NULL ;
ALTER TABLE AAU.EmergencyCase 
ADD CONSTRAINT `FK_EmergencyCaseEmergencyCodeId_EmergencyCodeEmergencyCodeId`
  FOREIGN KEY (`EmergencyCodeId`)
  REFERENCES AAU.EmergencyCode (`EmergencyCodeId`);
  
-- Now we don't need the not defined as emergency code.
DELETE FROM AAU.EmergencyCode 
WHERE EmergencyCodeId = 4;








