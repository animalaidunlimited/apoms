
DELIMITER !!
DROP procedure IF EXISTS AAU.sp_UpdateVisitDate!!
DELIMITER !!
DROP procedure IF EXISTS AAU.sp_UpdateVisitDateByReleaseDetailsId!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateVisitDate(
	IN prm_ReleaseDetailsId INT
)
BEGIN
/*
Created By: Ankit Singh
Created On: 15/04/2021
Purpose: Renamed procedure to differenciate between similar update visit.
*/
DECLARE vStreetTreatCaseId INT;
DECLARE vDay INT;
DECLARE vDate DATETIME;
DECLARE vSuccess INT;
DECLARE vVisitExists INT;

SELECT 
	StreetTreatCaseId,
    1
    INTO 
    vStreetTreatCaseId, 
	vVisitExists
FROM AAU.StreetTreatCase stc
INNER JOIN AAU.ReleaseDetails rd ON rd.PatientId = stc.PatientId AND rd.ReleaseDetailsId = prm_ReleaseDetailsId;		
    
IF vVisitExists > 0 THEN

UPDATE AAU.Visit
SET Date = ( SELECT DATE_ADD(CURRENT_DATE(), INTERVAL (`Day`) DAY )  )
WHERE 
	StreetTreatCaseId =  vStreetTreatCaseId 
	AND 
    Date IS NULL;
    SELECT 1 INTO vSuccess;
    
ELSEIF vVisitExists = 1 THEN

	SELECT 1 INTO vSuccess;

ELSEIF vVisitExists > 1 THEN

	SELECT 2 INTO vSuccess;
    
ELSE
	SELECT 3 INTO vSuccess;
    
END IF;

SELECT vSuccess AS success;
END$$

DELIMITER ;