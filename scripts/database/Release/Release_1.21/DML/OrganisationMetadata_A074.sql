CREATE TABLE AAU.OrganisationMetaData (
	OrganisationMetaDataId int(11) NOT NULL AUTO_INCREMENT,
	OrganisationId int(11) NOT NULL,
	LogoURL varchar(500) NULL,
	Address json DEFAULT NULL,
    DriverViewDeskNumber VARCHAR(20) NULL,
    VehicleDefaults JSON NULL,
	PRIMARY KEY (OrganisationId),
	UNIQUE KEY OrganisationId (OrganisationMetaDataId)
);

ALTER TABLE `AAU`.`OrganisationMetaData` 
ADD CONSTRAINT `FK_OrganisationMetaData_Organisation`
  FOREIGN KEY (`OrganisationId`)
  REFERENCES `AAU`.`Organisation` (`OrganisationId`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
