DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLeaveRequestsForUser !!

-- CALL AAU.sp_GetLeaveRequestsForUser(8);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLeaveRequestsForUser( IN prm_UserId  INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/11/2022
Purpose: Retrieve a list of leave requests for a user

*/

SELECT
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("leaveRequestId", lr.LeaveRequestId),
            JSON_OBJECT("departmentId", d.DepartmentId),
			JSON_OBJECT("department", d.Department),
            JSON_OBJECT("departmentColour", d.Colour),
			JSON_OBJECT("userId", lr.UserId),
            JSON_OBJECT("userCode", CONCAT(u.employeeNumber,' - ', u.FirstName)),
			JSON_OBJECT("requestDate", lr.RequestDate),
            JSON_OBJECT("leaveRequestReasonId", lr.LeaveRequestReasonId),
			JSON_OBJECT("leaveRequestReason", CONCAT(lrr.LeaveRequestReason, IF(f.FestivalId IS NULL,'', CONCAT(' (',f.Festival,')')))),
			JSON_OBJECT("additionalInformation", lr.AdditionalInformation),
			JSON_OBJECT("leaveStartDate", lr.LeaveStartDate),
			JSON_OBJECT("leaveEndDate", lr.LeaveEndDate),
            JSON_OBJECT("numberOfDays", DATEDIFF(lr.LeaveEndDate, lr.LeaveStartDate) + 1),
			JSON_OBJECT("granted", lr.Granted),
			JSON_OBJECT("commentReasonManagementOnly", lr.CommentReasonManagementOnly),
			JSON_OBJECT("dateApprovedRejected", lr.DateApprovedRejected),
			JSON_OBJECT("recordedOnNoticeBoard", AAU.fn_CastTinyIntToJSONBoolean(lr.RecordedOnNoticeBoard)),
			JSON_OBJECT("isDeleted", lr.IsDeleted)
			)) AS `LeaveRequests`
FROM AAU.LeaveRequest lr
INNER JOIN AAU.LeaveRequestReason lrr ON lrr.LeaveRequestReasonId = lr.LeaveRequestReasonId
INNER JOIN AAU.User u ON u.UserId = lr.UserId
INNER JOIN AAU.Department d ON d.DepartmentId = u.DepartmentId
LEFT JOIN AAU.Festival f ON f.FestivalId = lr.FestivalId
WHERE lr.UserId = prm_UserId
AND lr.IsDeleted = 0;

END $$

