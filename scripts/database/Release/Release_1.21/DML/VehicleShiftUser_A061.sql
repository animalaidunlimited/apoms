CREATE TABLE `AAU`.`VehicleShiftUser` (
  `VehicleShiftUserId` INT NOT NULL AUTO_INCREMENT,
  `VehicleShiftId` INT NOT NULL,
  `UserId` INT NOT NULL,
  `CreatedDate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`VehicleShiftUserId`),
  INDEX `FK_VehicleShiftUserVehicleShiftId_VehicleShiftVehicleShiftI_idx` (`VehicleShiftId` ASC) VISIBLE,
  CONSTRAINT `FK_VehicleShiftUserVehicleShiftId_VehicleShiftVehicleShiftId`
    FOREIGN KEY (`VehicleShiftId`)
    REFERENCES `AAU`.`VehicleShift` (`VehicleShiftId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_VehicleShiftUserUserId_UserUserId`
    FOREIGN KEY (`UserId`)
    REFERENCES `AAU`.`User` (`UserId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
