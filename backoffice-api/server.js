const express = require("express");
const sql = require("mssql");
const config = require("./config");
const cors = require("cors");
const bodyParser = require("body-parser");
const azure = require('azure-sb');
require("dotenv").config()
const { BlobServiceClient } = require('@azure/storage-blob');

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Wearable Devices Api",
        version: "1.0.0",
      },
    },
    apis: ["./server.js"], // chemin vers les fichiers contenant les docs
  };
  
  const specs = swaggerJsdoc(options);

// Créer une instance du service Notification Hub pour envoyer des notifications push.
const notificationHubService = azure.createNotificationHubService(
    "moebius-analytics-notifications", 
    "Endpoint=sb://care-pathway-notifications.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=UnfzGYUtmzrrPSKrTkz57/Hs0VnDGO9g3vAUuuzewHc="
);

// Initialisation de l'application Express
const app = express();
app.use(cors());  // Utilisation de CORS pour permettre des requêtes cross-origin
app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));  // Middleware pour parser les requêtes JSON

// Connexion à la base de données SQL Server
sql.connect(config.database, (err) => {
    if(err) throw err;
    console.log("Connecté à la base de données!");
});


/**
 * @swagger
 * /api/carepathway/data:
 *   get:
 *     summary: Récupère tous les CarePathways
 *     responses:
 *       200:
 *         description: Une liste de CarePathways
 */
app.get('/api/carepathway/data', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM CarePathway');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err);
    }
});

/**
 * @swagger
 * /api/carepathway/data/{id}:
 *   get:
 *     summary: Récupère un CarePathway spécifique par ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID du CarePathway
 *     responses:
 *       200:
 *         description: Un CarePathway spécifique
 *       404:
 *         description: Patient non trouvé
 */
