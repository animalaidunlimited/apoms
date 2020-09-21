DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPrintTemplates!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPrintTemplates(IN prm_Username VARCHAR(128))

BEGIN

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
JSON_MERGE_PRESERVE(
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("PrintTemplateId", pt.PrintTemplateId),
		JSON_OBJECT("TemplateName", pt.TemplateName),
		JSON_OBJECT("ShowTemplateImage", pt.ShowTemplateImage),
		JSON_OBJECT("BackgroundImageURL", pt.BackgroundImageURL),
		JSON_OBJECT("Name", pd.Name),
		JSON_OBJECT("Height", pd.Height),
		JSON_OBJECT("Width", pd.Width),
		JSON_OBJECT("Orientation", pt.Orientation)
	),
	JSON_OBJECT("printElements", 
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
				JSON_OBJECT("PrintTemplateElementId", pte.PrintTemplateElementId),
				JSON_OBJECT("Name", pe.Name),
				JSON_OBJECT("Example", pe.Example),
				JSON_OBJECT("Width", pte.Width),
				JSON_OBJECT("Height", pte.Height),
				JSON_OBJECT("Top", pte.Top),
				JSON_OBJECT("Left", pte.Left),
				JSON_OBJECT("ShowStyleBar", pte.ShowStyleBar),
				JSON_OBJECT("Bold", pte.Bold),
				JSON_OBJECT("Italics", pte.Italics),
				JSON_OBJECT("Underlined", pte.Underlined),
				JSON_OBJECT("FontSize", pte.FontSize),
				JSON_OBJECT("Alignment", pte.Alignment)
			)
		)
	)
) as Result
FROM AAU.PrintTemplateElement pte
INNER JOIN AAU.PrintTemplate pt ON pt.PrintTemplateId = pte.PrintTemplateId
INNER JOIN AAU.PaperDimensions pd ON pd.PaperDimensionsId = pt.PaperDimensionsId
INNER JOIN AAU.PrintElement pe ON pe.PrintElementId = pte.PrintElementId
WHERE pt.OrganisationId = vOrganisationId
GROUP BY pt.PrintTemplateId;

END$$
DELIMITER ;