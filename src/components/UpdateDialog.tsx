import React from 'react';
import { UpdateStatus } from '../types/finance';
import { RainbowProgressBar } from './RainbowProgressBar';
import { RefreshCw, Download, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface UpdateDialogProps {
  updateStatus: UpdateStatus;
  onDismiss: () => void;
  onCheckUpdate: () => void;
  onStartDownload: (url: string) => void;
}

export const UpdateDialog: React.FC<UpdateDialogProps> = ({
  updateStatus,
  onDismiss,
  onCheckUpdate,
  onStartDownload,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-slate-800/90">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-400" />
            Обновление приложения
          </h3>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-center space-y-4">
          {updateStatus.status === 'checking' && (
            <div className="py-4 space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-300">Проверка обновлений с GitHub...</p>
            </div>
          )}

          {updateStatus.status === 'upToDate' && (
            <div className="py-2 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-base font-bold text-emerald-400">
                Установлена последняя версия ({updateStatus.currentVersion})
              </p>
              <p className="text-xs text-slate-400">Приложение работает на актуальной версии</p>
            </div>
          )}

          {updateStatus.status === 'available' && (
            <div className="py-2 space-y-3 text-left">
              <div className="flex items-center gap-2 text-blue-400">
                <Download className="w-5 h-5" />
                <p className="text-base font-bold">Доступна новая версия {updateStatus.latestVersion}</p>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 text-xs text-slate-300 whitespace-pre-line">
                {updateStatus.releaseNotes}
              </div>
            </div>
          )}

          {updateStatus.status === 'downloading' && (
            <div className="py-3 space-y-3">
              <p className="text-sm font-semibold text-slate-200">Загрузка обновления...</p>
              <RainbowProgressBar progress={updateStatus.progress} />
            </div>
          )}

          {updateStatus.status === 'downloaded' && (
            <div className="py-3 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-base font-bold text-emerald-400">Загрузка завершена!</p>
              <p className="text-xs text-slate-300">Обновление готово к установке.</p>
            </div>
          )}

          {updateStatus.status === 'error' && (
            <div className="py-2 space-y-2">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
              <p className="text-sm font-semibold text-red-400">{updateStatus.message}</p>
            </div>
          )}

          {updateStatus.status === 'idle' && (
            <p className="text-sm text-slate-300 py-2">
              Нажмите «Проверить», чтобы проверить наличие новой версии.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 p-4 border-t border-slate-700/80 bg-slate-800/50">
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Закрыть
          </button>

          {updateStatus.status === 'available' && (
            <button
              onClick={() => onStartDownload(updateStatus.downloadUrl)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg transition-colors"
            >
              Обновить
            </button>
          )}

          {(updateStatus.status === 'idle' ||
            updateStatus.status === 'upToDate' ||
            updateStatus.status === 'error') && (
            <button
              onClick={onCheckUpdate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Проверить снова
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
