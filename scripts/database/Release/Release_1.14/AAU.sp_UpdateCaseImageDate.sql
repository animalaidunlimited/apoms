DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateCaseImageDate!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateCaseImageDate(
										IN prm_CaseId INT,
										IN prm_Filename VARCHAR(1024),
                                        IN prm_FileDate DATE,
										OUT prm_Success INT
										)
BEGIN

DECLARE vCaseImageExists INT;

SET vCaseImageExists = 0;

SELECT COUNT(1) INTO vCaseImageExists FROM AAU.CaseImage WHERE CaseId = prm_caseId AND
															FileName = prm_Filename;                                                       
														
IF vCaseImageExists = 1 THEN

UPDATE AAU.CaseImage SET
	CreatedDate	= prm_FileDate
WHERE CaseId = prm_CaseId
AND INSTR(prm_Filename, REPLACE(FileName,' ','%20')) > 0;

SELECT 1 INTO prm_Success;

INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,prm_CaseId,'CaseImage','Update', NOW());

ELSEIF vCaseImageExists >= 1 THEN

SELECT 2 INTO prm_Success;

ELSEIF vCaseImageExists = 0 THEN

SELECT 3 INTO prm_Success;

ELSE

SELECT 4 INTO prm_Success;

END IF;

END$$
DELIMITER ;
