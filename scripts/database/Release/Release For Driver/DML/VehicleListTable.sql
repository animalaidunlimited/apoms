CREATE TABLE IF NOT EXISTS AAU.VehicleList (
  `VehicleId` int NOT NULL AUTO_INCREMENT,
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
  CONSTRAINT `FK_VehicleVehicleTypeId_VehicleType_VehicleTypeId` FOREIGN KEY (`VehicleTypeId`) REFERENCES AAU.VehicleType (`VehicleTypeId`)
);
