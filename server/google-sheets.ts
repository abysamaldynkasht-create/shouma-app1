import { google, sheets_v4 } from "googleapis";

let sheetsClient: sheets_v4.Sheets | null = null;
let spreadsheetId: string | null = null;

export interface SheetRow {
  id: string;
  activityName: string;
  category: string;
  state: string;
  description: string;
  googleMapsLink: string;
  images: string;
  hiddenGems: string;
}

function getCredentials(): any | null {
  const credsJson = process.env.GOOGLE_SHEETS_CREDENTIALS;
  if (!credsJson) return null;
  try {
    return JSON.parse(credsJson);
  } catch {
    try {
      const cleaned = credsJson.replace(/\\n/g, '\n').replace(/\r/g, '');
      return JSON.parse(cleaned);
    } catch (e2) {
      console.error("Failed to parse GOOGLE_SHEETS_CREDENTIALS:", e2);
      return null;
    }
  }
}

async function getClient(): Promise<sheets_v4.Sheets | null> {
  if (sheetsClient) return sheetsClient;

  const creds = getCredentials();
  if (!creds) return null;

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

function getSpreadsheetId(): string | null {
  if (spreadsheetId) return spreadsheetId;
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) return null;
  spreadsheetId = id;
  return spreadsheetId;
}

function rowToSheetRow(row: string[]): SheetRow {
  return {
    id: row[0] || "",
    activityName: row[1] || "",
    category: row[2] || "",
    state: row[3] || "",
    description: row[4] || "",
    googleMapsLink: row[5] || "",
    images: row[6] || "",
    hiddenGems: row[7] || "",
  };
}

export async function isConfigured(): Promise<boolean> {
  return !!(getCredentials() && getSpreadsheetId());
}

export async function getAllRows(): Promise<SheetRow[]> {
  const client = await getClient();
  const sheetId = getSpreadsheetId();
  if (!client || !sheetId) {
    throw new Error("Google Sheets not configured");
  }

  const response = await client.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sheet1!A2:H",
  });

  const rows = response.data.values || [];
  return rows.map(rowToSheetRow);
}

async function findRowIndexById(id: string): Promise<number> {
  const rows = await getAllRows();
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) {
    throw new Error(`Row with ID ${id} not found`);
  }
  return index;
}

export async function addRow(data: Omit<SheetRow, "id">): Promise<SheetRow> {
  const client = await getClient();
  const sheetId = getSpreadsheetId();
  if (!client || !sheetId) {
    throw new Error("Google Sheets not configured");
  }

  const existing = await getAllRows();
  const maxId = existing.reduce((max, row) => {
    const num = parseInt(row.id);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const newId = String(maxId + 1);

  const newRow = [
    newId,
    data.activityName,
    data.category,
    data.state,
    data.description,
    data.googleMapsLink,
    data.images,
    data.hiddenGems,
  ];

  await client.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:H",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [newRow] },
  });

  return { id: newId, ...data };
}

export async function updateRowById(id: string, data: SheetRow): Promise<SheetRow> {
  const client = await getClient();
  const sheetId = getSpreadsheetId();
  if (!client || !sheetId) {
    throw new Error("Google Sheets not configured");
  }

  const rowIndex = await findRowIndexById(id);
  const range = `Sheet1!A${rowIndex + 2}:H${rowIndex + 2}`;
  const values = [
    [
      data.id,
      data.activityName,
      data.category,
      data.state,
      data.description,
      data.googleMapsLink,
      data.images,
      data.hiddenGems,
    ],
  ];

  await client.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  return data;
}

export async function deleteRowById(id: string): Promise<void> {
  const client = await getClient();
  const sheetId = getSpreadsheetId();
  if (!client || !sheetId) {
    throw new Error("Google Sheets not configured");
  }

  const rowIndex = await findRowIndexById(id);

  const spreadsheet = await client.spreadsheets.get({
    spreadsheetId: sheetId,
  });

  const sheet = spreadsheet.data.sheets?.[0];
  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
    throw new Error("Sheet not found");
  }

  await client.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: "ROWS",
              startIndex: rowIndex + 1,
              endIndex: rowIndex + 2,
            },
          },
        },
      ],
    },
  });
}

export async function initializeSheet(): Promise<string> {
  const client = await getClient();
  const sheetId = getSpreadsheetId();
  if (!client || !sheetId) {
    throw new Error("Google Sheets not configured");
  }

  const response = await client.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sheet1!A1:H1",
  });

  const headers = response.data.values?.[0];
  if (!headers || headers.length === 0) {
    await client.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "Sheet1!A1:H1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["ID", "Activity Name", "Category", "State", "Description", "Google Maps Link", "Images", "Hidden Gems"]],
      },
    });
    return "Headers created";
  }

  return "Sheet already initialized";
}
