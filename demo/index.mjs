import { JsonDiskStore } from "../dist/index.js";

const db = new JsonDiskStore("data.json", undefined, false);

// Write data
const uniqueKey1 = await db.write("key1", "value1");

// Read data
const value = await db.read(uniqueKey1);
console.log(`Read value: ${value}`);

// Update data
await db.update(uniqueKey1, "newValue");
const updatedValue = await db.read(uniqueKey1);
console.log(`Updated value: ${updatedValue}`);

// Delete data
const deleted = await db.delete(uniqueKey1);
console.log(`Key deleted: ${deleted}`);
