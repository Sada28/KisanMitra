import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { fetchStatesAndDistricts, fetchPrices } from '../services/mandiService';

// ===== DAYS AGO LABEL =====
const getDaysLabel = (daysAgo) => {
  if (daysAgo === 0) return { label: '🟢 Aaj Ka Data', color: '#27ae60', bg: '#e8f8f0' };
  if (daysAgo === 1) return { label: '🟡 Kal Ka Data', color: '#f39c12', bg: '#fff8e8' };
  if (daysAgo === 2) return { label: '🟠 Parso Ka Data', color: '#e67e22', bg: '#fff3e0' };
  return { label: `🔴 ${daysAgo} Din Purana Data`, color: '#e74c3c', bg: '#ffeaea' };
};

// ===== MODAL DROPDOWN =====
function Dropdown({ value, options, placeholder, onSelect, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  if (disabled) {
    return (
      <View style={[dd.trigger, dd.triggerDisabled]}>
        <Text style={dd.placeholder}>{placeholder}</Text>
        <Text style={dd.arrow}>▼</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[dd.trigger, value && dd.triggerSelected]}
        onPress={() => { setOpen(true); setSearch(''); }}
        activeOpacity={0.8}>
        <Text style={[dd.triggerText, !value && dd.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={dd.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dd.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={dd.sheet}>
            <View style={dd.sheetHeader}>
              <View style={dd.pill} />
              <Text style={dd.sheetTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} style={dd.closeBtn}>
                <Text style={dd.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={dd.searchRow}>
              <Text>🔍</Text>
              <TextInput
                style={dd.searchInput}
                placeholder="Search..."
                placeholderTextColor="#bbb"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Text style={dd.clearBtn}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filtered}
              keyExtractor={item => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[dd.option, value === item && dd.optionActive]}
                  onPress={() => { onSelect(item); setOpen(false); setSearch(''); }}>
                  <Text style={[dd.optionText, value === item && dd.optionTextActive]}>
                    {item}
                  </Text>
                  {value === item && <Text style={dd.check}>✓</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={dd.emptyWrap}>
                  <Text style={dd.emptyText}>Koi result nahi mila</Text>
                </View>
              }
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ===== PRICE CARD =====
function PriceCard({ item }) {
  const priceRange = item.max > 0
    ? Math.round(((item.max - item.min) / item.max) * 100)
    : 0;

  return (
    <View style={pc.card}>
      <View style={pc.cardTop}>
        <View style={pc.cropInfo}>
          <Text style={pc.cropName}>{item.crop}</Text>
          <Text style={pc.meta}>{item.variety} · {item.market}</Text>
          <View style={pc.tagRow}>
            {item.grade !== '-' && (
              <View style={pc.gradeBadge}>
                <Text style={pc.gradeText}>Grade: {item.grade}</Text>
              </View>
            )}
            <View style={pc.dateBadge}>
              <Text style={pc.dateText}>📅 {item.date}</Text>
            </View>
          </View>
        </View>
        <View style={pc.modalBadge}>
          <Text style={pc.modalLabel}>MODAL</Text>
          <Text style={pc.modalPrice}>₹{Number(item.modal).toLocaleString()}</Text>
          <Text style={pc.modalUnit}>/Quintal</Text>
        </View>
      </View>
      <View style={pc.priceRow}>
        <View style={pc.priceItem}>
          <Text style={pc.priceLabel}>MIN</Text>
          <Text style={[pc.priceValue, { color: '#e74c3c' }]}>
            ₹{Number(item.min).toLocaleString()}
          </Text>
        </View>
        <View style={pc.priceDivider} />
        <View style={pc.priceItem}>
          <Text style={pc.priceLabel}>MAX</Text>
          <Text style={[pc.priceValue, { color: '#27ae60' }]}>
            ₹{Number(item.max).toLocaleString()}
          </Text>
        </View>
        <View style={pc.priceDivider} />
        <View style={pc.priceItem}>
          <Text style={pc.priceLabel}>RANGE</Text>
          <Text style={[pc.priceValue, { color: Colors.amber }]}>{priceRange}%</Text>
        </View>
      </View>
    </View>
  );
}

// ===== SKELETON =====
function SkeletonCard() {
  return (
    <View style={sk.card}>
      <View style={sk.row}>
        <View style={sk.titleBlock} />
        <View style={sk.badge} />
      </View>
      <View style={sk.priceRow}>
        <View style={sk.priceBlock} />
        <View style={sk.priceBlock} />
        <View style={sk.priceBlock} />
      </View>
    </View>
  );
}

// ===== PROGRESS BAR =====
function ProgressBar({ progress }) {
  return (
    <View style={pb.wrap}>
      <View style={pb.track}>
        <View style={[pb.fill, { width: `${progress}%` }]} />
      </View>
      <Text style={pb.text}>Data load ho raha hai... {progress}%</Text>
    </View>
  );
}

// ===== MAIN SCREEN =====
export default function MandiScreen() {
  const { t } = useLanguage();

  const [states, setStates] = useState([]);
  const [districtMap, setDistrictMap] = useState({});
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaProgress, setMetaProgress] = useState(0);
  const [metaError, setMetaError] = useState('');

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [results, setResults] = useState([]);
  const [daysAgo, setDaysAgo] = useState(0);
  const [dataDate, setDataDate] = useState('');
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [searched, setSearched] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [priceError, setPriceError] = useState('');

  useEffect(() => { loadMeta(); }, []);

  const loadMeta = async () => {
    setLoadingMeta(true);
    setMetaError('');
    setMetaProgress(0);
    try {
      const { states: s, districtMap: dm } = await fetchStatesAndDistricts(
        p => setMetaProgress(p)
      );
      if (s.length > 0) {
        setStates(s);
        setDistrictMap(dm);
      } else {
        setMetaError('States load nahi hui — Retry karo');
      }
    } catch (e) {
      setMetaError('Network error — Retry karo');
    } finally {
      setLoadingMeta(false);
    }
  };

  const handleStateChange = state => {
    setSelectedState(state);
    setSelectedDistrict('');
    setResults([]);
    setSearched(false);
    setPriceError('');
  };

  const handleSearch = async () => {
    if (!selectedState || !selectedDistrict) return;

    setLoadingPrices(true);
    setSearched(false);
    setResults([]);
    setPriceError('');
    setLoadingStatus('Aaj ka data check kar raha hun...');

    const { records, daysAgo: days, date } = await fetchPrices(
      selectedState,
      selectedDistrict,
      (day) => {
        if (day === 0) setLoadingStatus('Aaj ka data check kar raha hun...');
        else if (day === 1) setLoadingStatus('Kal ka data check kar raha hun...');
        else setLoadingStatus(`${day} din pehle ka data check kar raha hun...`);
      }
    );

    if (records.length > 0) {
      setResults(records);
      setDaysAgo(days);
      setDataDate(date);
    } else {
      setPriceError(`${selectedDistrict} ka 7 din mein koi data nahi mila`);
    }

    setLoadingPrices(false);
    setLoadingStatus('');
    setSearched(true);
  };

  const filteredResults = results.filter(item =>
    item.crop.toLowerCase().includes(searchText.toLowerCase()) ||
    item.market.toLowerCase().includes(searchText.toLowerCase()) ||
    item.variety.toLowerCase().includes(searchText.toLowerCase())
  );

  const districts = districtMap[selectedState] || [];
  const daysLabel = getDaysLabel(daysAgo);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDark} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>🏪 {t.mandi.title}</Text>
            <Text style={styles.headerSub}>AGMARKNET · All India Live Prices</Text>
          </View>
        </View>

        {!loadingMeta && states.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statNum}>{states.length}</Text>
              <Text style={styles.statLabel}>States</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statNum}>
                {Object.values(districtMap).reduce((a, b) => a + b.length, 0)}
              </Text>
              <Text style={styles.statLabel}>Districts</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statNum}>300+</Text>
              <Text style={styles.statLabel}>Crops</Text>
            </View>
          </View>
        )}

        {/* Loading center mein */}
        {loadingMeta && (
          <View style={styles.headerLoader}>
            <ActivityIndicator color={Colors.greenLight} size="small" />
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {loadingMeta && <ProgressBar progress={metaProgress} />}

        {metaError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {metaError}</Text>
            <TouchableOpacity onPress={loadMeta} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* FILTERS */}
        <View style={styles.filtersCard}>
          <Text style={styles.filterTitle}>📍 Location Filter</Text>

          <Text style={styles.dropLabel}>{t.mandi.selectState}</Text>
          {loadingMeta ? (
            <View style={styles.loadingDropdown}>
              <ActivityIndicator size="small" color={Colors.greenMid} />
              <Text style={styles.loadingDropText}>States load ho rahi hain...</Text>
            </View>
          ) : (
            <Dropdown
              value={selectedState}
              options={states}
              placeholder="State chuniye..."
              onSelect={handleStateChange}
            />
          )}

          <Text style={styles.dropLabel}>{t.mandi.selectDistrict}</Text>
          <Dropdown
            value={selectedDistrict}
            options={districts}
            placeholder={
              !selectedState ? 'Pehle state chuniye' :
              districts.length === 0 ? 'Koi district nahi mili' :
              'District chuniye...'
            }
            onSelect={setSelectedDistrict}
            disabled={!selectedState || districts.length === 0}
          />

          <TouchableOpacity
            style={[
              styles.searchBtn,
              (!selectedState || !selectedDistrict || loadingPrices) && styles.searchBtnDisabled,
            ]}
            onPress={handleSearch}
            disabled={!selectedState || !selectedDistrict || loadingPrices}
            activeOpacity={0.85}>
            {loadingPrices ? (
              <View style={styles.loadingBtnRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.loadingBtnText}>{loadingStatus}</Text>
              </View>
            ) : (
              <Text style={styles.searchBtnText}>🔍 Bhav Dekho</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* PRICE ERROR */}
        {priceError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {priceError}</Text>
          </View>
        ) : null}

        {/* SKELETON */}
        {loadingPrices && (
          <View style={styles.resultsSection}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        )}

        {/* RESULTS */}
        {searched && !loadingPrices && results.length > 0 && (
          <View style={styles.resultsSection}>

            {/* Days Ago Banner */}
            <View style={[styles.daysBanner, { backgroundColor: daysLabel.bg }]}>
              <Text style={[styles.daysLabel, { color: daysLabel.color }]}>
                {daysLabel.label}
              </Text>
              <Text style={[styles.daysDate, { color: daysLabel.color }]}>
                {dataDate}
              </Text>
            </View>

            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <View>
                <Text style={styles.resultsTitle}>{selectedDistrict} Mandi</Text>
                <Text style={styles.resultsCount}>{filteredResults.length} crops mil gaye</Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchBar}>
              <Text>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Crop ya market dhundo..."
                placeholderTextColor="#bbb"
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Text style={styles.clearBtn}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {filteredResults.map(item => (
              <PriceCard key={item.id} item={item} />
            ))}

            {filteredResults.length === 0 && searchText.length > 0 && (
              <View style={styles.noData}>
                <Text style={styles.noDataIcon}>🔍</Text>
                <Text style={styles.noDataText}>"{searchText}" nahi mila</Text>
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Text style={styles.clearSearchText}>Search clear karo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* NO DATA AT ALL */}
        {searched && !loadingPrices && results.length === 0 && !priceError && (
          <View style={styles.noData}>
            <Text style={styles.noDataIcon}>🌾</Text>
            <Text style={styles.noDataText}>{t.mandi.noData}</Text>
            <Text style={styles.noDataSub}>{selectedDistrict} ka 7 din mein data nahi mila</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== DROPDOWN STYLES =====
const dd = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  triggerSelected: { borderColor: Colors.greenBright, backgroundColor: '#f0faf5' },
  triggerDisabled: { backgroundColor: '#f0f0f0', opacity: 0.6 },
  triggerText: { fontSize: 13, color: Colors.textDark, fontWeight: '500', flex: 1 },
  placeholder: { color: '#bbb', fontSize: 13, flex: 1 },
  arrow: { fontSize: 10, color: '#999' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%',
    paddingBottom: 20,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  pill: { width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, marginBottom: 10 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
  closeBtn: { position: 'absolute', right: 20, top: 16, padding: 4 },
  closeText: { fontSize: 14, color: '#999', fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.textDark, padding: 0 },
  clearBtn: { fontSize: 12, color: '#999', fontWeight: '700' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  optionActive: { backgroundColor: '#f0faf5' },
  optionText: { fontSize: 14, color: Colors.textDark },
  optionTextActive: { color: Colors.greenMid, fontWeight: '700' },
  check: { color: Colors.greenMid, fontWeight: '700', fontSize: 16 },
  emptyWrap: { padding: 30, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#bbb' },
});

// ===== PROGRESS BAR STYLES =====
const pb = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  track: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: Colors.greenBright, borderRadius: 3 },
  text: { fontSize: 11, color: Colors.textGrey, textAlign: 'center' },
});

// ===== PRICE CARD STYLES =====
const pc = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cropInfo: { flex: 1, gap: 4 },
  cropName: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  meta: { fontSize: 11, color: Colors.textGrey },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  gradeBadge: {
    backgroundColor: '#fff3e8',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gradeText: { fontSize: 9, color: Colors.amber, fontWeight: '700' },
  dateBadge: {
    backgroundColor: '#f0f4f1',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dateText: { fontSize: 9, color: Colors.textGrey },
  modalBadge: {
    backgroundColor: Colors.greenDark,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 90,
  },
  modalLabel: { fontSize: 8, color: Colors.greenLight, fontWeight: '700', letterSpacing: 1.5 },
  modalPrice: { fontSize: 16, color: Colors.white, fontWeight: '800', marginTop: 2 },
  modalUnit: { fontSize: 8, color: Colors.greenLight, marginTop: 1 },
  priceRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  priceItem: { flex: 1, alignItems: 'center', gap: 4 },
  priceLabel: { fontSize: 9, color: '#aaa', fontWeight: '700', letterSpacing: 1 },
  priceValue: { fontSize: 13, fontWeight: '700' },
  priceDivider: { width: 1, height: 28, backgroundColor: '#e5e5e5' },
});

// ===== SKELETON STYLES =====
const sk = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  titleBlock: { width: '50%', height: 16, backgroundColor: '#f0f0f0', borderRadius: 8 },
  badge: { width: 80, height: 50, backgroundColor: '#f0f0f0', borderRadius: 12 },
  priceRow: { flexDirection: 'row', gap: 8 },
  priceBlock: { flex: 1, height: 32, backgroundColor: '#f0f0f0', borderRadius: 8 },
});

// ===== MAIN STYLES =====
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f1' },
  scroll: { flex: 1 },
  header: {
    backgroundColor: Colors.greenDark,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 12,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: 11, color: Colors.greenLight, marginTop: 3, opacity: 0.8, letterSpacing: 1 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  statChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statNum: { fontSize: 16, fontWeight: '800', color: Colors.white },
  statLabel: { fontSize: 9, color: Colors.greenLight, marginTop: 1, letterSpacing: 0.5 },
  filtersCard: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    gap: 8,
  },
  filterTitle: { fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 4 },
  dropLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.5,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  loadingDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  loadingDropText: { fontSize: 13, color: '#bbb' },
  searchBtn: {
    backgroundColor: Colors.greenMid,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.greenMid,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBtnDisabled: { opacity: 0.4 },
  searchBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  loadingBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingBtnText: { color: Colors.white, fontSize: 12, fontWeight: '500' },
  errorBanner: {
    backgroundColor: '#fff8e8',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.amber,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: { fontSize: 12, color: '#7a5500', fontWeight: '500', flex: 1 },
  retryBtn: {
    backgroundColor: Colors.amber,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginLeft: 8,
  },
  retryText: { fontSize: 11, color: Colors.white, fontWeight: '700' },

  // Days ago banner
  daysBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  daysLabel: { fontSize: 13, fontWeight: '700' },
  daysDate: { fontSize: 12, fontWeight: '600' },

  resultsSection: { paddingHorizontal: 16 },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  resultsCount: { fontSize: 11, color: Colors.textGrey, marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.textDark, padding: 0 },
  clearBtn: { fontSize: 12, color: '#999', fontWeight: '700' },
  noData: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  noDataIcon: { fontSize: 40 },
  noDataText: { fontSize: 15, color: Colors.textDark, fontWeight: '600' },
  noDataSub: { fontSize: 12, color: Colors.textGrey, textAlign: 'center' },
  clearSearchText: { fontSize: 13, color: Colors.greenMid, fontWeight: '600', marginTop: 4 },
});
