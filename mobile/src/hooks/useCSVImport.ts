import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { AccessibilityInfo } from 'react-native';

export interface CSVRow {
  weightKg: number;
  material?: string;
  timestamp?: string;
}

export interface CSVValidationError {
  row: number;
  field: string;
  message: string;
}

export interface CSVImportResult {
  success: boolean;
  data: CSVRow[];
  errors: CSVValidationError[];
  totalRows: number;
  validRows: number;
}

interface UseCSVImportReturn {
  pickAndParseCSV: () => Promise<CSVImportResult | null>;
  isProcessing: boolean;
  error: string | null;
}

const WEIGHT_MIN = 0.001;
const WEIGHT_MAX = 10000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const useCSVImport = (): UseCSVImportReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateWeight = (weight: number): boolean => {
    return !isNaN(weight) && weight >= WEIGHT_MIN && weight <= WEIGHT_MAX;
  };

  const parseRow = (row: Record<string, string>, index: number): {
    data?: CSVRow;
    error?: CSVValidationError;
  } => {
    // Try common CSV column names (case-insensitive)
    const weightValue =
      row.weight ||
      row.Weight ||
      row.peso ||
      row.Peso ||
      row.weightKg ||
      row.weight_kg ||
      row['Peso (kg)'] ||
      '';

    const weight = parseFloat(String(weightValue).replace(',', '.'));

    if (!validateWeight(weight)) {
      return {
        error: {
          row: index + 2, // +2 because CSV is 1-indexed and has header
          field: 'weight',
          message: `Peso inválido: deve estar entre ${WEIGHT_MIN} e ${WEIGHT_MAX} kg`,
        },
      };
    }

    const material =
      row.material ||
      row.Material ||
      row.tipo ||
      row.Tipo ||
      undefined;

    const timestamp =
      row.timestamp ||
      row.Timestamp ||
      row.data ||
      row.Data ||
      row.date ||
      row.Date ||
      undefined;

    return {
      data: {
        weightKg: weight,
        material,
        timestamp,
      },
    };
  };

  const pickAndParseCSV = async (): Promise<CSVImportResult | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Pick CSV file
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsProcessing(false);
        return null;
      }

      const file = result.assets[0];

      // Validate file size
      if (file.size && file.size > MAX_FILE_SIZE) {
        const errorMsg = 'Arquivo muito grande. Máximo: 5MB';
        setError(errorMsg);
        AccessibilityInfo.announceForAccessibility(errorMsg);
        setIsProcessing(false);
        return null;
      }

      // Fetch file content
      const response = await fetch(file.uri);
      const csvText = await response.text();

      // Parse CSV
      const parseResult = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
        transform: (value) => value.trim(),
      });

      if (parseResult.errors.length > 0) {
        const errorMsg = `Erro ao analisar CSV: ${parseResult.errors[0].message}`;
        setError(errorMsg);
        AccessibilityInfo.announceForAccessibility(errorMsg);
        setIsProcessing(false);
        return null;
      }

      // Validate and transform rows
      const validData: CSVRow[] = [];
      const validationErrors: CSVValidationError[] = [];

      parseResult.data.forEach((row, index) => {
        const { data, error } = parseRow(row, index);
        if (data) {
          validData.push(data);
        } else if (error) {
          validationErrors.push(error);
        }
      });

      const totalRows = parseResult.data.length;
      const validRows = validData.length;

      // Announce result
      if (validRows > 0) {
        AccessibilityInfo.announceForAccessibility(
          `CSV processado: ${validRows} de ${totalRows} linhas válidas`
        );
      } else {
        AccessibilityInfo.announceForAccessibility(
          'Nenhuma linha válida encontrada no CSV'
        );
      }

      setIsProcessing(false);

      return {
        success: validRows > 0,
        data: validData,
        errors: validationErrors,
        totalRows,
        validRows,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao processar CSV';
      setError(errorMsg);
      AccessibilityInfo.announceForAccessibility(`Erro: ${errorMsg}`);
      setIsProcessing(false);
      return null;
    }
  };

  return {
    pickAndParseCSV,
    isProcessing,
    error,
  };
};
