import { type Token, type Deposit, type InsertToken, type InsertDeposit, type TokenRecord, type DepositRecord } from "@shared/schema";
import { randomUUID } from "crypto";

// Predefined valid tokens from CSV data
const VALID_TOKENS_DATA = [
  { "token_number": 1001, "secret": "IFUD7D", "barcode_data": "ABX_1001_IFUD7D_RSSB", "file_path": "barcodes_secure\\token_1001.png" },
  { "token_number": 1002, "secret": "FIZD0V", "barcode_data": "ABX_1002_FIZD0V_RSSB", "file_path": "barcodes_secure\\token_1002.png" },
  { "token_number": 1003, "secret": "YQVP14", "barcode_data": "ABX_1003_YQVP14_RSSB", "file_path": "barcodes_secure\\token_1003.png" },
  { "token_number": 1004, "secret": "Z55BWY", "barcode_data": "ABX_1004_Z55BWY_RSSB", "file_path": "barcodes_secure\\token_1004.png" },
  { "token_number": 1005, "secret": "CEJ88E", "barcode_data": "ABX_1005_CEJ88E_RSSB", "file_path": "barcodes_secure\\token_1005.png" },
  { "token_number": 1006, "secret": "CKLK5K", "barcode_data": "ABX_1006_CKLK5K_RSSB", "file_path": "barcodes_secure\\token_1006.png" },
  { "token_number": 1007, "secret": "RFQSZI", "barcode_data": "ABX_1007_RFQSZI_RSSB", "file_path": "barcodes_secure\\token_1007.png" },
  { "token_number": 1008, "secret": "XM4543", "barcode_data": "ABX_1008_XM4543_RSSB", "file_path": "barcodes_secure\\token_1008.png" },
  { "token_number": 1009, "secret": "244YOE", "barcode_data": "ABX_1009_244YOE_RSSB", "file_path": "barcodes_secure\\token_1009.png" },
  { "token_number": 1010, "secret": "1AC4NU", "barcode_data": "ABX_1010_1AC4NU_RSSB", "file_path": "barcodes_secure\\token_1010.png" },
  { "token_number": 1011, "secret": "WUNLKM", "barcode_data": "ABX_1011_WUNLKM_RSSB", "file_path": "barcodes_secure\\token_1011.png" },
  { "token_number": 1012, "secret": "PNVMTV", "barcode_data": "ABX_1012_PNVMTV_RSSB", "file_path": "barcodes_secure\\token_1012.png" },
  { "token_number": 1013, "secret": "YDSARN", "barcode_data": "ABX_1013_YDSARN_RSSB", "file_path": "barcodes_secure\\token_1013.png" },
  { "token_number": 1014, "secret": "PT6UHX", "barcode_data": "ABX_1014_PT6UHX_RSSB", "file_path": "barcodes_secure\\token_1014.png" },
  { "token_number": 1015, "secret": "YLEYDO", "barcode_data": "ABX_1015_YLEYDO_RSSB", "file_path": "barcodes_secure\\token_1015.png" },
  { "token_number": 1016, "secret": "DFS7FL", "barcode_data": "ABX_1016_DFS7FL_RSSB", "file_path": "barcodes_secure\\token_1016.png" },
  { "token_number": 1017, "secret": "PEUSRX", "barcode_data": "ABX_1017_PEUSRX_RSSB", "file_path": "barcodes_secure\\token_1017.png" },
  { "token_number": 1018, "secret": "9284O3", "barcode_data": "ABX_1018_9284O3_RSSB", "file_path": "barcodes_secure\\token_1018.png" },
  { "token_number": 1019, "secret": "95FKXI", "barcode_data": "ABX_1019_95FKXI_RSSB", "file_path": "barcodes_secure\\token_1019.png" },
  { "token_number": 1020, "secret": "ORD1ED", "barcode_data": "ABX_1020_ORD1ED_RSSB", "file_path": "barcodes_secure\\token_1020.png" }
];

export interface IStorage {
  // Token operations
  getToken(tokenNumber: number): Promise<TokenRecord | undefined>;
  validateToken(tokenNumber: number): Promise<boolean>;
  getAllTokens(): Promise<TokenRecord[]>;
  getTokenStats(): Promise<{ inUse: number; available: number }>;
  
  // Deposit operations
  createDeposit(tokenNumber: number, depositData: DepositRecord): Promise<void>;
  getDeposit(tokenNumber: number): Promise<DepositRecord | undefined>;
  deleteDeposit(tokenNumber: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private deposits: Map<number, DepositRecord>;

  constructor() {
    this.deposits = new Map();
  }

  async getToken(tokenNumber: number): Promise<TokenRecord | undefined> {
    const validToken = VALID_TOKENS_DATA.find(t => t.token_number === tokenNumber);
    if (!validToken) return undefined;

    const deposit = this.deposits.get(tokenNumber);
    
    return {
      tokenNumber: validToken.token_number,
      secret: validToken.secret,
      barcodeData: validToken.barcode_data,
      isInUse: !!deposit,
      deposit,
    };
  }

  async validateToken(tokenNumber: number): Promise<boolean> {
    return VALID_TOKENS_DATA.some(t => t.token_number === tokenNumber);
  }

  async getAllTokens(): Promise<TokenRecord[]> {
    const tokens = await Promise.all(
      VALID_TOKENS_DATA.map(async (validToken) => {
        const deposit = this.deposits.get(validToken.token_number);
        return {
          tokenNumber: validToken.token_number,
          secret: validToken.secret,
          barcodeData: validToken.barcode_data,
          isInUse: !!deposit,
          deposit,
        };
      })
    );
    return tokens;
  }

  async getTokenStats(): Promise<{ inUse: number; available: number }> {
    const inUse = this.deposits.size;
    const available = VALID_TOKENS_DATA.length - inUse;
    return { inUse, available };
  }

  async createDeposit(tokenNumber: number, depositData: DepositRecord): Promise<void> {
    // Validate token exists
    const isValid = await this.validateToken(tokenNumber);
    if (!isValid) {
      throw new Error('Invalid token number');
    }

    // Check if already in use
    if (this.deposits.has(tokenNumber)) {
      throw new Error('Token is already in use');
    }

    this.deposits.set(tokenNumber, depositData);
  }

  async getDeposit(tokenNumber: number): Promise<DepositRecord | undefined> {
    return this.deposits.get(tokenNumber);
  }

  async deleteDeposit(tokenNumber: number): Promise<void> {
    this.deposits.delete(tokenNumber);
  }
}

export const storage = new MemStorage();
