DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  ALTER TABLE `AAU`.`Patient` 
  ADD COLUMN `PatientCallOutcomeId` INT NULL DEFAULT NULL AFTER `KnownAsName`;
  ALTER TABLE `AAU`.`Patient` 
  ADD COLUMN `SameAsNumber` INT NULL DEFAULT NULL AFTER `PatientCallOutcomeId`;
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	