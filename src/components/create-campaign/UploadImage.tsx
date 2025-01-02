/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadFieldProps {
  required?: boolean;
  maxSize?: number;
  fieldName?: any;
  onChange?: (file: File | null) => void; // Add this prop
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  required = true, 
  maxSize = 20, 
  fieldName = "Upload Image",
  onChange
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: { preventDefault: () => void; currentTarget: { classList: { add: (arg0: string) => void; }; }; }) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500');
  };

  const handleDragLeave = (e: { preventDefault: () => void; currentTarget: { classList: { remove: (arg0: string) => void; }; }; }) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500');
  };

  const validateFile = (file: { type: string; size: number; }) => {
    // Check if file exists
    if (!file) return 'Please select a file';

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return 'Invalid file format. Please upload JPG, JPEG, or PNG';
    }

    // Check file size (convert maxSize from MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    return '';
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setImage(null);
      onChange?.(null);
      return;
    }

    setError('');
    setImage(file);
    onChange?.(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500');
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setImage(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange?.(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-md font-medium">
        {fieldName} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative w-2/5 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-500'}
          ${image ? 'bg-gray-50' : 'bg-white'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleChange}
          className="hidden"
        />

        {image ? (
          <div className="relative">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="max-h-40 mx-auto rounded"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-base">Upload</div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <p className="text-gray-500 text-sm">
          Maximum file size: {maxSize}MB. Accepted file formats: JPG, JPEG, PNG
        </p>
      )}

      {required && !image && !error && (
        <p className="text-red-500 text-sm">This field cannot be left blank</p>
      )}
    </div>
  );
};

export default ImageUploadField;