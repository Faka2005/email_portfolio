import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

// 🚀 Initialisation Express
const app = express();
const PORT = process.env.PORT || 5000;

// ⚙️ Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 🌍 Connexion MongoDB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let contactCollection;

async function initDB() {
  try {
    await client.connect();
    const db = client.db("Portfolio");
    contactCollection = db.collection("contact");
    console.log("✅ MongoDB connecté");
  } catch (err) {
    console.error("❌ Erreur de connexion à MongoDB :", err);
  }
}
initDB();

// POST /contact
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ error: "Tous les champs sont requis." });

  try {
    const newMessage = {
      name,
      email,
      message,
      createdAt: new Date(),
    };
    const result = await contactCollection.insertOne(newMessage);
    res.status(201).json({ message: "Message enregistré avec succès", id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /contact/messages (admin)
app.get("/contact/messages", async (req, res) => {
  try {
    const messages = await contactCollection.find().sort({ createdAt: -1 }).toArray();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ⚡ Lancement du serveur
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
