/* ORDER V1 - Online Database (Supabase)
 * ใช้ฐานข้อมูลกลางร่วมกันได้ทุกเครื่องผ่าน Supabase
 * ถ้า Supabase ใช้งานไม่ได้ ระบบจะแจ้งสาเหตุละเอียดขึ้นแทน Failed to fetch อย่างเดียว
 */
(function () {
  const cfg = window.SUPABASE_CONFIG || {};
  const configured = /^https:\/\/[^.]+\.supabase\.co\/?$/.test(String(cfg.url || '')) &&
                     String(cfg.anonKey || '').length > 30 &&
                     !String(cfg.anonKey || '').includes('YOUR_');
  const TABLE = 'order_datasets';
  const DB_NAME = 'ORDER_V1_DATABASE';
  const DB_VERSION = 1;
  const STORE = 'order_datasets';
  let localDbPromise;

  function openLocalDB() {
    if (localDbPromise) return localDbPromise;
    localDbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('savedAt', 'savedAt', { unique: false });
          store.createIndex('fileName', 'fileName', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('เปิดฐานข้อมูลในเครื่องไม่สำเร็จ'));
    });
    return localDbPromise;
  }
  async function localSave(fileName, headers, rows) {
    const db = await openLocalDB();
    const data = { fileName: fileName || 'ORDER', headers: Array.from(headers || []), rows: Array.from(rows || [], r => Array.from(r || [])), savedAt: new Date().toISOString(), rowCount: Math.max(0, (rows || []).length - 1) };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).add(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('บันทึกฐานข้อมูลในเครื่องไม่สำเร็จ'));
    });
  }
  async function localLatest() {
    const db = await openLocalDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).index('savedAt').openCursor(null, 'prev');
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => reject(req.error || new Error('อ่านฐานข้อมูลในเครื่องไม่สำเร็จ'));
    });
  }
  async function localList() {
    const db = await openLocalDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result || []).sort((a,b) => String(b.savedAt).localeCompare(String(a.savedAt))));
      req.onerror = () => reject(req.error || new Error('อ่านรายการฐานข้อมูลในเครื่องไม่สำเร็จ'));
    });
  }
  async function localClear() {
    const db = await openLocalDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error('ล้างฐานข้อมูลในเครื่องไม่สำเร็จ'));
    });
  }

  let client = null;
  if (configured && window.supabase?.createClient) {
    client = window.supabase.createClient(cfg.url.replace(/\/$/, ''), cfg.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  function onlineRequired() {
    if (!client) {
      if (!configured) throw new Error('Supabase ยังไม่ได้ตั้งค่า: ตรวจ js/supabase-config.js');
      if (!window.supabase?.createClient) throw new Error('โหลด Supabase JavaScript ไม่สำเร็จ: ตรวจอินเทอร์เน็ตหรือ CDN');
      throw new Error('สร้าง Supabase client ไม่สำเร็จ');
    }
  }

  function explainError(error, operation) {
    const e = error || {};
    const code = e.code ? `\nCode: ${e.code}` : '';
    const details = e.details ? `\nDetails: ${e.details}` : '';
    const hint = e.hint ? `\nHint: ${e.hint}` : '';
    let msg = e.message || String(e);
    if (/Failed to fetch/i.test(msg)) {
      msg += '\n\nสาเหตุที่ควรตรวจ: Data API, สิทธิ์ GRANT/RLS, URL/Key หรือการเชื่อมต่ออินเทอร์เน็ต';
    }
    return `${operation} ไม่สำเร็จ\n${msg}${code}${details}${hint}`;
  }

  async function ping() {
    onlineRequired();
    try {
      const { data, error } = await client.from(TABLE).select('id').limit(1);
      if (error) throw error;
      return { ok: true, rows: data || [] };
    } catch (e) {
      throw new Error(explainError(e, 'ตรวจการเชื่อมต่อ Supabase'));
    }
  }

  async function saveDataset(fileName, headers, rows) {
    if (!client) return localSave(fileName, headers, rows);
    const payload = {
      file_name: fileName || 'ORDER',
      headers: Array.from(headers || []),
      rows: Array.from(rows || [], r => Array.from(r || [])),
      row_count: Math.max(0, (rows || []).length - 1)
    };
    try {
      const { data, error } = await client.from(TABLE).insert(payload).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      throw new Error(explainError(e, 'บันทึกข้อมูลลง Supabase'));
    }
  }

  async function getLatest() {
    if (!client) return localLatest();
    try {
      const { data, error } = await client.from(TABLE).select('*').order('saved_at', { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { id: data.id, fileName: data.file_name, headers: data.headers || [], rows: data.rows || [], savedAt: data.saved_at, rowCount: data.row_count || 0 };
    } catch (e) {
      throw new Error(explainError(e, 'ดึงข้อมูลจาก Supabase'));
    }
  }

  async function listDatasets() {
    if (!client) return localList();
    try {
      const { data, error } = await client.from(TABLE).select('id,file_name,saved_at,row_count').order('saved_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(x => ({ id:x.id, fileName:x.file_name, savedAt:x.saved_at, rowCount:x.row_count || 0 }));
    } catch (e) {
      throw new Error(explainError(e, 'อ่านรายการจาก Supabase'));
    }
  }

  async function clearAll() {
    if (!client) return localClear();
    try {
      const { error } = await client.from(TABLE).delete().not('id', 'is', null);
      if (error) throw error;
    } catch (e) {
      throw new Error(explainError(e, 'ล้างข้อมูลใน Supabase'));
    }
  }

  window.ORDER_DATABASE = {
    openDB: client ? async () => client : openLocalDB,
    saveDataset,
    getLatest,
    listDatasets,
    clearAll,
    ping,
    isOnline: () => !!client,
    configReady: () => configured,
    mode: client ? 'supabase' : 'local'
  };
  window.orderDBReady = client ? Promise.resolve(client) : openLocalDB();
})();
