DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPrintTemplates!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPrintTemplates(IN prm_Username VARCHAR(128))

BEGIN

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
			JSON_OBJECT("printTemplateId", pt.PrintTemplateId),
			JSON_OBJECT("templateName", pt.TemplateName),
			JSON_OBJECT("showTemplateImage", pt.ShowTemplateImage),
			JSON_OBJECT("backgroundImageURL", pt.BackgroundImageURL),
			JSON_OBJECT("paperDimensions", 
				JSON_MERGE_PRESERVE(
					JSON_OBJECT("paperDimensionsId", pd.PaperDimensionsId),
					JSON_OBJECT("name", pd.Name),
					JSON_OBJECT("height", pd.Height),
					JSON_OBJECT("width", pd.Width)
				)
			),
			JSON_OBJECT("orientation", pt.Orientation),
			JSON_OBJECT("printElements", pe.PrintElements)
		)
) as Result
FROM AAU.PrintTemplate pt
INNER JOIN AAU.PaperDimensions pd ON pd.PaperDimensionsId = pt.PaperDimensionsId
INNER JOIN
(
SELECT pte.PrintTemplateId,
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
				JSON_OBJECT("printTemplateElementId", pte.PrintTemplateElementId),
				JSON_OBJECT("name", pe.Name),
				JSON_OBJECT("example", pe.Example),
				JSON_OBJECT("width", pte.Width),
				JSON_OBJECT("height", pte.Height),
				JSON_OBJECT("top", pte.Top),
				JSON_OBJECT("left", pte.Left),
				JSON_OBJECT("showStyleBar", pte.ShowStyleBar),
				JSON_OBJECT("bold", pte.Bold),
				JSON_OBJECT("italics", pte.Italics),
				JSON_OBJECT("underlined", pte.Underlined),
				JSON_OBJECT("fontSize", pte.FontSize),
				JSON_OBJECT("alignment", pte.Alignment),
                JSON_OBJECT("updated", false),
                JSON_OBJECT("deleted", false)
			)
		) as PrintElements	
FROM AAU.PrintTemplateElement pte
INNER JOIN AAU.PrintableElement pe ON pe.PrintableElementId = pte.PrintableElementId
GROUP BY pte.PrintTemplateId
) pe ON pe.PrintTemplateId = pt.PrintTemplateId
WHERE pt.OrganisationId = vOrganisationId;

END$$
DELIMITER ;