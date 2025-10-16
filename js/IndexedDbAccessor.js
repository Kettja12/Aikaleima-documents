export function initialize()
{
    let yasIndexedDb = indexedDB.open(DATABASE_NAME, CURRENT_VERSION);
    yasIndexedDb.onupgradeneeded = function ()
    {
        let db = yasIndexedDb.result;
        db.createObjectStore("settings", { keyPath: "key" });
    }
}

export function set(collectionName, value)
{
    let yasIndexedDb = indexedDB.open(DATABASE_NAME, CURRENT_VERSION);

    yasIndexedDb.onsuccess = function ()
    {
        let transaction = yasIndexedDb.result.transaction(collectionName, "readwrite");
        let collection = transaction.objectStore(collectionName)
        collection.put(value);
    }
}

export async function get(collectionName, id)
{
    let request = new Promise((resolve) =>
    {
        let yasIndexedDb = indexedDB.open(DATABASE_NAME, CURRENT_VERSION);
        yasIndexedDb.onsuccess = function ()
        {
            let transaction = yasIndexedDb.result.transaction(collectionName, "readonly");
            let collection = transaction.objectStore(collectionName);
            let result = collection.get(id);

            result.onsuccess = function (e)
            {
                resolve(result.result);
            }
        }
    });

    let result = await request;

    return result;
}

let CURRENT_VERSION = 2;
let DATABASE_NAME = "YAS";