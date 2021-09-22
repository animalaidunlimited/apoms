/*
THIS STEP IS VERY VERY IMMPORTANT
BEFORE DOING ANYTHING PLEASE CHANGE TABLE NAME EMERGENCY CASE COPY TO EMERGENCY CASE.
*/

SET SQL_SAFE_UPDATES = 0;
START TRANSACTION;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 19, 47, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 19, 47, Rescuer2Id)
WHERE Rescuer1Id = 19 OR Rescuer2Id = 19;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 20, 45, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 20, 45, Rescuer2Id)
WHERE Rescuer1Id = 20 OR Rescuer2Id = 20;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 21, 49, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 21, 49, Rescuer2Id)
WHERE Rescuer1Id = 21 OR Rescuer2Id = 21;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 10, 181, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 10, 181, Rescuer2Id)
WHERE Rescuer1Id = 10 OR Rescuer2Id = 10;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 23, 51, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 23, 51, Rescuer2Id)
WHERE Rescuer1Id = 23 OR Rescuer2Id = 23;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 30, 7, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 30, 7, Rescuer2Id)
WHERE Rescuer1Id = 30 OR Rescuer2Id = 30;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 37, 64, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 37, 64, Rescuer2Id)
WHERE Rescuer1Id = 37 OR Rescuer2Id = 37;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 28, 55, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 28, 55, Rescuer2Id)
WHERE Rescuer1Id = 28 OR Rescuer2Id = 28;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 29, 65, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 29, 65, Rescuer2Id)
WHERE Rescuer1Id = 29 OR Rescuer2Id = 29;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 27, 54, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 27, 54, Rescuer2Id)
WHERE Rescuer1Id = 27 OR Rescuer2Id = 27;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 67, 190, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 67, 190, Rescuer2Id)
WHERE Rescuer1Id = 67 OR Rescuer2Id = 67;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 38, 59, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 38, 59, Rescuer2Id)
WHERE Rescuer1Id = 38 OR Rescuer2Id = 38;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 22, 50, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 22, 50, Rescuer2Id)
WHERE Rescuer1Id = 22 OR Rescuer2Id = 22;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 24, 52, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 24, 52, Rescuer2Id)
WHERE Rescuer1Id = 24 OR Rescuer2Id = 24;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 25, 53, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 25, 53, Rescuer2Id)
WHERE Rescuer1Id = 25 OR Rescuer2Id = 25;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 68, 59, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 68, 59, Rescuer2Id)
WHERE Rescuer1Id = 68 OR Rescuer2Id = 68;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 26, 9, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 26, 9, Rescuer2Id)
WHERE Rescuer1Id = 26 OR Rescuer2Id = 26;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 70, 113, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 70, 113, Rescuer2Id)
WHERE Rescuer1Id = 70 OR Rescuer2Id = 70;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 73, 134, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 73, 134, Rescuer2Id)
WHERE Rescuer1Id = 73 OR Rescuer2Id = 73;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 75, 136, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 75,136 , Rescuer2Id)
WHERE Rescuer1Id = 75 OR Rescuer2Id = 75;


UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 66, 109, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 66, 109, Rescuer2Id)
WHERE Rescuer1Id = 66 OR Rescuer2Id = 66;


UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 60, 103, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 60, 103, Rescuer2Id)
WHERE Rescuer1Id = 60 OR Rescuer2Id = 60;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 69, 112, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 69, 112, Rescuer2Id)
WHERE Rescuer1Id = 69 OR Rescuer2Id = 69;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 77, 39, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 77, 39, Rescuer2Id)
WHERE Rescuer1Id = 77 OR Rescuer2Id = 77;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 76, 137, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 76, 137, Rescuer2Id)
WHERE Rescuer1Id = 76 OR Rescuer2Id = 76;


UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 82, 143, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 82, 143, Rescuer2Id)
WHERE Rescuer1Id = 82 OR Rescuer2Id = 82;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 215, 46, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 215, 46, Rescuer2Id)
WHERE Rescuer1Id = 215 OR Rescuer2Id = 215;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = IF(Rescuer1Id = 197, 48, Rescuer1Id),
	Rescuer2Id = IF(Rescuer2Id= 197, 48, Rescuer2Id)
