DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
	ALTER TABLE AAU.Problem
	ADD COLUMN SortOrder INT NULL AFTER Problem;
    
    ALTER TABLE AAU.Problem CHANGE COLUMN ProblemStripped ProblemStripped VARCHAR(45) NULL;
    
    ALTER TABLE AAU.Problem DROP INDEX `Problem_UNIQUE`;
  
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;