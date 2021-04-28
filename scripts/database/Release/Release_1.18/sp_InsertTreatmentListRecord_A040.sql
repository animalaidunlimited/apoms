DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertTreatmentListRecord !!

DELIMITER $$
-- START TRANSACTION;
-- CALL AAU.sp_InsertTreatmentListRecord(98820, 1, 10, '2021-04-27', NULL, NULL);
-- ROLLBACK TRANSACTION

CREATE PROCEDURE AAU.sp_InsertTreatmentListRecord (	IN prm_PatientId INT,
													IN prm_Admission TINYINT,
													IN prm_InCensusAreaId INT,
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

DECLARE vAdmissionExists INT;
DECLARE vTotalRecords INT;
SET vAdmissionExists = 0;
SET vTotalRecords = 0;

SELECT SUM(Admission), COUNT(1) INTO vAdmissionExists, vTotalRecords FROM AAU.TreatmentList WHERE PatientId = prm_PatientId;

IF vTotalRecords = 0 THEN
	INSERT INTO AAU.TreatmentList	(PatientId, Admission, InCensusAreaId, InDate, InAccepted, OutCensusAreaId)
									VALUES
									(prm_PatientId, prm_Admission, prm_InCensusAreaId, prm_InDate, prm_InAccepted, prm_PreviousArea);
                                    
	SELECT LAST_INSERT_ID() AS `TreatmentListId`, 1 AS `success`;

ELSEIF vAdmissionExists > 0 AND vAdmissionExists = 1 THEN

	UPDATE AAU.TreatmentList SET InCensusAreaId = prm_InCensusAreaId WHERE PatientId = prm_PatientId AND Admission = 1;
    SELECT 1 AS `success`;

ELSE

	SELECT -1 AS `TreatmentListId`, 0 AS `success`;

END IF;




END $$