WHERE Rescuer1Id = 197 OR Rescuer2Id = 197;

COMMIT;

-- DATA CORRECTION IN EMERGENCY CASE

SELECT COUNT(1) FROM AAU.EmergencyCase;


SELECT * FROM AAU.User
WHERE FirstName = 'Self'; -- HERE IN MY CASE IT IS 55


SET SQL_SAFE_UPDATES = 0;

START TRANSACTION;

UPDATE AAU.EmergencyCase SET SelfAdmission = 1 WHERE Rescuer1Id = 55 OR Rescuer2Id = 55;

UPDATE AAU.EmergencyCase SET Rescuer1Id = IF(Rescuer1Id = 55, NULL, Rescuer1Id), Rescuer2Id = IF(Rescuer2Id = 55, NULL, Rescuer2Id);


UPDATE AAU.EmergencyCase SET Rescuer1Id = IF(Rescuer1Id = -1, NULL, Rescuer1Id), Rescuer2Id = IF(Rescuer2Id = -1, NULL, Rescuer2Id);

UPDATE AAU.EmergencyCase SET Rescuer2Id = 7 WHERE Rescuer1Id IN (9) AND Rescuer2Id IS NULL;
UPDATE AAU.EmergencyCase SET Rescuer2Id = 9 WHERE Rescuer1Id IN (7) AND Rescuer2Id IS NULL;

UPDATE AAU.EmergencyCase SET Rescuer2Id = 43 WHERE Rescuer1Id IN (48) AND Rescuer2Id IS NULL;
UPDATE AAU.EmergencyCase SET Rescuer2Id = 48 WHERE Rescuer1Id IN (43) AND Rescuer2Id IS NULL;

UPDATE AAU.EmergencyCase SET Rescuer2Id = 42 WHERE Rescuer1Id IN (41) AND Rescuer2Id IS NULL;
UPDATE AAU.EmergencyCase SET Rescuer2Id = 41 WHERE Rescuer1Id IN (42) AND Rescuer2Id IS NULL;

UPDATE AAU.EmergencyCase SET Rescuer2Id = 49 WHERE Rescuer1Id IN (50) AND Rescuer2Id IS NULL;
UPDATE AAU.EmergencyCase SET Rescuer2Id = 50 WHERE Rescuer1Id IN (49) AND Rescuer2Id IS NULL;

UPDATE AAU.EmergencyCase SET Rescuer2Id = 50 WHERE Rescuer1Id IN (51) AND Rescuer2Id IS NULL;
UPDATE AAU.EmergencyCase SET Rescuer2Id = 51 WHERE Rescuer1Id IN (50) AND Rescuer2Id IS NULL;

UPDATE AAU.EmergencyCase SET Rescuer1Id = Rescuer2Id, Rescuer2Id = NULL WHERE Rescuer1Id IS NULL AND Rescuer2Id IS NOT NULL;

UPDATE AAU.EmergencyCase SET AdmittedByUserId = Rescuer1Id
WHERE SelfAdmission = 1
AND Rescuer1Id IS NOT NULL;

UPDATE AAU.EmergencyCase
SET Rescuer1Id = Rescuer2Id ,
	Rescuer2Id = Rescuer1Id
WHERE Rescuer1Id > Rescuer2Id;

UPDATE AAU.EmergencyCase SET Rescuer2Id = NULL WHERE Rescuer1Id = Rescuer2Id;



-- SELECT dVal.callDateTime as callDateTime, COUNT(1) AS count
-- FROM 
-- (
-- 	SELECT DISTINCT Rescuer1Id, Rescuer2Id,callDateTime
-- 	FROM
-- 	(
-- 		SELECT Rescuer1Id, Rescuer2Id,CAST(CalldateTime AS DATE) callDateTime
-- 		FROM AAU.EmergencyCase
-- 		WHERE Rescuer1Id != Rescuer2Id
-- 		AND Rescuer1Id != 55 AND Rescuer2Id != 55
-- 		AND Rescuer1Id != -1 AND Rescuer2Id != -1
-- 	) val
--     

-- )dVal
-- GROUP BY callDateTime
-- ORDER BY 2 DESC;


