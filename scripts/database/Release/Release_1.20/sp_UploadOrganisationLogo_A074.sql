DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UploadOrganisationLogo !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UploadOrganisationLogo( 
			IN prm_remoteURL VARCHAR(500),
			IN prm_organisationId INT
)
BEGIN

DECLARE vSuccess INT;

	INSERT INTO AAU.OrganisationMetadata(LogoURL,OrganisationId) 
	VALUES (prm_remoteURL, prm_organisationId) 
	ON DUPLICATE KEY UPDATE LogoURL = prm_remoteURL;

SELECT 1 INTO vSuccess;
SELECT vSuccess;

END$$
DELIMITER ;