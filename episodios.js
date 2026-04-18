// episodios.js - Servicio con Firestore y autenticación
import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc, query, where, setDoc, deleteDoc } from 'firebase/firestore';
import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// ========================
// FUNCIONES PARA DATOS (consultas a Firestore)
// ========================

export async function getAllSeries() {
  const snapshot = await getDocs(collection(db, 'series'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getSerieById(seriesid) {
  const docRef = doc(db, 'series', seriesid);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getSerieByUrl(url) {
  const series = await getAllSeries();
  return series.find(s => s.url_serie === url) || null;
}

export async function getAllEpisodios() {
  const snapshot = await getDocs(collection(db, 'episodios'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getEpisodiosBySerieId(seriesid) {
  const q = query(collection(db, 'episodios'), where('seriesid', '==', seriesid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getEpisodiosBySerieUrl(url) {
  const serie = await getSerieByUrl(url);
  if (!serie) return [];
  return getEpisodiosBySerieId(serie.seriesid);
}

export async function getEpisodioById(id) {
  const docRef = doc(db, 'episodios', id);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getEpisodioByDetailUrl(url) {
  const episodios = await getAllEpisodios();
  return episodios.find(ep => ep.detailUrl === url) || null;
}

export async function getEpisodiosConSerie() {
  const [episodios, series] = await Promise.all([getAllEpisodios(), getAllSeries()]);
  const seriesMap = Object.fromEntries(series.map(s => [s.seriesid, s]));
  return episodios.map(ep => ({ ...ep, series: seriesMap[ep.seriesid] || null }));
}

// ========================
// AUTENTICACIÓN Y ESTADO
// ========================

let currentUser = null;
let currentUserPremium = false;
const authListeners = [];

export function onAuthChange(callback) {
  authListeners.push(callback);
  callback({ user: currentUser, premium: currentUserPremium });
}

// Actualizar claims premium (desde el token)
async function updatePremiumStatus() {
  if (!auth.currentUser) {
    currentUserPremium = false;
    return;
  }
  const tokenResult = await auth.currentUser.getIdTokenResult();
  currentUserPremium = tokenResult.claims.premium === true;
}

// Iniciar sesión anónima (automática al cargar)
export async function initAnonymousSession() {
  try {
    const userCred = await signInAnonymously(auth);
    currentUser = userCred.user;
    await updatePremiumStatus();
    authListeners.forEach(cb => cb({ user: currentUser, premium: currentUserPremium }));
    return currentUser;
  } catch (error) {
    console.error('Error en autenticación anónima:', error);
    throw error;
  }
}

// Registrar con email/contraseña
export async function registerWithEmail(email, password) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  currentUser = userCred.user;
  await updatePremiumStatus();
  authListeners.forEach(cb => cb({ user: currentUser, premium: currentUserPremium }));
  return currentUser;
}

// Iniciar sesión con email/contraseña
export async function loginWithEmail(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  currentUser = userCred.user;
  await updatePremiumStatus();
  authListeners.forEach(cb => cb({ user: currentUser, premium: currentUserPremium }));
  return currentUser;
}

// Cerrar sesión
export async function logout() {
  await signOut(auth);
  currentUser = null;
  currentUserPremium = false;
  authListeners.forEach(cb => cb({ user: null, premium: false }));
}

// Verificar si un episodio es accesible (según premium)
export function isEpisodioAccesible(episodio, userPremium = currentUserPremium) {
  if (!episodio.premium) return true;
  return userPremium === true;
}

// ========================
// FAVORITOS (requiere login)
// ========================

async function getCurrentUserId() {
  if (!auth.currentUser) throw new Error('Debes iniciar sesión');
  return auth.currentUser.uid;
}

export async function getFavoritos() {
  const uid = await getCurrentUserId();
  const favCollection = collection(db, 'usuarios', uid, 'favoritos');
  const snapshot = await getDocs(favCollection);
  return snapshot.docs.map(doc => ({ episodioId: doc.id, ...doc.data() }));
}

export async function addFavorito(episodioId) {
  const uid = await getCurrentUserId();
  const favRef = doc(db, 'usuarios', uid, 'favoritos', episodioId);
  await setDoc(favRef, { fecha_agregado: new Date().toISOString() });
}

export async function removeFavorito(episodioId) {
  const uid = await getCurrentUserId();
  const favRef = doc(db, 'usuarios', uid, 'favoritos', episodioId);
  await deleteDoc(favRef);
}

export async function isFavorito(episodioId) {
  const uid = await getCurrentUserId();
  const favRef = doc(db, 'usuarios', uid, 'favoritos', episodioId);
  const snap = await getDoc(favRef);
  return snap.exists();
}
