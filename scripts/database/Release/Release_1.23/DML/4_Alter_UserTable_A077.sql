DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
    
	ALTER TABLE `AAU`.`User` ADD COLUMN `FixedDayOff` JSON NOT NULL AFTER `DateTimeOffsetHours`;
    ALTER TABLE `AAU`.`User` ADD COLUMN `DepartmentId` TINYINT NOT NULL AFTER `FixedDayOff`;
    ALTER TABLE `AAU`.`User` ADD COLUMN `LocalName` VARCHAR(64) CHARACTER SET UTF8MB4 NULL AFTER `DepartmentId`;
    
  
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;

