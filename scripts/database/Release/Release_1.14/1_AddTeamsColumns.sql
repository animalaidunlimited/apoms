DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  ALTER TABLE `AAU`.`Team` 
  CHANGE COLUMN `IsDeleted` `IsDeleted` TINYINT NOT NULL DEFAULT 0 ;
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	