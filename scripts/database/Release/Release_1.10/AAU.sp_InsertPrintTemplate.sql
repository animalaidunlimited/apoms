DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPrintTemplate!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPrintTemplate(IN prm_Username VARCHAR(128),
                                            IN prm_TemplateName VARCHAR(256),
                                            IN prm_ShowTemplateImage BOOLEAN,
                                            IN prm_BackgroundImageUrl VARCHAR(1024),
                                            IN prm_Orientation VARCHAR(32),
                                            IN prm_PaperDimensionsId INT)

BEGIN

DECLARE vOrganisationId INT;
DECLARE vTemplateExists INT;
DECLARE vPrintTemplateId INT;
DECLARE vSuccess INT;

SET vSuccess = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vTemplateExists FROM AAU.PrintTemplate WHERE TemplateName = prm_TemplateName;

IF vTemplateExists = 0 THEN

INSERT INTO AAU.PrintTemplate
	(
		OrganisationId,
        TemplateName,
        ShowTemplateImage,
        PaperDimensionsId,
        Orientation
	)
VALUES
	(
		prm_OrganisationId,
        prm_TemplateName,
        prm_ShowTemplateImage,
        prm_PaperDimensionsId,
        prm_Orientation
	);

SELECT LAST_INSERT_ID(), 1 INTO vPrintTemplateId, vSuccess;

ELSEIF vTemplateExists > 0 THEN

SELECT 2 INTO vSuccess;

END IF;

SELECT vPrintTemplateId, vSuccess;


END $$
