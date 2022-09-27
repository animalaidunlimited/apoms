CREATE TABLE IF NOT EXISTS AAU.VehicleType (
  `VehicleTypeId` int NOT NULL AUTO_INCREMENT,
  `VehicleType` varchar(45) DEFAULT NULL,
  `OrganisationId` int DEFAULT NULL,
  `CreatedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`VehicleTypeId`),
  UNIQUE KEY `VehicleTypeId_UNIQUE` (`VehicleTypeId`)
);


DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
	
	INSERT INTO AAU.VehicleType (`VehicleType`, `OrganisationId`) VALUES ('Van', '1');
	INSERT INTO AAU.VehicleType (`VehicleType`, `OrganisationId`) VALUES ('Truck', '1');
	INSERT INTO AAU.VehicleType (`VehicleType`, `OrganisationId`) VALUES ('Cow Truck', '1');
    INSERT INTO AAU.VehicleType (`VehicleType`, `OrganisationId`) VALUES ('Two Wheeler', '1');

END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	