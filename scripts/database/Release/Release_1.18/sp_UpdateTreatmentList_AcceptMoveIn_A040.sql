DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_AcceptMoveIn !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateTreatmentList_AcceptMoveIn (
													IN prm_TreatmentListId INT,
                                                    IN prm_PatientId INT
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for updating accepting a moved in record from another area. This procedure also updates the moved out flag on the previous record.
*/

DECLARE vSuccess INT;

SET vSuccess = 0;

UPDATE AAU.TreatmentList
	SET InAccepted = TRUE
WHERE	TreatmentListId = prm_TreatmentListId;

SELECT IF(ROW_COUNT() > 0, 1, 0) INTO vSuccess;

UPDATE AAU.TreatmentList
	SET OutAccepted = TRUE
WHERE	PatientId = prm_PatientId AND
		OutAccepted IS NULL;

SELECT IF(ROW_COUNT() > 0 AND vSuccess = 1, 1, 0) INTO vSuccess;

END $$