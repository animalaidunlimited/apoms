DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
	ALTER TABLE AAU.OrganisationMetadata ADD COLUMN RotaDefaults JSON NULL;
  
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;
