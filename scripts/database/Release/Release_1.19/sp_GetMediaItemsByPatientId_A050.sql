DROP procedure IF EXISTS AAU.sp_GetMediaItemsByPatientId;

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetMediaItemsByPatientId(IN prm_PatientId INT)
BEGIN

/*****************************************
Author: Jim Mackenzie
Date: 23/07/2020
Purpose: To retrieve Media items for a patient


Modified By: Ankit Singh
Date: 25-04-2021
Purpose: Comment with User

*****************************************/

/*
Updated By: Arpit Trivedi
Date: 9-11-20
Purpose: Added the date format in the datetime field.
*/

SELECT 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("mediaItemId", PatientMediaItemId),
JSON_OBJECT("mediaType", MediaType),
JSON_OBJECT("localURL", NULL),
JSON_OBJECT("isPrimary" , isPrimary),
JSON_OBJECT("remoteURL", URL),
JSON_OBJECT("datetime", DATE_FORMAT(DateTime , "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("patientId", PatientId),
JSON_OBJECT("heightPX", HeightPX),
JSON_OBJECT("widthPX", WidthPX),
Tags
)
) AS Result
FROM AAU.PatientMediaItem pmi
WHERE pmi.PatientId= prm_PatientId;

END$$
