import { useEffect } from 'react';
import { fetchMedicineByBarcode } from '../../../services/api';

/**
 * A custom hook that listens for global keystrokes simulating a barcode scanner.
 * It detects rapid inputs ending with an Enter key and triggers a callback.
 */
export const useBarcodeScanner = ({
  onMedicineFound,
  onBarcodeNotFound,
  dependencies = []
}) => {
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = async (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const currentTime = Date.now();
      
      // If time between keystrokes is more than 50ms, it's probably human typing
      if (currentTime - lastKeyTime > 50) {
        barcodeBuffer = '';
      }
      
      if (e.key === 'Enter' && barcodeBuffer.length > 3) {
        e.preventDefault();
        const codeToProcess = barcodeBuffer;
        barcodeBuffer = '';
        
        try {
          const medicineResponse = await fetchMedicineByBarcode(codeToProcess);
          if (medicineResponse && onMedicineFound) {
             onMedicineFound(medicineResponse);
          }
        } catch (error) {
           console.log('Barcode not found globally', error);
           if (onBarcodeNotFound) {
             onBarcodeNotFound(codeToProcess, error);
           }
        }
      } else if (e.key.length === 1) { 
        barcodeBuffer += e.key;
      }
      
      lastKeyTime = currentTime;
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, dependencies);
};
