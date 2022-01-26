CREATE TABLE AAU.OrganisationMetadata (
	OrganisationMetadataId int(11) NOT NULL AUTO_INCREMENT,
	OrganisationId int(11) NOT NULL,
	LogoURL varchar(500) NULL,
	Address json DEFAULT NULL,
	PRIMARY KEY (OrganisationId),
	UNIQUE KEY OrganisationId (OrganisationMetaDataId)
);

ALTER TABLE `AAU`.`OrganisationMetadata` 
ADD CONSTRAINT `FK_OrganisationMetadata_Organisation`
  FOREIGN KEY (`OrganisationId`)
  REFERENCES `AAU`.`Organisation` (`OrganisationId`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
