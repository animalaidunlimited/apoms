DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertEmergencyCase !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertEmergencyCase(
									IN prm_UserName VARCHAR(64),
                                    IN prm_GUID VARCHAR(128),
                                    IN prm_EmergencyNumber INT,
									IN prm_CallDateTime DATETIME,
									IN prm_DispatcherId INT,
									IN prm_EmergencyCodeId INT,
									-- IN prm_CallOutcomeId INT,
                                    -- IN prm_SameAsNumber INT,
                                    IN prm_Comments NVARCHAR(650),
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DECIMAL(11,8),
									IN prm_Longitude DECIMAL(11,8),
									IN prm_Rescuer1Id INT,
									IN prm_Rescuer2Id INT,
									IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/02/2020
Purpose: Used to insert a new emergency case.
*/
DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;
DECLARE vSameAsEmergencyCaseId INT;
DECLARE vEmNoExists INT;
DECLARE vCurrentCaseId INT;
DECLARE DummyEmNo INT;
-- DECLARE vEmergencyNumber INT;
DECLARE vEmergencyCaseId INT;
DECLARE vSocketEndpoint VARCHAR(64);
DECLARE vSuccess INT;
SET vEmNoExists = 0;
SET vOrganisationId = 0;

IF Prm_EmergencyNumber = -1 THEN

	SELECT (MIN(EmergencyNumber) - 1) INTO DummyEmNo 
    FROM AAU.EmergencyCase WHERE EmergencyNumber < 0;
    
ELSE 
	SELECT Prm_EmergencyNumber INTO DummyEmNo;

END IF;

SELECT COUNT(1), IFNULL(MAX(UpdateTime), '1901-01-01'), MAX(EmergencyCaseId) INTO 
vEmNoExists, vUpdateTime, vCurrentCaseId
FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_EmergencyNumber;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

START TRANSACTION ;

IF vEmNoExists = 0 THEN

-- SELECT MAX(EmergencyCaseId) INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsNumber;

-- LOCK TABLES AAU.EmergencyCase WRITE;

-- SELECT MAX(EmergencyNumber + 1) INTO vEmergencyNumber FROM AAU.EmergencyCase
-- WHERE OrganisationId = vOrganisationId FOR UPDATE;

INSERT INTO AAU.EmergencyCase
(
	OrganisationId,
	EmergencyNumber,
	CallDateTime,
	DispatcherId,
	EmergencyCodeId,
	-- CallOutcomeId,
    -- SameAsEmergencyCaseId,
	Location,
	Latitude,
	Longitude,
	Rescuer1Id,
	Rescuer2Id,
	AmbulanceArrivalTime,
	RescueTime,
	AdmissionTime,
    UpdateTime,
    Comments,
    GUID
)
VALUES
(
	vOrganisationId,
	-- prm_EmergencyNumber,
    DummyEmNo,
	prm_CallDateTime,
	prm_DispatcherId,
	prm_EmergencyCodeId,
	-- prm_CallOutcomeId,
    -- vSameAsEmergencyCaseId,
	prm_Location,
	prm_Latitude,
	prm_Longitude,
	prm_Rescuer1Id,
	prm_Rescuer2Id,
	prm_AmbulanceArrivalTime,
	prm_RescueTime,
	prm_AdmissionTime,
    prm_UpdateTime,
    prm_Comments,
    prm_GUID
);

-- UNLOCK TABLES;

COMMIT;
	
    SELECT LAST_INSERT_ID(),1 INTO vEmergencyCaseId,vSuccess;
    
	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId,ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId,prm_Username,vEmergencyCaseId,'EmergencyCase','Insert', NOW());
    
ELSEIF vEmNoExists >= 1 THEN

	SELECT 2, vCurrentCaseId INTO vSuccess, vEmergencyCaseId; -- Duplicate
    -- SELECT MAX(EmergencyNumber) INTO vEmergencyNumber FROM AAU.EmergencyCase;
    
ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3, vCurrentCaseId INTO vSuccess, vEmergencyCaseId; -- Already updated

ELSE 
	SELECT 4 INTO vSuccess; -- Other error
    SELECT vCurrentCaseId INTO vEmergencyCaseId;
END IF;


SELECT vSuccess as success, vEmergencyCaseId, prm_EmergencyNumber AS vEmergencyNumber,vSocketEndPoint;  

END$$
DELIMITER ;



DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateEmergencyCase !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateEmergencyCase(
									IN prm_EmergencyCaseId INT,
									IN prm_EmergencyNumber INT,
									IN prm_CallDateTime DATETIME,
									IN prm_DispatcherId INT,
									IN prm_EmergencyCodeId INT,
									-- IN prm_CallOutcomeId INT,
                                    -- IN prm_SameAsNumber INT,
                                    IN prm_Comments NVARCHAR(650),
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DOUBLE(11,8),
									IN prm_Longitude DECIMAL(11,8),
									IN prm_Rescuer1Id INT,
									IN prm_Rescuer2Id INT,
									IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME,
									IN prm_IsDeleted BOOLEAN,
                                    IN prm_DeletedDate DATETIME,
									IN prm_UserName VARCHAR(64),
									OUT prm_OutEmergencyCaseId INT,
                                    OUT prm_SocketEndPoint CHAR(3),
									OUT prm_Success VARCHAR(64))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to update a case.
