"use client";

import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogContent, DialogDescription, DialogTitle
} from "@/Components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { actionsDropdownItems } from "@/constants";
import Image from "next/image";
import { Models } from "node-appwrite";
import Link from "next/link";
import { FileDetails,ShareInput } from "./ActionsModelContent";

import React, { useState } from 'react'
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { deleteFile, renameFile, updateFileUsers } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
//this is like a dropdown showing the info about the document study the dialog and dropdown menu form shad cn
//first display the icons and the details functionality
const ActionDropdown = ({file}:{file: Models.Document}) => {
const [isModalOpen, setIsModalOpen] = useState(false);
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [action,setAction]=useState<ActionType | null>(null);
const [name,setName]=useState(file.name); 
const [isLoading,setIsLoading]=useState(false);
const [emails,setEmails]=useState<string[]>([]);
const path=usePathname();

const handleRemoveUser = async (email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);

    try {

      const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    if (success) setEmails(updatedEmails);
    closeAllModals();

    } catch (error) {
      console.log("error occured in removing users",error);
    }
};

const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
};

const handleAction=async()=>{
  if(!action) return;
  setIsLoading(true);
  let success = false;

  const actions = {
      rename: () =>
        renameFile({ fileId: file.$id, name, extension: file.extension, path }),
      share: () => updateFileUsers({ fileId: file.$id, emails, path }),
      delete: () =>
        deleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path }),
  };

  try {
    success = await actions[action.value as keyof typeof actions]();

    if (success) closeAllModals();
  } catch (error) {
    console.log("error occured in implementing actions",error);
  }
  setIsLoading(false);
}

const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;

    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          <DialogDescription></DialogDescription>
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
             <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete{` `}
              <span className="delete-file-name">{file.name}</span>?
            </p>
          )}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>
            <Button onClick={handleAction} className="modal-submit-button" disabled={isLoading}>
              <p className="capitalize">{value}</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
};


return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger className="shad-no-focus">
        <div className="border border-gray-200 rounded-md p-1 inline-block cursor-pointer">
           <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
           />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="max-w-[200px] truncate">
          {file.name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator/>
        {actionsDropdownItems.map((actionItem)=>(
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(actionItem);

                if (
                  ["rename", "share", "delete", "details"].includes(
                    actionItem.value,
                  )
                ) {
                  setIsModalOpen(true);
                }
              }}
            >
              {actionItem.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>

    {renderDialogContent()}

    </Dialog>
)
}

export default ActionDropdown