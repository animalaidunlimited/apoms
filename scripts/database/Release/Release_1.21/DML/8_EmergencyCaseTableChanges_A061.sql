DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
ALTER TABLE `AAU`.`EmergencyCase` 
ADD COLUMN `AssignedVehicleId` INT NULL AFTER `Longitude`,
ADD COLUMN `AmbulanceAssignmentTime` DATETIME NULL AFTER `AssignedVehicleId`,
ADD INDEX `FK_EmergencyCaseAssignedAmbulanceId_VehicleListVehicleId_idx` (`AssignedVehicleId` ASC) VISIBLE;

ALTER TABLE `AAU`.`EmergencyCase` 
ADD CONSTRAINT `FK_EmergencyCaseAssignedAmbulanceId_VehicleListVehicleId`
  FOREIGN KEY (`AssignedVehicleId`)
  REFERENCES `AAU`.`VehicleList` (`VehicleId`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	