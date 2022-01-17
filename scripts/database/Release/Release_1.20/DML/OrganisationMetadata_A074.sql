CREATE TABLE AAU.OrganisationMetadata (
	OrganisationMetadataId int(11) NOT NULL AUTO_INCREMENT,
	OrganisationId int(11) NOT NULL,
	LogoURL varchar(500) NULL,
	Address json DEFAULT NULL,
	Branches varchar(45) NULL,
	PRIMARY KEY (OrganisationMetaDataId),
	UNIQUE KEY OrganisationId (OrganisationId)
)
