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
