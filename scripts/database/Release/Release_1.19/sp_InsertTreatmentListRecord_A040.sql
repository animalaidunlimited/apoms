DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertTreatmentListRecord !!

DELIMITER $$
-- START TRANSACTION;
-- CALL AAU.sp_InsertTreatmentListRecord(98820, 1, 10, '2021-04-27', NULL, NULL);
-- ROLLBACK TRANSACTION

CREATE PROCEDURE AAU.sp_InsertTreatmentListRecord (	IN prm_PatientId INT,
													IN prm_Admission TINYINT,
													IN prm_InTreatmentAreaId INT,
													IN prm_InDate DATETIME,
													IN prm_InAccepted TINYINT,
                                                    IN prm_PreviousArea INT
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for inserting admission and moved in records to the treatment list.
*/

DECLARE vUnaccepted INT;
DECLARE vTotalRecords INT;
DECLARE vPreviousTreatmentId INT;
SET vPreviousTreatmentId = 0;
SET vUnaccepted = 0;
SET vTotalRecords = 0;

SELECT COUNT(1), IFNULL(SUM(IF(InAccepted IS NULL, 1, 0)),0) INTO vTotalRecords, vUnaccepted FROM AAU.TreatmentList WHERE PatientId = prm_PatientId;

IF prm_InTreatmentAreaId IS NOT NULL AND NOT (prm_Admission = 1 AND vTotalRecords > 0) AND vUnaccepted = 0 THEN
	INSERT INTO AAU.TreatmentList	(PatientId, Admission, InTreatmentAreaId, InDate)
									VALUES
									(prm_PatientId, prm_Admission, prm_InTreatmentAreaId, prm_InDate);
                                    
	SELECT LAST_INSERT_ID() AS `TreatmentListId`, 1 AS `success`;

-- ELSEIF vAdmissionExists = 0 AND prm_InTreatmentAreaId IS NOT NULL THEN

-- 	UPDATE AAU.TreatmentList SET InTreatmentAreaId = prm_InTreatmentAreaId WHERE PatientId = prm_PatientId AND Admission = 1;
--     SELECT 1 AS `success`;

-- We can't insert an admission for a patient that already has one.
ELSEIF prm_InTreatmentAreaId IS NOT NULL AND prm_Admission = 1 AND vTotalRecords > 0 THEN
 
	UPDATE AAU.TreatmentList SET InTreatmentAreaId = prm_InTreatmentAreaId WHERE PatientId = prm_PatientId AND Admission = 1;

 	SELECT -1 AS `TreatmentListId`, 0 AS `success`;
    
ELSEIF prm_InTreatmentAreaId IS NULL THEN

	DELETE FROM AAU.TreatmentList WHERE PatientId = prm_PatientId AND OutAccepted IS NULL AND InAccepted IS NULL;
    UPDATE AAU.TreatmentList SET OutTreatmentAreaId = NULL, OutDate = NULL WHERE PatientId = prm_PatientId AND OutAccepted IS NULL;
    SELECT -1 AS `TreatmentListId`, 2 AS `success`;
    
ELSEIF vUnaccepted > 0 THEN

		SELECT -1 AS `TreatmentListId`, 0 AS `success`;
		
ELSE

	SELECT -1 AS `TreatmentListId`, -1 AS `success`;

END IF;




END $$







