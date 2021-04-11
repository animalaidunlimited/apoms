DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertTreatmentListRecord !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertTreatmentListRecord (	IN prm_PatientId INT,
													IN prm_Admission TINYINT,
													IN prm_InCensusAreaId INT,
													IN prm_InDate DATETIME,
													IN prm_InAccepted TINYINT
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for inserting admission and moved in records to the treatment list.
*/

INSERT INTO AAU.TreatmentList (PatientId, Admission, InCensusAreaId, InDate, InAccepted) VALUES (prm_PatientId, prm_Admission, prm_InCensusAreaId, prm_InDate, prm_InAccepted);

SELECT LAST_INSERT_ID() AS `TreatmentListId`, 1 AS `Success`;

END $$







