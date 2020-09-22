DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPaperDimensions!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPaperDimensions(IN prm_Username VARCHAR(128))

BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/09/20202
Purpose: Used to return the paper dimensions
*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
		pd.PaperDimensionsId as paperDimensionsId,
		pd.Name as name,
		pd.Height as height,
		pd.Width as width
FROM AAU.PaperDimensions pd
WHERE pd.OrganisationId = vOrganisationId;

END$$
DELIMITER ;