DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLeaveRequests !!

-- CALL AAU.sp_GetLeaveRequests('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLeaveRequests( IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 20/11/2022
Purpose: Retrieve a list of leave requests

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("leaveRequestId", lr.LeaveRequestId),
			JSON_OBJECT("department", d.Department),
            JSON_OBJECT("departmentColour", d.Colour),
			JSON_OBJECT("userId", lr.UserId),
            JSON_OBJECT("userCode", CONCAT(u.employeeNumber,' - ', u.FirstName)),
			JSON_OBJECT("requestDate", lr.RequestDate),
            JSON_OBJECT("leaveRequestReasonId", lr.LeaveRequestReasonId),
			JSON_OBJECT("leaveRequestReason", lrr.LeaveRequestReason),
			JSON_OBJECT("additionalInformation", lr.AdditionalInformation),
			JSON_OBJECT("emergencyMedicalLeave", AAU.fn_CastTinyIntToJSONBoolean(lr.EmergencyMedicalLeave)),
			JSON_OBJECT("leaveStartDate", lr.LeaveStartDate),
			JSON_OBJECT("leaveEndDate", lr.LeaveEndDate),
            JSON_OBJECT("numberOfDays", DATEDIFF(lr.LeaveEndDate, lr.LeaveStartDate) + 1),
			JSON_OBJECT("granted", lr.Granted),
			JSON_OBJECT("commentReasonManagementOnly", lr.CommentReasonManagementOnly),
			JSON_OBJECT("dateApprovedRejected", lr.DateApprovedRejected),
			JSON_OBJECT("recordedOnNoticeBoard", AAU.fn_CastTinyIntToJSONBoolean(lr.RecordedOnNoticeBoard)),
			JSON_OBJECT("leaveTaken", lr.LeaveTaken),
            JSON_OBJECT("leaveTakenComment", lr.LeaveTakenComment),
			JSON_OBJECT("documentOrMedicalSlipProvided", AAU.fn_CastTinyIntToJSONBoolean(lr.DocumentOrMedicalSlipProvided)),
            JSON_OBJECT("documentOrMedicalSlipAccepted", AAU.fn_CastTinyIntToJSONBoolean(lr.DocumentOrMedicalSlipAccepted)),
			JSON_OBJECT("comment", lr.Comment),
			JSON_OBJECT("isDeleted", lr.IsDeleted)
			)) AS `LeaveRequests`
FROM AAU.LeaveRequest lr
INNER JOIN AAU.LeaveRequestReason lrr ON lrr.LeaveRequestReasonId = lr.LeaveRequestReasonId
INNER JOIN AAU.User u ON u.UserId = lr.UserId
INNER JOIN AAU.Department d ON d.DepartmentId = u.DepartmentId
WHERE lr.OrganisationId = vOrganisationId
AND lr.IsDeleted = 0;

END$$

