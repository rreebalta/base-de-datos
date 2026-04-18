// episodios.js - Servicio de datos con Firestore
import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

// ========================
// CACHÉ INTERNO (para no llamar a Firestore cada vez)
// ========================
let cachedEpisodios = null;
let cachedSeries = null;

// Función para cargar todos los episodios y series una sola vez
async function cargarDatos() {
  if (cachedEpisodios !== null && cachedSeries !== null) {
    return { episodios: cachedEpisodios, series: cachedSeries };
  }

  console.log('🔄 Cargando datos desde Firestore...');

  // Obtener todas las series
  const seriesSnap = await getDocs(collection(db, 'series'));
  const series = [];
  seriesSnap.forEach(doc => {
    series.push({ id: doc.id, ...doc.data() });
  });
  cachedSeries = series;

  // Obtener todos los episodios
  const episodiosSnap = await getDocs(collection(db, 'episodios'));
  const episodios = [];
  episodiosSnap.forEach(doc => {
    episodios.push({ id: doc.id, ...doc.data() });
  });

  // Asociar la serie a cada episodio (buscar por seriesid)
  const seriesMap = Object.fromEntries(series.map(s => [s.seriesid, s]));
  cachedEpisodios = episodios.map(ep => ({
    ...ep,
    series: seriesMap[ep.seriesid] || null
  }));

  console.log(`✅ Cargados ${cachedEpisodios.length} episodios y ${cachedSeries.length} series`);
  return { episodios: cachedEpisodios, series: cachedSeries };
}

// ========================
// FUNCIONES EXPORTADAS (para usar en tu SPA)
// ========================

export async function getAllEpisodios() {
  const { episodios } = await cargarDatos();
  return episodios;
}

export async function getAllSeries() {
  const { series } = await cargarDatos();
  return series;
}

export async function getEpisodioById(id) {
  const { episodios } = await cargarDatos();
  return episodios.find(ep => ep.id === id) || null;
}

export async function getEpisodioByDetailUrl(url) {
  const { episodios } = await cargarDatos();
  return episodios.find(ep => ep.detailUrl === url) || null;
}

export async function getSerieById(seriesid) {
  const { series } = await cargarDatos();
  return series.find(s => s.seriesid === seriesid) || null;
}

export async function getSerieByUrl(url) {
  const { series } = await cargarDatos();
  return series.find(s => s.url_serie === url) || null;
}

export async function getEpisodiosBySerieId(seriesid) {
  const { episodios } = await cargarDatos();
  return episodios.filter(ep => ep.seriesid === seriesid);
}

export async function getEpisodiosBySerieUrl(url) {
  const serie = await getSerieByUrl(url);
  if (!serie) return [];
  return getEpisodiosBySerieId(serie.seriesid);
}

export async function getEpisodiosConSerie() {
  const { episodios } = await cargarDatos();
  return episodios;
}

// ========================
// AUTENTICACIÓN Y SESIÓN
// ========================
export function getCurrentUser() {
  return auth.currentUser;
}

export async function isPremiumUser() {
  const user = auth.currentUser;
  if (!user) return false;
  const tokenResult = await user.getIdTokenResult();
  return tokenResult.claims.premium === true;
}
