import React, { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useDropzone } from 'react-dropzone';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [roastingStyle, setRoastingStyle] = useState<string>('pedas');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setImage(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const analyzeImage = async () => {
    console.log("Analyzing image...");
    console.log("Roasting style:", roastingStyle);
    if (!image) return;

    setIsAnalyzing(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

      let prompt = "Analisis gambar ini dan berikan roasting yang lucu dan gaul dalam bahasa Indonesia. ";
      switch (roastingStyle) {
        case 'motivasi':
          prompt += "Berikan roasting yang memotivasi tapi tetap lucu.";
          break;
        case 'pedas':
          prompt += "Berikan roasting yang pedas tapi tetap dalam batas wajar.";
          break;
        case 'absurd':
          prompt += "Berikan roasting yang absurd dan tidak masuk akal.";
          break;
      }

      const imageData = await fileToGenerativePart(image);
    console.log("Image data:", imageData);
      const imagePart = { inlineData: { data: imageData.inlineData.data, mimeType: imageData.inlineData.mimeType } };
      const result = await model.generateContent([prompt, imagePart]);
    console.log("API response:", result);
      const response = await result.response;
      const text = response.text();
      setResult(text);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setResult('Ups, ada yang salah nih! Coba lagi ya, bro!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  async function fileToGenerativePart(file: File): Promise<{
    inlineData: { data: string; mimeType: string };
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve({
            inlineData: {
              data: reader.result.split(',')[1],
              mimeType: file.type,
            },
          });
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">Roasting Foto Gaul</h1>
      <div
        {...getRootProps()}
        className={`mb-4 p-4 border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out ${
          isDragActive ? 'border-indigo-600 bg-indigo-100' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {image ? (
          <p className="text-center">Foto siap di-roasting! 🔥</p>
        ) : (
          <p className="text-center">Drag 'n' drop fotomu di sini, atau klik untuk pilih foto</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Gaya Roasting:</label>
        <select
          value={roastingStyle}
          onChange={(e) => setRoastingStyle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="pedas">Pedas 🌶️</option>
          <option value="motivasi">Motivasi 💪</option>
          <option value="absurd">Absurd 🤪</option>
        </select>
      </div>
      <button
        onClick={analyzeImage}
        disabled={!image || isAnalyzing}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ${
          (!image || isAnalyzing) && 'opacity-50 cursor-not-allowed'
        }`}
      >
        {isAnalyzing ? 'Lagi Nge-roast...' : 'Roasting Fotonya, Bro!'}
      </button>
      {isAnalyzing && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}
      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg animate-fade-in">
          <h2 className="text-xl font-semibold mb-2 text-indigo-600">Hasil Roasting:</h2>
          <p className="text-gray-800">{result}</p>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;
