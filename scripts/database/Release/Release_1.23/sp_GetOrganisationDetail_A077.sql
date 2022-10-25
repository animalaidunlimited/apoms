DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOrganisationDetail !!

-- CALL AAU.sp_GetOrganisationDetail(1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOrganisationDetail( IN prm_OrganisationId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve the details and defaults for an Organisation

*/

	SELECT 
		JSON_OBJECT(
        'organisationId', o.OrganisationId,
		'logoUrl', om.LogoURL,
		'address', om.Address,
		'name', o.Organisation,
        'driverViewDeskNumber', om.DriverViewDeskNumber,
        'vehicleDefaults', om.VehicleDefaults,
        'rotaDefaults', om.RotaDefaults
		) AS Organisation
	FROM 
		AAU.OrganisationMetaData om
		INNER JOIN AAU.Organisation o ON o.OrganisationId = om.OrganisationId
	WHERE o.OrganisationId = prm_OrganisationId;
    
END$$

