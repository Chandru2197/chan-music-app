import AlertSign from "@component/alert/signIn";
import { authOptions } from "@auth/route";
import Center from "@component/center";
import Header from "@component/header";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { getMusicParams } from "../album/page";
import { headers } from "next/headers";
import { parsedUrl } from "@lib/functions/parsedUrl";
import { Music } from "@prisma/client";
import Cards from "@component/list/cards";

const getFavoriteMusic = async ({ searchParams, take }: getMusicParams) => {
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

    const { listOfFavorite } = (await resp.json()) as {
      listOfFavorite: Music[];
    };

    return listOfFavorite;
  } catch (e) {
    console.log(e);

    if (e instanceof Error) {
      throw new Error(e.message);
    }

    throw new Error("Something went wrong");
  }
};

const FavoritePage = async () => {
  const listOfFavorite = await getFavoriteMusic({
    take: 8,
    searchParams: [{ key: "favorite", value: "favorite" }],
  });

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <main className="md:w-[80%] w-full h-full bg-stone-900 md:rounded-2xl overflow-y-scroll pb-32">
        <Header />
        <AlertSign />
      </main>
    );
  }

  return (
    <main className="md:w-[80%] w-full h-full bg-stone-900 md:rounded-2xl overflow-y-scroll  pb-32">
      <Header />

      {!listOfFavorite.length && (
        <Center className="flex-col">
          <h4 className="text-3xl text-stone-200 font-[700]">
            You don&apos;t have favorite song yet 🪹
          </h4>
          <Link
            href="/"
            className="bg-white w-[160px] text-black font-[700] text-xl rounded-full p-3 text-center capitalize"
          >
            See Music
          </Link>
        </Center>
      )}

      {listOfFavorite.length && (
        <Cards
          heading="My Favorite"
          link="/favorite"
          listOfMusic={listOfFavorite}
        />
      )}
    </main>
  );
};

export default FavoritePage;
