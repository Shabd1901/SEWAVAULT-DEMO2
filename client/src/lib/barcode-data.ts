// Predefined barcode data from CSV file
export const VALID_TOKENS = [
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

export function validateBarcodeFormat(barcode: string): { valid: boolean; tokenNumber?: number } {
  // Check if barcode matches format: ABX_1001_IFUD7D_RSSB
  const match = barcode.match(/^ABX_(\d+)_([A-Z0-9]+)_RSSB$/);
  
  if (!match) {
    return { valid: false };
  }

  const tokenNumber = parseInt(match[1]);
  const secret = match[2];

  // Validate against known tokens
  const validToken = VALID_TOKENS.find(
    token => token.token_number === tokenNumber && token.secret === secret
  );

  return {
    valid: !!validToken,
    tokenNumber: validToken?.token_number,
  };
}

export function getTokenByNumber(tokenNumber: number) {
  return VALID_TOKENS.find(token => token.token_number === tokenNumber);
}
