DELIMITER !!
DROP PROCEDURE IF EXISTS  AAU.sp_UpdateVisitDate !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateVisitDate(
	IN prm_ReleaseDetailsId INT
)
BEGIN
DECLARE vStreetTreatCaseId INT;
DECLARE vDay INT;
DECLARE vDate DATETIME;
DECLARE vSuccess INT;
DECLARE vVisitExists INT;

SELECT 
	StreetTreatCaseId,
    count(1) 
    INTO 
    vStreetTreatCaseId, 
	vVisitExists
FROM 
	AAU.StreetTreatCase 
WHERE 
	PatientId = (
		SELECT PatientId from ReleaseDetails WHERE ReleaseDetailsId = prm_ReleaseDetailsId
    );
    
IF vVisitExists > 0 THEN

UPDATE AAU.Visit
	SET Date = (
					SELECT DATE_ADD(
						CURRENT_DATE() ,
						INTERVAL (
									Day
								) 
						DAY
						)
			   )
WHERE 
	StreetTreatCaseId =  vStreetTreatCaseId 
	AND 
    Date IS NULL;
    SELECT 1 INTO vSuccess;

ELSEIF vVisitExists > 1 THEN

	SELECT 2 INTO vSuccess;
    
ELSE
	SELECT 3 INTO vSuccess;
    
END IF;

SELECT vSuccess AS success;
END$$
