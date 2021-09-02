DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
ALTER TABLE AAU.ReleaseDetails 
ADD COLUMN `AssignedVehicleId` INT NULL AFTER `ComplainerInformed`,
ADD COLUMN `AmbulanceAssignmentTime` DATETIME NULL AFTER `AssignedVehicleId`,
ADD INDEX `FK_ReleaseDetailsVehicleId_VehicleVehicleId_idx` (`AssignedVehicleId` ASC) VISIBLE;

ALTER TABLE `AAU`.`ReleaseDetails` 
ADD CONSTRAINT `FK_ReleaseDetailsVehicleId_VehicleVehicleId`
  FOREIGN KEY (`AssignedVehicleId`)
  REFERENCES `AAU`.`VehicleList` (`VehicleId`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	
