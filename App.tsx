
import React, { useState, useCallback, useMemo } from 'react';
import { splitText } from './services/textProcessor';
import { MAX_CHUNK_LENGTH } from './constants';
import { CopyIcon, ExcelIcon, SplitIcon, ClearIcon, CheckIcon } from './components/Icons';

// This tells TypeScript that the XLSX variable will be available globally from the CDN script
declare var XLSX: any;

export default function App() {
  const [inputText, setInputText] = useState<string>('');
  const [chunks, setChunks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const characterCount = useMemo(() => inputText.length, [inputText]);

  const handleSplitText = useCallback(() => {
    setIsLoading(true);
    // Simulate processing for better UX on very fast operations
    setTimeout(() => {
      const result = splitText(inputText);
      setChunks(result);
      setIsLoading(false);
    }, 200);
  }, [inputText]);

  const handleClear = useCallback(() => {
    setInputText('');
    setChunks([]);
    setCopiedIndex(null);
  }, []);

  const handleCopyToClipboard = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2500);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Không thể sao chép vào clipboard.');
      });
  }, []);

  const handleExportToExcel = useCallback(() => {
    if (chunks.length === 0) {
      alert('Không có dữ liệu để xuất. Vui lòng chia văn bản trước.');
      return;
    }

    if (typeof XLSX === 'undefined') {
      alert('Thư viện xuất Excel chưa được tải. Vui lòng kiểm tra kết nối mạng và làm mới trang.');
      return;
    }
    
    try {
        const data = [
            ["Số thứ tự", "Nội dung", "Số ký tự"],
            ...chunks.map((chunk, index) => [index + 1, chunk, chunk.length])
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        
        // Set column widths
        worksheet['!cols'] = [{ wch: 10 }, { wch: 100 }, { wch: 15 }];
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Văn bản đã chia");
        XLSX.writeFile(workbook, "van-ban-da-chia.xlsx");
    } catch (error) {
        console.error("Error exporting to Excel:", error);
        alert("Đã xảy ra lỗi khi xuất file Excel.");
    }
  }, [chunks]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-500">
            Trình Chia Văn Bản
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Chia văn bản dài thành các đoạn nhỏ hơn để xử lý dễ dàng.
          </p>
        </header>
        
        <main className="space-y-8">
          <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700">
            <label htmlFor="text-input" className="block text-lg font-medium text-slate-300 mb-2">
              Văn bản gốc
            </label>
            <div className="relative">
              <textarea
                id="text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Dán văn bản dài của bạn vào đây..."
                className="w-full h-60 p-4 bg-slate-900 border border-slate-700 rounded-lg resize-y focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow duration-200 text-slate-300"
              />
              <div className="absolute bottom-3 right-3 text-sm text-slate-500">
                {characterCount.toLocaleString('vi-VN')} / {MAX_CHUNK_LENGTH.toLocaleString('vi-VN')} ký tự/đoạn
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4 items-center justify-center sm:justify-start">
              <button
                onClick={handleSplitText}
                disabled={!inputText || isLoading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                <SplitIcon />
                {isLoading ? 'Đang xử lý...' : 'Chia văn bản'}
              </button>
              <button
                onClick={handleExportToExcel}
                disabled={chunks.length === 0}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ExcelIcon />
                Xuất Excel
              </button>
               <button
                onClick={handleClear}
                disabled={!inputText}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ClearIcon />
                Xóa
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-300 border-b border-slate-700 pb-2">
              Kết quả ({chunks.length} đoạn)
            </h2>
            {chunks.length === 0 && !isLoading && (
              <div className="text-center py-10 px-6 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                <p className="text-slate-400">Các đoạn văn bản đã chia sẽ xuất hiện ở đây.</p>
              </div>
            )}
            {isLoading && (
               <div className="text-center py-10 px-6 bg-slate-800/50 rounded-2xl">
                <p className="text-slate-400 animate-pulse">Đang chia nhỏ văn bản...</p>
              </div>
            )}
            {chunks.map((chunk, index) => (
              <div key={index} className="bg-slate-800/50 p-5 rounded-2xl shadow-md border border-slate-700 transition-all duration-300 hover:border-sky-500">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-sky-400">
                    Đoạn {index + 1}
                    <span className="ml-3 text-sm font-normal text-slate-400">({chunk.length.toLocaleString('vi-VN')} ký tự)</span>
                  </h3>
                  <button
                    onClick={() => handleCopyToClipboard(chunk, index)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${copiedIndex === index ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    {copiedIndex === index ? <CheckIcon /> : <CopyIcon />}
                    {copiedIndex === index ? 'Đã chép!' : 'Chép'}
                  </button>
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap break-words font-sans bg-slate-900/70 p-4 rounded-lg">{chunk}</pre>
              </div>
            ))}
          </div>
        </main>
        
        <footer className="text-center mt-12 py-4 border-t border-slate-800">
            <p className="text-sm text-slate-500">
                Được phát triển với React, Tailwind CSS, và ♥️
            </p>
        </footer>
      </div>
    </div>
  );
}
