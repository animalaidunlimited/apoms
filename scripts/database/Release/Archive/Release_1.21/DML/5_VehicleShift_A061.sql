CREATE TABLE `AAU`.`VehicleShift` (
  `VehicleShiftId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `VehicleId` INT NOT NULL,
  `StartDate` DATETIME NULL,
  `EndDate` DATETIME NULL,
  `CreatedDate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdateDate` DATETIME NULL,
  `IsDeleted` TINYINT NULL,
  `DeletedDate` DATETIME NULL,
  PRIMARY KEY (`VehicleShiftId`),
  INDEX `FK_VehicleShiftVehicleId_VehicleListVehicleId_idx` (`VehicleId` ASC) VISIBLE,
  INDEX `FK_VehicleShiftOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_VehicleShiftVehicleId_VehicleListVehicleId`
    FOREIGN KEY (`VehicleId`)
    REFERENCES `AAU`.`Vehicle` (`VehicleId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_VehicleShiftOrganisationId_OrganisationOrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);