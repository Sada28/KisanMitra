import { API_KEY, MANDI_API_URL } from './endpoint';

const BASE = `${MANDI_API_URL}?api-key=${API_KEY}&format=json`;

// ===== States + Districts — Pagination se sab lao =====
export const fetchStatesAndDistricts = async (onProgress) => {
  try {
    const LIMIT = 100;

    // Step 1 — Total count pata karo
    const countRes = await fetch(`${BASE}&limit=1&fields=state,district`);
    const countData = await countRes.json();
    const total = countData.total || 10886;

    console.log('Total records:', total);

    // Step 2 — Parallel calls banao (10 calls ek saath)
    const totalPages = Math.ceil(total / LIMIT);
    const districtMap = {};

    // Batches mein karo — 10 calls ek saath
    const BATCH_SIZE = 10;
    for (let batch = 0; batch < totalPages; batch += BATCH_SIZE) {
      const batchPromises = [];

      for (let page = batch; page < Math.min(batch + BATCH_SIZE, totalPages); page++) {
        const offset = page * LIMIT;
        const url = `${BASE}&limit=${LIMIT}&offset=${offset}&fields=state,district`;
        batchPromises.push(fetch(url).then(r => r.json()));
      }

      // Batch execute karo
      const batchResults = await Promise.all(batchPromises);

      // Records process karo
      batchResults.forEach(data => {
        if (data.records) {
          data.records.forEach(record => {
            const state = record.state?.trim();
            const district = record.district?.trim();
            if (state && district) {
              if (!districtMap[state]) districtMap[state] = new Set();
              districtMap[state].add(district);
            }
          });
        }
      });

      // Progress callback
      const progress = Math.min(((batch + BATCH_SIZE) / totalPages) * 100, 100);
      onProgress && onProgress(Math.round(progress));
      console.log(`Progress: ${Math.round(progress)}%`);
    }

    // Set to sorted Array
    const finalMap = {};
    Object.keys(districtMap).sort().forEach(state => {
      finalMap[state] = [...districtMap[state]].sort();
    });

    const states = Object.keys(finalMap);
    console.log('Total unique states:', states.length);

    return { states, districtMap: finalMap };
  } catch (e) {
    console.log('fetchStatesAndDistricts error:', e);
    return { states: [], districtMap: {} };
  }
};

// ===== Prices fetch karo =====
export const fetchPrices = async (state, district) => {
  try {
    const url = `${BASE}&limit=100&filters[state.keyword]=${encodeURIComponent(state)}&filters[district]=${encodeURIComponent(district)}`;
    console.log('Fetching prices:', url);

    const res = await fetch(url);
    const data = await res.json();

    console.log('Price records:', data.count, '/', data.total);

    if (!data.records || data.records.length === 0) return [];

    return data.records.map((item, index) => ({
      id: String(index),
      crop: item.commodity?.trim() || 'Unknown',
      variety: item.variety?.trim() || 'Local',
      market: item.market?.trim() || district,
      grade: item.grade?.trim() || '-',
      min: Number(item.min_price) || 0,
      max: Number(item.max_price) || 0,
      modal: Number(item.modal_price) || 0,
      date: item.arrival_date || 'Today',
    }));
  } catch (e) {
    console.log('fetchPrices error:', e);
    return [];
  }
};
