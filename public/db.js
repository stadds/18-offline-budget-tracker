//  DECLARE VARIABLES
// =======================================
const DB_NAME = "budget";
const OBJ_STORE = "transactions";

let db;

const request = indexedDB.open(DB_NAME);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore(OBJ_STORE, { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.error("Error Occurred: " + event.target.errorCode);
};

function saveTransaction(trans) {
  const transaction = db.transaction([OBJ_STORE], "readwrite");

  const store = transaction.objectStore(OBJ_STORE);

  store.add(trans);
}

function checkDatabase() {
  const transaction = db.transaction([OBJ_STORE], "readwrite");

  const store = transaction.objectStore(OBJ_STORE);

  const getAll = store.getAll();

  getAll.onsuccess = function() {
      if(getAll.result.length > 0){
          fetch("/api/transaction/bulk", {
              method: "POST",
              body: JSON.stringify(getAll.result),
              headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
              }
          })
          .then(response => response.json())
          .then(() => {
            const transaction = db.transaction([OBJ_STORE], "readwrite");

            const store = transaction.objectStore(OBJ_STORE);

            store.clear();
          });
      }
  };
}

window.addEventListener("online",checkDatabase);