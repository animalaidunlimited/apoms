DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertOrganisationDetail !!

DELIMITER $$

-- CALL AAU.sp_UpsertOrganisationDetail('{"Address": "123 Tree Street"}', 'Sarvoham', 2);

CREATE PROCEDURE AAU.sp_UpsertOrganisationDetail (
    IN prm_Address JSON,
	IN prm_Organisation VARCHAR(100),
    IN prm_DriverViewDeskNumber VARCHAR(20),
	IN prm_OrganisationId INT,
    IN prm_VehicleDefaults JSON,
    IN prm_RotaDefaults JSON
)
BEGIN
DECLARE vSuccess INT DEFAULT 0;

UPDATE AAU.Organisation SET Organisation = prm_Organisation WHERE OrganisationId = prm_OrganisationId;

INSERT INTO AAU.OrganisationMetaData (Address, OrganisationId, DriverViewDeskNumber, VehicleDefaults, RotaDefaults)
VALUES (prm_Address, prm_OrganisationId, prm_DriverViewDeskNumber, prm_VehicleDefaults, prm_RotaDefaults) ON DUPLICATE KEY UPDATE
			Address = prm_Address,
            DriverViewDeskNumber = prm_DriverViewDeskNumber,
            VehicleDefaults = prm_VehicleDefaults,
            RotaDefaults = prm_RotaDefaults;
	
	SELECT 1 INTO vSuccess;
	SELECT vSuccess;
    
END$$
