import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

type JsonData = { [key: string]: any };

export class JsonDiskStore {
  private filePath: string;
  private cache: JsonData | null;
  private isFileInitialized: boolean;
  private encryptionKey: Buffer | null;

  constructor(
    fileName: string,
    directoryPath?: string,
    useCache: boolean = false,
    encryptionPassword?: string
  ) {
    this.filePath = this.getFilePath(fileName, directoryPath);
    this.cache = useCache ? {} : null;
    this.isFileInitialized = false;
    this.encryptionKey = encryptionPassword
      ? crypto.scryptSync(encryptionPassword, "salt", 32)
      : null;
  }

  private getFilePath(fileName: string, directoryPath?: string): string {
    const dirPath = directoryPath || process.cwd();
    return path.resolve(dirPath, fileName);
  }

  private async initializeFile(): Promise<void> {
    if (!this.isFileInitialized) {
      await this.ensureFileExists();

      if (!this.cache) {
        const content = await fs.readFile(this.filePath, "utf-8");
        const decryptedContent = this.decrypt(content);
        this.cache = decryptedContent ? JSON.parse(decryptedContent) : {};
      }

      this.isFileInitialized = true;
    }
  }

  private async ensureFileExists(): Promise<void> {
    if (!(await fs.pathExists(this.filePath))) {
      await fs.ensureFile(this.filePath);
      await fs.writeFile(this.filePath, this.encrypt(JSON.stringify({})));
    }
  }

  private encrypt(data: string): string {
    if (!this.encryptionKey) {
      return data;
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", this.encryptionKey, iv);
    const encryptedData = Buffer.concat([
      cipher.update(data, "utf8"),
      cipher.final(),
    ]);

    return iv.toString("hex") + ":" + encryptedData.toString("hex");
  }

  private decrypt(data: string): string {
    if (!this.encryptionKey) {
      return data;
    }

    const [ivString, encryptedDataString] = data.split(":");
    const iv = Buffer.from(ivString, "hex");
    const encryptedData = Buffer.from(encryptedDataString, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.encryptionKey,
      iv
    );
    const decryptedData = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decryptedData.toString("utf8");
  }

  private async readJsonData(): Promise<JsonData> {
    await this.initializeFile();
    return this.cache!;
  }

  private async writeJsonData(data: JsonData): Promise<void> {
    await this.initializeFile();
    this.cache = data;
    await fs.writeFile(this.filePath, this.encrypt(JSON.stringify(data)));
  }

  public async write(key: string, value: any): Promise<string> {
    const data = await this.readJsonData();

    const uniqueKey = `${key}-${uuidv4()}`;
    data[uniqueKey] = value;
    await this.writeJsonData(data);

    return uniqueKey;
  }

  public async read(key: string): Promise<any> {
    const data = await this.readJsonData();
    return data[key];
  }

  public async update(key: string, newValue: any): Promise<void> {
    const data = await this.readJsonData();

    if (!data.hasOwnProperty(key)) {
      throw new Error(`Key "${key}" not found`);
    }

    data[key] = newValue;
    await this.writeJsonData(data);
  }

  public async delete(key: string): Promise<boolean> {
    const data = await this.readJsonData();

    if (!data.hasOwnProperty(key)) {
      return false;
    }

    delete data[key];
    await this.writeJsonData(data);
    return true;
  }
}
