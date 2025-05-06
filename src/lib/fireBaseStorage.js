import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import crypto from "crypto";
import sharp from "sharp";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_AUTH_DOMAIN,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

class FireBaseStorage {
  async save(fileName, buffer) {
    try {
      const fileHash = crypto.randomBytes(10).toString("hex");
      const baseName = fileName.split(".").slice(0, -1).join(".").replace(" ", "-");
      const uniqueFileName = `${fileHash}-${baseName}.png`;

      const pngBuffer = await sharp(buffer).png().toBuffer();
      const storageRef = ref(storage, `uploads/${uniqueFileName}`);

      const metadata = {
        contentType: "image/png",
      };

      const uploadTask = uploadBytesResumable(storageRef, pngBuffer, metadata);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => {
            console.error("Upload failed:", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log("File available at", downloadURL);
              resolve(downloadURL);
            });
          }
        );
      });
    } catch (error) {
      console.error(`Error saving file: ${error.message}`);
      throw error;
    }
  }

  async delete(fileName) {
    try {
      const fileRef = ref(storage, `uploads/${fileName}`);
      await deleteObject(fileRef);
    } catch (error) {
      if (error.code === "storage/object-not-found") {
        console.error(`File ${fileName} not found in Firebase Storage.`);
      } else {
        console.error(`Error deleting file from Firebase Storage: ${error.message}`);
      }
    }
  }
}

export default FireBaseStorage;
