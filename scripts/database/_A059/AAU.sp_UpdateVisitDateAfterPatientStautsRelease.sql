DELIMITER !!
DROP procedure IF EXISTS AAU.sp_UpdateVisitDate;
;

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateVisitDateAfterPatientStautsRelease(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
                                    IN prm_PatientStatusId INT,
                                    IN prm_PatientStatusDate DATETIME
)
BEGIN
DECLARE vStreetTreatCaseId INT;
DECLARE vSuccess INT;
DECLARE vVisitExists INT;

SELECT 
	v.StreetTreatCaseId,
    1
    INTO 
    vStreetTreatCaseId, 
	vVisitExists
FROM AAU.StreetTreatCase stc 
LEFT JOIN AAU.Visit v ON v.StreetTreatCaseId = stc.StreetTreatCaseId WHERE stc.PatientId = prm_PatientId  GROUP BY v.StreetTreatCaseId;	

IF vVisitExists > 0 THEN
	START TRANSACTION;
	UPDATE AAU.Visit
	SET Date = ( SELECT DATE_ADD(prm_PatientStatusDate, INTERVAL (`Day`) DAY )  )
	WHERE 
		StreetTreatCaseId =  vStreetTreatCaseId 
		AND 
		Date IS NULL
        AND VisitID <> 0;
	COMMIT;   
	SELECT 1 INTO vSuccess;
ELSE
	/* No planned visit exists */
	SELECT 2 INTO vSuccess;
    
END IF;
SELECT vSuccess;

END$$
DELIMITER ;