*/

DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;
DECLARE vSameAsEmergencyCaseId INT;

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;

SELECT prm_EmergencyCaseId INTO prm_OutEmergencyCaseId;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.EmergencyCase WHERE EmergencyCaseId <> prm_EmergencyCaseId AND EmergencyNumber = prm_EmergencyNumber;

SELECT IFNULL(MAX(UpdateTime), '1901-01-01') INTO vUpdateTime FROM AAU.EmergencyCase WHERE EmergencyCaseId = prm_EmergencyCaseId;

-- SELECT MAX(EmergencyCaseId) INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsNumber;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, prm_SocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists = 0 AND prm_UpdateTime >= vUpdateTime THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET
						EmergencyNumber        = prm_EmergencyNumber,
						CallDateTime           = prm_CallDateTime,
						DispatcherId           = prm_DispatcherId,
						EmergencyCodeId        = prm_EmergencyCodeId,
						-- CallOutcomeId          = prm_CallOutcomeId,
                        -- SameAsEmergencyCaseId  = vSameAsEmergencyCaseId,
						Location               = prm_Location,
						Latitude               = prm_Latitude,
						Longitude              = prm_Longitude,
						Rescuer1Id             = prm_Rescuer1Id,
						Rescuer2Id             = prm_Rescuer2Id,
						AmbulanceArrivalTime   = prm_AmbulanceArrivalTime,
						RescueTime             = prm_RescueTime,
						AdmissionTime          = prm_AdmissionTime,
						IsDeleted			   = prm_IsDeleted,
                        DeletedDate			   = prm_DeletedDate,
                        UpdateTime			   = prm_UpdateTime,
                        Comments			   = prm_Comments
			WHERE EmergencyCaseId = prm_EmergencyCaseId;

COMMIT;

    SELECT 1 INTO prm_Success;

    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_EmergencyCaseId,'EmergencyCase','Update', NOW());  
	

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3 INTO prm_Success; -- Already updated

ELSEIF prm_UpdateTime > vUpdateTime THEN
	SELECT 4 INTO prm_Success; -- Emergency record already updated another time.
    
ELSE
	SELECT 5 INTO prm_Success; -- Other error   
END IF;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, NULL);

END$$
DELIMITER ;



DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEmergencyCaseById !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetEmergencyCaseById( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a case by ID.
*/

SELECT 
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencyDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencyCaseId", ec.EmergencyCaseId),
JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
JSON_OBJECT("callDateTime", DATE_FORMAT(ec.CallDateTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("dispatcher", ec.DispatcherId),
CASE WHEN ec.EmergencyCodeId IS NOT NULL
THEN JSON_OBJECT("code",
JSON_MERGE_PRESERVE(
JSON_OBJECT("EmergencyCodeId", ec.EmergencyCodeId),
JSON_OBJECT("EmergencyCode", c.EmergencyCode)
))
ELSE JSON_OBJECT("code", '')
END,
JSON_OBJECT("updateTime", DATE_FORMAT(ec.UpdateTime, "%Y-%m-%dT%H:%i:%s"))
)),
JSON_OBJECT("caseComments", ec.Comments)

) AS Result
			
FROM AAU.EmergencyCase ec
LEFT JOIN AAU.EmergencyCode c ON c.EmergencyCodeId = ec.EmergencyCodeId
LEFT JOIN AAU.CallOutcome o ON o.CallOutcomeId = ec.CallOutcomeId
LEFT JOIN AAU.EmergencyCase sa ON sa.EmergencyCaseId = ec.SameAsEmergencyCaseId
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;


END$$
DELIMITER ;



DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatient !!

DELIMITER $$
CREATE PROCEDURE sp_InsertPatient(
IN prm_Username VARCHAR(128),
IN prm_EmergencyCaseId INT,
IN prm_Position INT,
IN prm_AnimalTypeId INT,
IN prm_TagNumber VARCHAR(45),
IN prm_PatientCallOutcomeId  INT,
IN prm_SameAsEmergencyCaseId INT
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;
DECLARE vPatientId INT;
DECLARE vTagExists INT;
DECLARE vSuccess INT;
DECLARE vTagNumber VARCHAR(20);

SET vPatientExists = 0;
SET vTagExists = 0;
SET vTagNumber = NULL;


SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE EmergencyCaseId = prm_EmergencyCaseId AND Position = prm_Position AND IsDeleted = 0;

SELECT COUNT(1) INTO vTagExists FROM AAU.Patient WHERE TagNumber = prm_TagNumber;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 AND vTagExists = 0 THEN

	INSERT INTO AAU.Patient
		(
			OrganisationId,        
			EmergencyCaseId,
			Position,
			AnimalTypeId,
			TagNumber,
            PatientCallOutcomeId,
            SameAsNumber
		)
		VALUES
		(
			vOrganisationId,        
			prm_EmergencyCaseId,
			prm_Position,
			prm_AnimalTypeId,
			UPPER(prm_TagNumber),
            prm_PatientCallOutcomeId,
            prm_SameAsEmergencyCaseId
		);
          
	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID(),prm_TagNumber INTO vPatientId,vTagNumber;
    
    IF IFNULL(prm_TagNumber,'') <> '' THEN    
		UPDATE AAU.Census SET PatientId = vPatientId WHERE TagNumber = vTagNumber;    
    END IF;
    
    

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vPatientId,'Patient','Insert', NOW());

