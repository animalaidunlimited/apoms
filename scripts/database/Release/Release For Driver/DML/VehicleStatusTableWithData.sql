CREATE TABLE IF NOT EXISTS AAU.VehicleStatus (
  `VehicleStatusId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NULL,
  `VehicleStatus` VARCHAR(45) NULL,
  `CreatedDate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`VehicleStatusId`));




DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
	INSERT INTO AAU.VehicleStatus (OrganisationId,VehicleStatus) VALUES (1,'Active');

	INSERT INTO AAU.VehicleStatus (OrganisationId,VehicleStatus) VALUES (1,'Inactive');

	INSERT INTO AAU.VehicleStatus (OrganisationId,VehicleStatus) VALUES (1,'Damaged');
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	