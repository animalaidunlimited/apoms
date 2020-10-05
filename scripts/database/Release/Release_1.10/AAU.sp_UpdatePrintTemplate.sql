DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePrintTemplate!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePrintTemplate(IN prm_Username VARCHAR(128),
											IN prm_PrintTemplateId INT,
                                            IN prm_TemplateName VARCHAR(256),
                                            IN prm_ShowTemplateImage BOOLEAN,
                                            IN prm_BackgroundImageUrl VARCHAR(1024),
                                            IN prm_Orientation VARCHAR(32),
                                            IN prm_PaperDimensionsId INT)

BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/09/20202
Purpose: Used to update a print elements.
*/

DECLARE vOrganisationId INT;
DECLARE vTemplateExists INT;
DECLARE vSuccess INT;

SET vSuccess = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vTemplateExists FROM AAU.PrintTemplate WHERE TemplateName = prm_TemplateName;

IF vTemplateExists = 1 THEN

UPDATE AAU.PrintTemplate SET	
			OrganisationId		= vOrganisationId,
			TemplateName		= prm_TemplateName,
			ShowTemplateImage	= prm_ShowTemplateImage,
			PaperDimensionsId	= prm_PaperDimensionsId,
			Orientation			= prm_Orientation
WHERE PrintTemplateId = prm_PrintTemplateId;

SELECT 1 INTO vSuccess;

ELSEIF vTemplateExists = 0 THEN

SELECT 2 INTO vSuccess;

ELSEIF vTemplateExists > 1 THEN

SELECT 3 INTO vSuccess;

ELSE 

SELECT 4 INTO vSuccess;

END IF;

SELECT prm_PrintTemplateId as printTemplateId, vSuccess as success;


END $$
