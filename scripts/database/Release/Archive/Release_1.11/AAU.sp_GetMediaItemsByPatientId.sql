DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetMediaItemsByPatientId!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetMediaItemsByPatientId(IN prm_PatientId INT)
BEGIN

/*****************************************
Author: Jim Mackenzie
Date: 23/07/2020
Purpose: To retrieve Media items for a patient

*****************************************/

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("mediaItemId", PatientMediaItemId),
JSON_OBJECT("mediaType", MediaType),
JSON_OBJECT("localURL", URL),
JSON_OBJECT("isPrimary" , isPrimary),
JSON_OBJECT("remoteURL", NULL),
JSON_OBJECT("datetime", DateTime),
JSON_OBJECT("comment", Comment),
JSON_OBJECT("patientId", PatientId),
JSON_OBJECT("heightPX", HeightPX),
JSON_OBJECT("widthPX", WidthPX),
Tags)) AS Result
FROM AAU.PatientMediaItem
WHERE IsDeleted = 0
AND PatientId = prm_PatientId;

END