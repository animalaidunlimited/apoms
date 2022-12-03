DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotas !!

-- CALL AAU.sp_GetRotas('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotas( IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of rotas and their versions

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

WITH RotaVersionCTE AS
(
	SELECT rv.RotaId,
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("rotaVersionId", rv.RotaVersionId),
			JSON_OBJECT("rotaVersionName", rv.RotaVersionName),
            JSON_OBJECT("rotaId", rv.RotaId),
			JSON_OBJECT("defaultRotaVersion", IF(rv.DefaultRotaVersion = 1, CAST(TRUE AS JSON), CAST(FALSE AS JSON)))
			)) AS `RotaVersions`
	FROM AAU.RotaVersion rv
    WHERE rv.OrganisationId = vOrganisationId
    AND rv.IsDeleted <> 1
    GROUP BY rv.RotaId
)

	SELECT
		JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE(
		JSON_OBJECT("rotaId", r.RotaId),
        JSON_OBJECT("rotaName", r.RotaName),
        JSON_OBJECT("defaultRota", IF(r.DefaultRota = 1, CAST(TRUE AS JSON), CAST(FALSE AS JSON))),
        JSON_OBJECT("rotaVersions", rv.RotaVersions)
        )) AS `Rotas`
        -- ,r.y
    FROM AAU.Rota r
    INNER JOIN RotaVersionCTE rv ON rv.RotaId = r.RotaId
    WHERE r.OrganisationId = vOrganisationId
    AND r.IsDeleted <> 1;
    
END$$

