"use client";

import React, { useState } from "react";

import Image from "next/image";
import { Input } from "@/Components/ui/input";
import { useRouter } from "next/navigation";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import Thumbnail from "@/Components/Thumbnail";
import FormattedDateTime from "@/Components/FormattedDateTime";
import { Button } from "@/Components/ui/button";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Models.Document[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const files = await getFiles({ types: [], searchText: query.trim() });
    if(files?.documents){
    setResults(files.documents);
    setOpen(true);
    }
  };

  const handleClickItem = (file: Models.Document) => {
    setOpen(false);
    setResults([]);

    router.push(
      `/${file.type === "video" || file.type === "audio" ? "media" : file.type + "s"}?query=${query}`,
    );
  };

  const handleCloseButton=()=>{
    setOpen(false);
    setResults([]);
  }

  return (
    <div className="search">
      <div className="search-input-wrapper flex items-center gap-2">
        <Image
          src="/assets/icons/search.svg"
          alt="Search"
          width={24}
          height={24}
        />
        <Input
          value={query}
          placeholder="Search..."
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <Button onClick={handleSearch} className="ml-2 bg-brand hover:bg-brand-100 cursor-pointer">
          Search
        </Button>

        {open && (
        <Button onClick={handleCloseButton} className="ml-2 bg-brand hover:bg-brand-100 cursor-pointer">Close</Button>
        )}
      </div>

      {open && (
        <ul className="search-result">
          {results.length > 0 ? (
            results.map((file) => (
              <li
                className="flex items-center justify-between"
                key={file.$id}
                onClick={() => handleClickItem(file)}
              >
                <div className="flex cursor-pointer items-center gap-4">
                  <Thumbnail
                    type={file.type}
                    extension={file.extension}
                    url={file.url}
                    className="size-9 min-w-9"
                  />
                  <p className="subtitle-2 line-clamp-1 text-light-100">
                    {file.name}
                  </p>
                </div>

                <FormattedDateTime
                  date={file.$createdAt}
                  className="caption line-clamp-1 text-light-200"
                />
              </li>
            ))
          ) : (
            <p className="empty-result">No files found</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Search;
