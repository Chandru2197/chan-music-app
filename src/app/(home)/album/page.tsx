import Header from "@component/header";
import Center from "@component/center";
import Link from "next/link";
import { parsedUrl } from "@lib/functions/parsedUrl";
import { headers } from "next/headers";
import { Music } from "@prisma/client";
import Cards from "@component/list/cards";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AlertSign from "@component/alert/signIn";

export type getMusicParams = {
  take: number;
  searchParams: {
    key: string;
    value: string;
  }[];
};

const getMusicAlbum = async ({ take, searchParams }: getMusicParams) => {
  const url = parsedUrl({
    path: "api/song",
    searchParams,
  });

  try {
    const resp = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: headers(),
    });

    if (!resp.ok) {
      throw new Error("Error when try to fetch.");
    }

    const { listOfAlbum } = (await resp.json()) as { listOfAlbum: Music[] };

    return listOfAlbum;
  } catch (e) {
    console.log(e);

    if (e instanceof Error) {
      throw new Error(e.message);
    }

    throw new Error("Something went wrong");
  }
};

const Album = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <main className="md:w-[80%] w-full h-full bg-stone-900 md:rounded-2xl overflow-y-scroll pb-32">
        <AlertSign />
      </main>
    );
  }

  const listOfAlbum = await getMusicAlbum({
    take: 8,
    searchParams: [{ key: "album", value: "album" }],
  });

  return (
    <div className="md:w-[80%] w-full h-full bg-stone-900 md:rounded-2xl overflow-y-scroll  pb-32">
      <Header />

      {!listOfAlbum.length && (
        <Center className="flex-col">
          <h4 className="text-3xl text-stone-200 font-[700]">
            Your album is empty 🪹
          </h4>
          <Link
            href="/"
            className="bg-white w-[160px] text-black font-[700] text-xl rounded-full p-3 text-center"
          >
            Get Song
          </Link>
        </Center>
      )}

      {listOfAlbum.length && (
        <section className="w-full h-full mt-32 px-3">
          <Cards heading="My Album" listOfMusic={listOfAlbum} link="/music" />
        </section>
      )}
    </div>
  );
};

export default Album;
