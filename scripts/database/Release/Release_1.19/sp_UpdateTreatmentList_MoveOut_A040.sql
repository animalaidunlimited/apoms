DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_MoveOut !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateTreatmentList_MoveOut (
													IN prm_PatientId INT,
													IN prm_TreatmentListId INT,
													IN prm_OutTreatmentAreaId INT,
													IN prm_OutDate DATETIME
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for updating the treatment list to move a patient out of an area. A moved in record can only be added with sp_InsertTreatmentListRecord .
*/

UPDATE AAU.TreatmentList SET
			InTreatmentAreaId = IF(Admission = 1 AND InAccepted != 1, prm_OutTreatmentAreaId, InTreatmentAreaId),
			OutTreatmentAreaId = IF(InAccepted = 1, prm_OutTreatmentAreaId, NULL),
			OutDate = IF(InAccepted = 1, prm_OutDate, NULL),
            OutAccepted = NULL
            -- OutTreatmentAreaId = prm_OutTreatmentAreaId,
            -- OutDate = prm_OutDate
WHERE TreatmentListId = prm_TreatmentListId;

-- We also need to update any outstanding unaccepted moved in records
UPDATE AAU.TreatmentList SET InTreatmentAreaId = prm_OutTreatmentAreaId WHERE PatientId = prm_PatientId AND InAccepted IS NULL;

SELECT IF(ROW_COUNT() > 0, 1, 0) AS `success`;

END $$
