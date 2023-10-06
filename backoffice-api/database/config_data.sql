-- Vérifier si la table 'CarePathway' existe, et la supprimer si c'est le cas
IF OBJECT_ID('CarePathway', 'U') IS NOT NULL
    DROP TABLE CarePathway;

-- Vérifier si la table 'WearableDevices' existe, et la supprimer si c'est le cas
IF OBJECT_ID('WearableDevices', 'U') IS NOT NULL
    DROP TABLE WearableDevices;

-- Créer la table WearableDevices
CREATE TABLE WearableDevices
(
    id INT PRIMARY KEY IDENTITY(1,1),
    deviceId NVARCHAR(50) UNIQUE,
    model NVARCHAR(50) UNIQUE,
    isActive BIT DEFAULT 0
);

-- Créer la table CarePathway
CREATE TABLE CarePathway
(
    id INT PRIMARY KEY IDENTITY(1,1),
    firstName NVARCHAR(50),
    lastName NVARCHAR(50),
    carePathwayId NVARCHAR(50) UNIQUE,
    deviceId NVARCHAR(50) NULL,
    anesthesiaDate DATETIME NOT NULL,
    surgeryDate DATETIME NOT NULL,
    FOREIGN KEY (deviceId) REFERENCES WearableDevices(deviceId),
    CONSTRAINT CK_CarePathway_Dates CHECK (anesthesiaDate < surgeryDate)
);

-- Insérer des données fictives dans CarePathway
INSERT INTO CarePathway
(
    carePathwayId,
    firstName, 
    lastName, 
    anesthesiaDate, 
    surgeryDate
)
VALUES
(
    'CARE001', 
    'Karim', 
    'Aouadi',
    '2023-05-01 10:00:00', 
    '2023-05-01 12:30:00'
),
(
    'CARE002',   -- Assurez-vous que c'est un ID unique
    'Raphael', 
    'Palerme',
    '2023-06-01 14:00:00',   -- Changez les dates selon vos besoins
    '2023-06-01 16:30:00'
);

GO

-- Créer un index filtré pour deviceId
CREATE UNIQUE NONCLUSTERED INDEX idx_UniqueDeviceId
ON CarePathway(deviceId)
WHERE deviceId IS NOT NULL;

-- Ajoutez GO pour séparer la création du trigger des autres instructions
GO

-- Créer le trigger
CREATE TRIGGER trg_UpdateIsActiveOnDeviceIdNotNull 
ON CarePathway
AFTER UPDATE
AS
BEGIN
    IF EXISTS (SELECT 1 FROM inserted INNER JOIN WearableDevices ON inserted.deviceId = WearableDevices.deviceId WHERE inserted.deviceId IS NOT NULL)
    BEGIN
        UPDATE WearableDevices
        SET isActive = 1
        WHERE deviceId IN (SELECT deviceId FROM inserted WHERE deviceId IS NOT NULL);
    END
END;

-- Ajoutez GO pour séparer la création du trigger des autres instructions
GO

CREATE TRIGGER trg_UpdateIsActiveOnDeviceIdNull
ON CarePathway
AFTER UPDATE
AS
BEGIN
    -- Si le deviceId a été mis à jour avec une valeur NULL
    IF EXISTS (SELECT 1 FROM inserted WHERE deviceId IS NULL)
    BEGIN
        -- Mettre à jour le champ isActive de la table WearableDevices à 0
        UPDATE WearableDevices
        SET isActive = 0
        WHERE deviceId IN (SELECT deviceId FROM deleted WHERE deviceId IS NOT NULL)
        AND deviceId NOT IN (SELECT deviceId FROM CarePathway WHERE deviceId IS NOT NULL);
    END
END;