let db;
// create a new db request for a "budget" database.
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  // create object store called "pending" and set autoIncrement to true
  const pending = db.createObjectStore("budget", {
    autoIncrement: true,
    keypath: "budgetId"
  });
  // Creates a statusIndex that we can query on.
  pending.createIndex("statusIndex", "status");
};

request.onsuccess = function (event) {
  db = target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(error);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["budget"], "readwrite");
  // access your pending object store
  const budgetStore = transaction.objectStore("budget");
  // add record to your store with add method.
  budgetStore.add({ budgetId: "1", status: "in-progress" });
}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["budget"], "readwrite");
  // access your pending object store
  const budgetStore = transaction.objectStore("budget");
  // get all records from store and set to a variable
  const records = db.budget.find(budgetStore);

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
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
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(["budget"], "readwrite");
          // access your pending object store
          const budgetStore = transaction.objectStore("budget");
          // clear all items in your store
          budgetStore.delete()
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);