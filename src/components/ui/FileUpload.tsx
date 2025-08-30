'use client';

import React, { useState, useRef, useCallback } from 'react';
import { clsx } from 'clsx';

interface FileUploadProps {
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in bytes
    maxFiles?: number;
    onFilesChange?: (files: File[]) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    className?: string;
    dragDropClassName?: string;
    showPreview?: boolean;
    allowRemove?: boolean;
}

interface FileWithPreview extends File {
    preview?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    accept,
    multiple = false,
    maxSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 10,
    onFilesChange,
    onError,
    disabled = false,
    className,
    dragDropClassName,
    showPreview = true,
    allowRemove = true,
}) => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        if (maxSize && file.size > maxSize) {
            return `Arquivo "${file.name}" é muito grande. Tamanho máximo: ${formatFileSize(maxSize)}`;
        }

        if (accept) {
            const acceptedTypes = accept.split(',').map(type => type.trim());
            const fileType = file.type;
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

            const isValidType = acceptedTypes.some(type => {
                if (type.startsWith('.')) {
                    return type === fileExtension;
                }
                if (type.includes('*')) {
                    const baseType = type.split('/')[0];
                    return fileType.startsWith(baseType);
                }
                return fileType === type;
            });

            if (!isValidType) {
                return `Tipo de arquivo não aceito: ${file.name}`;
            }
        }

        return null;
    };

    const createFilePreview = (file: File): Promise<FileWithPreview> => {
        return new Promise((resolve) => {
            const fileWithPreview = file as FileWithPreview;

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fileWithPreview.preview = e.target?.result as string;
                    resolve(fileWithPreview);
                };
                reader.readAsDataURL(file);
            } else {
                resolve(fileWithPreview);
            }
        });
    };

    const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
        if (disabled) return;

        const fileArray = Array.from(newFiles);
        const errors: string[] = [];
        const validFiles: File[] = [];

        // Validate each file
        for (const file of fileArray) {
            const error = validateFile(file);
            if (error) {
                errors.push(error);
            } else {
                validFiles.push(file);
            }
        }

        // Check total file count
        const totalFiles = files.length + validFiles.length;
        if (maxFiles && totalFiles > maxFiles) {
            errors.push(`Máximo de ${maxFiles} arquivos permitidos`);
            return;
        }

        if (errors.length > 0) {
            onError?.(errors.join('\n'));
            return;
        }

        setIsUploading(true);

        try {
            // Create previews for valid files
            const filesWithPreview = await Promise.all(
                validFiles.map(file => createFilePreview(file))
            );

            const updatedFiles = multiple
                ? [...files, ...filesWithPreview]
                : filesWithPreview;

            setFiles(updatedFiles);
            onFilesChange?.(updatedFiles);
        } catch (error) {
            onError?.('Erro ao processar arquivos');
        } finally {
            setIsUploading(false);
        }
    }, [files, multiple, maxFiles, disabled, onFilesChange, onError]);

    const removeFile = (index: number) => {
        if (!allowRemove) return;

        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        onFilesChange?.(updatedFiles);

        // Revoke preview URL to prevent memory leaks
        const file = files[index];
        if (file.preview) {
            URL.revokeObjectURL(file.preview);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (!disabled && e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
        // Reset input value to allow uploading same file again
        e.target.value = '';
    };

    const openFileDialog = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return (
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            );
        }
        if (file.type.includes('pdf')) {
            return (
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            );
        }
        return (
            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
        );
    };

    return (
        <div className={clsx('w-full', className)}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleInputChange}
                className="hidden"
                disabled={disabled}
            />

            {/* Drag and drop area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileDialog}
                className={clsx(
                    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200',
                    {
                        'border-blue-400 bg-blue-50': isDragOver && !disabled,
                        'border-gray-300 hover:border-gray-400': !isDragOver && !disabled,
                        'border-gray-200 bg-gray-50 cursor-not-allowed': disabled,
                    },
                    dragDropClassName
                )}
            >
                <div className="flex flex-col items-center space-y-4">
                    {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    ) : (
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    )}

                    <div>
                        <p className="text-lg font-medium text-gray-900">
                            {isUploading ? 'Processando...' : 'Arraste arquivos aqui'}
                        </p>
                        <p className="text-sm text-gray-500">
                            ou <span className="text-blue-500 underline">clique para selecionar</span>
                        </p>

                        {accept && (
                            <p className="text-xs text-gray-400 mt-2">
                                Tipos aceitos: {accept}
                            </p>
                        )}

                        {maxSize && (
                            <p className="text-xs text-gray-400">
                                Tamanho máximo: {formatFileSize(maxSize)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* File list */}
            {showPreview && files.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Arquivos selecionados:</h4>
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md"
                            >
                                {/* File icon or preview */}
                                <div className="flex-shrink-0">
                                    {file.preview ? (
                                        <img
                                            src={file.preview}
                                            alt={file.name}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                    ) : (
                                        getFileIcon(file)
                                    )}
                                </div>

                                {/* File info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>

                                {/* Remove button */}
                                {allowRemove && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(index);
                                        }}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        disabled={disabled}
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
