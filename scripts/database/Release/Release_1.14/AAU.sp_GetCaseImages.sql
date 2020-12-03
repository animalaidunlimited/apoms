
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCaseImages!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCaseImages(IN prm_CaseId INT)
BEGIN

SELECT CaseId, FileName, DATE_FORMAT(CreatedDate, '%d/%b/%Y')
FROM AAU.CaseImage
WHERE CaseId = prm_CaseId;

END$$
DELIMITER ;



