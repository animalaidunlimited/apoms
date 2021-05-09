DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  ALTER TABLE `AAU`.`Patient` 
  ADD COLUMN `PatientCallOutcomeId` INT NULL DEFAULT NULL AFTER `KnownAsName`;
  ALTER TABLE `AAU`.`Patient` 
  ADD COLUMN `SameAsNumber` INT NULL DEFAULT NULL AFTER `PatientCallOutcomeId`;
  
  IF (SELECT COUNT(1) FROM AAU.Patient WHERE PatientCallOutcomeId IS NOT NULL) = 0 THEN
  UPDATE AAU.Patient p
  INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
  SET p.PatientCallOutcomeId = ec.CallOutcomeId;
  
  END IF;
  
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;
