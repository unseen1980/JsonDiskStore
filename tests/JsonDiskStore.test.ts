import path from "path";
import fs from "fs-extra";
import { JsonDiskStore } from "../src/JsonDiskStore";

const testFilePath = path.resolve(process.cwd(), "test_data");

describe("JsonDiskStore", () => {
  afterEach(async () => {
    // Clean up test_data directory after each test
    await fs.remove(testFilePath);
  });

  test("write, read, update, and delete operations", async () => {
    const db = new JsonDiskStore("data.json", testFilePath, false);

    // Test write operation
    const uniqueKey1 = (await db.write("key1", "value1")) as string;

    const value1 = (await db.read(uniqueKey1)) as string;

    expect(value1).toBe("value1");

    // Test update operation
    await db.update(uniqueKey1, "updatedValue1");
    const updatedValue1 = await db.read(uniqueKey1);
    expect(updatedValue1).toBe("updatedValue1");

    // Test delete operation
    const deleteSuccess = await db.delete(uniqueKey1);
    expect(deleteSuccess).toBe(true);

    // Test read after delete
    const deletedValue = await db.read(uniqueKey1);
    expect(deletedValue).toBeUndefined();

    // Test unsuccessful delete
    const deleteFail = await db.delete("nonExistentKey");
    expect(deleteFail).toBe(false);
  });

  test("throws error when updating non-existent key", async () => {
    const db = new JsonDiskStore("data.json", testFilePath, false);
    await expect(db.update("nonExistentKey", "value")).rejects.toThrow(
      'Key "nonExistentKey" not found'
    );
  });

  test("cache is utilized for read operations", async () => {
    const db = new JsonDiskStore("data.json", testFilePath, true);
    const uniqueKey1 = (await db.write("key1", "value1")) as string;

    // spyOn fs.promises.readFile to ensure it's not called during read operations
    const readFileSpy = jest.spyOn(fs.promises, "readFile");

    const value1 = await db.read(uniqueKey1);
    expect(value1).toBe("value1");
    expect(readFileSpy).not.toHaveBeenCalled();

    // Clean up spy
    readFileSpy.mockRestore();
  });

  test("file content is in sync with cache", async () => {
    const db = new JsonDiskStore("data.json", testFilePath, true);

    const uniqueKey1 = (await db.write("key1", "value1")) as string;
    const uniqueKey2 = (await db.write("key2", "value2")) as string;

    await db.update(uniqueKey1, "updatedValue1");
    await db.delete(uniqueKey2);

    const fileContent = await fs.promises.readFile(
      path.resolve(testFilePath, "data.json"),
      "utf-8"
    );
    const fileData = JSON.parse(fileContent);

    expect(fileData).toEqual({
      [Object.keys(fileData)[0]]: "updatedValue1",
    });
  });
});
