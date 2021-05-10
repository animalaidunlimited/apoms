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