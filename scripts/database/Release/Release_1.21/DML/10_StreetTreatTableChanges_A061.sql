DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
ALTER TABLE AAU.StreetTreatCase 
ADD COLUMN `AssignedVehicleId` INT NULL AFTER `OrganisationId`,
ADD COLUMN `AmbulanceAssignmentTime` DATETIME NULL AFTER `AssignedVehicleId`,
ADD INDEX `FK_StreetTreatCaseVehicleId_VehicleVehicleId_idx` (`AssignedVehicleId` ASC) VISIBLE;

ALTER TABLE `AAU`.`StreetTreatCase` 
ADD CONSTRAINT `FK_StreetTreatCaseVehicleId_VehicleVehicleId`
  FOREIGN KEY (`AssignedVehicleId`)
  REFERENCES `AAU`.`VehicleList` (`VehicleId`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	