-- SELECT MIN(CallDateTime)minTime, Max(CalldateTime)maxTime,Rescuer1Id, Rescuer2Id, u.FirstName as R1, u2.FirstName as R2
-- FROM AAU.EmergencyCase ec
-- INNER JOIN AAU.User u ON u.UserId = ec.Rescuer1Id
-- INNER JOIN AAU.User u2 ON u2.UserId = ec.Rescuer2Id
-- -- WHERE CAST(CalldateTime AS DATE) = '2021-03-04'
-- AND Rescuer1Id != Rescuer2Id
-- 		AND Rescuer1Id != 55 AND Rescuer2Id != 55
-- 		AND Rescuer1Id != -1 AND Rescuer2Id != -1
-- GROUP BY Rescuer1Id, Rescuer2Id, u.FirstName, u2.FirstName
-- ORDER BY u.FirstName, u2.FirstName;


-- SELECT * 
-- FROM AAU.EmergencyCase
-- WHERE Rescuer1Id = 56 AND Rescuer2Id = 46
-- AND CAST(CallDateTime AS DATE) = '2021-03-04';


-- UPDATE AAU.EmergencyCase
-- SET Rescuer1Id = 56
-- WHERE EmergencyCaseId IN (89397,
-- 89400);





SELECT * FROM AAU.EmergencyCase
where SelfAdmission = 1
AND Rescuer1Id IS NOT NULL and Rescuer1Id NOT IN (SELECT UserId from AAU.User); -- SHOULD RETURN NULL



-- GIVES THE COUNT OF AMBULANCE ASSIGNMENTS ON EACH DAY.

SELECT dVal.callDateTime as callDateTime, COUNT(1) AS count
FROM 
(
	SELECT DISTINCT Rescuer1Id, Rescuer2Id,callDateTime
	FROM
	(
		SELECT Rescuer1Id, Rescuer2Id,CAST(CalldateTime AS DATE) callDateTime
		FROM AAU.EmergencyCase
		WHERE 
        -- Rescuer1Id != Rescuer2Id
		-- AND Rescuer1Id != 55 AND Rescuer2Id != 55
        SelfAdmission IS NULL
		-- AND Rescuer1Id != -1 AND Rescuer2Id != -1
		AND Rescuer1Id IS NOT NULL 
	) val
    

)dVal
GROUP BY callDateTime
ORDER BY 2 DESC ;



-- INSERT THE MAX NUMBER OF VEHICLE BY THE ABOVE QUERY 

INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ1', 'Historic1', 2, 1 , 2, 1, 1,2
);

INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ2', 'Historic2',  2, 1 , 2, 1, 1,2
);

INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ3', 'Historic3',  2, 1 , 2, 1, 1,2
);

INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ4', 'Historic4', 2, 1 , 2, 1, 1,2
);

INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ5', 'Historic5', 2, 1 , 2, 1, 1,2
);

INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ6', 'Historic6',  2, 1 , 2, 1, 1,2
);

INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ7', 'Historic7', 2, 1 , 2, 1, 1,2
);

INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ8', 'Historic8',  2, 1 , 2, 1, 1,2
);

INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ9', 'Historic9', 2, 1 , 2, 1, 1,2
);

INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ10', 'Historic10', 2, 1 , 2, 1, 1,2
);

INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ11', 'Historic11', 2, 1 , 2, 1, 1,2
);
INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ12', 'Historic12', 2, 1 , 2, 1, 1,2
);
INSERT INTO AAU.Vehicle
(
 OrganisationId, 
VehicleRegistrationNumber,
 VehicleNumber, 
VehicleTypeId, 
LargeAnimalCapacity, 
SmallAnimalCapacity,
VehicleStatusId,  
MinRescuerCapacity, 
MaxRescuerCapacity
)
VALUES (
1, 'RJ13', 'Historic13', 2, 1 , 2, 1, 1,2
);





-- Insert data into vehicle shift table

SELECT count(1) FROM VehicleShiftTemp;

