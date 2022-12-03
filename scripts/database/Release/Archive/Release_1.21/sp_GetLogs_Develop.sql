DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLogs !!



DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLogs( IN prm_Username VARCHAR(45), IN prm_PatientIds TEXT, IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Ankit Singh
Created On:
Purpose: Retrieve log records for list of patient Ids or Emergency Numbers.

Modified By: Jim Mackenzie
Modified On: 29/08/2022
Purpose: Resolved issue where we're just passing in a list of Ids and bringing back logs for those ids. We need to tie an id to a
         particular ChangeTable. For instance we need to tie patient ids to the patient ChangeTable. Otherwise we're returning 
	     patient log records for emergency case ids, which is obviously wrong.
*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

	SELECT 
    UserName,
    ChangeTable,
    LoggedAction,
    DateTime AS Date,
    CONVERT(DateTime,TIME(0)) AS Time
    FROM AAU.Logging
    WHERE OrganisationId = vOrganisationId
    AND
    (
		(
			ChangeTable = 'Patient'
			AND
			FIND_IN_SET(RecordId, prm_PatientIds)
		)
	OR
		(
			ChangeTable IN ('EmergencyCase', 'Case')
			AND
			RecordId = prm_EmergencyCaseId
		)
    );
    
END



