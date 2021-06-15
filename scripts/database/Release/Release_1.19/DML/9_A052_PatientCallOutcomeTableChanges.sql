DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  UPDATE AAU.PatientCallOutcome SET `PatientCallOutcome` = 'Not reachable - Try again' WHERE (`PatientCallOutcomeId` = '2');
  UPDATE AAU.PatientCallOutcome SET `PatientCallOutcome` = 'Not possible to complete' WHERE (`PatientCallOutcomeId` = '3');
  DELETE FROM AAU.PatientCallOutcome WHERE (`PatientCallOutcomeId` = '4');
  ALTER TABLE AAU.PatientCallOutcome
  RENAME TO  AAU.PatientCallerInteractionOutcome;
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	


DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  ALTER TABLE AAU.PatientCallerInteractionOutcome 
  CHANGE COLUMN `PatientCallerInteractionOutcomeId` `PatientCallerInteractionOutcomeId` INT(11) NOT NULL AUTO_INCREMENT ,
  CHANGE COLUMN `PatientCallerInteractionOutcome` `PatientCallerInteractionOutcome` VARCHAR(64) NULL DEFAULT NULL ;

END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	