CREATE TEMPORARY TABLE VehicleShiftTemp 
SELECT * 
FROM 
(
		SELECT MIN(CallDateTime)StartTime , Max(CalldateTime)EndTime ,Rescuer1Id, Rescuer2Id,
		Row_Number()
		OVER(
		PARTITION BY CAST(CallDateTime AS DATE)
		ORDER BY Rescuer1Id,Rescuer2Id
		) as AmbulanceId
		FROM AAU.EmergencyCase ec
		INNER JOIN AAU.User u ON u.UserId = ec.Rescuer1Id
		LEFT JOIN AAU.User u2 ON u2.UserId = ec.Rescuer2Id
		WHERE 
		-- AND Rescuer1Id != 55 AND Rescuer2Id != 55
        SelfAdmission IS NULL
		-- AND Rescuer1Id != -1 AND Rescuer2Id != -1
		AND Rescuer1Id IS NOT NULL
		GROUP BY Rescuer1Id, Rescuer2Id,CAST(CallDateTime AS DATE)
)cteData;

CREATE Table VehicleShiftData 
LIKE
VehicleShiftTemp;

INSERT INTO VehicleShiftData
SELECT * FROM VehicleShiftTemp;

-- DROP TABLE VehicleShiftData;
DROP TABLE VehicleShiftTemp;



INSERT INTO VehicleShift (OrganisationId, VehicleId, StartDate, EndDate)
SELECT 1, AmbulanceId, StartTime, EndTime
FROM AAU.VehicleShiftData;

SELECT * FROM AAU.VehicleShift;

-- INSERT DATA INTO VEHICLE SHIFT USER TABLE

INSERT INTO AAU.VehicleShiftUser(VehicleShiftId, UserId)
SELECT vs.VehicleShiftId, vsd.Rescuer1Id AS UserId
FROM AAU.VehicleShift vs
INNER JOIN (
SELECT AmbulanceId, StartTime, EndTime, Rescuer1Id
FROM
AAU.VehicleShiftData
WHERE Rescuer1Id IS NOT NULL

UNION

SELECT AmbulanceId, StartTime, EndTime, Rescuer2Id
FROM
AAU.VehicleShiftData
WHERE Rescuer2Id IS NOT NULL
) 
vsd ON vsd.StartTime = vs.StartDate AND vsd.EndTime = vs.EndDate AND vsd.AmbulanceId = vs.VehicleId
WHERE Rescuer1Id IS NOT NULL;

DELETE FROM AAU.VehicleShiftUser
WHERE VehicleShiftId != -1;


SELECT DISTINCT Rescuer1Id 
FROM AAU.EmergencyCase;

-- UPDATE ASSIGNED VEHICLE ID AND ASSIGNMENT TIME IN EMERGENCY CASE.

UPDATE AAU.EmergencyCase
SET Rescuer2Id = 0
WHERE Rescuer1Id IS NOT NULL AND REscuer2Id IS NULL;


-- (6,7,9,11,12,13,14,15,16,45,18,39,40,41,43,44,45,46,47,48,49,50,52,53,54,56,57,58,59,61,62,63,64,65,86,89,103,109,112,113,134,136,143,149,165,181,191) OLD
-- (6,7,9,11,12,14,16,39,40,41,43,44,45,46,47,48,49,50,52,53,54,58,59,61,63,64,65,86,105,112,113,134,143,149,165,181,182,191) NEW
-- Select three values at a time to use in where clause so that the query dont break.

UPDATE AAU.EmergencyCase ec
INNER JOIN AAU.VehicleShiftData vsd 
ON vsd.Rescuer1Id = ec.Rescuer1Id AND IFNULL(vsd.Rescuer2Id , 0)= ec.Rescuer2Id AND vsd.StartTime <= ec.CallDateTime AND vsd.EndTime >= ec.CalldateTime
SET ec.AssignedvehicleId = vsd.AmbulanceId,
ec.AmbulanceAssignmentTime = ec.CallDateTime
WHERE vsd.Rescuer1Id IN (105,112,113,134,143,149,165,181,182,191);



DROP TABLE AAU.VehiceShiftData;

UPDATE AAU.EmergencyCase
SET Rescuer2Id = NULL 
WHERE Rescuer2Id = 0 AND REscuer1Id IS NOT NULL;


SELECT DISTINCT * FROM AAU.EmergencyCase
WHERE Rescuer1Id IS NOT NULL
AND SelfAdmission IS NULL
AND AssignedVehicleId IS NULL


ROLLBACK;

COMMIT;




