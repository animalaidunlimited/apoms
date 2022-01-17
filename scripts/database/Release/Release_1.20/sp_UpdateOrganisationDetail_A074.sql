DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateOrganisationDetail !!

DELIMITER $$
CREATE  PROCEDURE AAU.sp_UpdateOrganisationDetail (
    IN prm_Address JSON,
	IN prm_Organisation VARCHAR(100),
	IN prm_OrganisationId INT
)
BEGIN
DECLARE vSuccess INT DEFAULT 0;

	UPDATE AAU.OrganisationMetadata om
    INNER JOIN AAU.Organisation o ON o.OrganisationId = prm_organisationId
		SET 
			om.Address = prm_Address,
			o.Organisation = prm_Organisation;
	
	SELECT 1 INTO vSuccess;
	SELECT vSuccess;
END$$