import Footer from "@component/footer";
import HeaderPhone from "@component/sidebar/header";

import { getFavorite } from "@lib/functions/favorite";
import { parsedUrl } from "@lib/functions/parsedUrl";
import { getMusicAlbum, getMusicParams } from "../../album/page";

import { headers } from "next/headers";
import { Music } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@auth/route";
import SongDetail from "./songDetail";
import { getMusic } from "../../page";
import { Metadata, ResolvingMetadata } from "next";

type Params = {
  params: {
    id: string;
  };
};

export async function generateMetadata(
  { params }: Params,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;

  const music = await getMusicById({
    searchParams: [{ key: "songId", value: id }],
  });

  return {
    title: music.title,
    description: music.description,
    icons: {
      icon: "/favicon.png",
    },
    keywords: ["music", "streaming", "playlists", "artists", "albums"],
    authors: {
      name: "Peter Sahanaya",
      url: "https://linkedin.com/in/peter-sahanaya",
    },
    openGraph: {
      type: "music.song",
      url: "https://p3music.vercel.app",
      title: music.title,
      description: music.description,
      emails: ["petersahanaya09@gmail.com"],
      images: ["/favicon.png"],
    },
  };
}

type MusicWithAuthor = {
  author: {
    profile: string;
    username: string;
    userId: string;
  };
} & Music;

const getMusicById = async ({ searchParams }: getMusicParams) => {
  const url = parsedUrl({
    path: "api/song",
    searchParams,
  });

  const header = headers()

  try {
      const resp = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          cookie: header.get("cookie") || "",
        },
      });

    if (!resp.ok) {
      throw new Error("Error when try to fetch.");
    }

    const { song } = (await resp.json()) as {
      song: MusicWithAuthor;
    };

    return song;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }

    throw new Error("Something went wrong");
  }
};

const Track = async ({ params }: Params) => {
  const session = await getServerSession(authOptions);

  const [listOfAlsoLike, listOfAlbum, song] = await Promise.all([
    getMusic({ take: 4, type: "" }),
    getMusicAlbum({
      searchParams: [{ key: "album", value: "album" }],
    }),
    getMusicById({
      searchParams: [{ key: "songId", value: params.id }],
    }),
  ]);

  const favorite = await getFavorite({
    songId: params.id,
    userId: session!.user.userId as string,
  });

  return (
    <main className="md:w-[80%] w-full h-full bg-stone-900 md:rounded-2xl ">
      <HeaderPhone />

      <SongDetail
        session={session}
        song={song}
        coverImage={song.coverImage}
        favorite={favorite}
        listOfAlsoLike={listOfAlsoLike}
        listOfMusic={listOfAlbum}
        lyrics={song.lyric}
        profile={song.author.profile}
        title={song.title}
        userProfileHref="/user"
        username={song.author.username}
      />

      <Footer />
    </main>
  );
};

export default Track;
