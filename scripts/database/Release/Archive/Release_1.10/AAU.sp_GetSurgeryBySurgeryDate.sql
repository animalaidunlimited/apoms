DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetSurgeryBySurgeryDate!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetSurgeryBySurgeryDate(IN prm_Username VARCHAR(45), IN prm_Date DATE)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 03/10/2020
Purpose: Return surgeries by surgery date
*/

DECLARE vOrganisationId INT;

SELECT o.OrganisationId INTO vOrganisationId
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT
	s.SurgeryId as "surgeryId",
    p.TagNumber as "tagNumber",
    aty.AnimalType as "animalType",
	DATE_Format(s.SurgeryDate,"%Y-%m-%dT%H:%i:%s") as "date",
	st.SurgeryType as "type",
	u.FirstName as "surgeon",
	ss.SurgerySite as "site",
    s.AnesthesiaMinutes as "anesthesiaMinutes",
    DATE_FORMAT(s.DiedDate,"%Y-%m-%dT%H:%i:%s") as "died",
	s.DiedComment as "comment",
    s.AntibioticsGiven as "antibioticsGiven"
FROM AAU.Surgery s
INNER JOIN AAU.Patient p ON p.PatientId = s.PatientId
INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
INNER JOIN AAU.SurgeryType st ON st.SurgeryTypeId = s.SurgeryTypeId
INNER JOIN AAU.User u ON u.UserId = s.SurgeonId
INNER JOIN AAU.SurgerySite ss ON ss.SurgerySiteId = s.SurgerySiteId
WHERE CAST(s.SurgeryDate AS DATE) = prm_Date
AND s.OrganisationId = vOrganisationId;
END$$
DELIMITER ;