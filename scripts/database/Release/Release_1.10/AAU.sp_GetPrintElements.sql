DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPrintableElements!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPrintableElements(IN prm_Username VARCHAR(128))

BEGIN

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
	pe.PrintableElementId as printableElementId,
	pe.Name as name,
	pe.Example as example
FROM AAU.PrintableElement pe
WHERE pe.OrganisationId = vOrganisationId;

END$$
DELIMITER ;