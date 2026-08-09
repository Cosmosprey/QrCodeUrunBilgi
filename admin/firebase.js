import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js"; // firestore işlemleri için gerekli fonksiyonları import et

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"; // firestore işlemleri için gerekli fonksiyonları import et

import { getStorage, ref, uploadBytes, getDownloadURL } // storage işlemleri için gerekli fonksiyonları import et

  from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";

  //Firebase projesi oluşturulduktan sonra, proje ayarlarından config bilgilerini alıp buraya yapıştırın
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
}; // firestore işlemleri için gerekli fonksiyonları export et

const storage = getStorage(app);

export { storage, ref, uploadBytes, getDownloadURL }; // storage işlemleri için gerekli fonksiyonları export et