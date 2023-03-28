# JsonDiskStore

JsonDiskStore is a lightweight Node.js library for storing and managing JSON data on the local disk. It offers an easy-to-use API for reading, writing, updating, and deleting JSON data. It also supports optional in-memory caching, custom file paths, and encryption for secure data storage.

## Features

- Read, write, update, and delete JSON data.
- In-memory cache for faster read and write operations.
- Custom file path support for storing the JSON data.
- AES-256 encryption support for secure data storage.

## Installation

Install JsonDiskStore using npm:

`npm install json-disk-store`

## Usage

Here are some examples of how to use JsonDiskStore:

### Basic Usage

```javascript
import { JsonDiskStore } from "json-disk-store";

const db = new JsonDiskStore("data.json");

// Write data
await db.write("key1", "value1");

// Read data
const value = await db.read("key1");
console.log(`Read value: ${value}`);

// Update data
await db.update("key1", "newValue");
const updatedValue = await db.read("key1");
console.log(`Updated value: ${updatedValue}`);

// Delete data
const deleted = await db.delete("key1");
console.log(`Key deleted: ${deleted}`);
```

### In-Memory Cache

Enable in-memory caching for faster read and write operations:

```javascript
import { JsonDiskStore } from "json-disk-store";

const db = new JsonDiskStore("data.json", undefined, true);

// Usage is the same as the basic example
```

### Custom File Path

Store the JSON data in a custom file path:

```javascript
import { JsonDiskStore } from "json-disk-store";
import path from "path";

const customPath = path.resolve(process.cwd(), "custom_data");
const db = new JsonDiskStore("data.json", customPath);

// Usage is the same as the basic example
```

### Encryption

Encrypt the JSON data using AES-256 encryption:

```javascript
import { JsonDiskStore } from "json-disk-store";

const db = new JsonDiskStore(
  "encryptedData.json",
  undefined,
  false,
  "encryptionPassword123"
);

// Usage is the same as the basic example
```

Note: The encryption password should be kept secret and not hardcoded in the source code in a production environment. Instead, consider using environment variables or a secure key management system to store the password.

## License

MIT