app.get('/api/carepathway/data/:id', async (req, res) => {
    try {
        const patientId = req.params.id;
        const query = "SELECT * FROM CarePathway WHERE id = @patientId";
        const request = new sql.Request();
        request.input('patientId', sql.Int, patientId);
        const result = await request.query(query);
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send({ message: 'Patient non trouvé' });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

/**
 * @swagger
 * /api/wearabledevices:
 *   post:
 *     summary: Ajoute un nouveau dispositif portable (wearable device)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: string
 *               model:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dispositif créé avec succès
 *       400:
 *         description: Les champs deviceId et model sont requis
 *       409:
 *         description: Ce deviceId ou modèle existe déjà
 */
app.post('/api/wearabledevices', async (req, res) => {
    try {
        const { deviceId, model } = req.body;
        if (!deviceId || !model) {
            return res.status(400).send({ message: 'Les champs deviceId et model sont requis.' });
        }
        const query = `INSERT INTO WearableDevices (deviceId, model) VALUES (@deviceId, @model)`;
        const request = new sql.Request();
        request.input('deviceId', sql.NVarChar(50), deviceId);
        request.input('model', sql.NVarChar(50), model);
        await request.query(query);
        res.status(201).send({ message: 'Dispositif créé avec succès!' });
    } catch (err) {
        if (err instanceof sql.RequestError) {
            return res.status(400).send(err.message);
        } else if (err instanceof sql.UniqueViolationError) {
            return res.status(409).send({ message: "Ce deviceId ou modèle existe déjà." });
        } else {
            return res.status(500).send(err.message);
        }
    }
});

/**
 * @swagger
 * /api/carepathway/updateDevice:
 *   post:
 *     summary: Met à jour le deviceId d'un CarePathway spécifique
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: string
 *               carePathwayId:
 *                 type: string
 *     responses:
 *       200:
 *         description: DeviceId mis à jour avec succès et notification envoyée
 *       400:
 *         description: Les champs deviceId et carePathwayId sont requis
 *       404:
 *         description: Aucun CarePathway trouvé avec cet ID
 *       409:
 *         description: Ce deviceId est déjà associé à un autre carePathway
 */
app.post('/api/carepathway/updateDevice', async (req, res) => {
    try {
        const { deviceId, carePathwayId } = req.body;
        if (!deviceId || !carePathwayId) {
            return res.status(400).send({ message: 'Les champs deviceId et carePathwayId sont requis.' });
        }
        const query = `UPDATE CarePathway SET deviceId = @deviceId WHERE carePathwayId = @carePathwayId`;
        const request = new sql.Request();
        request.input('deviceId', sql.NVarChar(50), deviceId);
        request.input('carePathwayId', sql.NVarChar(50), carePathwayId);
        const result = await request.query(query);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send({ message: 'Aucun CarePathway trouvé avec cet ID.' });
        }
        await sendPushNotification(deviceId, carePathwayId);
        res.status(200).send({ message: 'DeviceId mis à jour avec succès et notification envoyée!' });
    } catch (err) {
        if (err.number === 2627 || err.number === 2601) {
            return res.status(409).send({ message: "Ce deviceId est déjà associé à un autre carePathway." });
        } else {
            return res.status(500).send(err.message);
        }
    }
});

/**
 * @swagger
 * /api/carepathway/{id}:
 *   get:
 *     summary: Obtient un CarePathway spécifique depuis Azure Blob Storage
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID du CarePathway
 *     responses:
 *       200:
 *         description: Un CarePathway spécifique
 *       404:
 *         description: Care Pathway non trouvé
 */
app.get("/api/carepathway/:id", async (req, res) => {
    try {
        const carePathwayData = await fetchJSONFromBlob();
        const id = req.params.id;
        const care_pathway = carePathwayData.find(
            (carepathway) => carepathway.carePathwayId === id
        );
        if (care_pathway) {
            res.status(200).json(care_pathway);
        } else {
            res.status(404).json({ message: `Care Pathway not found` });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des données depuis le Blob Storage:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
});

/**
 * @swagger
 * /api/carepathway/resetDevice:
 *   put:
 *     summary: Réinitialise le deviceId d'un CarePathway spécifique (le met à NULL)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carePathwayId:
 *                 type: string
 *     responses:
 *       200:
 *         description: DeviceId remis à NULL avec succès
 *       400:
 *         description: Le champ carePathwayId est requis
 *       404:
 *         description: Aucun CarePathway trouvé avec cet ID
 */
app.put('/api/carepathway/resetDevice', async (req, res) => {
    try {
        const { carePathwayId } = req.body;
        if (!carePathwayId) {
            return res.status(400).send({ message: 'Le champ carePathwayId est requis.' });
        }
        const query = `UPDATE CarePathway SET deviceId = NULL WHERE carePathwayId = @carePathwayId`;
        const request = new sql.Request();
        request.input('carePathwayId', sql.NVarChar(50), carePathwayId);
        const result = await request.query(query);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send({ message: 'Aucun CarePathway trouvé avec cet ID.' });
        }
        res.status(200).send({ message: 'DeviceId remis à NULL avec succès!' });
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

// Fonction pour envoyer une notification push à un dispositif spécifique
const sendPushNotification = async (deviceId, carePathwayId) => {
    try {
        const payload = {
            data: {
                deviceId: deviceId,
                carePathwayId: carePathwayId
            }
        };
        notificationHubService.gcm.send(deviceId, payload, function(error) {
            if (error) {
                console.error('Erreur lors de l\'envoi de la notification:', error);
            } else {
                console.log('Notification envoyée avec succès!');
            }
        });
    } catch (err) {
        console.error('Erreur lors de l\'envoi de la notification:', err);
    }
};

// Fonction pour récupérer des données JSON depuis Azure Blob Storage
const fetchJSONFromBlob = async () => {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(config.blobConnectionString);
        const containerClient = blobServiceClient.getContainerClient(config.containerName);
        const blobClient = containerClient.getBlobClient(config.blobName);
        const downloadBlockBlobResponse = await blobClient.download();
        const blobData = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString();
        return JSON.parse(blobData);
    } catch (error) {
        throw error;
    }
};

// Fonction pour convertir un stream en Buffer
const streamToBuffer = async (readableStream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
};

// Lancer le serveur sur le port 3000
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
