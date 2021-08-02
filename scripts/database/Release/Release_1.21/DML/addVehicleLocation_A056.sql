CREATE TABLE IF NOT EXISTS `AAU`.`VehicleLocation` (
  `VehicleLocationId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `VehicleId` INT NOT NULL,
  `Timestamp` DATETIME NOT NULL,
  `Latitude` DECIMAL(11,8) NOT NULL,
  `Longitude` DECIMAL(11,8) NOT NULL,
  `Speed` DOUBLE NULL,
  `Heading` DOUBLE NULL,
  `Accuracy` DOUBLE NULL,
  `Altitude` DOUBLE NULL,
  `AltitudeAccuracy` DOUBLE NULL,
  `CreatedDate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`VehicleLocationId`),
  INDEX `IX_VehicleLocation_Datetime` (`Timestamp` ASC, `VehicleId` ASC) VISIBLE,
  INDEX `FK_VehicleLocationVehicleId_VehicleVehicleId_idx` (`VehicleId` ASC) VISIBLE,
  CONSTRAINT `FK_VehicleLocationVehicleId_VehicleVehicleId`
    FOREIGN KEY (`VehicleId`)
    REFERENCES `AAU`.`Vehicle` (`VehicleId`),
INDEX `FK_VehicleLocationOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_VehicleLocationOrganisationId_OrganisationOrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`));

