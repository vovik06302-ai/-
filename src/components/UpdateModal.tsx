import React, { useState } from 'react';
import { UpdateStatus } from '../types';
import { RainbowProgressBar } from './RainbowProgressBar';
import { RefreshCw, CheckCircle2, Download, AlertTriangle, X } from 'lucide-react';

interface Props {
  updateStatus: UpdateStatus;
  onClose: () => void;
  onCheckUpdate: () => void;
  onStartDownload: () => void;
}

export const UpdateModal: React.FC<Props> = ({
  updateStatus,
  onClose,
  onCheckUpdate,
  onStartDownload
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h2 className="text-xl font-bold text-slate-800">Обновление приложения</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 text-center">
          {updateStatus.status === 'checking' && (
            <div className="flex flex-col items-center justify-center py-4">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-700">Проверка обновлений с GitHub...</p>
            </div>
          )}

          {updateStatus.status === 'up_to_date' && (
            <div className="flex flex-col items-center justify-center py-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
              <p className="text-base font-bold text-slate-800">Установлена последняя версия</p>
              <p className="text-xs text-slate-500 mt-1">Версия v1.0.0 (актуальная)</p>
            </div>
          )}

          {updateStatus.status === 'update_available' && (
            <div className="text-left space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="font-bold text-blue-900">
                  Доступно обновление {updateStatus.latestVersion}
                </span>
                <p className="text-xs text-slate-600 mt-1">{updateStatus.releaseNotes}</p>
              </div>
            </div>
          )}

          {updateStatus.status === 'downloading' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Загрузка обновления...</p>
              <RainbowProgressBar progress={updateStatus.progress} />
            </div>
          )}

          {updateStatus.status === 'downloaded' && (
            <div className="flex flex-col items-center justify-center py-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
              <p className="text-base font-bold text-slate-800">Загрузка завершена!</p>
              <p className="text-xs text-slate-500 mt-1">Перезапуск с обновленной версией...</p>
            </div>
          )}

          {updateStatus.status === 'error' && (
            <div className="flex flex-col items-center justify-center py-2">
              <AlertTriangle className="w-10 h-10 text-red-600 mb-2" />
              <p className="text-sm font-semibold text-red-600">{updateStatus.message}</p>
            </div>
          )}

          {updateStatus.status === 'idle' && (
            <p className="text-sm text-slate-600">
              Нажмите «Проверить», чтобы проверить наличие новой версии.
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
          {updateStatus.status === 'update_available' ? (
            <button
              onClick={onStartDownload}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Обновить</span>
            </button>
          ) : (
            <button
              onClick={onCheckUpdate}
              disabled={updateStatus.status === 'checking' || updateStatus.status === 'downloading'}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
            >
              Проверить снова
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
