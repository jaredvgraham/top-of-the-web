"use client";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";

const Page = () => {
  const [url, setUrl] = useState("");
  const axiosPrivate = useAxiosPrivate();
  //

  useEffect(() => {
    const callEndpoint = async () => {
      console.log("Calling ednpoint");
      try {
        const res = await axiosPrivate.post("/stripe/portal");
        console.log(res.data.url);
        setUrl(res.data.url);
      } catch (error) {
        console.log(error);
      }
    };
    callEndpoint();
  }, []);

  return <Link href={url}> </Link>;
};

export default Page;
