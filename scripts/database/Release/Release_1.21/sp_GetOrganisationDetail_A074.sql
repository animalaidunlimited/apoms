DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOrganisationDetail !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOrganisationDetail(IN prm_OrganisationId INT)
BEGIN
	SELECT 
		JSON_OBJECT(
        'organisationId', o.OrganisationId,
		'logoUrl', om.LogoURL,
		'address', om.Address,
		'name', o.Organisation,
        'driverViewDeskNumber', om.DriverViewDeskNumber,
        'vehicleDefaults', om.VehicleDefaults
		) AS Organisation
	FROM 
		AAU.OrganisationMetadata om
		INNER JOIN AAU.Organisation o ON o.OrganisationId = om.OrganisationId
	WHERE o.OrganisationId = prm_OrganisationId;
	
END$$

