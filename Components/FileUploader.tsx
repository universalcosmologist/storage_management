"use client"

import React,{useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {Button} from '@/Components/ui/button'
import Image from 'next/image'
import { toast } from "sonner"
import { cn, convertFileToUrl, getFileType } from '@/lib/utils'
import Thumbnail from './Thumbnail'
import { MAX_FILE_SIZE } from '@/constants'
import { usePathname } from 'next/navigation'
import { uploadFile } from '@/lib/actions/file.actions'

interface Props{
    ownerId:string;
    userId:string;
    className?:string;
}
const FileUploader = ({ownerId,userId,className}:Props) => {

    const [files,setFiles]=useState<File[]>([]);
    const path=usePathname();

    const onDrop = useCallback(async(acceptedFiles: File[]) => {
    // Do something with the files
    setFiles((prev)=>[...prev,...acceptedFiles]); 
    //now upload the files and once uploaded remove from the ui
    const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prevFiles) =>
            prevFiles.filter((f) => f.name !== file.name),
          );

           return toast("file size is too large",{
            description: (
              <p className="body-2 text-black">
                <span className="font-semibold">{file.name}</span> is too large.
                Max file size is 40MB.
              </p>
            ),
            className: "error-toast",
          });
        }

        return uploadFile({ file, ownerId, userId, path }).then(
          (uploadedFile) => {
            if (uploadedFile) {
              setFiles((prevFiles) =>
                prevFiles.filter((f) => f.name !== file.name),
              );
            }
          },
        );
    });

    await Promise.all(uploadPromises);

  }, [ownerId,userId,path]);

  const handleRemoveFile=async(e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    fileName: string)=>{
    //remove the file this removes from ui only not from the db 
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  }

  const {getRootProps, getInputProps} = useDropzone({onDrop})

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button type="button" className={cn("uploader-button", className)}>
        <Image
          src="/assets/icons/upload.svg"
          alt="upload"
          width={24}
          height={24}
        />{" "}
        <p>Upload</p>
      </Button>
      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Uploading</h4>
          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />

                  <div className="preview-item-name">
                    {file.name}
                    <Image
                      src="/assets/icons/file-loader.gif"
                      width={80}
                      height={26}
                      alt="Loader"
                    />
                  </div>
                </div>

                <Image
                  src="/assets/icons/remove.svg"
                  width={24}
                  height={24}
                  alt="Remove"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div> 
  )
}

export default FileUploader