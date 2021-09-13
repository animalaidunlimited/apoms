


CREATE TABLE IF NOT EXISTS AAU.Vehicle (
  `VehicleId` int NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `VehicleRegistrationNumber` varchar(100) DEFAULT NULL,
  `VehicleNumber` varchar(100) NOT NULL,
  `VehicleTypeId` int DEFAULT NULL,
  `LargeAnimalCapacity` int DEFAULT NULL,
  `SmallAnimalCapacity` int DEFAULT NULL,
  `VehicleStatusId` int DEFAULT NULL,
  `CreatedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `IsDeleted` tinyint DEFAULT '0',
  `DeletedDate` datetime DEFAULT NULL,
  `VehicleImage` varchar(650) DEFAULT NULL,
  `MinRescuerCapacity` int DEFAULT NULL,
  `MaxRescuerCapacity` int DEFAULT NULL,
  PRIMARY KEY (`VehicleId`),
  KEY `FK_VehicleVehicleTypeId_VehicleType_VehicleTypeId_idx` (`VehicleTypeId`),
  KEY `FK_VehicleVehicleStatusId_VehicleStatus_VehicleStatusId_idx` (`VehicleStatusId`),
  KEY `FK_VehicleOrganisationId_OrganisationOrganisationId_idx` (`OrganisationId` ASC),
  CONSTRAINT `FK_VehicleVehicleTypeId_VehicleType_VehicleTypeId` FOREIGN KEY (`VehicleTypeId`) REFERENCES AAU.VehicleType (`VehicleTypeId`),
  CONSTRAINT `FK_VehicleVehicleStatusId_VehicleStatus_VehicleStatusId` FOREIGN KEY (`VehicleStatusId`) REFERENCES AAU.VehicleType (`VehicleStatusId`),
  CONSTRAINT `FK_VehicleOrganisationId_OrganisationOrganisationId_idx` FOREIGN KEY (`OrganisationId`) REFERENCES AAU.Organisation (`OrganisationId`)
);