ELSEIF vPatientExists > 0 THEN

	SELECT 2 INTO vSuccess;

ELSEIF vTagExists > 0 THEN
    
	SELECT 3 INTO vSuccess;
    
ELSE

	SELECT 4 INTO vSuccess;
END IF;

SELECT vPatientId AS patientId, vSuccess AS success , vTagNumber;

END$$
DELIMITER ;


DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatient !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatient(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
									IN prm_EmergencyCaseId INT,
									IN prm_Position INT,
									IN prm_AnimalTypeId INT,									
                                    IN prm_IsDeleted INT,
                                    IN prm_TagNumber VARCHAR(45),
                                    IN prm_PatientCallOutcomeId INT,
                                    IN prm_SameAsNumber INT
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;
DECLARE vPatientId INT;
DECLARE vTagNumber VARCHAR(45);
DECLARE vExistingTagNumber VARCHAR(45);
DECLARE vSuccess INT;
SET vTagNumber = NULL;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE PatientId <> prm_PatientId
AND EmergencyCaseId = prm_EmergencyCaseId
AND Position = prm_Position AND IsDeleted = 0;

SELECT TagNumber INTO vExistingTagNumber FROM AAU.Patient WHERE PatientId = prm_PatientId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 THEN

	UPDATE AAU.Patient SET
			Position		= prm_Position,
			AnimalTypeId	= prm_AnimalTypeId,
			TagNumber		= IF(prm_IsDeleted = 1, NULL, UPPER(prm_TagNumber)),
            PatientCallOutcomeId = prm_PatientCallOutcomeId,
            SameAsNumber = prm_SameAsNumber,
            IsDeleted		= prm_IsDeleted,
            DeletedDate		= CASE
								WHEN prm_IsDeleted = FALSE THEN NULL
                                WHEN prm_IsDeleted = TRUE AND DeletedDate IS NULL THEN NOW()
							  END								
	WHERE PatientId = prm_PatientId;
    
    -- Now update the Census in case there were records entered there early.
    IF IFNULL(prm_TagNumber, '') <> '' AND vExistingTagNumber <> prm_TagNumber THEN     
		UPDATE AAU.Census SET TagNumber = prm_TagNumber WHERE PatientId = prm_PatientId;
    END IF;
    
	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientId,'Patient','Update', NOW());
               
    SELECT 1,prm_TagNumber,prm_PatientId INTO vSuccess,vTagNumber,vPatientId;  
    
ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vPatientId AS patientId, vTagNumber, vSuccess AS success;

END$$
DELIMITER ;




DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientsByEmergencyCaseId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return all patients for a case by EmergencyCaseId
*/

SELECT 
JSON_OBJECT(
	"patients",
	 JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("patientId", p.PatientId),
			JSON_OBJECT("position", p.Position),
			JSON_OBJECT("tagNumber", p.TagNumber),
			JSON_OBJECT("animalTypeId", p.AnimalTypeId),
			JSON_OBJECT("animalType", at.AnimalType),
			JSON_OBJECT("updated", false),
			JSON_OBJECT("deleted", p.IsDeleted),
			JSON_OBJECT("duplicateTag", false),
            JSON_OBJECT("admissionArea", tl.InCensusAreaId),
            JSON_OBJECT("callOutcome",
				JSON_MERGE_PRESERVE(
					JSON_OBJECT("CallOutcome",
						JSON_MERGE_PRESERVE(
						JSON_OBJECT("CallOutcomeId",p.PatientCallOutcomeId),
						JSON_OBJECT("CallOutcome",co.CallOutcome))
					),
					JSON_OBJECT("sameAsNumber",p.SameAsNumber)
                )
            ),
            pp.problemsJSON,
            pp.problemsString				
			)
		 )
) AS Result
			
FROM  AAU.Patient p
INNER JOIN
	(
	SELECT pp.patientId, JSON_OBJECT("problems",
		 JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(                    
				JSON_OBJECT("problemId", pp.ProblemId),                        
				JSON_OBJECT("problem", pr.Problem) 
				)
			 )
		) AS problemsJSON,
        JSON_OBJECT("problemsString", GROUP_CONCAT(pr.Problem)) AS ProblemsString
	FROM AAU.PatientProblem pp
	INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
    WHERE pp.PatientId IN (SELECT PatientId FROM AAU.Patient WHERE EmergencyCaseId = prm_emergencyCaseId AND IsDeleted = 0)
	GROUP BY pp.patientId
	) pp ON pp.patientId = p.patientId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN AAU.TreatmentList tl ON tl.Admission = 1 AND tl.PatientId = p.PatientId
LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
GROUP BY p.EmergencyCaseId;

END$$
DELIMITER ;











